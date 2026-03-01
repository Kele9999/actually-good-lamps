import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import MyContext from "../../context/data/myContext";

/* Styles */

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
    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: 32px;
      align-items: start;
    }
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
      width: 80px; height: 80px;
      object-fit: cover; display: block;
      border-radius: 1px; background: #1e0f0a;
    }
    .cart-item-img-placeholder {
      width: 80px; height: 80px;
      background: #1e0f0a; border-radius: 1px;
      display: flex; align-items: center; justify-content: center;
      font-size: 9px; color: rgba(234,206,170,0.15);
    }
    .cart-item-name {
      font-family: var(--font-display);
      font-size: 18px; font-weight: 400;
      color: var(--champagne); margin-bottom: 4px;
    }
    .cart-item-meta {
      font-size: 10px; letter-spacing: 0.12em;
      text-transform: uppercase; color: var(--whiskey); opacity: 0.55;
    }
    .cart-item-price {
      font-family: var(--font-display);
      font-size: 16px; font-weight: 300;
      color: var(--champagne); opacity: 0.7; margin-top: 6px;
    }
    .cart-item-controls { display: flex; align-items: center; gap: 12px; }
    .cart-qty {
      display: flex; align-items: center;
      border: 1px solid rgba(211,152,88,0.2);
      border-radius: 2px; overflow: hidden;
    }
    .cart-qty-btn {
      background: transparent; border: none;
      color: var(--whiskey); font-size: 16px;
      width: 32px; height: 36px; cursor: pointer;
      font-family: var(--font-body); transition: background 0.15s;
      display: flex; align-items: center; justify-content: center;
    }
    .cart-qty-btn:hover { background: rgba(211,152,88,0.1); }
    .cart-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .cart-qty-num {
      width: 40px; height: 36px; background: transparent;
      border: none; border-left: 1px solid rgba(211,152,88,0.15);
      border-right: 1px solid rgba(211,152,88,0.15);
      color: var(--champagne); font-family: var(--font-body);
      font-size: 13px; text-align: center; outline: none;
    }
    .cart-qty-num::-webkit-inner-spin-button { -webkit-appearance: none; }
    .cart-remove-btn {
      background: transparent; border: none;
      color: var(--champagne); opacity: 0.25;
      font-size: 18px; cursor: pointer; padding: 4px;
      transition: opacity 0.2s, color 0.2s; line-height: 1;
    }
    .cart-remove-btn:hover { opacity: 1; color: #c0392b; }
    .cart-footer {
      background: var(--burnt); padding: 16px 20px;
      display: flex; justify-content: space-between;
      align-items: center; margin-top: 2px;
    }
    .cart-clear-btn {
      background: transparent; border: none;
      color: var(--champagne); opacity: 0.3;
      font-family: var(--font-body); font-size: 10px;
      letter-spacing: 0.15em; text-transform: uppercase;
      cursor: pointer; transition: opacity 0.2s; padding: 0;
    }
    .cart-clear-btn:hover { opacity: 0.7; }
    .cart-item-count {
      font-size: 10px; letter-spacing: 0.15em;
      text-transform: uppercase; color: var(--champagne); opacity: 0.35;
    }

    /*  Guest prompt  */

    .cart-guest-prompt {
      background: rgba(21,12,12,0.7);
      border: 1px solid rgba(211,152,88,0.2);
      border-radius: 2px;
      padding: 36px 32px 32px;
      text-align: left;    
      position: relative;
      overflow: hidden;
    }
    .cart-guest-prompt::before {
      content: '';
      position: absolute; bottom: -60px; right: -60px;
      width: 200px; height: 200px; border-radius: 50%;
      background: radial-gradient(circle, rgba(211,152,88,0.07) 0%, transparent 70%);
      pointer-events: none;
    }
    .cart-guest-prompt::after {
      content: '';
      position: absolute; top: -40px; left: -40px;
      width: 140px; height: 140px; border-radius: 50%;
      background: radial-gradient(circle, rgba(133,67,30,0.1) 0%, transparent 70%);
      pointer-events: none;
    }
    .cart-guest-eyebrow {
      font-size: 9px; letter-spacing: 0.28em;
      text-transform: uppercase; color: var(--whiskey);
      opacity: 0.5; margin-bottom: 14px;
    }
    .cart-guest-heading {
      font-family: var(--font-display);
      font-size: 26px; font-weight: 300; font-style: italic;
      color: var(--champagne); line-height: 1.3; margin-bottom: 12px;
    }
    .cart-guest-divider {
      width: 40px;
      height: 1px;
      background: rgba(211,152,88,0.3);
      margin: 0 0 16px;              
    }
    .cart-guest-sub {
      font-size: 11px; color: var(--champagne);
      opacity: 0.42; letter-spacing: 0.04em;
      line-height: 1.8; margin-bottom: 28px;
    }
    .cart-guest-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-start;  
      margin-top: 24px;
    }
    .cart-guest-btn-primary {
      background: var(--whiskey); color: var(--balsamico);
      font-family: var(--font-body); font-size: 10px; font-weight: 600;
      letter-spacing: 0.2em; text-transform: uppercase;
      padding: 13px 28px; border-radius: 1px; text-decoration: none;
      transition: background 0.2s; display: inline-block;
    }
    .cart-guest-btn-primary:hover { background: var(--champagne); }
    .cart-guest-btn-secondary {
      background: transparent; color: var(--champagne);
      font-family: var(--font-body); font-size: 10px;
      letter-spacing: 0.2em; text-transform: uppercase;
      padding: 12px 24px; border-radius: 1px;
      border: 1px solid rgba(211,152,88,0.22);
      text-decoration: none; display: inline-block;
      transition: border-color 0.2s, background 0.2s;
    }
    .cart-guest-btn-secondary:hover { border-color: rgba(211,152,88,0.5); background: rgba(211,152,88,0.05); }

    /* Checkout panel */

    .checkout-panel {
      background: var(--burnt);
      padding: 32px 28px;
      position: sticky;
      top: 88px;
    }
    .checkout-section-title {
      font-size: 9px; letter-spacing: 0.28em;
      text-transform: uppercase; color: var(--whiskey);
      opacity: 0.65; margin-bottom: 16px; display: block;
    }
    .checkout-divider {
      height: 1px; background: rgba(211,152,88,0.1); margin: 24px 0;
    }

    /* Validated inputs */

    .checkout-field { margin-bottom: 10px; }
    .checkout-input {
      width: 100%;
      background: rgba(21,12,12,0.5);
      border: 1px solid rgba(211,152,88,0.15);
      color: var(--champagne); font-family: var(--font-body);
      font-size: 13px; padding: 12px 14px; border-radius: 2px;
      outline: none; transition: border-color 0.2s;
    }
    .checkout-input::placeholder { color: rgba(234,206,170,0.25); }
    .checkout-input:focus { border-color: rgba(211,152,88,0.5); }
    .checkout-input.invalid { border-color: rgba(231,76,60,0.55); background: rgba(192,57,43,0.05); }
    .checkout-field-error {
      font-size: 10px; color: #e57373;
      margin-top: 5px; letter-spacing: 0.04em; padding-left: 2px;
    }

    /* Payment methods */

    .payment-options { display: flex; flex-direction: column; gap: 8px; }
    .payment-option {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px; border: 1px solid rgba(211,152,88,0.12);
      border-radius: 2px; cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      background: rgba(21,12,12,0.3);
    }
    .payment-option:hover { border-color: rgba(211,152,88,0.35); background: rgba(21,12,12,0.5); }
    .payment-option.selected { border-color: var(--whiskey); background: rgba(211,152,88,0.06); }
    .payment-option input[type="radio"] {
      appearance: none; -webkit-appearance: none;
      width: 16px; height: 16px; border: 1px solid rgba(211,152,88,0.4);
      border-radius: 50%; background: transparent;
      flex-shrink: 0; cursor: pointer; position: relative; transition: border-color 0.15s;
    }
    .payment-option.selected input[type="radio"] { border-color: var(--whiskey); }
    .payment-option.selected input[type="radio"]::after {
      content: ''; position: absolute; top: 3px; left: 3px;
      width: 8px; height: 8px; border-radius: 50%; background: var(--whiskey);
    }
    .payment-option-icon { font-size: 18px; opacity: 0.7; }
    .payment-option-info { flex: 1; }
    .payment-option-label { font-size: 12px; font-weight: 500; color: var(--champagne); }
    .payment-option-desc { font-size: 10px; color: var(--champagne); opacity: 0.35; margin-top: 2px; }
    .card-fields {
      margin-top: 12px; display: flex; flex-direction: column; gap: 10px;
      padding: 14px; background: rgba(21,12,12,0.3);
      border: 1px solid rgba(211,152,88,0.1); border-radius: 2px;
    }
    .card-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

    /* Order summary */
    .order-summary { margin-bottom: 4px; }
    .order-summary-row {
      display: flex; justify-content: space-between;
      font-size: 12px; color: var(--champagne); opacity: 0.5;
      margin-bottom: 8px;
    }
    .order-summary-total {
      display: flex; justify-content: space-between; align-items: baseline;
      border-top: 1px solid rgba(211,152,88,0.12); padding-top: 14px; margin-top: 6px;
    }
    .order-summary-total-label {
      font-size: 10px; letter-spacing: 0.2em;
      text-transform: uppercase; color: var(--champagne); opacity: 0.5;
    }
    .order-summary-total-amount {
      font-family: var(--font-display); font-size: 28px;
      font-weight: 300; color: var(--champagne);
    }
    .order-summary-total-amount span {
      font-size: 12px; font-family: var(--font-body); opacity: 0.4; margin-right: 3px;
    }
    .place-order-btn {
      width: 100%; background: var(--whiskey); color: var(--balsamico);
      border: none; font-family: var(--font-body); font-size: 11px;
      font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase;
      padding: 18px; border-radius: 1px; cursor: pointer; margin-top: 20px;
      transition: background 0.2s, transform 0.15s;
    }
    .place-order-btn:hover:not(:disabled) { background: var(--champagne); transform: translateY(-1px); }
    .place-order-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    .checkout-status {
      margin-top: 14px; font-size: 12px; text-align: center;
      line-height: 1.5; padding: 12px; border-radius: 2px;
    }
    .checkout-status.error { background: rgba(192,57,43,0.12); color: #e74c3c; border: 1px solid rgba(192,57,43,0.2); }
    .checkout-status.success { background: rgba(211,152,88,0.1); color: var(--whiskey); border: 1px solid rgba(211,152,88,0.2); font-style: italic; }

    /* ── Order success popup ── */
    .order-popup-overlay {
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(21,12,12,0.85);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      animation: popup-fade-in 0.3s ease;
    }
    @keyframes popup-fade-in { from { opacity: 0; } to { opacity: 1; } }

    .order-popup {
      background: var(--burnt);
      border: 1px solid rgba(211,152,88,0.2);
      padding: 52px 48px;
      max-width: 420px;
      width: 90%;
      text-align: center;
      position: relative;
      animation: popup-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes popup-slide-up {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .order-popup-icon {
      font-family: var(--font-display);
      font-size: 52px;
      color: var(--whiskey);
      opacity: 0.6;
      line-height: 1;
      margin-bottom: 20px;
    }
    .order-popup-title {
      font-family: var(--font-display);
      font-size: 32px;
      font-weight: 300;
      font-style: italic;
      color: var(--champagne);
      margin-bottom: 10px;
      line-height: 1.2;
    }
    .order-popup-sub {
      font-size: 11px;
      color: var(--champagne);
      opacity: 0.42;
      letter-spacing: 0.06em;
      line-height: 1.8;
      margin-bottom: 8px;
    }
    .order-popup-id {
      font-size: 10px;
      font-family: monospace;
      color: var(--whiskey);
      opacity: 0.6;
      letter-spacing: 0.08em;
      margin-bottom: 32px;
      background: rgba(21,12,12,0.4);
      padding: 8px 14px;
      border-radius: 1px;
      display: inline-block;
    }
    .order-popup-btn {
      background: var(--whiskey);
      color: var(--balsamico);
      border: none;
      font-family: var(--font-body);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      padding: 14px 32px;
      border-radius: 1px;
      cursor: pointer;
      transition: background 0.2s;
      display: block;
      width: 100%;
    }
    .order-popup-btn:hover { background: var(--champagne); }
    .order-popup-close {
      position: absolute;
      top: 16px; right: 20px;
      background: none; border: none;
      color: var(--champagne); opacity: 0.25;
      font-size: 20px; cursor: pointer;
      transition: opacity 0.2s; line-height: 1;
    }
    .order-popup-close:hover { opacity: 0.7; }
    
    @media (max-width: 900px) {
      .cart-layout { grid-template-columns: 1fr; }
      .cart-wrap { padding: 32px 20px 60px; }
    }
  `;
  document.head.appendChild(style);
}

const PAYMENT_METHODS = [
  { id: "cod",    label: "Cash on Delivery",   desc: "Pay when your order arrives", icon: "💵" },
  { id: "card",   label: "Credit / Debit Card", desc: "Visa, Mastercard, Amex",      icon: "💳" },
  { id: "wallet", label: "Digital Wallet",      desc: "PayFast, SnapScan, Zapper",   icon: "📱" },
];

const isValidPhone      = (v) => /^[0-9+\s\-()]{7,15}$/.test(v.trim());
const isValidCardNumber = (v) => v.replace(/\s/g, "").length >= 13;
const isValidExpiry     = (v) => /^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(v.trim());
const isValidCvc        = (v) => /^\d{3,4}$/.test(v.trim());

function Field({ error, children }) {
  return (
    <div className="checkout-field">
      {children}
      {error && <div className="checkout-field-error">{error}</div>}
    </div>
  );
}

function Cart() {
  const { user, cartItems, cartTotal, removeFromCart, updateQty, clearCart, placeOrder } =
    useContext(MyContext);

  const [name, setName]                   = useState("");
  const [phone, setPhone]                 = useState("");
  const [address, setAddress]             = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cardNumber, setCardNumber]       = useState("");
  const [cardExpiry, setCardExpiry]       = useState("");
  const [cardCvc, setCardCvc]             = useState("");
  const [cardName, setCardName]           = useState("");
  const [statusMsg, setStatusMsg]         = useState("");
  const [statusType, setStatusType]       = useState("error");
  const [placing, setPlacing]             = useState(false);
  const [touched, setTouched]             = useState({});
  const [successOrder, setSuccessOrder]   = useState(null);

  const touch = (field) => setTouched((p) => ({ ...p, [field]: true }));

  const errors = {
    name:       !name.trim()             ? "Full name is required."          : "",
    phone:      !phone.trim()            ? "Phone number is required."
              : !isValidPhone(phone)     ? "Enter a valid phone number."      : "",
    address:    !address.trim()          ? "Delivery address is required."    : "",
    cardName:   paymentMethod === "card" && !cardName.trim()
                                         ? "Name on card is required."        : "",
    cardNumber: paymentMethod === "card" && !isValidCardNumber(cardNumber)
                                         ? "Enter a valid card number."       : "",
    cardExpiry: paymentMethod === "card" && !isValidExpiry(cardExpiry)
                                         ? "Use MM / YY format."              : "",
    cardCvc:    paymentMethod === "card" && !isValidCvc(cardCvc)
                                         ? "CVC must be 3–4 digits."          : "",
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const handlePlaceOrder = async () => {
    setTouched({ name:true, phone:true, address:true, cardName:true, cardNumber:true, cardExpiry:true, cardCvc:true });
    setStatusMsg("");
    if (hasErrors) {
      setStatusMsg("Please fix the errors above before placing your order.");
      setStatusType("error");
      return;
    }
    setPlacing(true);
    const res = await placeOrder({ name, phone, address, paymentMethod });
    setPlacing(false);
    if (!res.ok) {
      setStatusMsg(res.message || "Something went wrong.");
      setStatusType("error");
      return;
    }
    setName(""); setPhone(""); setAddress("");
    setCardNumber(""); setCardExpiry(""); setCardCvc(""); setCardName("");
    setTouched({});
    setSuccessOrder(res.orderId);
  };

  const handleCardNumber = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(val.replace(/(.{4})/g, "$1 ").trim());
  };

  const handleExpiry = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 3) val = val.slice(0, 2) + " / " + val.slice(2);
    setCardExpiry(val);
  };

  return (
    <div className="cart-wrap">
      <div className="cart-header">
        <h1 className="cart-title">Your Cart</h1>
        <p className="cart-subtitle">{cartItems.length} {cartItems.length === 1 ? "piece" : "pieces"} selected</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <p className="cart-empty-text">Your cart is empty</p>
          <Link to="/products" className="cart-shop-link">Browse the collection</Link>
        </div>
      ) : (
        <div className="cart-layout">

          {/*  Items */}

          <div>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  {item.imageUrl
                    ? <img className="cart-item-img" src={item.imageUrl} alt={item.name} />
                    : <div className="cart-item-img-placeholder">No img</div>}
                  <div>
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-meta">{[item.categoryName, item.material].filter(Boolean).join(" · ")}</div>
                    <div className="cart-item-price">R {Number(item.price).toLocaleString()}</div>
                  </div>
                  <div className="cart-item-controls">
                    <div className="cart-qty">
                      <button className="cart-qty-btn" onClick={() => updateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                      <input className="cart-qty-num" type="number" min="1" value={item.quantity} onChange={(e) => updateQty(item.id, e.target.value)} />
                      <button className="cart-qty-btn" onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)} title="Remove">×</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <span className="cart-item-count">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</span>
              <button className="cart-clear-btn" onClick={clearCart}>Clear cart</button>
            </div>
          </div>

          {/* Checkout panel */}

          <div className="checkout-panel">

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
              <span className="order-summary-total-amount"><span>R</span>{Number(cartTotal).toLocaleString()}</span>
            </div>

            <div className="checkout-divider" />

            {/* Guest prompt */}

            {!user ? (
              <div className="cart-guest-prompt">
                <p className="cart-guest-eyebrow">To complete your order</p>
                <h2 className="cart-guest-heading">
                  Good taste deserves<br />an account.
                </h2>
                <div className="cart-guest-divider" />
                <p className="cart-guest-sub">
                  Sign in to complete your order, track deliveries,<br />
                  and save your wishlist across devices.
                </p>
                <div className="cart-guest-actions">
                  <Link to="/login" className="cart-guest-btn-primary">Sign In</Link>
                  <Link to="/signup" className="cart-guest-btn-secondary">Create Account</Link>
                </div>
              </div>
            ) : (
              <>
                {/* Delivery details */}
                <span className="checkout-section-title">Delivery Details</span>

                <Field error={touched.name && errors.name}>
                  <input className={`checkout-input${touched.name && errors.name ? " invalid" : ""}`}
                    placeholder="Full name" value={name}
                    onChange={(e) => setName(e.target.value)} onBlur={() => touch("name")} />
                </Field>

                <Field error={touched.phone && errors.phone}>
                  <input className={`checkout-input${touched.phone && errors.phone ? " invalid" : ""}`}
                    placeholder="Phone number" value={phone}
                    onChange={(e) => setPhone(e.target.value)} onBlur={() => touch("phone")} />
                </Field>

                <Field error={touched.address && errors.address}>
                  <input className={`checkout-input${touched.address && errors.address ? " invalid" : ""}`}
                    placeholder="Delivery address" value={address}
                    onChange={(e) => setAddress(e.target.value)} onBlur={() => touch("address")} />
                </Field>

                <div className="checkout-divider" />

                {/* Payment method */}

                <span className="checkout-section-title">Payment Method</span>
                <div className="payment-options">
                  {PAYMENT_METHODS.map((method) => (
                    <label key={method.id} className={`payment-option${paymentMethod === method.id ? " selected" : ""}`}>
                      <input type="radio" name="payment" value={method.id}
                        checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} />
                      <span className="payment-option-icon">{method.icon}</span>
                      <div className="payment-option-info">
                        <div className="payment-option-label">{method.label}</div>
                        <div className="payment-option-desc">{method.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === "card" && (
                  <div className="card-fields">
                    <Field error={touched.cardName && errors.cardName}>
                      <input className={`checkout-input${touched.cardName && errors.cardName ? " invalid" : ""}`}
                        style={{ marginBottom: 0 }} placeholder="Name on card" value={cardName}
                        onChange={(e) => setCardName(e.target.value)} onBlur={() => touch("cardName")} />
                    </Field>
                    <Field error={touched.cardNumber && errors.cardNumber}>
                      <input className={`checkout-input${touched.cardNumber && errors.cardNumber ? " invalid" : ""}`}
                        style={{ marginBottom: 0 }} placeholder="Card number" value={cardNumber}
                        onChange={handleCardNumber} onBlur={() => touch("cardNumber")} maxLength={19} />
                    </Field>
                    <div className="card-row">
                      <Field error={touched.cardExpiry && errors.cardExpiry}>
                        <input className={`checkout-input${touched.cardExpiry && errors.cardExpiry ? " invalid" : ""}`}
                          style={{ marginBottom: 0 }} placeholder="MM / YY" value={cardExpiry}
                          onChange={handleExpiry} onBlur={() => touch("cardExpiry")} maxLength={7} />
                      </Field>
                      <Field error={touched.cardCvc && errors.cardCvc}>
                        <input className={`checkout-input${touched.cardCvc && errors.cardCvc ? " invalid" : ""}`}
                          style={{ marginBottom: 0 }} placeholder="CVC" value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          onBlur={() => touch("cardCvc")} maxLength={4} />
                      </Field>
                    </div>
                  </div>
                )}

                <button className="place-order-btn" onClick={handlePlaceOrder} disabled={placing}>
                  {placing ? "Placing order…" : "Place Order"}
                </button>

                {statusMsg && <div className={`checkout-status ${statusType}`}>{statusMsg}</div>}
              </>
            )}
          </div>
        </div>
      )}

      {successOrder && (
        <div className="order-popup-overlay" onClick={() => setSuccessOrder(null)}>
          <div className="order-popup" onClick={(e) => e.stopPropagation()}>
            <button className="order-popup-close" onClick={() => setSuccessOrder(null)}>×</button>
            <div className="order-popup-icon">✦</div>
            <h2 className="order-popup-title">Order placed,<br />beautifully.</h2>
            <p className="order-popup-sub">
              Thank you for your order. We'll have your<br />
              lamp on its way to you shortly.
            </p>
            <div className="order-popup-id">#{successOrder.slice(0, 16).toUpperCase()}</div>
            <button className="order-popup-btn" onClick={() => setSuccessOrder(null)}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Cart;