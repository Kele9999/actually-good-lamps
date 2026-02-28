/* eslint-disable no-undef */

require("dotenv").config();

const { setGlobalOptions } = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors");

setGlobalOptions({ maxInstances: 10 });

const corsHandler = cors({ origin: true });
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

// ✅ sanity check
exports.pingGroqKey = onRequest((req, res) => {
  corsHandler(req, res, () => {
    const ok = Boolean(GROQ_API_KEY);
    res.json({
      ok,
      message: ok
        ? "Groq key loaded successfully ✅"
        : "Groq key not found ❌",
    });
  });
});

// ✅ AI text search
exports.aiTextSearch = onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (!GROQ_API_KEY) {
        return res
          .status(500)
          .json({ ok: false, message: "Missing GROQ_API_KEY" });
      }

      const query = req.body?.query || req.query?.query;
      if (!query) {
        return res.status(400).json({
          ok: false,
          message: "Missing query",
        });
      }

      const system = `
Return ONLY valid JSON (no extra text).
Schema:
{
  "search": string,
  "minPrice": number|null,
  "maxPrice": number|null,
  "category": string|"All",
  "material": string|"All",
  "lightQuality": string|"All",
  "features": string[],
  "inStockOnly": boolean,
  "sort": "featured"|"price-asc"|"price-desc"|"name-asc"
}
`;

      const body = {
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        messages: [
          { role: "system", content: system.trim() },
          { role: "user", content: String(query) },
        ],
      };

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          ok: false,
          message: data?.error?.message || "Groq request failed",
        });
      }

      const content = data?.choices?.[0]?.message?.content || "";

      const match = String(content).match(/\{[\s\S]*\}/);
      const jsonText = match ? match[0] : content;

      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        return res.json({
          ok: true,
          result: { raw: content },
        });
      }

      return res.json({ ok: true, result: parsed });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        ok: false,
        message: err?.message || "Server error",
      });
    }
  });
});