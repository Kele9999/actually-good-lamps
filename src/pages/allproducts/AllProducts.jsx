import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MyContext from "../../context/data/myContext";

/* Google Fonts */
if (!document.getElementById("agl-fonts")) {
  const link = document.createElement("link");
  link.id = "agl-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap";
  document.head.appendChild(link);
}

/* Styles */
if (!document.getElementById("agl-allproducts-style")) {
  const style = document.createElement("style");
  style.id = "agl-allproducts-style";
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
    *, *::before, *::after { box-sizing: border-box; }
    body { background: var(--balsamico); color: var(--champagne); font-family: var(--font-body); }

    .agl-sidebar {
      background: var(--burnt);
      border-radius: 2px;
      padding: 28px 20px;
      position: sticky;
      top: 80px;
      height: fit-content;
    }
    .agl-sidebar h3 {
      font-family: var(--font-display);
      font-size: 11px;
      font-weight: 400;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--whiskey);
      margin-bottom: 24px;
    }
    .agl-filter-group { margin-bottom: 18px; }
    .agl-filter-label {
      font-size: 9px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--whiskey);
      opacity: 0.7;
      display: block;
      margin-bottom: 6px;
    }
    .agl-input, .agl-select {
      width: 100%;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(211,152,88,0.2);
      color: var(--champagne);
      font-family: var(--font-body);
      font-size: 12px;
      padding: 9px 12px;
      border-radius: 2px;
      outline: none;
      transition: border-color 0.2s;
    }
    .agl-input::placeholder { color: rgba(234,206,170,0.3); }
    .agl-input:focus, .agl-select:focus { border-color: rgba(211,152,88,0.6); }
    .agl-select option { background: var(--burnt); color: var(--champagne); }
    .agl-price-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .agl-checkbox-group { display: flex; flex-direction: column; gap: 8px; }
    .agl-checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--champagne);
      opacity: 0.8;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .agl-checkbox-label:hover { opacity: 1; }
    .agl-checkbox-label input[type="checkbox"] {
      appearance: none;
      -webkit-appearance: none;
      width: 14px; height: 14px;
      border: 1px solid rgba(211,152,88,0.4);
      border-radius: 1px;
      background: transparent;
      cursor: pointer;
      position: relative;
      flex-shrink: 0;
      transition: background 0.15s, border-color 0.15s;
    }
    .agl-checkbox-label input[type="checkbox"]:checked {
      background: var(--whiskey);
      border-color: var(--whiskey);
    }
    .agl-checkbox-label input[type="checkbox"]:checked::after {
      content: '';
      position: absolute;
      left: 3px; top: 0px;
      width: 5px; height: 8px;
      border: 1.5px solid var(--balsamico);
      border-top: none; border-left: none;
      transform: rotate(45deg);
    }
    .agl-divider { height: 1px; background: rgba(211,152,88,0.12); margin: 18px 0; }
    .agl-reset-btn {
      width: 100%;
      background: transparent;
      border: 1px solid rgba(211,152,88,0.25);
      color: var(--whiskey);
      font-family: var(--font-body);
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      padding: 10px;
      border-radius: 2px;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }
    .agl-reset-btn:hover { background: rgba(211,152,88,0.08); border-color: rgba(211,152,88,0.5); }

    .agl-ai-banner {
      background: var(--burnt);
      border: 1px solid rgba(211,152,88,0.2);
      border-radius: 2px;
      padding: 14px 18px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .agl-ai-query {
      font-family: var(--font-display);
      font-size: 16px;
      font-style: italic;
      font-weight: 400;
      color: var(--whiskey);
    }
    .agl-ai-sub {
      font-size: 11px;
      opacity: 0.5;
      margin-top: 3px;
      letter-spacing: 0.04em;
    }
    .agl-clear-btn {
      background: transparent;
      border: 1px solid rgba(211,152,88,0.3);
      color: var(--champagne);
      font-family: var(--font-body);
      font-size: 10px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      padding: 8px 16px;
      border-radius: 2px;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      transition: background 0.2s, border-color 0.2s;
    }
    .agl-clear-btn:hover { background: rgba(211,152,88,0.08); border-color: rgba(211,152,88,0.5); }

    .agl-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
    }

    .agl-card {
      background: var(--burnt);
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease;
    }
    .agl-card:hover { transform: translateY(-3px); }

    .agl-card-img-wrap {
      width: 100%;
      aspect-ratio: 3/4;
      overflow: hidden;
      background: #1e0f0a;
      position: relative;
    }
    .agl-card-img {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.5s ease;
    }
    .agl-card:hover .agl-card-img { transform: scale(1.04); }
    .agl-card-img-placeholder {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      color: rgba(234,206,170,0.12);
      font-size: 11px; letter-spacing: 0.12em;
    }

    .agl-card-overlay {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      background: linear-gradient(to top, rgba(21,12,12,0.96) 0%, rgba(21,12,12,0.4) 65%, transparent 100%);
      padding: 18px 14px 14px;
      transform: translateY(52px);
      transition: transform 0.32s ease;
    }
    .agl-card:hover .agl-card-overlay { transform: translateY(0); }

    .agl-card-actions { display: flex; gap: 8px; margin-top: 10px; }

    .agl-btn-cart {
      flex: 1;
      background: var(--whiskey);
      color: var(--balsamico);
      border: none;
      font-family: var(--font-body);
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      padding: 10px 8px;
      border-radius: 1px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .agl-btn-cart:hover { background: var(--champagne); }

    .agl-btn-wish {
      background: transparent;
      border: 1px solid rgba(211,152,88,0.35);
      color: var(--whiskey);
      font-size: 15px;
      width: 38px;
      border-radius: 1px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s, border-color 0.2s;
      flex-shrink: 0;
    }
    .agl-btn-wish:hover, .agl-btn-wish.saved {
      background: rgba(211,152,88,0.12);
      border-color: var(--whiskey);
    }

    .agl-card-info { padding: 14px 16px 20px; cursor: pointer;}
    .agl-card-meta {
      font-size: 9px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--whiskey);
      opacity: 0.65;
      margin-bottom: 5px;
    }
    .agl-card-name {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 400;
      color: var(--champagne);
      line-height: 1.25;
      margin-bottom: 6px;
      transition: color 0.2s;  /* add this */
    }

    .agl-card:hover .agl-card-name {
      color: var(--whiskey);
    }
    .agl-card-price {
      font-family: var(--font-display);
      font-size: 21px;
      font-weight: 300;
      color: var(--champagne);
    }
    .agl-card-price span {
      font-size: 11px;
      font-family: var(--font-body);
      opacity: 0.45;
      margin-right: 2px;
    }
    .agl-card-features {
      font-size: 9px;
      letter-spacing: 0.1em;
      color: var(--champagne);
      opacity: 0.35;
      margin-top: 5px;
      text-transform: uppercase;
    }

    .agl-page-header {
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(211,152,88,0.1);
    }
    .agl-page-title {
      font-family: var(--font-display);
      font-size: 44px;
      font-weight: 300;
      color: var(--champagne);
      letter-spacing: 0.06em;
      line-height: 1;
    }
    .agl-page-subtitle {
      font-size: 10px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--whiskey);
      opacity: 0.55;
      margin-top: 10px;
    }

    .agl-empty {
      grid-column: 1 / -1;
      text-align: center;
      padding: 80px 20px;
      color: var(--champagne);
      opacity: 0.25;
      font-family: var(--font-display);
      font-size: 24px;
      font-style: italic;
      font-weight: 300;
    }
    .agl-loading {
      text-align: center;
      padding: 80px;
      color: var(--whiskey);
      font-size: 10px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      opacity: 0.5;
    }

    @media (max-width: 1100px) { .agl-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px)  { .agl-grid { grid-template-columns: 1fr; } }
  `;
  document.head.appendChild(style);
}

export default function AllProducts() {
  const {
    products,
    categories,
    filteredProducts,
    filters,
    setFilters,
    addToCart,
    cartCount,
    productsLoading,
    productsError,
    toggleWishlist,
    wishlistIds,
    aiResultsProducts,
    aiResultIds,
    aiQuery,
    clearAiResults,
  } = useContext(MyContext);

  const navigate = useNavigate();
  const aiActive = aiResultIds.length > 0;
  const listToShow = aiActive ? aiResultsProducts : filteredProducts;

  const categoryOptions = useMemo(() => {
    return (Array.isArray(categories) ? categories : []).map((c) => ({
      id: c.id,
      name: c.name || "Unnamed",
    }));
  }, [categories]);

  const resetFilters = () => {
    clearAiResults();
    setFilters({
      search: "",
      minPrice: "",
      maxPrice: "",
      category: "All",
      lightQuality: "All",
      material: "All",
      features: [],
      inStockOnly: false,
      sort: "featured",
    });
  };



  return (
    <div style={{ minHeight: "100vh", background: "var(--balsamico)", padding: "36px 32px 80px" }}>

      <div className="agl-page-header">
        <h1 className="agl-page-title">The Collection</h1>
        <p className="agl-page-subtitle">
          {listToShow.length} of {products.length} pieces &nbsp;·&nbsp; {cartCount} in cart
        </p>
      </div>

      {aiActive && (
        <div className="agl-ai-banner">
          <div>
            <div className="agl-ai-query">"{aiQuery}"</div>
            <div className="agl-ai-sub">
              Showing the most relevant lamps to your search — clear to browse the full collection
            </div>
          </div>
          <button className="agl-clear-btn" onClick={clearAiResults}>Clear search</button>
        </div>
      )}

      {productsLoading && <div className="agl-loading">Curating the collection…</div>}
      {productsError && (
        <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 16 }}>{productsError}</p>
      )}

      {!productsLoading && !productsError && (
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "20px", alignItems: "start" }}>

          {/* Sidebar */}

          <aside className="agl-sidebar">
            <h3>Refine</h3>

            <div className="agl-filter-group">
              <label className="agl-filter-label">Search</label>
              <input
                className="agl-input"
                placeholder="Keyword…"
                value={filters.search}
                onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              />
            </div>

            <div className="agl-filter-group">
              <label className="agl-filter-label">Price range</label>
              <div className="agl-price-row">
                <input
                  className="agl-input"
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value }))}
                />
                <input
                  className="agl-input"
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value }))}
                />
              </div>
            </div>

            <div className="agl-filter-group">
              <label className="agl-filter-label">Category</label>
              <select
                className="agl-select"
                value={filters.category}
                onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
              >
                <option value="All">All categories</option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="agl-filter-group">
              <label className="agl-filter-label">Light quality</label>
              <select
                className="agl-select"
                value={filters.lightQuality}
                onChange={(e) => setFilters((p) => ({ ...p, lightQuality: e.target.value }))}
              >
                <option value="All">All</option>
                <option value="Warm">Warm</option>
                <option value="Neutral">Neutral</option>
                <option value="Cool">Cool</option>
              </select>
            </div>

            <div className="agl-filter-group">
              <label className="agl-filter-label">Material</label>
              <select
                className="agl-select"
                value={filters.material}
                onChange={(e) => setFilters((p) => ({ ...p, material: e.target.value }))}
              >
                <option value="All">All</option>
                {["Wood","Brass","Ceramic","Glass","Metal","Rattan","Marble"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="agl-filter-group">
              <label className="agl-filter-label">Features</label>
              <div className="agl-checkbox-group">
                {["LED","Smart","Dimmable","Halogen","Touch"].map((feat) => {
                  const checked = filters.features.includes(feat);
                  return (
                    <label key={feat} className="agl-checkbox-label">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setFilters((p) => ({
                            ...p,
                            features: checked
                              ? p.features.filter((f) => f !== feat)
                              : [...p.features, feat],
                          }))
                        }
                      />
                      {feat}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="agl-filter-group" style={{ marginTop: 4 }}>
              <label className="agl-checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) => setFilters((p) => ({ ...p, inStockOnly: e.target.checked }))}
                />
                In stock only
              </label>
            </div>

            <div className="agl-divider" />

            <div className="agl-filter-group">
              <label className="agl-filter-label">Sort by</label>
              <select
                className="agl-select"
                value={filters.sort}
                onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value }))}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="name-asc">Name: A → Z</option>
              </select>
            </div>

            <button className="agl-reset-btn" onClick={resetFilters}>
              Reset all filters
            </button>
          </aside>

          {/* Grid */}

          <section>
            <div className="agl-grid">
              {listToShow.length === 0 ? (
                <div className="agl-empty">No lamps found</div>
              ) : (
                listToShow.map((p) => (
                  <div key={p.id} className="agl-card" onClick={() => navigate(`/product/${p.id}`)}>
                    <div className="agl-card-img-wrap" onClick={(e) => e.stopPropagation()}>
                      {p.imageUrl ? (
                        <img
                          className="agl-card-img"
                          src={p.imageUrl}
                          alt={p.name}
                          loading="lazy"
                        />
                      ) : (
                        <div className="agl-card-img-placeholder">No image</div>
                      )}
                      <div className="agl-card-overlay">
                        <div className="agl-card-actions">
                          <button className="agl-btn-cart" onClick={() => addToCart(p, 1)}>
                            Add to cart
                          </button>
                          <button
                            className={`agl-btn-wish${wishlistIds.has(p.id) ? " saved" : ""}`}
                            onClick={() => toggleWishlist(p)}
                            title={wishlistIds.has(p.id) ? "Saved" : "Save"}
                          >
                            {wishlistIds.has(p.id) ? "♥" : "♡"}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="agl-card-info">
                      <div className="agl-card-meta">
                        {[p.categoryName, p.material].filter(Boolean).join(" · ")}
                      </div>
                      <div className="agl-card-name">{p.name}</div>
                      <div className="agl-card-price">
                        <span>R</span>{Number(p.price).toLocaleString()}
                      </div>
                      {Array.isArray(p.features) && p.features.length > 0 && (
                        <div className="agl-card-features">{p.features.join(" · ")}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      )}
    </div>
  );
}