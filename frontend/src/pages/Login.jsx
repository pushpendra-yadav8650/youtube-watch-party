import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="auth-wrapper">
        <div className="auth-card">
          <span className="youtube-icon">▶</span>
          <h2>Welcome Back</h2>
          <p className="subtitle">Login to continue watching together</p>

          {error && <div className="error-text">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email address</label>
              <div className="input-wrap">
                <span className="icon">✉</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="field">
              <label>Password</label>
              <div className="input-wrap">
                <span className="icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <span
                  className="icon"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? "🙈" : "👁"}
                </span>
              </div>
            </div>

            <button className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>

          

          <p className="switch-text">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
