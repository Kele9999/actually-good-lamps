import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import Signup from "./pages/signup/Signup";
import RequireAdmin from "./components/auth/RequireAdmin";
import RequireAuth from "./components/auth/RequireAuth";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/homepage/HomePage";
import AllProducts from "./pages/allproducts/AllProducts";
import ProductInfo from "./pages/productinfo/ProductInfo";
import Order from "./pages/order/Order";
import Cart from "./pages/cart/Cart";
import Dashboard from "./pages/administrator/dashboard/Dashboard";
import NoPage from "./pages/nopage/NoPage";


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<AllProducts />} />
          <Route path="product/:id" element={<ProductInfo />} />
          <Route path="cart" element={<Cart />} />
          <Route path="*" element={<NoPage />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="dashboard"element={<RequireAdmin> <Dashboard /> </RequireAdmin>} />
          <Route path="order" element={<RequireAuth><Order /></RequireAuth>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;