import { useContext } from "react";
import { Link } from "react-router-dom";
import MyContext from "../../context/data/myContext";

function Navbar() {
  const { cartCount } = useContext(MyContext);

  return (
    <nav style={{ display: "flex", gap: 16, padding: 16, borderBottom: "1px solid #ddd" }}>
      <Link to="/">Home</Link>
      <Link to="/products">Shop</Link>
      <Link to="/cart">Cart ({cartCount})</Link>
      <Link to="/dashboard">Admin</Link>
    </nav>
  );
}

export default Navbar;