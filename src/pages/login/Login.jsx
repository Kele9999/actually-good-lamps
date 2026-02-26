import { useContext, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import MyContext from "../../context/data/myContext";

export default function Login() {
  const { login } = useContext(MyContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 420 }}>
      <h2>Login</h2>
      {err && <p style={{ color: "red" }}>{err}</p>}
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        <button type="submit">Login</button>
      </form>
      <p style={{ marginTop: 10 }}>
        No account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}