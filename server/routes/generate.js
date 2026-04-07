const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildProjectPrompt } = require("../prompts/projectPrompt");

const router = express.Router();

router.post("/", async (req, res) => {
  const { language, level, domain } = req.body;

  if (!language || !level || !domain) {
    return res.status(400).json({ error: "language, level, and domain are required" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = buildProjectPrompt(language, level, domain);
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

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
    console.error("Generate error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
