import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyContext from "../../context/data/myContext";

/* ── Fonts ── */
if (!document.getElementById("agl-fonts")) {
  const link = document.createElement("link");
  link.id = "agl-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Jost:wght@300;400;500&display=swap";
  document.head.appendChild(link);
}

/* ── Styles ── */
if (!document.getElementById("agl-home-style")) {
  const style = document.createElement("style");
  style.id = "agl-home-style";
  style.textContent = `
    :root {
      --balsamico: #150C0C;
      --burnt:     #34150F;
      --honey:     #85431E;
      --whiskey:   #D39858;
      --champagne: #EACEAA;
      --font-display: 'Cormorant Garamond', serif;
      --font-body:    'Jost', sans-serif;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--balsamico); color: var(--champagne); font-family: var(--font-body); overflow-x: hidden; }

    /* HERO */
    .hp-hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 100px 24px 80px;
      text-align: center;
      background:
        radial-gradient(ellipse 80% 50% at 50% 110%, rgba(133,67,30,0.22) 0%, transparent 70%),
        var(--balsamico);
      overflow: hidden;
    }
    .hp-hero::before {
      content: '';
      position: absolute; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D39858' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E");
      pointer-events: none;
    }
    .hp-eyebrow { font-size: 10px; letter-spacing: 0.35em; text-transform: uppercase; color: var(--whiskey); opacity: 0.7; margin-bottom: 24px; }
    .hp-hero-title {
      font-family: var(--font-display);
      font-size: clamp(54px, 9vw, 116px);
      font-weight: 300;
      line-height: 0.95;
      color: var(--champagne);
      letter-spacing: 0.02em;
      max-width: 900px;
    }
    .hp-hero-title em { font-style: italic; color: var(--whiskey); }
    .hp-hero-sub {
      font-family: var(--font-display);
      font-size: clamp(16px, 2vw, 21px);
      font-weight: 300;
      font-style: italic;
      color: var(--champagne);
      opacity: 0.5;
      margin-top: 26px;
      max-width: 500px;
      line-height: 1.65;
    }
    .hp-divider-line { width: 44px; height: 1px; background: var(--whiskey); opacity: 0.35; margin: 36px auto; }

    /* Search */
    .hp-search-wrap { width: 100%; max-width: 580px; position: relative; z-index: 1; }
    .hp-search-label { font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--whiskey); opacity: 0.55; display: block; margin-bottom: 12px; }
    .hp-search-row {
      display: flex;
      border: 1px solid rgba(211,152,88,0.3);
      border-radius: 2px;
      overflow: hidden;
      background: rgba(52,21,15,0.7);
      backdrop-filter: blur(12px);
      transition: border-color 0.25s;
    }
    .hp-search-row:focus-within { border-color: rgba(211,152,88,0.65); }
    .hp-search-input {
      flex: 1; background: transparent; border: none; outline: none;
      color: var(--champagne); font-family: var(--font-body); font-size: 14px;
      padding: 16px 20px; letter-spacing: 0.02em;
    }
    .hp-search-input::placeholder { color: rgba(234,206,170,0.28); font-style: italic; }
    .hp-search-btn {
      background: var(--whiskey); border: none; color: var(--balsamico);
      font-family: var(--font-body); font-size: 10px; font-weight: 500;
      letter-spacing: 0.18em; text-transform: uppercase; padding: 16px 24px;
      cursor: pointer; transition: background 0.2s; white-space: nowrap;
    }
    .hp-search-btn:hover { background: var(--champagne); }
    .hp-search-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .hp-image-upload { margin-top: 14px; display: flex; align-items: center; gap: 12px; justify-content: center; }
    .hp-upload-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--champagne); opacity: 0.35; }
    .hp-upload-btn {
      display: inline-flex; align-items: center; gap: 7px;
      background: transparent; border: 1px solid rgba(211,152,88,0.22);
      color: var(--whiskey); font-family: var(--font-body); font-size: 10px;
      letter-spacing: 0.12em; text-transform: uppercase; padding: 8px 16px;
      border-radius: 2px; cursor: pointer; transition: background 0.2s, border-color 0.2s;
    }
    .hp-upload-btn:hover { background: rgba(211,152,88,0.08); border-color: rgba(211,152,88,0.45); }
    .hp-file-input { display: none; }
    .hp-search-err { font-size: 12px; color: #c0392b; margin-top: 10px; }
    .hp-search-ok  { font-size: 11px; color: var(--whiskey); margin-top: 10px; font-style: italic; opacity: 0.8; }

    /* Scroll hint */
    .hp-scroll-hint {
      position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      opacity: 0.25; animation: hp-bob 2.4s ease-in-out infinite;
    }
    .hp-scroll-hint span { font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; }
    @keyframes hp-bob {
      0%, 100% { transform: translateX(-50%) translateY(0); }
      50%       { transform: translateX(-50%) translateY(7px); }
    }

    /* ABOUT */
    .hp-about { background: var(--burnt); padding: 100px 64px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
    .hp-about-eyebrow { font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--whiskey); opacity: 0.65; margin-bottom: 20px; }
    .hp-about-title { font-family: var(--font-display); font-size: clamp(34px, 4vw, 54px); font-weight: 300; line-height: 1.1; color: var(--champagne); margin-bottom: 28px; }
    .hp-about-title em { font-style: italic; color: var(--whiskey); }
    .hp-about-body { font-size: 14px; line-height: 1.85; color: var(--champagne); opacity: 0.6; max-width: 420px; }
    .hp-about-body p + p { margin-top: 16px; }
    .hp-about-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-top: 48px; }
    .hp-stat { background: rgba(21,12,12,0.45); padding: 28px 24px; }
    .hp-stat-num { font-family: var(--font-display); font-size: 48px; font-weight: 300; color: var(--whiskey); line-height: 1; }
    .hp-stat-label { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--champagne); opacity: 0.38; margin-top: 8px; }

    /* SHOP THE LIGHT */
    .hp-stl { background: var(--balsamico); padding: 100px 0; }
    .hp-stl-header { padding: 0 64px 52px; display: flex; align-items: flex-end; justify-content: space-between; }
    .hp-stl-title { font-family: var(--font-display); font-size: clamp(44px, 6vw, 82px); font-weight: 300; line-height: 0.95; color: var(--champagne); }
    .hp-stl-title em { font-style: italic; color: var(--whiskey); }
    .hp-stl-desc { font-size: 13px; line-height: 1.8; color: var(--champagne); opacity: 0.45; max-width: 300px; text-align: right; }
    .hp-stl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
    .hp-stl-left { display: grid; grid-template-rows: 1fr 1fr; gap: 3px; }
    .hp-stl-cell { position: relative; overflow: hidden; background: var(--burnt); cursor: pointer; }
    .hp-stl-cell-tall { aspect-ratio: 4/5; }
    .hp-stl-cell-short { aspect-ratio: 4/3; }
    .hp-stl-cell-feature { aspect-ratio: 3/4; }
    .hp-stl-cell-bg { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; transition: transform 0.55s ease; }
    .hp-stl-cell:hover .hp-stl-cell-bg { transform: scale(1.04); }
    .hp-stl-cell-overlay {
      position: absolute; bottom: 0; left: 0; right: 0;
      padding: 32px 28px 24px;
      background: linear-gradient(to top, rgba(21,12,12,0.92) 0%, transparent 100%);
    }
    .hp-stl-cell-cat { font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--whiskey); opacity: 0.75; margin-bottom: 6px; }
    .hp-stl-cell-name { font-family: var(--font-display); font-size: 28px; font-weight: 400; color: var(--champagne); line-height: 1.1; margin-bottom: 14px; }
    .hp-stl-shop-link {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
      color: var(--whiskey); background: none; border: none; cursor: pointer;
      font-family: var(--font-body); padding: 0; transition: gap 0.2s;
    }
    .hp-stl-shop-link:hover { gap: 14px; }
    .hp-stl-shop-link::after { content: '→'; }

    /* FINAL CTA */
    .hp-cta { background: var(--burnt); padding: 120px 64px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; position: relative; overflow: hidden; }
    .hp-cta::before {
      content: ''; position: absolute; top: -120px; right: -120px;
      width: 550px; height: 550px; border-radius: 50%;
      background: radial-gradient(circle, rgba(133,67,30,0.14) 0%, transparent 70%);
      pointer-events: none;
    }
    .hp-cta-left { position: relative; z-index: 1; }
    .hp-cta-eyebrow { font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--whiskey); opacity: 0.6; margin-bottom: 20px; }
    .hp-cta-title { font-family: var(--font-display); font-size: clamp(40px, 5vw, 68px); font-weight: 300; line-height: 1.05; color: var(--champagne); margin-bottom: 28px; }
    .hp-cta-title em { font-style: italic; color: var(--whiskey); }
    .hp-cta-body { font-size: 14px; line-height: 1.8; color: var(--champagne); opacity: 0.52; max-width: 400px; margin-bottom: 40px; }
    .hp-cta-btn {
      display: inline-block; background: var(--whiskey); color: var(--balsamico);
      border: none; font-family: var(--font-body); font-size: 11px; font-weight: 500;
      letter-spacing: 0.22em; text-transform: uppercase; padding: 18px 42px;
      border-radius: 1px; cursor: pointer; transition: background 0.2s, transform 0.2s;
    }
    .hp-cta-btn:hover { background: var(--champagne); transform: translateY(-1px); }
    .hp-cta-right { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; position: relative; z-index: 1; }
    .hp-cta-feature { background: rgba(21,12,12,0.5); padding: 30px 22px; border: 1px solid rgba(211,152,88,0.07); }
    .hp-cta-feature-icon { font-size: 22px; margin-bottom: 14px; opacity: 0.65; }
    .hp-cta-feature-title { font-family: var(--font-display); font-size: 18px; font-weight: 400; color: var(--champagne); margin-bottom: 8px; }
    .hp-cta-feature-text { font-size: 12px; line-height: 1.6; color: var(--champagne); opacity: 0.38; }

    @media (max-width: 900px) {
      .hp-about, .hp-cta { grid-template-columns: 1fr; gap: 48px; padding: 64px 28px; }
      .hp-stl-header { flex-direction: column; align-items: flex-start; gap: 20px; padding: 0 28px 36px; }
      .hp-stl-desc { text-align: left; }
      .hp-stl-grid { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(style);
}

export default function HomePage() {
  const { aiSearch, aiImageSearch } = useContext(MyContext);
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");

  const onSearch = async (e) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    setLoading(true); setErr(""); setNote("");
    try {
      const out = await aiSearch(query);
      if (!out?.ok) { setErr(out?.message || "Search failed."); return; }
      navigate("/products");
    } catch (e2) {
      setErr(e2?.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErr("Please pick an image file."); return; }
    setLoading(true); setErr(""); setNote("");
    try {
      const out = await aiImageSearch(file);
      if (!out?.ok) { setErr(out?.message || "Image search failed."); return; }
      if (out?.extractedQuery) setNote(`Searching for: "${out.extractedQuery}"`);
      navigate("/products");
    } catch (e2) {
      setErr(e2?.message || "Image search failed.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div style={{ background: "var(--balsamico)" }}>

      {/* ══ HERO ══ */}
      <section className="hp-hero">
        <p className="hp-eyebrow">Actually Good Lamps &nbsp;·&nbsp; South Africa</p>

        <h1 className="hp-hero-title">
          Light that <em>moves</em> you
        </h1>

        <p className="hp-hero-sub">
          Carefully curated lamps for spaces that deserve more than ordinary illumination.
        </p>

        <div className="hp-divider-line" />

        <div className="hp-search-wrap">
          <label className="hp-search-label">Describe what you're looking for</label>
          <form onSubmit={onSearch}>
            <div className="hp-search-row">
              <input
                className="hp-search-input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="A warm brass floor lamp for a reading nook…"
              />
              <button className="hp-search-btn" type="submit" disabled={loading}>
                {loading ? "Searching…" : "Search"}
              </button>
            </div>
          </form>
          <div className="hp-image-upload">
            <span className="hp-upload-label">or</span>
            <label className="hp-upload-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              Search by photo
              <input className="hp-file-input" type="file" accept="image/*" onChange={onPickImage} disabled={loading} />
            </label>
          </div>
          {note && <p className="hp-search-ok">{note}</p>}
          {err  && <p className="hp-search-err">{err}</p>}
        </div>

        <div className="hp-scroll-hint">
          <span>Explore</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </section>

      {/* ══ ABOUT ══ */}
      <section className="hp-about">
        <div>
          <p className="hp-about-eyebrow">Our philosophy</p>
          <h2 className="hp-about-title">
            We believe light is the <em>soul</em> of a room
          </h2>
          <div className="hp-about-body">
            <p>
              Actually Good Lamps was born from a simple frustration — beautiful lamps
              that actually work, crafted from materials worth touching, at prices that
              respect your intelligence.
            </p>
            <p>
              Every piece in our collection is hand-selected for its quality of light,
              longevity of design, and the way it transforms a space from merely furnished
              to genuinely felt.
            </p>
            <p>
              We don't chase trends. We find objects that belong in your home for decades.
            </p>
          </div>
        </div>

        <div className="hp-about-stats">
          {[
            { num: "26",  label: "Curated pieces" },
            { num: "7",   label: "Materials" },
            { num: "AI",  label: "Powered search" },
            { num: "ZA",  label: "South African" },
          ].map((s) => (
            <div key={s.label} className="hp-stat">
              <div className="hp-stat-num">{s.num}</div>
              <div className="hp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ SHOP THE LIGHT ══ */}
      <section className="hp-stl">
        <div className="hp-stl-header">
          <h2 className="hp-stl-title">Shop<br />the <em>Light</em></h2>
          <p className="hp-stl-desc">
            Explore our collection by mood and purpose.
            Each category is a different conversation between light and architecture.
          </p>
        </div>

        <div className="hp-stl-grid">
          <div className="hp-stl-left">
            <div className="hp-stl-cell hp-stl-cell-tall" onClick={() => navigate("/products")}>
              <div className="hp-stl-cell-bg" style={{ background: "linear-gradient(145deg, #2e1208 0%, #150C0C 100%)" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 90, opacity: 0.05, color: "var(--whiskey)" }}>◎</span>
              </div>
              <div className="hp-stl-cell-overlay">
                <div className="hp-stl-cell-cat">Collection</div>
                <div className="hp-stl-cell-name">Floor<br />Lamps</div>
                <button className="hp-stl-shop-link">Shop now</button>
              </div>
            </div>
            <div className="hp-stl-cell hp-stl-cell-short" onClick={() => navigate("/products")}>
              <div className="hp-stl-cell-bg" style={{ background: "linear-gradient(145deg, #1e0e07 0%, #34150F 100%)" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 70, opacity: 0.06, color: "var(--champagne)" }}>✦</span>
              </div>
              <div className="hp-stl-cell-overlay">
                <div className="hp-stl-cell-cat">Collection</div>
                <div className="hp-stl-cell-name">Table<br />Lamps</div>
                <button className="hp-stl-shop-link">Shop now</button>
              </div>
            </div>
          </div>

          <div className="hp-stl-cell hp-stl-cell-feature" onClick={() => navigate("/products")}>
            <div className="hp-stl-cell-bg" style={{ background: "linear-gradient(160deg, #3a1a0a 0%, #150C0C 55%, #34150F 100%)" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 160, opacity: 0.04, color: "var(--whiskey)" }}>☽</span>
            </div>
            <div className="hp-stl-cell-overlay" style={{ padding: "48px 36px 32px" }}>
              <div className="hp-stl-cell-cat">Featured</div>
              <div className="hp-stl-cell-name" style={{ fontSize: 36 }}>Pendant<br />&amp; Ceiling<br />Lamps</div>
              <button className="hp-stl-shop-link">Shop now</button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="hp-cta">
        <div className="hp-cta-left">
          <p className="hp-cta-eyebrow">The AGL difference</p>
          <h2 className="hp-cta-title">
            Every lamp.<br /><em>Intentionally</em><br />chosen.
          </h2>
          <p className="hp-cta-body">
            No fillers. No compromises. Just a considered edit of the finest lamps
            available in South Africa — with AI-powered search to help you find
            exactly what your space is missing.
          </p>
          <button className="hp-cta-btn" onClick={() => navigate("/products")}>
            Explore the collection
          </button>
        </div>

        <div className="hp-cta-right">
          {[
            { icon: "◈", title: "AI Search",        text: "Describe it in plain language. Our AI understands exactly what you mean." },
            { icon: "◉", title: "Image Search",      text: "Upload a photo of a space or lamp you love. We'll find the closest match." },
            { icon: "◇", title: "Premium Materials", text: "Brass, marble, rattan, glass — every lamp is made to last and to impress." },
            { icon: "◎", title: "South African",     text: "A curated collection built specifically for South African homes and taste." },
          ].map((f) => (
            <div key={f.title} className="hp-cta-feature">
              <div className="hp-cta-feature-icon">{f.icon}</div>
              <div className="hp-cta-feature-title">{f.title}</div>
              <div className="hp-cta-feature-text">{f.text}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}