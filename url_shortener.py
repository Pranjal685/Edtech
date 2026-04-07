"""
URL Shortener Service
=====================
A production-ready URL shortening API built with Flask and SQLAlchemy.
Demonstrates clean separation of concerns: Models → Services → Routes.
"""

import os
import string
import random
import re
from datetime import datetime, timezone
from urllib.parse import urlparse
from functools import wraps

from flask import Flask, request, jsonify, redirect, abort
from flask_sqlalchemy import SQLAlchemy

# ──────────────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────────────

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(BASE_DIR, 'urls.db')}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SHORT_CODE_LENGTH"] = 6
app.config["MAX_RETRIES"] = 10

db = SQLAlchemy(app)


# ──────────────────────────────────────────────────────────────
# Data Access Layer — Models
# ──────────────────────────────────────────────────────────────

class ShortenedURL(db.Model):
    """Represents a mapping between a short code and its original URL."""

    __tablename__ = "shortened_urls"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    short_code = db.Column(db.String(16), unique=True, nullable=False, index=True)
    original_url = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    access_count = db.Column(db.Integer, default=0, nullable=False)

    def to_dict(self):
        """Serialize the model to a JSON-safe dictionary."""
        return {
            "id": self.id,
            "short_code": self.short_code,
            "original_url": self.original_url,
            "short_url": f"{request.host_url}{self.short_code}",
            "created_at": self.created_at.isoformat(),
            "access_count": self.access_count,
        }


# ──────────────────────────────────────────────────────────────
# Business Logic — Service Layer
# ──────────────────────────────────────────────────────────────

class URLValidationError(Exception):
    """Raised when a URL fails validation checks."""
    pass


class ShortCodeCollisionError(Exception):
    """Raised when unique code generation fails after max retries."""
    pass


def validate_url(url: str) -> str:
    """
    Validate that the input is a syntactically correct HTTP(S) URL.

    Args:
        url: The raw URL string from the user.

    Returns:
        The cleaned URL string.

    Raises:
        URLValidationError: If the URL is missing, malformed, or uses
                            a disallowed scheme.
    """
    if not url or not isinstance(url, str):
        raise URLValidationError("URL is required and must be a non-empty string.")

    url = url.strip()

    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https"):
        raise URLValidationError(
            f"Invalid URL scheme '{parsed.scheme}'. Only http and https are allowed."
        )

    if not parsed.netloc or "." not in parsed.netloc:
        raise URLValidationError(
            "URL must include a valid domain name (e.g., example.com)."
        )

    # Block localhost / private IPs for security
    hostname = parsed.hostname or ""
    blocked_patterns = [
        r"^localhost$",
        r"^127\.",
        r"^10\.",
        r"^192\.168\.",
        r"^172\.(1[6-9]|2\d|3[01])\.",
    ]
    for pattern in blocked_patterns:
        if re.match(pattern, hostname):
            raise URLValidationError(
                "URLs pointing to private/local networks are not allowed."
            )

    return url


def generate_short_code(length: int = 6) -> str:
    """
    Generate a random alphanumeric short code.

    Args:
        length: Number of characters (default 6).

    Returns:
        A random string of uppercase letters, lowercase letters, and digits.
    """
    alphabet = string.ascii_letters + string.digits
    return "".join(random.choices(alphabet, k=length))


def create_short_url(original_url: str) -> ShortenedURL:
    """
    Validate, shorten, and persist a new URL.

    Handles collision detection by retrying with a new code up to
    MAX_RETRIES times before raising an error.

    Args:
        original_url: The long URL to shorten.

    Returns:
        The persisted ShortenedURL model instance.

    Raises:
        URLValidationError: If the URL is invalid.
        ShortCodeCollisionError: If a unique code cannot be generated.
    """
    validated_url = validate_url(original_url)
    code_length = app.config["SHORT_CODE_LENGTH"]
    max_retries = app.config["MAX_RETRIES"]

    for attempt in range(max_retries):
        code = generate_short_code(code_length)

        existing = ShortenedURL.query.filter_by(short_code=code).first()
        if existing is None:
            entry = ShortenedURL(short_code=code, original_url=validated_url)
            db.session.add(entry)
            db.session.commit()
            return entry

    raise ShortCodeCollisionError(
        f"Failed to generate a unique short code after {max_retries} attempts. "
        "Try increasing SHORT_CODE_LENGTH."
    )


