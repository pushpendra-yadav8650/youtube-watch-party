import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api";
import Navbar from "../components/Navbar.jsx";

export default function JoinRoom() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // Confirm the room actually exists before navigating.
      await api.getRoom(token, code.trim());
      navigate(`/room/${code.trim().toUpperCase()}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <Navbar />
      <Link to="/" className="back-link">
        ← Back
      </Link>

      <div className="form-wrapper">
        <div className="form-card">
          <div className="icon-circle">👥</div>
          <h2>Join a Watch Room</h2>
          <p className="subtitle">Enter the room code shared by your friend.</p>

          {error && <div className="error-text">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <div className="input-wrap">
                <span className="icon">#</span>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter Room Code"
                  style={{ textTransform: "uppercase" }}
                />
              </div>
            </div>

            <button className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? "Joining..." : "Join Room"}
            </button>
          </form>

          <div className="info-box">
            <span>ℹ️</span>
            <span>
              Don't have a code? Ask your friend to share the room link or code.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
