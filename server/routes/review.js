const express = require("express");
const { generateWithRetry, GeminiQuotaError } = require("../lib/gemini");
const { buildReviewPrompt } = require("../prompts/reviewPrompt");

const router = express.Router();

router.post("/", async (req, res) => {
  const { studentCode, projectSpec, language } = req.body;

  if (!studentCode || !projectSpec || !language) {
    return res.status(400).json({ error: "studentCode, projectSpec, and language are required" });
  }

  try {
    const prompt = buildReviewPrompt(studentCode, projectSpec, language);
    const rawText = await generateWithRetry(prompt);

    // Strip markdown code fences if Gemini wraps the response
    const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      return res.status(500).json({
        error: "Gemini returned malformed JSON",
        raw: rawText,
      });
    }

    const required = ["architectureQuality", "naming", "errorHandling", "strengths", "improvement", "overallScore"];
    const missing = required.filter((key) => !(key in parsed));
    if (missing.length > 0) {
      return res.status(500).json({
        error: `Response missing keys: ${missing.join(", ")}`,
        raw: parsed,
      });
    }

    // Override Gemini's math — compute overallScore server-side
    const { architectureQuality, naming, errorHandling } = parsed;
    parsed.overallScore = Math.round(
      ((architectureQuality.score + naming.score + errorHandling.score) / 3) * 10
    );

    return res.json(parsed);
  } catch (err) {
    if (err.name === "GeminiQuotaError") {
      console.warn("Review quota error:", err.original?.slice(0, 120));
      return res.status(429).json({ error: err.message });
    }
    console.error("Review error:", err.message);
    return res.status(500).json({ error: "Failed to review code. Please try again." });
  }
});

module.exports = router;
