import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
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
      await signup(fullName, email, password);
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
          <h2>Create an Account</h2>
          <p className="subtitle">Join now and start your watch party</p>

          {error && <div className="error-text">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full Name</label>
              <div className="input-wrap">
                <span className="icon">👤</span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
            </div>

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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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
              {submitting ? "Creating account..." : "Sign Up"}
            </button>
          </form>
          <p className="switch-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