def resolve_short_code(short_code: str) -> ShortenedURL:
    """
    Look up a short code and increment its access counter.

    Args:
        short_code: The alphanumeric code to resolve.

    Returns:
        The matching ShortenedURL with an incremented access_count.

    Raises:
        LookupError: If the short code does not exist.
    """
    entry = ShortenedURL.query.filter_by(short_code=short_code).first()

    if entry is None:
        raise LookupError(f"Short code '{short_code}' not found.")

    entry.access_count += 1
    db.session.commit()
    return entry


def get_analytics(short_code: str) -> dict:
    """
    Return analytics data for a given short code.

    Args:
        short_code: The code to look up.

    Returns:
        A dictionary with URL metadata and access statistics.

    Raises:
        LookupError: If the short code does not exist.
    """
    entry = ShortenedURL.query.filter_by(short_code=short_code).first()

    if entry is None:
        raise LookupError(f"Short code '{short_code}' not found.")

    return entry.to_dict()


# ──────────────────────────────────────────────────────────────
# API Layer — Routes
# ──────────────────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors with a JSON response."""
    return jsonify({"error": "Resource not found."}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle unexpected server errors with a JSON response."""
    return jsonify({"error": "An internal server error occurred."}), 500


@app.route("/shorten", methods=["POST"])
def shorten_url():
    """
    POST /shorten
    Accepts JSON: { "url": "https://example.com/very-long-path" }
    Returns JSON with the generated short URL.
    """
    data = request.get_json(silent=True)

    if not data or "url" not in data:
        return jsonify({
            "error": "Request body must be JSON with a 'url' field.",
            "example": {"url": "https://example.com/long-path"}
        }), 400

    try:
        entry = create_short_url(data["url"])
    except URLValidationError as exc:
        return jsonify({"error": str(exc)}), 400
    except ShortCodeCollisionError as exc:
        return jsonify({"error": str(exc)}), 503

    return jsonify({
        "message": "URL shortened successfully.",
        "data": entry.to_dict()
    }), 201


@app.route("/<short_code>", methods=["GET"])
def redirect_to_url(short_code: str):
    """
    GET /<short_code>
    Redirects the client to the original long URL (302 Found).
    Increments the access counter for analytics.
    """
    if not short_code.isalnum():
        return jsonify({"error": "Invalid short code format."}), 400

    try:
        entry = resolve_short_code(short_code)
    except LookupError as exc:
        return jsonify({"error": str(exc)}), 404

    return redirect(entry.original_url, code=302)


@app.route("/analytics/<short_code>", methods=["GET"])
def get_url_analytics(short_code: str):
    """
    GET /analytics/<short_code>
    Returns access count, creation date, and URL metadata.
    """
    if not short_code.isalnum():
        return jsonify({"error": "Invalid short code format."}), 400

    try:
        analytics_data = get_analytics(short_code)
    except LookupError as exc:
        return jsonify({"error": str(exc)}), 404

    return jsonify({
        "message": "Analytics retrieved successfully.",
        "data": analytics_data
    }), 200


@app.route("/health", methods=["GET"])
def health_check():
    """GET /health — Simple liveness probe."""
    return jsonify({"status": "healthy", "service": "url-shortener"}), 200


# ──────────────────────────────────────────────────────────────
# Application Entry Point
# ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("Database tables created.")

    app.run(host="0.0.0.0", port=5001, debug=True)
