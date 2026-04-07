import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LANGUAGES = ["JavaScript", "Python", "Java"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const DOMAINS = ["Web Development", "Systems", "Data Engineering", "APIs"];

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function SkillSetup() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isReady = language && level && domain;

  async function handleGenerate() {
    if (!isReady || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, level, domain }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }

      const project = await res.json();
      navigate("/project-brief", {
        state: { project, language, level, domain },
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="bg-scene" aria-hidden="true" />

      <div className="relative z-10 min-h-dvh flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-10 fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] text-xs font-medium tracking-wide uppercase mb-6"
              style={{ color: "var(--accent-indigo)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-emerald)] animate-pulse" />
              AI-Powered Learning
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3"
              style={{ background: "var(--gradient-accent)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Architecture Engine
            </h1>
            <p className="text-base" style={{ color: "var(--text-secondary)" }}>
              Build real projects. Get reviewed like a senior engineer.
            </p>
          </div>

          {/* Form Card */}
          <div className="glass-card p-8 fade-in fade-in-delay-2">
            <div className="space-y-5">
              {/* Language */}
              <div>
                <label htmlFor="language-select" className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}>
                  Language
                </label>
                <select
                  id="language-select"
                  className="custom-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="">Select a language</option>
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Level */}
              <div>
                <label htmlFor="level-select" className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}>
                  Skill Level
                </label>
                <select
                  id="level-select"
                  className="custom-select"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="">Select your level</option>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Domain */}
              <div>
                <label htmlFor="domain-select" className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}>
                  Domain
                </label>
                <select
                  id="domain-select"
                  className="custom-select"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                >
                  <option value="">Select a domain</option>
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 p-3 rounded-xl text-sm font-medium"
                style={{ background: "rgba(251, 113, 133, 0.1)", color: "var(--accent-rose)", border: "1px solid rgba(251, 113, 133, 0.2)" }}>
                {error}
              </div>
            )}

            {/* CTA */}
            <button
              id="generate-btn"
              className="btn-glow w-full mt-7"
              disabled={!isReady || loading}
              onClick={handleGenerate}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Generating…
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                  Generate My Project
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs mt-6 fade-in fade-in-delay-4"
            style={{ color: "var(--text-muted)" }}>
            Powered by Gemini AI · Google Solution Challenge 2026
          </p>
        </div>
      </div>
    </>
  );
}
