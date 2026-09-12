import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api";
import Navbar from "../components/Navbar.jsx";
import '../pages/Home.css'

export default function CreateRoom() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { room } = await api.createRoom(token, name, privacy);
      
      navigate(`/room/${room.roomCode}`, { state: { isCreator: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <Navbar />
      <Link to="/Dashboard" className="back-link">
        ← Back
      </Link>

      <div className="form-wrapper">
        <div className="form-card">
          <div className="icon-circle">🎥</div>
          <h2>Create a Watch Room</h2>
          <p className="subtitle">
            Create a new room and invite your friends to watch together in real time.
          </p>

          {error && <div className="error-text">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Room Name</label>
              <div className="input-wrap">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Movie Night "
                />
              </div>
            </div>

            <div className="field">
              <label>Room Privacy</label>
              <div className="input-wrap">
                <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
                  <option value="public">Public (Anyone with the code can join)</option>
                  <option value="private">Private (Invite only)</option>
                </select>
              </div>
            </div>

            <button className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? "Creating..." : "Create Room"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
