import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MyContext from "../../context/data/myContext";

function Order() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, placeOrder } = useContext(MyContext);

  const [customer, setCustomer] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  const handleChange = (e) => {
    setCustomer((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = () => {
    if (!customer.fullName || !customer.phone || !customer.address) {
      alert("Please fill in your name, phone, and address.");
      return;
    }

    const res = placeOrder(customer);

    if (!res.ok) {
      alert(res.message);
      return;
    }

    alert(`Order placed! ✅\nOrder ID: ${res.orderId}`);
    navigate("/"); // or navigate("/dashboard") later for admin
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <Link to="/products">Go shop lamps</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      {/* Left: Order Summary */}
      <div>
        <h1>Checkout</h1>

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
              style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 6 }}
            />

            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0 }}>{item.name}</h3>
              <p style={{ margin: "4px 0" }}>
                R {item.price} × {item.quantity}
              </p>
            </div>

            <strong>R {item.price * item.quantity}</strong>
          </div>
        ))}

        <h2>Total: R {cartTotal}</h2>
      </div>

      {/* Right: Customer Details */}
      <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
        <h2>Delivery Details</h2>

        <div style={{ display: "grid", gap: 10 }}>
          <input
            name="fullName"
            placeholder="Full name"
            value={customer.fullName}
            onChange={handleChange}
            style={{ padding: 10 }}
          />

          <input
            name="phone"
            placeholder="Phone number"
            value={customer.phone}
            onChange={handleChange}
            style={{ padding: 10 }}
          />

          <textarea
            name="address"
            placeholder="Delivery address"
            value={customer.address}
            onChange={handleChange}
            rows={4}
            style={{ padding: 10 }}
          />

          <button onClick={handlePlaceOrder} style={{ padding: 12 }}>
            Place Order
          </button>

          <Link to="/cart">← Back to cart</Link>
        </div>
      </div>
    </div>
  );
}

export default Order;