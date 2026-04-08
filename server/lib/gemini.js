const { GoogleGenerativeAI } = require("@google/generative-ai");

// Single shared client — instantiated once at startup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use flash-lite models for higher rate limits
const MODEL_PRIMARY = "gemini-2.5-flash-lite";
const MODEL_FALLBACK = "gemini-2.0-flash-lite-001";

/**
 * Parse the retry delay (seconds) out of a Gemini 429 error message.
 * The message contains "Please retry in X.XXs".
 */
function parseRetryDelay(message) {
  const match = message.match(/retry in ([\d.]+)s/i);
  return match ? Math.ceil(parseFloat(match[1])) * 1000 : 10000;
}

/**
 * Call Gemini with automatic retry on 429.
 * Tries MODEL_PRIMARY first; if that 429s, waits the retry delay then
 * tries MODEL_FALLBACK once before giving up.
 */
async function generateWithRetry(prompt) {
  const attempts = [MODEL_PRIMARY, MODEL_FALLBACK];

  for (let i = 0; i < attempts.length; i++) {
    const modelName = attempts[i];
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      const is429 = err.message.includes("429") || err.message.includes("Too Many Requests") || err.message.includes("Quota") || err.message.includes("503");
      const isLast = i === attempts.length - 1;

      if (is429 && !isLast) {
        const delay = parseRetryDelay(err.message);
        console.warn(`[gemini] ${modelName} quota/overload. Waiting ${delay}ms then retrying with ${attempts[i + 1]}…`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (is429) {
        throw new GeminiQuotaError(err.message);
      }

      throw err;
    }
  }
}

class GeminiQuotaError extends Error {
  constructor(original) {
    super("The AI service is temporarily rate-limited. Please wait a moment and try again.");
    this.name = "GeminiQuotaError";
    this.original = original;
  }
}

module.exports = { generateWithRetry, GeminiQuotaError };
