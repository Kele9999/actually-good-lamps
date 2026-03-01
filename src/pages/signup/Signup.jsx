import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import MyContext from "../../context/data/myContext";

/* ── Helpers ── */
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: "", cls: "" };
  let score = 0;
  if (pw.length >= 8)                score++;
  if (/[A-Z]/.test(pw))             score++;
  if (/[0-9]/.test(pw))             score++;
  if (/[^A-Za-z0-9]/.test(pw))      score++;
  if (score <= 1) return { score, label: "Weak",   cls: "weak" };
  if (score <= 2) return { score, label: "Fair",   cls: "fair" };
  return            { score, label: "Strong", cls: "strong" };
}

function Field({ error, children }) {
  return (
    <div className="login-field">
      {children}
      {error && <div className="login-field-error">{error}</div>}
    </div>
  );
}

function StrengthMeter({ password }) {
  const { score, label, cls } = getPasswordStrength(password);
  if (!password) return null;
  return (
    <>
      <div className="login-strength-bar">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`login-strength-seg${i <= score ? ` ${cls}` : ""}`} />
        ))}
      </div>
      <div className={`login-strength-label ${cls}`}>{label}</div>
    </>
  );
}

export default function Signup() {
  const { signup } = useContext(MyContext);

  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr]                       = useState("");
  const [loading, setLoading]               = useState(false);
  const [touched, setTouched]               = useState({});
  const navigate = useNavigate();

  const touch = (f) => setTouched((p) => ({ ...p, [f]: true }));

  const errors = {
    email:    !email.trim()        ? "Email address is required."
            : !isValidEmail(email) ? "Enter a valid email address." : "",
    password: !password            ? "Password is required."
            : password.length < 6  ? "Password must be at least 6 characters."
            : getPasswordStrength(password).cls === "weak" ? "Please choose a stronger password." : "",
    confirmPassword:
              !confirmPassword              ? "Please confirm your password."
            : confirmPassword !== password  ? "Passwords do not match." : "",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true, confirmPassword: true });
    setErr("");
    if (Object.values(errors).some(Boolean)) return;
    setLoading(true);
    try {
      const user = await signup(email, password);
      await setDoc(
        doc(db, "users", user.uid),
        { email: user.email || email, role: "customer", createdAt: serverTimestamp() },
        { merge: true }
      );
      navigate("/", { replace: true });
    } catch (e) {
      setErr(e.message?.replace("Firebase: ", "").replace(/\(auth.*\)/, "").trim() || "Signup failed.");
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
            The right light doesn't just<br />
            illuminate a room — it <em>defines</em> it.
          </p>
        </div>
        <div className="login-left-footer">© {new Date().getFullYear()} Actually Good Lamps · South Africa</div>
      </div>

      <div className="login-right">
        <div className="login-form-wrap">
          <p className="login-eyebrow">Join the atelier</p>
          <h1 className="login-heading">Create your<br />AGL account</h1>

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
                onBlur={() => touch("password")} autoComplete="new-password"
              />
              <StrengthMeter password={password} />
            </Field>

            <Field error={touched.confirmPassword && errors.confirmPassword}>
              <label className="login-field-label">Confirm password</label>
              <input
                className={`login-input${touched.confirmPassword && errors.confirmPassword ? " invalid" : ""}`}
                type="password" placeholder="••••••••"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => touch("confirmPassword")} autoComplete="new-password"
              />
            </Field>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading
                ? <span className="login-btn-loading"><span className="login-spinner" />Creating account…</span>
                : "Create Account"}
            </button>
          </form>

          <div className="login-divider">
            <span className="login-divider-line" />
            <span className="login-divider-text">Already registered?</span>
            <span className="login-divider-line" />
          </div>
          <p className="login-signup-row">
            <Link to="/login" className="login-signup-link">Sign in to your account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}