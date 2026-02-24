import { useContext } from "react";
import MyContext from "../../context/data/myContext";
import { Link } from "react-router-dom";

function Cart() {
  const { cartItems, cartTotal, removeFromCart, updateQty, clearCart } =
    useContext(MyContext);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Your Cart</h1>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Your Cart</h1>

      {cartItems.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 6 }}
          />

          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0 }}>{item.name}</h3>
            <p style={{ margin: "4px 0" }}>R {item.price}</p>
            <p style={{ margin: 0, fontSize: 12 }}>{item.category}</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12 }}>Qty</label>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateQty(item.id, e.target.value)}
              style={{ width: 60, padding: 6 }}
            />
          </div>

          <button onClick={() => removeFromCart(item.id)}>Remove</button>
        </div>
      ))}

      <h2>Total: R {cartTotal}</h2>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
      <Link to="/order">
        <button>Proceed to Checkout</button>
      </Link>

  <button onClick={clearCart}>Clear Cart</button>
</div>

      <button onClick={clearCart} style={{ marginTop: 12 }}>
        Clear Cart
      </button>
    </div>
  );
}

export default Cart;