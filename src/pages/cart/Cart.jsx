import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import MyContext from "../../context/data/myContext";

/* ── Styles ── */
if (!document.getElementById("agl-cart-style")) {
  const style = document.createElement("style");
  style.id = "agl-cart-style";
  style.textContent = `
    .cart-wrap {
      min-height: 100vh;
      background: var(--balsamico);
      padding: 48px 40px 80px;
      font-family: var(--font-body);
    }

    .cart-header {
      border-bottom: 1px solid rgba(211,152,88,0.1);
      padding-bottom: 20px;
      margin-bottom: 40px;
    }
    .cart-title {
      font-family: var(--font-display);
      font-size: 42px;
      font-weight: 300;
      color: var(--champagne);
      letter-spacing: 0.05em;
    }
    .cart-subtitle {
      font-size: 10px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--whiskey);
      opacity: 0.55;
      margin-top: 8px;
    }

    .cart-empty {
      text-align: center;
      padding: 100px 20px;
    }
    .cart-empty-text {
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 300;
      font-style: italic;
      color: var(--champagne);
      opacity: 0.3;
      margin-bottom: 24px;
    }
    .cart-shop-link {
      display: inline-block;
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--whiskey);
      text-decoration: none;
      border-bottom: 1px solid rgba(211,152,88,0.35);
      padding-bottom: 2px;
      transition: opacity 0.2s;
    }
    .cart-shop-link:hover { opacity: 0.7; }

    /* Layout */
    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: 32px;
      align-items: start;
    }

    /* Cart items */
    .cart-items { display: flex; flex-direction: column; gap: 2px; }

    .cart-item {
      background: var(--burnt);
      display: grid;
      grid-template-columns: 80px 1fr auto;
      gap: 20px;
      align-items: center;
      padding: 16px 20px;
    }

    .cart-item-img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      display: block;
      border-radius: 1px;
      background: #1e0f0a;
    }
    .cart-item-img-placeholder {
      width: 80px; height: 80px;
      background: #1e0f0a;
      border-radius: 1px;
      display: flex; align-items: center; justify-content: center;
      font-size: 9px; letter-spacing: 0.1em; color: rgba(234,206,170,0.15);
    }

    .cart-item-name {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 400;
      color: var(--champagne);
      margin-bottom: 4px;
    }
    .cart-item-meta {
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--whiskey);
      opacity: 0.55;
    }
    .cart-item-price {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 300;
      color: var(--champagne);
      opacity: 0.7;
      margin-top: 6px;
    }

    .cart-item-controls { display: flex; align-items: center; gap: 12px; }

    .cart-qty {
      display: flex;
      align-items: center;
      gap: 0;
      border: 1px solid rgba(211,152,88,0.2);
      border-radius: 2px;
      overflow: hidden;
    }
    .cart-qty-btn {
      background: transparent;
      border: none;
      color: var(--whiskey);
      font-size: 16px;
      width: 32px; height: 36px;
      cursor: pointer;
      font-family: var(--font-body);
      transition: background 0.15s;
      display: flex; align-items: center; justify-content: center;
    }
    .cart-qty-btn:hover { background: rgba(211,152,88,0.1); }
    .cart-qty-num {
      width: 40px; height: 36px;
      background: transparent;
      border: none; border-left: 1px solid rgba(211,152,88,0.15); border-right: 1px solid rgba(211,152,88,0.15);
      color: var(--champagne);
      font-family: var(--font-body);
      font-size: 13px;
      text-align: center;
      outline: none;
    }
    .cart-qty-num::-webkit-inner-spin-button { -webkit-appearance: none; }

    .cart-remove-btn {
      background: transparent;
      border: none;
      color: var(--champagne);
      opacity: 0.25;
      font-size: 18px;
      cursor: pointer;
      padding: 4px;
      transition: opacity 0.2s, color 0.2s;
      line-height: 1;
    }
    .cart-remove-btn:hover { opacity: 1; color: #c0392b; }

    /* Cart footer */
    .cart-footer {
      background: var(--burnt);
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2px;
    }
    .cart-clear-btn {
      background: transparent;
      border: none;
      color: var(--champagne);
      opacity: 0.3;
      font-family: var(--font-body);
      font-size: 10px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      cursor: pointer;
      transition: opacity 0.2s;
      padding: 0;
    }
    .cart-clear-btn:hover { opacity: 0.7; }
    .cart-item-count {
      font-size: 10px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--champagne);
      opacity: 0.35;
    }

    /* Checkout panel */
    .checkout-panel {
      background: var(--burnt);
      padding: 32px 28px;
      position: sticky;
      top: 88px;
    }

    .checkout-section-title {
      font-size: 9px;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: var(--whiskey);
      opacity: 0.65;
      margin-bottom: 16px;
      display: block;
    }

    .checkout-divider {
      height: 1px;
      background: rgba(211,152,88,0.1);
      margin: 24px 0;
    }

    .checkout-input {
      width: 100%;
      background: rgba(21,12,12,0.5);
      border: 1px solid rgba(211,152,88,0.15);
      color: var(--champagne);
      font-family: var(--font-body);
      font-size: 13px;
      padding: 12px 14px;
      border-radius: 2px;
      outline: none;
      margin-bottom: 10px;
      transition: border-color 0.2s;
    }
    .checkout-input::placeholder { color: rgba(234,206,170,0.25); }
    .checkout-input:focus { border-color: rgba(211,152,88,0.5); }

    /* Payment methods */
    .payment-options { display: flex; flex-direction: column; gap: 8px; }

    .payment-option {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      border: 1px solid rgba(211,152,88,0.12);
      border-radius: 2px;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      background: rgba(21,12,12,0.3);
    }
    .payment-option:hover { border-color: rgba(211,152,88,0.35); background: rgba(21,12,12,0.5); }
    .payment-option.selected { border-color: var(--whiskey); background: rgba(211,152,88,0.06); }

    .payment-option input[type="radio"] {
      appearance: none;
      -webkit-appearance: none;
      width: 16px; height: 16px;
      border: 1px solid rgba(211,152,88,0.4);
      border-radius: 50%;
      background: transparent;
      flex-shrink: 0;
      cursor: pointer;
      position: relative;
      transition: border-color 0.15s;
    }
    .payment-option.selected input[type="radio"] { border-color: var(--whiskey); }
    .payment-option.selected input[type="radio"]::after {
      content: '';
      position: absolute;
      top: 3px; left: 3px;
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--whiskey);
    }

    .payment-option-icon { font-size: 18px; opacity: 0.7; }

    .payment-option-info { flex: 1; }
    .payment-option-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--champagne);
      letter-spacing: 0.04em;
    }
    .payment-option-desc {
      font-size: 10px;
      color: var(--champagne);
      opacity: 0.35;
      margin-top: 2px;
      letter-spacing: 0.03em;
    }

    /* Card fields */
    .card-fields {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 14px;
      background: rgba(21,12,12,0.3);
      border: 1px solid rgba(211,152,88,0.1);
      border-radius: 2px;
    }
    .card-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

    /* Order summary */
    .order-summary { margin-bottom: 4px; }
    .order-summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--champagne);
      opacity: 0.5;
      margin-bottom: 8px;
      letter-spacing: 0.03em;
    }
    .order-summary-total {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-top: 1px solid rgba(211,152,88,0.12);
      padding-top: 14px;
      margin-top: 6px;
    }
    .order-summary-total-label {
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--champagne);
      opacity: 0.5;
    }
    .order-summary-total-amount {
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 300;
      color: var(--champagne);
    }
    .order-summary-total-amount span {
      font-size: 12px;
      font-family: var(--font-body);
      opacity: 0.4;
      margin-right: 3px;
    }

    /* Place order btn */
    .place-order-btn {
      width: 100%;
      background: var(--whiskey);
      color: var(--balsamico);
      border: none;
      font-family: var(--font-body);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      padding: 18px;
      border-radius: 1px;
      cursor: pointer;
      margin-top: 20px;
      transition: background 0.2s, transform 0.15s;
    }
    .place-order-btn:hover:not(:disabled) { background: var(--champagne); transform: translateY(-1px); }
    .place-order-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

    .checkout-status {
      margin-top: 14px;
      font-size: 12px;
      text-align: center;
      line-height: 1.5;
      padding: 12px;
      border-radius: 2px;
    }
    .checkout-status.error { background: rgba(192,57,43,0.12); color: #e74c3c; border: 1px solid rgba(192,57,43,0.2); }
    .checkout-status.success { background: rgba(211,152,88,0.1); color: var(--whiskey); border: 1px solid rgba(211,152,88,0.2); font-style: italic; }

    @media (max-width: 900px) {
      .cart-layout { grid-template-columns: 1fr; }
      .cart-wrap { padding: 32px 20px 60px; }
    }
  `;
  document.head.appendChild(style);
}

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Cash on Delivery",
    desc: "Pay when your order arrives",
    icon: "💵",
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    desc: "Visa, Mastercard, Amex",
    icon: "💳",
  },
  {
    id: "wallet",
    label: "Digital Wallet",
    desc: "PayFast, SnapScan, Zapper",
    icon: "📱",
  },
];

