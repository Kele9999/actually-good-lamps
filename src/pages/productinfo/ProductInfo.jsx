import { useContext, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MyContext from "../../context/data/myContext";

/* Styles */

if (!document.getElementById("agl-product-style")) {
  const style = document.createElement("style");
  style.id = "agl-product-style";
  style.textContent = `
    .pi-wrap {
      min-height: 100vh;
      background: var(--balsamico);
      font-family: var(--font-body);
    }

    .pi-back {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--champagne);
      opacity: 0.4;
      text-decoration: none;
      padding: 28px 40px 0;
      transition: opacity 0.2s;
    }
    .pi-back:hover { opacity: 0.8; color: var(--whiskey); }
    .pi-back::before { content: '←'; font-size: 12px; }

    .pi-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      min-height: 85vh;
    }

    /* Image side */

    .pi-img-side {
      position: relative;
      background: #1e0f0a;
      overflow: hidden;
    }
    .pi-img {
      width: 100%;
      height: 100%;
      min-height: 600px;
      object-fit: cover;
      display: block;
    }
    .pi-img-placeholder {
      width: 100%; height: 100%; min-height: 600px;
      display: flex; align-items: center; justify-content: center;
      color: rgba(234,206,170,0.1); font-size: 13px; letter-spacing: 0.12em;
    }

    /* Badges on image */
    .pi-img-badges {
      position: absolute;
      top: 20px; left: 20px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .pi-badge {
      background: rgba(21,12,12,0.75);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(211,152,88,0.2);
      color: var(--whiskey);
      font-size: 9px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      padding: 6px 10px;
      border-radius: 1px;
    }

    /* Information side */

    .pi-info-side {
      background: var(--burnt);
      padding: 56px 52px 56px 56px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .pi-eyebrow {
      font-size: 9px;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: var(--whiskey);
      opacity: 0.6;
      margin-bottom: 16px;
    }

    .pi-name {
      font-family: var(--font-display);
      font-size: clamp(32px, 4vw, 52px);
      font-weight: 300;
      color: var(--champagne);
      line-height: 1.1;
      margin-bottom: 16px;
      letter-spacing: 0.02em;
    }

    .pi-price {
      font-family: var(--font-display);
      font-size: 36px;
      font-weight: 300;
      color: var(--champagne);
      margin-bottom: 28px;
    }
    .pi-price span {
      font-size: 14px;
      font-family: var(--font-body);
      opacity: 0.4;
      margin-right: 3px;
    }

    .pi-divider {
      height: 1px;
      background: rgba(211,152,88,0.1);
      margin: 24px 0;
    }

    .pi-desc {
      font-size: 14px;
      line-height: 1.85;
      color: var(--champagne);
      opacity: 0.55;
      margin-bottom: 28px;
      max-width: 420px;
    }

    /* Specs grid */

    .pi-specs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2px;
      margin-bottom: 32px;
    }
    .pi-spec {
      background: rgba(21,12,12,0.35);
      padding: 14px 16px;
    }
    .pi-spec-label {
      font-size: 8px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--whiskey);
      opacity: 0.55;
      margin-bottom: 4px;
    }
    .pi-spec-value {
      font-size: 13px;
      color: var(--champagne);
      opacity: 0.8;
      letter-spacing: 0.03em;
    }

    /* Features tags */
    .pi-features {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 36px;
    }
    .pi-feature-tag {
      background: transparent;
      border: 1px solid rgba(211,152,88,0.2);
      color: var(--champagne);
      opacity: 0.55;
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding: 6px 12px;
      border-radius: 1px;
    }

    /* Qty + actions */

    .pi-actions { display: flex; flex-direction: column; gap: 12px; }

    .pi-qty-row { display: flex; align-items: center; gap: 16px; }

    .pi-qty-label {
      font-size: 9px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--champagne);
      opacity: 0.4;
    }

    .pi-qty {
      display: flex;
      align-items: center;
      border: 1px solid rgba(211,152,88,0.2);
      border-radius: 2px;
      overflow: hidden;
    }
    .pi-qty-btn {
      background: transparent;
      border: none;
      color: var(--whiskey);
      font-size: 18px;
      width: 36px; height: 38px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s;
      font-family: var(--font-body);
    }
    .pi-qty-btn:hover { background: rgba(211,152,88,0.1); }
    .pi-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .pi-qty-num {
      width: 44px; height: 38px;
      background: transparent;
      border: none;
      border-left: 1px solid rgba(211,152,88,0.15);
      border-right: 1px solid rgba(211,152,88,0.15);
      color: var(--champagne);
      font-family: var(--font-body);
      font-size: 13px;
      text-align: center;
      outline: none;
    }
    .pi-qty-num::-webkit-inner-spin-button { -webkit-appearance: none; }

    .pi-btn-row { display: flex; gap: 10px; }

    .pi-btn-cart {
      flex: 1;
      background: var(--whiskey);
      color: var(--balsamico);
      border: none;
      font-family: var(--font-body);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      padding: 16px;
      border-radius: 1px;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
    }
    .pi-btn-cart:hover { background: var(--champagne); transform: translateY(-1px); }

    .pi-btn-wish {
      background: transparent;
      border: 1px solid rgba(211,152,88,0.25);
      color: var(--whiskey);
      font-size: 18px;
      width: 52px;
      border-radius: 1px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s, border-color 0.2s;
      flex-shrink: 0;
    }
    .pi-btn-wish:hover, .pi-btn-wish.saved {
      background: rgba(211,152,88,0.1);
      border-color: var(--whiskey);
    }

    .pi-added-msg {
      font-size: 11px;
      color: var(--whiskey);
      font-style: italic;
      opacity: 0.8;
      text-align: center;
      animation: pi-fade 0.3s ease;
    }
    @keyframes pi-fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 0.8; } }

    /* Not found */

    .pi-not-found {
      min-height: 60vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      text-align: center;
      padding: 40px;
    }
    .pi-not-found-title {
      font-family: var(--font-display);
      font-size: 36px;
      font-weight: 300;
      font-style: italic;
      color: var(--champagne);
      opacity: 0.3;
    }
    .pi-not-found-link {
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--whiskey);
      text-decoration: none;
      border-bottom: 1px solid rgba(211,152,88,0.3);
      padding-bottom: 2px;
    }

    @media (max-width: 900px) {
      .pi-layout { grid-template-columns: 1fr; }
      .pi-info-side { padding: 36px 28px; }
      .pi-back { padding: 24px 28px 0; }
    }
  `;
  document.head.appendChild(style);
}

export default function ProductInfo() {
  const { id } = useParams();
  const { products, addToCart, toggleWishlist, wishlistIds } = useContext(MyContext);

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products.find((p) => p.id === id);

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) {
    return (
      <div className="pi-wrap">
        <div className="pi-not-found">
          <p className="pi-not-found-title">This lamp doesn't exist</p>
          <Link to="/products" className="pi-not-found-link">Back to the collection</Link>
        </div>
      </div>
    );
  }

  const isSaved = wishlistIds?.has(product.id);
  const features = Array.isArray(product.features) ? product.features : [];
  const tags = Array.isArray(product.tags) ? product.tags : [];

  return (
    <div className="pi-wrap">

      <Link to="/products" className="pi-back">Back to collection</Link>

      <div className="pi-layout">

        {/* Image */}

        <div className="pi-img-side">
          {product.imageUrl ? (
            <img className="pi-img" src={product.imageUrl} alt={product.name} />
          ) : (
            <div className="pi-img-placeholder">No image available</div>
          )}

          <div className="pi-img-badges">
            {product.lightQuality && (
              <span className="pi-badge">{product.lightQuality} light</span>
            )}
            {features.includes("Dimmable") && (
              <span className="pi-badge">Dimmable</span>
            )}
            {features.includes("Smart") && (
              <span className="pi-badge">Smart</span>
            )}
          </div>
        </div>

        {/* Product Information */}

        <div className="pi-info-side">

          <p className="pi-eyebrow">
            {[product.categoryName, product.material].filter(Boolean).join(" · ")}
          </p>

          <h1 className="pi-name">{product.name}</h1>

          <div className="pi-price">
            <span>R</span>{Number(product.price).toLocaleString()}
          </div>

          {product.description && (
            <p className="pi-desc">{product.description}</p>
          )}

          <div className="pi-divider" />

          {/* Specifications */}

          <div className="pi-specs">
            {product.material && (
              <div className="pi-spec">
                <div className="pi-spec-label">Material</div>
                <div className="pi-spec-value">{product.material}</div>
              </div>
            )}
            {product.lightQuality && (
              <div className="pi-spec">
                <div className="pi-spec-label">Light Quality</div>
                <div className="pi-spec-value">{product.lightQuality}</div>
              </div>
            )}
            {product.categoryName && (
              <div className="pi-spec">
                <div className="pi-spec-label">Category</div>
                <div className="pi-spec-value">{product.categoryName}</div>
              </div>
            )}
            {product.stock !== undefined && (
              <div className="pi-spec">
                <div className="pi-spec-label">Availability</div>
                <div className="pi-spec-value">
                  {Number(product.stock) > 0 ? `${product.stock} in stock` : "Out of stock"}
                </div>
              </div>
            )}
          </div>

          {/* Feature tags */}

          {features.length > 0 && (
            <div className="pi-features">
              {features.map((f) => (
                <span key={f} className="pi-feature-tag">{f}</span>
              ))}
              {tags.map((t) => (
                <span key={t} className="pi-feature-tag">{t}</span>
              ))}
            </div>
          )}

          <div className="pi-divider" />

          {/* Qty + actions */}
          
          <div className="pi-actions">
            <div className="pi-qty-row">
              <span className="pi-qty-label">Qty</span>
              <div className="pi-qty">
                <button
                  className="pi-qty-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >−</button>
                <input
                  className="pi-qty-num"
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                />
                <button
                  className="pi-qty-btn"
                  onClick={() => setQty((q) => q + 1)}
                >+</button>
              </div>
            </div>

            <div className="pi-btn-row">
              <button className="pi-btn-cart" onClick={handleAddToCart}>
                Add to cart
              </button>
              <button
                className={`pi-btn-wish${isSaved ? " saved" : ""}`}
                onClick={() => toggleWishlist(product)}
                title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
              >
                {isSaved ? "♥" : "♡"}
              </button>
            </div>

            {added && <p className="pi-added-msg">Added to your cart</p>}
          </div>

        </div>
      </div>
    </div>
  );
}