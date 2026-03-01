import { Link } from "react-router-dom";

/* ── Styles ── */
if (!document.getElementById("agl-footer-style")) {
  const style = document.createElement("style");
  style.id = "agl-footer-style";
  style.textContent = `
    .agl-footer {
      background: var(--burnt);
      border-top: 1px solid rgba(211,152,88,0.1);
      font-family: var(--font-body);
    }

    /* ── Main footer grid ── */
    .agl-footer-main {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 64px;
      padding: 80px 64px 64px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Brand column */
    .agl-footer-brand-name {
      font-family: var(--font-display);
      font-size: 32px;
      font-weight: 300;
      color: var(--champagne);
      letter-spacing: 0.06em;
      line-height: 1;
      margin-bottom: 6px;
    }
    .agl-footer-brand-tag {
      font-size: 9px;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--whiskey);
      opacity: 0.5;
      margin-bottom: 24px;
    }
    .agl-footer-brand-desc {
      font-size: 13px;
      line-height: 1.8;
      color: var(--champagne);
      opacity: 0.45;
      max-width: 280px;
      margin-bottom: 32px;
    }

    /* Social icons */
    .agl-footer-socials {
      display: flex;
      gap: 12px;
    }
    .agl-footer-social {
      width: 36px;
      height: 36px;
      border: 1px solid rgba(211,152,88,0.2);
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--champagne);
      opacity: 0.4;
      text-decoration: none;
      font-size: 14px;
      transition: opacity 0.2s, border-color 0.2s;
    }
    .agl-footer-social:hover {
      opacity: 1;
      border-color: rgba(211,152,88,0.5);
      color: var(--whiskey);
    }

    /* Nav columns */
    .agl-footer-col-title {
      font-size: 9px;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: var(--whiskey);
      opacity: 0.6;
      margin-bottom: 20px;
      display: block;
    }
    .agl-footer-links {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .agl-footer-link {
      font-size: 13px;
      color: var(--champagne);
      opacity: 0.45;
      text-decoration: none;
      transition: opacity 0.2s, color 0.2s;
      letter-spacing: 0.02em;
    }
    .agl-footer-link:hover {
      opacity: 1;
      color: var(--whiskey);
    }

    /* ── Newsletter strip ── */
    .agl-footer-newsletter {
      border-top: 1px solid rgba(211,152,88,0.08);
      border-bottom: 1px solid rgba(211,152,88,0.08);
      padding: 40px 64px;
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 40px;
    }
    .agl-footer-nl-left { flex-shrink: 0; }
    .agl-footer-nl-title {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 300;
      color: var(--champagne);
      margin-bottom: 4px;
    }
    .agl-footer-nl-title em { font-style: italic; color: var(--whiskey); }
    .agl-footer-nl-sub {
      font-size: 11px;
      color: var(--champagne);
      opacity: 0.4;
      letter-spacing: 0.04em;
    }
    .agl-footer-nl-form {
      display: flex;
      flex: 1;
      max-width: 420px;
      border: 1px solid rgba(211,152,88,0.22);
      border-radius: 2px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .agl-footer-nl-form:focus-within { border-color: rgba(211,152,88,0.5); }
    .agl-footer-nl-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--champagne);
      font-family: var(--font-body);
      font-size: 13px;
      padding: 12px 16px;
    }
    .agl-footer-nl-input::placeholder { color: rgba(234,206,170,0.25); font-style: italic; }
    .agl-footer-nl-btn {
      background: var(--whiskey);
      border: none;
      color: var(--balsamico);
      font-family: var(--font-body);
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      padding: 12px 20px;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.2s;
    }
    .agl-footer-nl-btn:hover { background: var(--champagne); }

    /* ── Bottom bar ── */
    .agl-footer-bottom {
      padding: 24px 64px;
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .agl-footer-copy {
      font-size: 11px;
      color: var(--champagne);
      opacity: 0.25;
      letter-spacing: 0.06em;
    }
    .agl-footer-copy em {
      font-style: normal;
      color: var(--whiskey);
      opacity: 0.6;
    }
    .agl-footer-bottom-links {
      display: flex;
      gap: 24px;
    }
    .agl-footer-bottom-link {
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--champagne);
      opacity: 0.22;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .agl-footer-bottom-link:hover { opacity: 0.6; }

    /* ── Decorative quote strip ── */
    .agl-footer-quote {
      padding: 0 64px 0;
      max-width: 1400px;
      margin: 0 auto 40px;
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .agl-footer-quote-line {
      flex: 1;
      height: 1px;
      background: rgba(211,152,88,0.08);
    }
    .agl-footer-quote-text {
      font-family: var(--font-display);
      font-size: 14px;
      font-style: italic;
      font-weight: 300;
      color: var(--champagne);
      opacity: 0.2;
      white-space: nowrap;
      letter-spacing: 0.04em;
    }

    @media (max-width: 1024px) {
      .agl-footer-main { grid-template-columns: 1fr 1fr; gap: 40px; padding: 60px 32px 48px; }
      .agl-footer-newsletter { flex-direction: column; align-items: flex-start; padding: 36px 32px; }
      .agl-footer-nl-form { max-width: 100%; width: 100%; }
      .agl-footer-bottom { padding: 20px 32px; flex-direction: column; align-items: flex-start; gap: 12px; }
      .agl-footer-quote { padding: 0 32px; }
    }
    @media (max-width: 640px) {
      .agl-footer-main { grid-template-columns: 1fr; padding: 48px 24px 40px; }
      .agl-footer-newsletter { padding: 32px 24px; }
      .agl-footer-bottom { padding: 20px 24px; }
      .agl-footer-quote { padding: 0 24px; }
      .agl-footer-bottom-links { flex-wrap: wrap; gap: 16px; }
    }
  `;
  document.head.appendChild(style);
}

