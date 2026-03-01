import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyContext from "../../context/data/myContext";

export default function HomePage() {
  const { aiSearch, aiImageSearch } = useContext(MyContext);

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");

  const navigate = useNavigate();

  const onSearch = async (e) => {
    e.preventDefault();

    const query = q.trim();
    if (!query) return;

    setLoading(true);
    setErr("");
    setNote("");

    try {
      const out = await aiSearch(query); // stores results in context

      if (!out?.ok) {
        setErr(out?.message || "Search failed.");
        return;
      }

      navigate("/products"); // no state needed — results live in context
    } catch (e2) {
      setErr(e2?.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErr("Please pick an image file.");
      e.target.value = "";
      return;
    }

    setLoading(true);
    setErr("");
    setNote("");

    try {
      const out = await aiImageSearch(file); // stores results in context

      if (!out?.ok) {
        setErr(out?.message || "Image search failed.");
        return;
      }

      if (out?.extractedQuery) {
        setNote(`Image interpreted as: "${out.extractedQuery}"`);
      }

      navigate("/products"); // no state needed — results live in context
    } catch (e2) {
      setErr(e2?.message || "Image search failed.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Actually Good Lamps</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>
        Try: "minimalist brass floor lamp under 2000, dimmable"
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

      <div style={{ marginTop: 14 }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            opacity: 0.8,
            marginBottom: 6,
          }}
        >
          Or search by uploading a picture
        </label>
        <input type="file" accept="image/*" onChange={onPickImage} disabled={loading} />
      </div>

      {note && <p style={{ marginTop: 10, color: "green" }}>{note}</p>}
      {err && <p style={{ marginTop: 10, color: "crimson" }}>{err}</p>}
    </div>
  );
}