import { useContext } from "react";
import { Link } from "react-router-dom";
import MyContext from "../../context/data/myContext";

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
} = useContext(MyContext);

  return (
  <div style={{ padding: 16 }}>
    <h1>All Lamps</h1>
    <p style={{ fontSize: 14 }}>
      Items in cart: {cartCount} • Showing {filteredProducts.length} of {products.length}
    </p>

    {productsLoading && <p>Loading products...</p>}
    {productsError && <p style={{ color: "red" }}>{productsError}</p>}

    {!productsLoading && !productsError && (
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, alignItems: "start" }}>
        {/* LEFT SIDEBAR */}
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
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            style={{ width: "100%", padding: 8, marginBottom: 10 }}
          />

          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12 }}>Min price</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value }))}
                style={{ width: "100%", padding: 8 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12 }}>Max price</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value }))}
                style={{ width: "100%", padding: 8 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12 }}>Type</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
                style={{ width: "100%", padding: 8 }}
              >
                <option value="All">All</option>
                {[...new Set(products.map((x) => x.category).filter(Boolean))].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12 }}>Light quality</label>
              <select
                value={filters.lightQuality}
                onChange={(e) => setFilters((p) => ({ ...p, lightQuality: e.target.value }))}
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
                onChange={(e) => setFilters((p) => ({ ...p, material: e.target.value }))}
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
              <label style={{ fontSize: 12, display: "block", marginBottom: 6 }}>Features</label>
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
                onChange={(e) => setFilters((p) => ({ ...p, inStockOnly: e.target.checked }))}
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
                })
              }
              style={{ padding: 10, cursor: "pointer" }}
            >
              Reset
            </button>
          </div>
        </aside>

        {/* RIGHT GRID */}
        <section>
          {filteredProducts.length === 0 ? (
            <p>No products match your filters.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {filteredProducts.map((p) => (
                <div key={p.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 6 }}
                  />
                  <h3>{p.name}</h3>
                  <p>R {p.price}</p>
                  <p style={{ fontSize: 12 }}>{p.category}</p>
                  <p style={{ fontSize: 12 }}>{p.material} • {p.lightQuality}</p>
                  <p style={{ fontSize: 12 }}>{Array.isArray(p.features) ? p.features.join(", ") : ""}</p>
                  <p style={{ fontSize: 12 }}>Stock: {p.stock}</p>

                  <button
                    onClick={() => addToCart(p, 1)}
                    disabled={(Number(p.stock) || 0) <= 0}
                    style={{ cursor: (Number(p.stock) || 0) <= 0 ? "not-allowed" : "pointer" }}
                  >
                    {(Number(p.stock) || 0) <= 0 ? "Out of stock" : "Add to cart"}
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