export default function Footer() {
  return (
    <footer className="agl-footer">

      {/* ── Main columns ── */}
      <div className="agl-footer-main">

        {/* Brand */}
        <div>
          <div className="agl-footer-brand-name">AGL</div>
          <div className="agl-footer-brand-tag">Actually Good Lamps · South Africa</div>
          <p className="agl-footer-brand-desc">
            A curated edit of premium lamps for spaces that take light seriously.
            Every piece hand-selected for design integrity, material quality,
            and the way it transforms a room.
          </p>
          <div className="agl-footer-socials">
            <a href="#" className="agl-footer-social" title="Instagram">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="#" className="agl-footer-social" title="Pinterest">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.03-2.83.19-.77 1.27-5.37 1.27-5.37s-.32-.65-.32-1.61c0-1.51.88-2.64 1.97-2.64.93 0 1.38.7 1.38 1.54 0 .94-.6 2.34-.91 3.64-.26 1.09.54 1.97 1.6 1.97 1.92 0 3.21-2.45 3.21-5.35 0-2.21-1.49-3.76-3.62-3.76-2.47 0-3.92 1.85-3.92 3.76 0 .74.29 1.54.64 1.97.07.09.08.17.06.26l-.24.97c-.04.16-.13.19-.3.11-1.12-.52-1.82-2.16-1.82-3.48 0-2.83 2.06-5.43 5.93-5.43 3.11 0 5.53 2.22 5.53 5.18 0 3.09-1.95 5.57-4.65 5.57-.91 0-1.76-.47-2.05-1.03l-.56 2.09c-.2.78-.75 1.76-1.12 2.35.85.26 1.74.4 2.67.4 5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
              </svg>
            </a>
            <a href="#" className="agl-footer-social" title="Facebook">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="#" className="agl-footer-social" title="WhatsApp">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <span className="agl-footer-col-title">Shop</span>
          <div className="agl-footer-links">
            <Link to="/products" className="agl-footer-link">All Lamps</Link>
            <Link to="/products" className="agl-footer-link">Floor Lamps</Link>
            <Link to="/products" className="agl-footer-link">Table Lamps</Link>
            <Link to="/products" className="agl-footer-link">Pendant Lamps</Link>
            <Link to="/products" className="agl-footer-link">Desk Lamps</Link>
            <Link to="/wishlist" className="agl-footer-link">Saved Items</Link>
          </div>
        </div>

        {/* Info */}
        <div>
          <span className="agl-footer-col-title">Information</span>
          <div className="agl-footer-links">
            <Link to="/" className="agl-footer-link">About Us</Link>
            <a href="#" className="agl-footer-link">Delivery & Returns</a>
            <a href="#" className="agl-footer-link">Care & Maintenance</a>
            <a href="#" className="agl-footer-link">FAQ</a>
            <a href="#" className="agl-footer-link">Contact Us</a>
          </div>
        </div>

        {/* Contact */}
        <div>
          <span className="agl-footer-col-title">Get in Touch</span>
          <div className="agl-footer-links">
            <a href="mailto:hello@actuallygoodlamps.co.za" className="agl-footer-link">
              hello@actuallygoodlamps.co.za
            </a>
            <a href="tel:+27000000000" className="agl-footer-link">+27 (0) 00 000 0000</a>
            <span className="agl-footer-link" style={{ cursor: "default" }}>
              Johannesburg, South Africa
            </span>
            <span className="agl-footer-link" style={{ cursor: "default", marginTop: 8, fontSize: 11, opacity: 0.3 }}>
              Mon – Fri &nbsp;·&nbsp; 9am – 5pm SAST
            </span>
          </div>
        </div>

      </div>

      {/* ── Newsletter ── */}
      <div className="agl-footer-newsletter">
        <div className="agl-footer-nl-left">
          <div className="agl-footer-nl-title">
            Stay in the <em>light</em>
          </div>
          <div className="agl-footer-nl-sub">
            New arrivals, design notes, and exclusive offers — no noise.
          </div>
        </div>
        <div className="agl-footer-nl-form">
          <input
            className="agl-footer-nl-input"
            type="email"
            placeholder="Your email address…"
          />
          <button className="agl-footer-nl-btn">Subscribe</button>
        </div>
      </div>

      {/* ── Decorative quote ── */}
      <div className="agl-footer-quote">
        <div className="agl-footer-quote-line" />
        <span className="agl-footer-quote-text">
          "Light is the first of painters. There is no object so foul that intense light will not make it beautiful." — Emerson
        </span>
        <div className="agl-footer-quote-line" />
      </div>

      {/* ── Bottom bar ── */}
      <div className="agl-footer-bottom">
        <span className="agl-footer-copy">
          © {new Date().getFullYear()} <em>Actually Good Lamps</em>. All rights reserved. Crafted in South Africa.
        </span>
        <div className="agl-footer-bottom-links">
          <a href="#" className="agl-footer-bottom-link">Privacy Policy</a>
          <a href="#" className="agl-footer-bottom-link">Terms of Use</a>
          <a href="#" className="agl-footer-bottom-link">Cookie Policy</a>
        </div>
      </div>

    </footer>
  );
}