import { useContext } from "react";
import { Navigate } from "react-router-dom";
import MyContext from "../../context/data/myContext";

export default function RequireAdmin({ children }) {
  const { user, role, authLoading } = useContext(MyContext);

  if (authLoading) return <p style={{ padding: 16 }}>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/" replace />;

  return children;
}