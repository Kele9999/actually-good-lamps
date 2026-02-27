import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import MyContext from "../../context/data/myContext";
import { FiShoppingCart } from "react-icons/fi";

function Navbar() {
  const { user, role, logout, cartCount, wishlistItems } = useContext(MyContext);
  const navigate = useNavigate();

  const isAdmin = role === "admin";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header style={{ borderBottom: "1px solid #ddd" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
        }}
      >
        <Link
          to={isAdmin ? "/dashboard" : "/"}
          style={{
            fontWeight: 700,
            fontSize: 20,
            textDecoration: "none",
            color: "black",
          }}
        >
          Actually Good Lamps
        </Link>

        <nav style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {/* ✅ Customer and Guest nav */}
          {!isAdmin && (
            <>
              <Link to="/products">Shop</Link>

              <Link to="/wishlist">
                Wishlist ({wishlistItems?.length ?? 0})
              </Link>

              <Link
                to="/cart"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <FiShoppingCart /> Cart ({cartCount})
              </Link>
            </>
          )}

          {/* ✅ Admin nav*/}
          {isAdmin && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/analytics">Analytics</Link>
              <Link to="/admin/products">Manage</Link>
            </>
          )}

          {/* ✅ Authentication */}
          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign up</Link>
            </>
          ) : (
            <>
              <span style={{ fontSize: 12, opacity: 0.8 }}>{user.email}</span>
              <button
                onClick={handleLogout}
                style={{
                  border: "1px solid #ddd",
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;