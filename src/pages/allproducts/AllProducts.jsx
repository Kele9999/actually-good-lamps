import { useContext, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MyContext from "../../context/data/myContext";

const norm = (v) => String(v || "").toLowerCase();

const scoreProduct = (p, terms) => {
  const hay = [
    p.name,
    p.description,
    p.categoryName,
    p.material,
    ...(Array.isArray(p.tags) ? p.tags : []),
    ...(Array.isArray(p.features) ? p.features : []),
  ]
    .map(norm)
    .join(" ");

  let score = 0;
  for (const t of terms) {
    if (!t) continue;
    if (hay.includes(t)) score += 1;
  }
  return score;
};

function AllProducts() {
  const {
    products,
    filteredProducts,
    filters,
    setFilters,
    addToCart,
    cartCount,
    productsLoading,
    productsError,
    toggleWishlist,
    wishlistIds, // Set
  } = useContext(MyContext);

  const location = useLocation();
  const navigate = useNavigate();

  const aiQuery = location.state?.aiQuery || "";

  const aiResults = useMemo(() => {
    if (!aiQuery || !products.length) return null;

    const terms = aiQuery
      .toLowerCase()
      .split(/\s+/)
      .map((x) => x.trim())
      .filter(Boolean);

    const ranked = [...products]
      .map((p) => ({ p, s: scoreProduct(p, terms) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.p);

    return ranked;
  }, [aiQuery, products]);

  // ✅ AI overrides filters (only if aiQuery exists)
  const listToShow = aiResults ?? filteredProducts;

  // For dropdown options, prefer categoryName (since you’re using categoryId/categoryName)
  const categoryOptions = useMemo(() => {
    const names = products
      .map((p) => p.categoryName || p.category) // fallback if old docs still exist
      .filter(Boolean);
    return [...new Set(names)];
  }, [products]);

  const clearAiSearch = () => {
    // Clear route state (aiQuery) without changing page
    navigate("/products", { replace: true, state: {} });
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>All Lamps</h1>

      <p style={{ fontSize: 14 }}>
        Items in cart: {cartCount} • Showing {listToShow.length} of {products.length}
      </p>

      {/* ✅ AI banner */}
      {aiQuery ? (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 10,
            marginBottom: 12,
            background: "#fafafa",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 14 }}>
            <strong>AI search:</strong> {aiQuery}
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Showing best matches (filters are ignored until you clear AI search)
            </div>
          </div>

          <button
            onClick={clearAiSearch}
            style={{
              border: "1px solid #ddd",
              padding: "8px 10px",
              borderRadius: 8,
              background: "white",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Clear AI search
          </button>
        </div>
      ) : null}

      {productsLoading && <p>Loading products...</p>}
      {productsError && <p style={{ color: "red" }}>{productsError}</p>}

      {!productsLoading && !productsError && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* Left sidebar */}
          <aside
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 12,
              position: "sticky",
              top: 90,
              background: "white",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Filters</h3>

            <input
              placeholder="Search..."
              value={filters.search}
              onChange={(e) =>
                setFilters((p) => ({ ...p, search: e.target.value }))
              }
              style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />

            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <label style={{ fontSize: 12 }}>Min price</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, minPrice: e.target.value }))
                  }
                  style={{ width: "100%", padding: 8 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12 }}>Max price</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, maxPrice: e.target.value }))
                  }
                  style={{ width: "100%", padding: 8 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12 }}>Type</label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, category: e.target.value }))
                  }
                  style={{ width: "100%", padding: 8 }}
                >
                  <option value="All">All</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12 }}>Light quality</label>
                <select
                  value={filters.lightQuality}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, lightQuality: e.target.value }))
                  }
                  style={{ width: "100%", padding: 8 }}
                >
                  <option value="All">All</option>
                  <option value="Warm">Warm</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Cool">Cool</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12 }}>Material</label>
                <select
                  value={filters.material}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, material: e.target.value }))
                  }
                  style={{ width: "100%", padding: 8 }}
                >
                  <option value="All">All</option>
                  <option value="Wood">Wood</option>
                  <option value="Brass">Brass</option>
                  <option value="Ceramic">Ceramic</option>
                  <option value="Glass">Glass</option>
                  <option value="Metal">Metal</option>
                  <option value="Rattan">Rattan</option>
                  <option value="Marble">Marble</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
                  Features
                </label>
                {["LED", "Smart", "Dimmable", "Halogen", "Touch"].map((feat) => {
                  const checked = filters.features.includes(feat);
                  return (
                    <label key={feat} style={{ display: "block", fontSize: 14 }}>
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
                      />{" "}
                      {feat}
                    </label>
                  );
                })}
              </div>

              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, inStockOnly: e.target.checked }))
                  }
                />
                In stock only
              </label>

              <button
                onClick={() =>
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
                  })
                }
                style={{ padding: 10, cursor: "pointer" }}
              >
                Reset
              </button>

              <div>
                <label style={{ fontSize: 12 }}>Sort</label>
                <select
                  value={filters.sort}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, sort: e.target.value }))
                  }
                  style={{ width: "100%", padding: 8 }}
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="name-asc">Name: A → Z</option>
                </select>
              </div>
            </div>
          </aside>

          {/* right grid */}
          <section>
            {listToShow.length === 0 ? (
              <p>{aiQuery ? "No AI matches found." : "No products match your filters."}</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 16,
                }}
              >
                {listToShow.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      border: "1px solid #ddd",
                      padding: 12,
                      borderRadius: 8,
                    }}
                  >
                    <img
                      src={p.imageUrl || ""}
                      alt={p.name}
                      style={{
                        width: "100%",
                        height: 180,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                    <h3>{p.name}</h3>
                    <p>R {p.price}</p>
                    <p style={{ fontSize: 12 }}>{p.categoryName || p.category}</p>
                    <p style={{ fontSize: 12 }}>
                      {p.material} • {p.lightQuality}
                    </p>
                    <p style={{ fontSize: 12 }}>
                      {Array.isArray(p.features) ? p.features.join(", ") : ""}
                    </p>
                    <p style={{ fontSize: 12 }}>Stock: {p.stock}</p>

                    <button
                      onClick={() => addToCart(p, 1)}
                      disabled={(Number(p.stock) || 0) <= 0}
                      style={{
                        cursor:
                          (Number(p.stock) || 0) <= 0 ? "not-allowed" : "pointer",
                      }}
                    >
                      {(Number(p.stock) || 0) <= 0 ? "Out of stock" : "Add to cart"}
                    </button>

                    <button
                      onClick={() => toggleWishlist(p)}
                      style={{ cursor: "pointer", marginLeft: 8 }}
                    >
                      {wishlistIds?.has?.(p.id) ? "♥ Saved" : "♡ Save"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default AllProducts;