import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MyContext from "../../context/data/myContext";

export default function Signup() {
  const { signup } = useContext(MyContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await signup(email, password);
      navigate("/", { replace: true });
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 420 }}>
      <h2>Create account</h2>
      {err && <p style={{ color: "red" }}>{err}</p>}
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        <button type="submit">Sign up</button>
      </form>
      <p style={{ marginTop: 10 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}