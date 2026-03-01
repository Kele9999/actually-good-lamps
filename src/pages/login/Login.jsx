import { useContext, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import MyContext from "../../context/data/myContext";

if (!document.getElementById("agl-login-style")) {
  const style = document.createElement("style");
  style.id = "agl-login-style";
  style.textContent = `
    .login-wrap {
      min-height: 100vh;
      background: var(--balsamico);
      display: grid;
      grid-template-columns: 1fr 1fr;
      font-family: var(--font-body);
    }
    .login-left {
      background: var(--burnt);
      border-right: 1px solid rgba(211,152,88,0.1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 52px 56px;
      position: relative;
      overflow: hidden;
    }
    .login-left::before {
      content: '';
      position: absolute;
      bottom: -120px; right: -120px;
      width: 400px; height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(211,152,88,0.07) 0%, transparent 70%);
      pointer-events: none;
    }
    .login-left::after {
      content: '';
      position: absolute;
      top: -80px; left: -80px;
      width: 280px; height: 280px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(133,67,30,0.12) 0%, transparent 70%);
      pointer-events: none;
    }
    .login-brand-name {
      font-family: var(--font-display);
      font-size: 28px; font-weight: 300;
      color: var(--champagne); letter-spacing: 0.1em; line-height: 1;
    }
    .login-brand-tag {
      font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase;
      color: var(--whiskey); opacity: 0.45; margin-top: 5px;
    }
    .login-left-quote { position: relative; z-index: 1; }
    .login-quote-mark {
      font-family: var(--font-display); font-size: 80px;
      color: var(--whiskey); opacity: 0.15;
      line-height: 0.6; margin-bottom: 16px; display: block;
    }
    .login-quote-text {
      font-family: var(--font-display); font-size: 22px;
      font-weight: 300; font-style: italic;
      color: var(--champagne); opacity: 0.45; line-height: 1.5; max-width: 280px;
    }
    .login-quote-text em { font-style: normal; color: var(--whiskey); opacity: 1; }
    .login-left-footer {
      font-size: 10px; color: var(--champagne); opacity: 0.2; letter-spacing: 0.1em;
    }
    .login-right {
      display: flex; flex-direction: column;
      justify-content: center; align-items: center; padding: 52px 64px;
    }
    .login-form-wrap { width: 100%; max-width: 360px; }
    .login-eyebrow {
      font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase;
      color: var(--whiskey); opacity: 0.55; margin-bottom: 14px;
    }
    .login-heading {
      font-family: var(--font-display); font-size: 38px; font-weight: 300;
      color: var(--champagne); line-height: 1.1; margin-bottom: 36px; letter-spacing: 0.03em;
    }

    /* ── Fields ── */
    .login-field { margin-bottom: 16px; }
    .login-field-label {
      font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
      color: var(--whiskey); opacity: 0.55; display: block; margin-bottom: 7px;
    }
    .login-input {
      width: 100%;
      background: rgba(21,12,12,0.6);
      border: 1px solid rgba(211,152,88,0.18);
      color: var(--champagne); font-family: var(--font-body);
      font-size: 14px; padding: 13px 16px; border-radius: 2px;
      outline: none; transition: border-color 0.2s, background 0.2s;
    }
    .login-input::placeholder { color: rgba(234,206,170,0.2); }
    .login-input:focus { border-color: rgba(211,152,88,0.5); background: rgba(21,12,12,0.8); }
    .login-input.invalid { border-color: rgba(231,76,60,0.55); background: rgba(192,57,43,0.05); }
    .login-field-error {
      font-size: 10px; color: #e57373;
      margin-top: 5px; letter-spacing: 0.04em; padding-left: 2px;
    }

    /* ── Password strength ── */
    .login-strength-bar { display: flex; gap: 4px; margin-top: 8px; }
    .login-strength-seg {
      flex: 1; height: 2px; border-radius: 2px;
      background: rgba(211,152,88,0.12); transition: background 0.3s;
    }
    .login-strength-seg.weak   { background: #e57373; }
    .login-strength-seg.fair   { background: var(--whiskey); }
    .login-strength-seg.strong { background: #81c784; }
    .login-strength-label { font-size: 9px; letter-spacing: 0.1em; margin-top: 5px; padding-left: 2px; }
    .login-strength-label.weak   { color: #e57373; }
    .login-strength-label.fair   { color: var(--whiskey); }
    .login-strength-label.strong { color: #81c784; }

    /* ── Error banner ── */
    .login-error {
      background: rgba(192,57,43,0.1); border: 1px solid rgba(192,57,43,0.25);
      border-radius: 2px; padding: 11px 14px; font-size: 12px;
      color: #e57373; margin-bottom: 18px; line-height: 1.5;
    }

    /* ── Button ── */
    .login-btn {
      width: 100%; background: var(--whiskey); color: var(--balsamico);
      border: none; font-family: var(--font-body); font-size: 11px; font-weight: 600;
      letter-spacing: 0.22em; text-transform: uppercase; padding: 16px;
      border-radius: 1px; cursor: pointer;
      transition: background 0.2s, transform 0.15s; margin-top: 8px;
    }
    .login-btn:hover:not(:disabled) { background: var(--champagne); transform: translateY(-1px); }
    .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .login-btn-loading { display: flex; align-items: center; justify-content: center; gap: 8px; }
    .login-spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(21,12,12,0.3); border-top-color: var(--balsamico);
      border-radius: 50%; animation: login-spin 0.7s linear infinite;
    }
    @keyframes login-spin { to { transform: rotate(360deg); } }

    .login-divider { display: flex; align-items: center; gap: 14px; margin: 28px 0 20px; }
    .login-divider-line { flex: 1; height: 1px; background: rgba(211,152,88,0.1); }
    .login-divider-text { font-size: 10px; color: var(--champagne); opacity: 0.25; letter-spacing: 0.12em; white-space: nowrap; }
    .login-signup-row { font-size: 12px; color: var(--champagne); opacity: 0.45; text-align: center; line-height: 1.6; }
    .login-signup-link {
      color: var(--whiskey); text-decoration: none;
      border-bottom: 1px solid rgba(211,152,88,0.3); padding-bottom: 1px; transition: opacity 0.2s;
    }
    .login-signup-link:hover { opacity: 1; }

    @media (max-width: 768px) {
      .login-wrap { grid-template-columns: 1fr; }
      .login-left { display: none; }
      .login-right { padding: 48px 28px; }
    }
  `;
  document.head.appendChild(style);
}

/* ── Helpers ── */
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function Field({ error, children }) {
  return (
    <div className="login-field">
      {children}
      {error && <div className="login-field-error">{error}</div>}
    </div>
  );
}

export default function Login() {
  const { login } = useContext(MyContext);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr]           = useState("");
  const [loading, setLoading]   = useState(false);
  const [touched, setTouched]   = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const touch = (f) => setTouched((p) => ({ ...p, [f]: true }));

  const errors = {
    email:    !email.trim()        ? "Email address is required."
            : !isValidEmail(email) ? "Enter a valid email address." : "",
    password: !password            ? "Password is required."
            : password.length < 6  ? "Password must be at least 6 characters." : "",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setErr("");
    if (Object.values(errors).some(Boolean)) return;
    setLoading(true);
    try {
      const user = await login(email, password);
      const snap = await getDoc(doc(db, "users", user.uid));
      const role = snap.data()?.role;
      if (role === "admin") navigate("/dashboard", { replace: true });
      else navigate(from === "/login" ? "/" : from, { replace: true });
    } catch (e) {
      setErr(e.message?.replace("Firebase: ", "").replace(/\(auth.*\)/, "").trim() || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-left">
        <div>
          <div className="login-brand-name">AGL</div>
          <div className="login-brand-tag">Actually Good Lamps</div>
        </div>
        <div className="login-left-quote">
          <span className="login-quote-mark">"</span>
          <p className="login-quote-text">
            Light is the first of painters.<br />
            There is no object so foul that<br />
            <em>intense light</em> will not make it beautiful.
          </p>
        </div>
        <div className="login-left-footer">© {new Date().getFullYear()} Actually Good Lamps · South Africa</div>
      </div>

      <div className="login-right">
        <div className="login-form-wrap">
          <p className="login-eyebrow">Welcome back</p>
          <h1 className="login-heading">Sign in to<br />your account</h1>

          {err && <div className="login-error">{err}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <Field error={touched.email && errors.email}>
              <label className="login-field-label">Email address</label>
              <input
                className={`login-input${touched.email && errors.email ? " invalid" : ""}`}
                type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                onBlur={() => touch("email")} autoComplete="email"
              />
            </Field>

            <Field error={touched.password && errors.password}>
              <label className="login-field-label">Password</label>
              <input
                className={`login-input${touched.password && errors.password ? " invalid" : ""}`}
                type="password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                onBlur={() => touch("password")} autoComplete="current-password"
              />
            </Field>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading
                ? <span className="login-btn-loading"><span className="login-spinner" />Signing in…</span>
                : "Sign In"}
            </button>
          </form>

          <div className="login-divider">
            <span className="login-divider-line" />
            <span className="login-divider-text">New to AGL?</span>
            <span className="login-divider-line" />
          </div>
          <p className="login-signup-row">
            <Link to="/signup" className="login-signup-link">Create an account</Link>
            {" "}— it only takes a moment
          </p>
        </div>
      </div>
    </div>
  );
}