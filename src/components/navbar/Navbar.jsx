import { useContext } from "react";
import { Link } from "react-router-dom";
import MyContext from "../../context/data/myContext";
import { FiShoppingCart } from "react-icons/fi";

function Navbar() {
  const { cartCount } = useContext(MyContext);

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
          to="/"
          style={{
            fontWeight: 700,
            fontSize: 20,
            textDecoration: "none",
            color: "black",
          }}
        >
          Actually Good Lamps
        </Link>

        <nav style={{ display: "flex", gap: 20 }}>
          <Link to="/products">Shop</Link>
          <Link to="/cart" style={{ display: "flex", alignItems: "center", gap: 6 }}> <FiShoppingCart /> Cart ({cartCount})</Link>
          <Link to="/dashboard">Admin</Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;