function Cart() {
  const { cartItems, cartTotal, removeFromCart, updateQty, clearCart, placeOrder } =
    useContext(MyContext);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState("error");
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    setStatusMsg("");

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setStatusMsg("Please fill in your name, phone, and address.");
      setStatusType("error");
      return;
    }

    if (paymentMethod === "card") {
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim() || !cardName.trim()) {
        setStatusMsg("Please fill in all card details.");
        setStatusType("error");
        return;
      }
    }

    setPlacing(true);
    const res = await placeOrder({
      name,
      phone,
      address,
      paymentMethod,
    });
    setPlacing(false);

    if (!res.ok) {
      setStatusMsg(res.message || "Something went wrong.");
      setStatusType("error");
      return;
    }

    setName(""); setPhone(""); setAddress("");
    setCardNumber(""); setCardExpiry(""); setCardCvc(""); setCardName("");
    setStatusMsg(`Order confirmed — ID: ${res.orderId}`);
    setStatusType("success");
  };

  return (
    <div className="cart-wrap">

      <div className="cart-header">
        <h1 className="cart-title">Your Cart</h1>
        <p className="cart-subtitle">
          {cartItems.length} {cartItems.length === 1 ? "piece" : "pieces"} selected
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <p className="cart-empty-text">Your cart is empty</p>
          <Link to="/products" className="cart-shop-link">Browse the collection</Link>
        </div>
      ) : (
        <div className="cart-layout">

          {/* ── Left: items ── */}
          <div>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">

                  {item.imageUrl ? (
                    <img className="cart-item-img" src={item.imageUrl} alt={item.name} />
                  ) : (
                    <div className="cart-item-img-placeholder">No img</div>
                  )}

                  <div>
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-meta">
                      {[item.categoryName, item.material].filter(Boolean).join(" · ")}
                    </div>
                    <div className="cart-item-price">
                      R {Number(item.price).toLocaleString()}
                    </div>
                  </div>

                  <div className="cart-item-controls">
                    <div className="cart-qty">
                      <button
                        className="cart-qty-btn"
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >−</button>
                      <input
                        className="cart-qty-num"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQty(item.id, e.target.value)}
                      />
                      <button
                        className="cart-qty-btn"
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                      >+</button>
                    </div>
                    <button
                      className="cart-remove-btn"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove"
                    >×</button>
                  </div>

                </div>
              ))}
            </div>

            <div className="cart-footer">
              <span className="cart-item-count">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</span>
              <button className="cart-clear-btn" onClick={clearCart}>Clear cart</button>
            </div>
          </div>

          {/* ── Right: checkout panel ── */}
          <div className="checkout-panel">

            {/* Order summary */}
            <span className="checkout-section-title">Order Summary</span>
            <div className="order-summary">
              {cartItems.map((item) => (
                <div key={item.id} className="order-summary-row">
                  <span>{item.name} × {item.quantity}</span>
                  <span>R {(Number(item.price) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="order-summary-total">
              <span className="order-summary-total-label">Total</span>
              <span className="order-summary-total-amount">
                <span>R</span>{Number(cartTotal).toLocaleString()}
              </span>
            </div>

            <div className="checkout-divider" />

            {/* Delivery details */}
            <span className="checkout-section-title">Delivery Details</span>
            <input
              className="checkout-input"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="checkout-input"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              className="checkout-input"
              placeholder="Delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <div className="checkout-divider" />

            {/* Payment method */}
            <span className="checkout-section-title">Payment Method</span>
            <div className="payment-options">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`payment-option${paymentMethod === method.id ? " selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                  />
                  <span className="payment-option-icon">{method.icon}</span>
                  <div className="payment-option-info">
                    <div className="payment-option-label">{method.label}</div>
                    <div className="payment-option-desc">{method.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Card fields — shown only when card is selected */}
            {paymentMethod === "card" && (
              <div className="card-fields">
                <input
                  className="checkout-input"
                  style={{ marginBottom: 0 }}
                  placeholder="Name on card"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
                <input
                  className="checkout-input"
                  style={{ marginBottom: 0 }}
                  placeholder="Card number"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
                <div className="card-row">
                  <input
                    className="checkout-input"
                    style={{ marginBottom: 0 }}
                    placeholder="MM / YY"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                  />
                  <input
                    className="checkout-input"
                    style={{ marginBottom: 0 }}
                    placeholder="CVC"
                    maxLength={4}
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? "Placing order…" : "Place Order"}
            </button>

            {statusMsg && (
              <div className={`checkout-status ${statusType}`}>
                {statusMsg}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;