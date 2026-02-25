import { useContext } from "react";
import { Link } from "react-router-dom";
import MyContext from "../../context/data/myContext";

function AllProducts() {
  const { products, addToCart, cartCount, productsLoading, productsError } =
    useContext(MyContext);

  return (
    <div style={{ padding: 16 }}>
      <h1>All Lamps</h1>
      <p>Items in cart: {cartCount}</p>

      {/* 👇 Loading / Error section goes HERE */}
      {productsLoading && <p>Loading products...</p>}

      {productsError && (
        <p style={{ color: "red" }}>{productsError}</p>
      )}

      {!productsLoading && !productsError && products.length === 0 && (
        <p>No products yet.</p>
      )}

      {/* 👇 Grid starts AFTER the status messages */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ddd",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <img
              src={p.imageUrl}
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
            <p style={{ fontSize: 12 }}>{p.category}</p>
            <p style={{ fontSize: 12 }}>{p.description}</p>

            <button onClick={() => addToCart(p, 1)}>
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllProducts;