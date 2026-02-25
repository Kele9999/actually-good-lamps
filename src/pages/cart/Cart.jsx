import { useContext, useState } from "react";
import MyContext from "../../context/data/myContext";
import { Link } from "react-router-dom";


function Cart() {
  const { cartItems, cartTotal, removeFromCart, updateQty, clearCart, placeOrder } =
    useContext(MyContext);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    setStatusMsg("");

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setStatusMsg("Please fill in name, phone, and address.");
      return;
    }

    setPlacing(true);
    const res = await placeOrder({ name, phone, address });
    setPlacing(false);

    if (!res.ok) {
      setStatusMsg(res.message);
      return;
    }

    setName("");
    setPhone("");
    setAddress("");
    setStatusMsg(`Order placed! Order ID: ${res.orderId}`);
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Cart</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  border: "1px solid #ddd",
                  padding: 12,
                  borderRadius: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <strong>{item.name}</strong>
                  <div style={{ fontSize: 12 }}>R {item.price}</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQty(item.id, e.target.value)}
                    style={{ width: 70 }}
                  />
                  <button onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: 16 }}>Total: R {cartTotal}</h3>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button onClick={clearCart}>Clear Cart</button>
          </div>

          <hr style={{ margin: "20px 0" }} />

          <h2>Checkout</h2>

          <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
            <input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <button onClick={handlePlaceOrder} disabled={placing}>
              {placing ? "Placing order..." : "Place Order"}
            </button>

            {statusMsg && <p>{statusMsg}</p>}
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;