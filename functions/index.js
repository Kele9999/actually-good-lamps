/* eslint-disable no-undef */
/* eslint-disable require-jsdoc */
require("dotenv").config();

const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const cors = require("cors");

setGlobalOptions({ maxInstances: 10 });

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const corsHandler = cors({ origin: true });
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// -------- Utilities --------

function enforcePost(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "POST required" });
    return false;
  }
  return true;
}

function enforceImageSize(imageDataUrl) {
  const maxSize = 2 * 1024 * 1024; // 2MB
  const approxBytes = imageDataUrl.length * 0.75;
  return approxBytes <= maxSize;
}

function compactCatalog(products, limit = 80) {
  return products.slice(0, limit).map((p) => ({
    id: p.id,
    name: p.name || "",
    description: p.description || "",
    price: Number(p.price) || 0,
    categoryId: p.categoryId || "",
    categoryName: p.categoryName || p.category || "",
    material: p.material || "",
    lightQuality: p.lightQuality || "",
    tags: Array.isArray(p.tags) ? p.tags : [],
    features: Array.isArray(p.features) ? p.features : [],
    imageUrl: p.imageUrl || "",
  }));
}

async function loadProductsFromFirestore() {
  const snap = await db.collection("products").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function groqChat({ messages, model, temperature = 0.2 }) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, temperature, messages }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Groq failed (${res.status}): ${text}`);
  }
  return JSON.parse(text);
}

function safeJsonFromModel(content) {
  const text = String(content || "").trim();
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : text);
}

function simpleRankFallback(products, query) {
  const q = String(query || "").toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);

  const score = (p) => {
    const hay = [
      p.name,
      p.description,
      p.categoryName || p.category,
      p.material,
      ...(p.tags || []),
      ...(p.features || []),
    ]
      .join(" ")
      .toLowerCase();

    return terms.reduce((s, t) => (hay.includes(t) ? s + 1 : s), 0);
  };

  return products
    .map((p) => ({ id: p.id, s: score(p) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 24)
    .map((x) => x.id);
}

// -------- Ping --------

exports.pingGroqKey = onRequest({ maxInstances: 10, secrets: ["GROQ_API_KEY"] }, (req, res) => {
  corsHandler(req, res, () => {
    res.json({
      ok: Boolean(GROQ_API_KEY),
      message: GROQ_API_KEY ? "Groq key loaded ✅" : "Groq key missing ❌",
    });
  });
});

// -------- AI TEXT SEARCH --------

exports.aiProductSearch = onRequest(
  { maxInstances: 10, secrets: ["GROQ_API_KEY"] },
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (!enforcePost(req, res)) return;

        if (!GROQ_API_KEY)
          return res.status(500).json({ ok: false, message: "Missing GROQ_API_KEY" });

        const query = req.body?.query;
        if (!query)
          return res.status(400).json({ ok: false, message: "Missing query" });

        const products = await loadProductsFromFirestore();
        const catalog = compactCatalog(products);

        const system = `
You are a product search engine for an online lamp store.
Return ONLY valid JSON:
{ "ids": ["<productId>"], "reason": "optional" }
Catalog:
${JSON.stringify(catalog)}
`.trim();

        const data = await groqChat({
          model: "llama-3.1-8b-instant",
          temperature: 0.2,
          messages: [
            { role: "system", content: system },
            { role: "user", content: query },
          ],
        });

        const content = data?.choices?.[0]?.message?.content || "";
        let parsed;

        try {
          parsed = safeJsonFromModel(content);
        } catch {
          return res.json({
            ok: true,
            ids: simpleRankFallback(products, query),
            warning: "Fallback used",
          });
        }

        const valid = new Set(products.map((p) => p.id));
        const cleanIds = (parsed?.ids || [])
          .filter((id) => valid.has(id))
          .slice(0, 24);

        if (!cleanIds.length) {
          return res.json({
            ok: true,
            ids: simpleRankFallback(products, query),
            warning: "Fallback used",
          });
        }

        return res.json({ ok: true, ids: cleanIds });
      } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
      }
    });
  }
);

// -------- AI IMAGE SEARCH --------

exports.aiImageSearch = onRequest(
  { maxInstances: 10, secrets: ["GROQ_API_KEY"] },
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (!enforcePost(req, res)) return;

        if (!GROQ_API_KEY)
          return res.status(500).json({ ok: false, message: "Missing GROQ_API_KEY" });

        const { imageDataUrl, query = "" } = req.body || {};
        if (!imageDataUrl)
          return res.status(400).json({ ok: false, message: "Missing imageDataUrl" });

        if (!enforceImageSize(imageDataUrl))
          return res.status(400).json({ ok: false, message: "Image too large" });

        const products = await loadProductsFromFirestore();
        const catalog = compactCatalog(products);

        const system = `
Return ONLY valid JSON:
{ "ids": ["<productId>"], "extractedQuery": "short description" }
Catalog:
${JSON.stringify(catalog)}
`.trim();

        const data = await groqChat({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          temperature: 0.2,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: `${system}\nQuery: ${query}` },
                { type: "image_url", image_url: { url: imageDataUrl } },
              ],
            },
          ],
        });

        const content = data?.choices?.[0]?.message?.content || "";
        const parsed = safeJsonFromModel(content);

        const valid = new Set(products.map((p) => p.id));
        const cleanIds = (parsed?.ids || [])
          .filter((id) => valid.has(id))
          .slice(0, 24);

        return res.json({
          ok: true,
          ids: cleanIds,
          extractedQuery: parsed?.extractedQuery || query,
        });
      } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
      }
    });
  }
);