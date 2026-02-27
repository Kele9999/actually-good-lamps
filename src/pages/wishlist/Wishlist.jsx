import { useContext } from "react";
import { Link } from "react-router-dom";
import MyContext from "../../context/data/myContext";

export default function Wishlist() {
  const { user, wishlistItems } = useContext(MyContext);

  return (
    <div style={{ padding: 24 }}>
      <h1>Wishlist</h1>

      {/* Guest reminder about wishlist */}
      {!user && (
        <p style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>
          You’re using a guest wishlist - it won’t be saved after you close this tab.{" "}
          <Link to="/login">Log in</Link> to keep it permanently.
        </p>
      )}

      {wishlistItems.length === 0 ? (
        <p style={{ marginTop: 16 }}>No saved lamps yet.</p>
      ) : (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {wishlistItems.map((w) => {
            // logged in items might use productId, guests use id
            const productId = w.productId || w.id;

            return (
              <div
                key={productId}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <img
                  src={w.imageUrl}
                  alt={w.name}
                  style={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                    borderRadius: 6,
                  }}
                />

                <h3 style={{ marginTop: 10 }}>{w.name}</h3>
                <p>R {w.price}</p>
                <p style={{ fontSize: 12 }}>{w.category}</p>

                <Link
                  to={`/product/${productId}`}
                  style={{ display: "inline-block", marginTop: 8 }}
                >
                  View product
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}