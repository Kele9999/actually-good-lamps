import { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MyContext from "../../context/data/myContext";
import { FiShoppingCart, FiHeart } from "react-icons/fi";

/* ── Styles ── */
if (!document.getElementById("agl-navbar-style")) {
  const style = document.createElement("style");
  style.id = "agl-navbar-style";
  style.textContent = `
    :root {
      --balsamico: #150C0C;
      --burnt:     #34150F;
      --honey:     #85431E;
      --whiskey:   #D39858;
      --champagne: #EACEAA;
      --font-display: 'Cormorant Garamond', serif;
      --font-body:    'Jost', sans-serif;
    }

    .agl-nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      background: rgba(21, 12, 12, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(211, 152, 88, 0.12);
      font-family: var(--font-body);
    }

    .agl-nav-inner {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      padding: 0 40px;
      height: 68px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Logo — left */
    .agl-nav-logo {
      text-decoration: none;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .agl-nav-logo-main {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 400;
      letter-spacing: 0.08em;
      color: var(--champagne);
      line-height: 1;
    }
    .agl-nav-logo-sub {
      font-size: 8px;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--whiskey);
      opacity: 0.55;
    }

    /* Center nav links */
    .agl-nav-center {
      display: flex;
      align-items: center;
      gap: 36px;
    }

    .agl-nav-link {
      text-decoration: none;
      font-size: 10px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--champagne);
      opacity: 0.55;
      transition: opacity 0.2s, color 0.2s;
      position: relative;
      padding-bottom: 2px;
    }
    .agl-nav-link::after {
      content: '';
      position: absolute;
      bottom: -2px; left: 0; right: 0;
      height: 1px;
      background: var(--whiskey);
      transform: scaleX(0);
      transition: transform 0.25s ease;
      transform-origin: left;
    }
    .agl-nav-link:hover { opacity: 1; color: var(--champagne); }
    .agl-nav-link:hover::after { transform: scaleX(1); }
    .agl-nav-link.active { opacity: 1; color: var(--whiskey); }
    .agl-nav-link.active::after { transform: scaleX(1); background: var(--whiskey); }

    /* Right side */
    .agl-nav-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 20px;
    }

    .agl-nav-icon-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      font-size: 10px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--champagne);
      opacity: 0.55;
      transition: opacity 0.2s;
      background: none;
      border: none;
      cursor: pointer;
      font-family: var(--font-body);
      padding: 0;
    }
    .agl-nav-icon-btn:hover { opacity: 1; }

    .agl-nav-icon-btn svg { width: 16px; height: 16px; stroke: currentColor; }

    .agl-nav-badge {
      font-size: 9px;
      color: var(--whiskey);
      opacity: 1;
    }

    .agl-nav-divider {
      width: 1px;
      height: 16px;
      background: rgba(211,152,88,0.2);
    }

    .agl-nav-email {
      font-size: 10px;
      letter-spacing: 0.05em;
      color: var(--champagne);
      opacity: 0.35;
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .agl-nav-logout {
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--champagne);
      opacity: 0.45;
      background: none;
      border: none;
      cursor: pointer;
      font-family: var(--font-body);
      padding: 0;
      transition: opacity 0.2s, color 0.2s;
    }
    .agl-nav-logout:hover { opacity: 1; color: var(--whiskey); }

    .agl-nav-auth-link {
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--champagne);
      opacity: 0.45;
      text-decoration: none;
      transition: opacity 0.2s, color 0.2s;
    }
    .agl-nav-auth-link:hover { opacity: 1; color: var(--champagne); }

    .agl-nav-auth-link.primary {
      background: var(--whiskey);
      color: var(--balsamico);
      opacity: 1;
      padding: 8px 18px;
      border-radius: 1px;
      font-weight: 500;
      transition: background 0.2s;
    }
    .agl-nav-auth-link.primary:hover { background: var(--champagne); color: var(--balsamico); }

    /* Spacer so page content isn't hidden under fixed nav */
    .agl-nav-spacer { height: 68px; }
  `;
  document.head.appendChild(style);
}

function Navbar() {
  const { user, role, logout, cartCount, wishlistItems } = useContext(MyContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = role === "admin";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path) =>
    location.pathname === path ? "agl-nav-link active" : "agl-nav-link";

  return (
    <>
      <header className="agl-nav">
        <div className="agl-nav-inner">

          {/* ── Logo ── */}
          <Link to={isAdmin ? "/dashboard" : "/"} className="agl-nav-logo">
            <span className="agl-nav-logo-main">AGL</span>
            <span className="agl-nav-logo-sub">Actually Good Lamps</span>
          </Link>

          {/* ── Center links ── */}
          <nav className="agl-nav-center">
            {!isAdmin && (
              <>
                <Link to="/" className={isActive("/")}>Home</Link>
                <Link to="/products" className={isActive("/products")}>Shop</Link>
                <Link to="/wishlist" className={isActive("/wishlist")}>Wishlist</Link>
                {user && (
                <Link to="/my-orders" className={isActive("/my-orders")}>My Orders</Link>
                )}
                
              </>
            )}
            {isAdmin && (
              <>
                <Link to="/dashboard" className={isActive("/dashboard")}>Dashboard</Link>
              </>
            )}
          </nav>

          {/* ── Right side ── */}
          <div className="agl-nav-right">
            {!isAdmin && (
              <>
                <Link to="/wishlist" className="agl-nav-icon-btn">
                  <FiHeart />
                  {(wishlistItems?.length ?? 0) > 0 && (
                    <span className="agl-nav-badge">{wishlistItems.length}</span>
                  )}
                </Link>

                <Link to="/cart" className="agl-nav-icon-btn">
                  <FiShoppingCart />
                  {cartCount > 0 && (
                    <span className="agl-nav-badge">{cartCount}</span>
                  )}
                </Link>

                <div className="agl-nav-divider" />
              </>
            )}

            {!user ? (
              <>
                <Link to="/login" className="agl-nav-auth-link">Login</Link>
                <Link to="/signup" className="agl-nav-auth-link primary">Sign up</Link>
              </>
            ) : (
              <>
                <span className="agl-nav-email">{user.email}</span>
                <button className="agl-nav-logout" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
          </div>

        </div>
      </header>

      {/* Pushes page content below the fixed nav */}
      <div className="agl-nav-spacer" />
    </>
  );
}

export default Navbar;