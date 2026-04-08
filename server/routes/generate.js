const express = require("express");
const { generateWithRetry, GeminiQuotaError } = require("../lib/gemini");
const { buildProjectPrompt } = require("../prompts/projectPrompt");

const router = express.Router();

router.post("/", async (req, res) => {
  const { language, level, domain, focusArea } = req.body;

  if (!language || !level || !domain || !focusArea) {
    return res.status(400).json({ error: "language, level, domain, and focusArea are required" });
  }

  try {
    const prompt = buildProjectPrompt(language, level, domain, focusArea);
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

    const required = ["title", "description", "requirements", "constraints", "difficulty"];
    const missing = required.filter((key) => !(key in parsed));
    if (missing.length > 0) {
      return res.status(500).json({
        error: `Response missing keys: ${missing.join(", ")}`,
        raw: parsed,
      });
    }

    return res.json(parsed);
  } catch (err) {
    if (err.name === "GeminiQuotaError") {
      console.warn("Generate quota error:", err.original?.slice(0, 120));
      return res.status(429).json({ error: err.message });
    }
    console.error("Generate error:", err.message);
    return res.status(500).json({ error: "Failed to generate project. Please try again." });
  }
});

module.exports = router;
