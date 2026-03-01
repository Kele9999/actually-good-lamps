import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import MyContext from "../../context/data/myContext";

if (!document.getElementById("agl-myorders-style")) {
  const style = document.createElement("style");
  style.id = "agl-myorders-style";
  style.textContent = `
    .mo-wrap { min-height: 100vh; background: var(--balsamico); padding: 48px 40px 80px; font-family: var(--font-body); }
    .mo-header { border-bottom: 1px solid rgba(211,152,88,0.1); padding-bottom: 20px; margin-bottom: 40px; }
    .mo-title { font-family: var(--font-display); font-size: 42px; font-weight: 300; color: var(--champagne); letter-spacing: 0.05em; }
    .mo-sub { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--whiskey); opacity: 0.55; margin-top: 8px; }

    .mo-login-note { background: var(--burnt); border: 1px solid rgba(211,152,88,0.12); border-radius: 2px; padding: 16px 20px; font-size: 13px; color: var(--champagne); opacity: 0.65; line-height: 1.7; }
    .mo-login-note a { color: var(--whiskey); text-decoration: none; border-bottom: 1px solid rgba(211,152,88,0.3); }

    .mo-empty { text-align: center; padding: 80px 20px; }
    .mo-empty-text { font-family: var(--font-display); font-size: 26px; font-weight: 300; font-style: italic; color: var(--champagne); opacity: 0.28; margin-bottom: 20px; }
    .mo-shop-link { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--whiskey); text-decoration: none; border-bottom: 1px solid rgba(211,152,88,0.3); padding-bottom: 2px; }

    .mo-list { display: flex; flex-direction: column; gap: 2px; }

    .mo-order { background: var(--burnt); overflow: hidden; }
    .mo-order-head {
      display: grid; grid-template-columns: 1fr auto auto auto auto;
      gap: 28px; align-items: center; padding: 18px 24px;
      cursor: pointer; transition: background 0.15s;
    }
    .mo-order-head:hover { background: rgba(211,152,88,0.04); }

    .mo-order-id   { font-family: monospace; font-size: 10px; color: var(--champagne); opacity: 0.4; }
    .mo-order-date { font-size: 11px; color: var(--champagne); opacity: 0.38; }
    .mo-order-total { font-family: var(--font-display); font-size: 20px; font-weight: 300; color: var(--champagne); white-space: nowrap; }
    .mo-order-total span { font-size: 11px; font-family: var(--font-body); opacity: 0.4; margin-right: 2px; }

    .mo-badge { display: inline-block; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; padding: 5px 10px; border-radius: 1px; white-space: nowrap; }
    .mo-pending   { background: rgba(211,152,88,0.12); color: var(--whiskey); }
    .mo-complete  { background: rgba(46,125,50,0.15); color: #81c784; }
    .mo-cancelled { background: rgba(192,57,43,0.15); color: #e57373; }

    .mo-chevron { font-size: 11px; color: var(--whiskey); opacity: 0.35; transition: transform 0.2s; }
    .mo-chevron.open { transform: rotate(180deg); }

    .mo-detail { padding: 4px 24px 24px; border-top: 1px solid rgba(211,152,88,0.07); }
    .mo-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; padding-top: 20px; }
    .mo-detail-label { font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--whiskey); opacity: 0.55; margin-bottom: 14px; display: block; }

    .mo-item { display: flex; align-items: center; gap: 14px; padding: 10px 0; border-bottom: 1px solid rgba(211,152,88,0.06); }
    .mo-item-img { width: 48px; height: 48px; object-fit: cover; border-radius: 1px; background: #1e0f0a; flex-shrink: 0; display: block; }
    .mo-item-name { font-size: 13px; color: var(--champagne); opacity: 0.8; }
    .mo-item-qty  { font-size: 10px; color: var(--champagne); opacity: 0.38; margin-top: 2px; }
    .mo-item-price { font-family: var(--font-display); font-size: 16px; font-weight: 300; margin-left: auto; flex-shrink: 0; opacity: 0.8; }

    .mo-delivery { font-size: 12px; color: var(--champagne); opacity: 0.6; line-height: 1.9; }
    .mo-delivery strong { opacity: 1; color: var(--champagne); }

    @media (max-width: 800px) {
      .mo-wrap { padding: 32px 20px 60px; }
      .mo-order-head { grid-template-columns: 1fr auto auto; gap: 12px; }
      .mo-order-id, .mo-order-date { display: none; }
      .mo-detail-grid { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(style);
}

const STATUS_CLS   = { pending_payment: "mo-pending", complete: "mo-complete", cancelled: "mo-cancelled" };
const STATUS_LABEL = { pending_payment: "Pending", complete: "Complete", cancelled: "Cancelled" };

export default function MyOrders() {
  const { user, userOrders, userOrdersLoading } = useContext(MyContext);
  const [expanded, setExpanded] = useState(null);

  if (!user) return (
    <div className="mo-wrap">
      <div className="mo-header"><h1 className="mo-title">My Orders</h1></div>
      <div className="mo-login-note"><Link to="/login">Log in</Link> to view your order history.</div>
    </div>
  );

  return (
    <div className="mo-wrap">
      <div className="mo-header">
        <h1 className="mo-title">My Orders</h1>
        <p className="mo-sub">{userOrders?.length ?? 0} orders placed</p>
      </div>

      {userOrdersLoading ? (
        <p style={{ fontSize: 12, opacity: 0.38, letterSpacing: "0.1em" }}>Loading your orders…</p>
      ) : !userOrders || userOrders.length === 0 ? (
        <div className="mo-empty">
          <p className="mo-empty-text">No orders yet</p>
          <Link to="/products" className="mo-shop-link">Start shopping</Link>
        </div>
      ) : (
        <div className="mo-list">
          {userOrders.map((o) => {
            const isOpen = expanded === o.id;
            const pm = o.customer?.paymentMethod || o.paymentMethod || "—";

            return (
              <div key={o.id} className="mo-order">
                <div className="mo-order-head" onClick={() => setExpanded(isOpen ? null : o.id)}>
                  <div>
                    <div className="mo-order-id">#{o.id.slice(0, 16).toUpperCase()}</div>
                    <div className="mo-order-date">
                      {o.createdAt?.toDate?.()?.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }) || "—"}
                    </div>
                  </div>
                  <div className="mo-order-date">{(o.items || []).length} item{(o.items || []).length !== 1 ? "s" : ""}</div>
                  <div className="mo-order-total"><span>R</span>{Number(o.total).toLocaleString()}</div>
                  <span className={`mo-badge ${STATUS_CLS[o.status] || "mo-pending"}`}>
                    {STATUS_LABEL[o.status] || o.status}
                  </span>
                  <span className={`mo-chevron${isOpen ? " open" : ""}`}>▼</span>
                </div>

                {isOpen && (
                  <div className="mo-detail">
                    <div className="mo-detail-grid">
                      <div>
                        <span className="mo-detail-label">Items ordered</span>
                        {(o.items || []).map((it, i) => (
                          <div key={i} className="mo-item">
                            {it.imageUrl
                              ? <img src={it.imageUrl} className="mo-item-img" alt={it.name} />
                              : <div className="mo-item-img" />}
                            <div style={{ flex: 1 }}>
                              <div className="mo-item-name">{it.name}</div>
                              <div className="mo-item-qty">Qty: {it.quantity}</div>
                            </div>
                            <div className="mo-item-price">
                              R {((Number(it.price) || 0) * (Number(it.quantity) || 0)).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <span className="mo-detail-label">Delivery &amp; Payment</span>
                        <div className="mo-delivery">
                          <div><strong>{o.customer?.name}</strong></div>
                          <div>{o.customer?.phone}</div>
                          <div>{o.customer?.address}</div>
                          <div style={{ marginTop: 12 }}>Payment: <strong>{pm}</strong></div>
                          <div>Status: <strong>{STATUS_LABEL[o.status] || o.status}</strong></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}