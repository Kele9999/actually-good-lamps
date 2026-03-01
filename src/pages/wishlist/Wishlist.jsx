import { useContext } from "react";
import { Link } from "react-router-dom";
import MyContext from "../../context/data/myContext";

/* ── Styles ── */
if (!document.getElementById("agl-wishlist-style")) {
  const style = document.createElement("style");
  style.id = "agl-wishlist-style";
  style.textContent = `
    .wl-wrap {
      min-height: 100vh;
      background: var(--balsamico);
      padding: 48px 40px 80px;
      font-family: var(--font-body);
    }
    .wl-header {
      border-bottom: 1px solid rgba(211,152,88,0.1);
      padding-bottom: 20px;
      margin-bottom: 40px;
    }
    .wl-title {
      font-family: var(--font-display);
      font-size: 42px;
      font-weight: 300;
      color: var(--champagne);
      letter-spacing: 0.05em;
    }
    .wl-subtitle {
      font-size: 10px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--whiskey);
      opacity: 0.55;
      margin-top: 8px;
    }
    .wl-guest-note {
      background: var(--burnt);
      border: 1px solid rgba(211,152,88,0.12);
      border-radius: 2px;
      padding: 14px 18px;
      font-size: 12px;
      color: var(--champagne);
      opacity: 0.65;
      margin-bottom: 32px;
      line-height: 1.65;
    }
    .wl-guest-note a {
      color: var(--whiskey);
      text-decoration: none;
      border-bottom: 1px solid rgba(211,152,88,0.3);
      padding-bottom: 1px;
      transition: opacity 0.2s;
    }
    .wl-guest-note a:hover { opacity: 0.7; }

    .wl-empty {
      text-align: center;
      padding: 100px 20px;
    }
    .wl-empty-text {
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 300;
      font-style: italic;
      color: var(--champagne);
      opacity: 0.28;
      margin-bottom: 24px;
    }
    .wl-browse-link {
      display: inline-block;
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--whiskey);
      text-decoration: none;
      border-bottom: 1px solid rgba(211,152,88,0.3);
      padding-bottom: 2px;
      transition: opacity 0.2s;
    }
    .wl-browse-link:hover { opacity: 0.7; }

    .wl-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
    }

    .wl-card {
      background: var(--burnt);
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease;
    }
    .wl-card:hover { transform: translateY(-3px); }

    .wl-card-img-wrap {
      width: 100%;
      aspect-ratio: 3/4;
      overflow: hidden;
      background: #1e0f0a;
      position: relative;
    }
    .wl-card-img {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.5s ease;
    }
    .wl-card:hover .wl-card-img { transform: scale(1.04); }
    .wl-card-img-placeholder {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      color: rgba(234,206,170,0.12); font-size: 11px; letter-spacing: 0.1em;
    }

    .wl-card-overlay {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      background: linear-gradient(to top, rgba(21,12,12,0.95) 0%, rgba(21,12,12,0.3) 65%, transparent 100%);
      padding: 18px 14px 14px;
      transform: translateY(52px);
      transition: transform 0.32s ease;
    }
    .wl-card:hover .wl-card-overlay { transform: translateY(0); }

    .wl-card-actions { display: flex; gap: 8px; margin-top: 10px; }

    .wl-btn-cart {
      flex: 1;
      background: var(--whiskey);
      color: var(--balsamico);
      border: none;
      font-family: var(--font-body);
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      padding: 10px 8px;
      border-radius: 1px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .wl-btn-cart:hover { background: var(--champagne); }

    .wl-btn-remove {
      background: transparent;
      border: 1px solid rgba(211,152,88,0.25);
      color: var(--champagne);
      opacity: 0.5;
      font-size: 15px;
      width: 38px;
      border-radius: 1px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: opacity 0.2s, border-color 0.2s, color 0.2s;
      flex-shrink: 0;
    }
    .wl-btn-remove:hover { opacity: 1; color: #e74c3c; border-color: rgba(231,76,60,0.35); }

    .wl-card-info { padding: 14px 16px 20px; }
    .wl-card-meta {
      font-size: 9px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--whiskey);
      opacity: 0.6;
      margin-bottom: 5px;
    }
    .wl-card-name {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 400;
      color: var(--champagne);
      line-height: 1.25;
      margin-bottom: 6px;
    }
    .wl-card-price {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 300;
      color: var(--champagne);
    }
    .wl-card-price span {
      font-size: 11px;
      font-family: var(--font-body);
      opacity: 0.4;
      margin-right: 2px;
    }

    @media (max-width: 1100px) { .wl-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px)  { .wl-grid { grid-template-columns: 1fr; } .wl-wrap { padding: 32px 20px 60px; } }
  `;
  document.head.appendChild(style);
}

export default function Wishlist() {
  
  const { user, wishlist: wishlistItems, toggleWishlist, addToCart } = useContext(MyContext);

  return (
    <div className="wl-wrap">

      <div className="wl-header">
        <h1 className="wl-title">Saved Lamps</h1>
        <p className="wl-subtitle">
          {wishlistItems?.length ?? 0} {wishlistItems?.length === 1 ? "piece" : "pieces"} saved
        </p>
      </div>

      {/* Guest notice */}
      {!user && (
        <div className="wl-guest-note">
          You're browsing as a guest — your saved lamps will be lost when you close this tab.{" "}
          <Link to="/login">Log in</Link> or <Link to="/signup">create an account</Link> to keep them permanently.
        </div>
      )}

      {!wishlistItems || wishlistItems.length === 0 ? (
        <div className="wl-empty">
          <p className="wl-empty-text">Nothing saved yet</p>
          <Link to="/products" className="wl-browse-link">Browse the collection</Link>
        </div>
      ) : (
        <div className="wl-grid">
          {wishlistItems.map((w) => {
            // logged-in items use productId, guest items use id
            const id = w.productId || w.id;

            return (
              <div key={id} className="wl-card">

                <div className="wl-card-img-wrap">
                  {w.imageUrl ? (
                    <img className="wl-card-img" src={w.imageUrl} alt={w.name} loading="lazy" />
                  ) : (
                    <div className="wl-card-img-placeholder">No image</div>
                  )}

                  <div className="wl-card-overlay">
                    <div className="wl-card-actions">
                      <button
                        className="wl-btn-cart"
                        onClick={() => addToCart(w, 1)}
                      >
                        Add to cart
                      </button>
                      <button
                        className="wl-btn-remove"
                        onClick={() => toggleWishlist(w)}
                        title="Remove from wishlist"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>

                <div className="wl-card-info">
                  <div className="wl-card-meta">
                    {[w.categoryName, w.material].filter(Boolean).join(" · ")}
                  </div>
                  <div className="wl-card-name">{w.name}</div>
                  <div className="wl-card-price">
                    <span>R</span>{Number(w.price).toLocaleString()}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}