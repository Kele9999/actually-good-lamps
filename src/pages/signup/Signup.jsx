import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import MyContext from "../../context/data/myContext";

export default function Signup() {
  const { signup } = useContext(MyContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      // Assumes your signup(email, password) returns a user with uid (same pattern as login())
      const user = await signup(email, password);

      // Create/merge user profile doc with default role
      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email || email,
          role: "customer",
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      navigate("/", { replace: true });
    } catch (e) {
      setErr(
        e.message
          ?.replace("Firebase: ", "")
          .replace(/\(auth.*\)/, "")
          .trim() || "Signup failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      {/* ── Left panel ── */}
      <div className="login-left">
        <div>
          <div className="login-brand-name">AGL</div>
          <div className="login-brand-tag">Actually Good Lamps</div>
        </div>

        <div className="login-left-quote">
          <span className="login-quote-mark">"</span>
          <p className="login-quote-text">
            The right light doesn’t just<br />
            illuminate a room, it defines it.
          </p>
        </div>

        <div className="login-left-footer">
          © {new Date().getFullYear()} Actually Good Lamps · South Africa
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="login-right">
        <div className="login-form-wrap">
          <p className="login-eyebrow">Join the atelier</p>
          <h1 className="login-heading">
            Create your<br />AGL account
          </h1>

          {err && <div className="login-error">{err}</div>}

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-field-label">Email address</label>
              <input
                className="login-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <label className="login-field-label">Password</label>
              <input
                className="login-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="login-field">
              <label className="login-field-label">Confirm password</label>
              <input
                className="login-input"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="login-btn-loading">
                  <span className="login-spinner" />
                  Creating account…
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="login-divider">
            <span className="login-divider-line" />
            <span className="login-divider-text">Already registered?</span>
            <span className="login-divider-line" />
          </div>

          <p className="login-signup-row">
            <Link to="/login" className="login-signup-link">
              Sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}