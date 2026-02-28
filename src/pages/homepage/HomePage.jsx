import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyContext from "../../context/data/myContext";

export default function HomePage() {
  const { aiSearch } = useContext(MyContext);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const onSearch = async (e) => {
    e.preventDefault();

    const query = q.trim();
    if (!query) return;

    setLoading(true);
    setErr("");

    try {
      const out = await aiSearch(query);

      // your function returns { ok, ... }
      if (!out || out.ok === false) {
        setErr(out?.message || "AI search failed.");
        return;
      }

      // ✅ IMPORTANT: pass aiQuery so AllProducts uses AI results instead of filters
      navigate("/products", { state: { aiQuery: query } });
    } catch (e2) {
      const msg = e2?.message || "Search failed.";

      // Common local dev issue: functions emulator not running / wrong URL
      if (
        msg.toLowerCase().includes("failed to fetch") ||
        msg.toLowerCase().includes("connection refused")
      ) {
        setErr(
          "Could not reach the AI search function. If you're running locally, make sure Firebase emulators are running (functions emulator), then try again."
        );
      } else {
        setErr(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Actually Good Lamps</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>
        Try: “minimalist brass floor lamp under 2000, dimmable”
      </p>

      <form onSubmit={onSearch} style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search with AI…"
          style={{
            flex: 1,
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 10,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "white",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {err && <p style={{ color: "crimson", marginTop: 10 }}>{err}</p>}
    </div>
  );
}