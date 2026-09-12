import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api";
import Navbar from "../components/Navbar.jsx";

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function Dashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .myRooms(token)
      .then((data) => setRooms(data.rooms))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="page">
      <Navbar />

      <div className="dashboard">
        <div className="dashboard-header">
          <h2>My Watch Rooms</h2>
          <button className="btn btn-primary" onClick={() => navigate("/create-room")}>
            + Create Room
          </button>
        </div>

        {loading && <p>Loading rooms...</p>}

        {!loading && rooms.length === 0 && (
          <div className="empty-state">
            <p>You haven't created any rooms yet.</p>
          </div>
        )}

        {rooms.map((room) => (
          <div className="room-card" key={room._id}>
            <div className="room-card-left">
              <div className="room-thumb">🎬</div>
              <div>
                <strong>{room.name}</strong>
                <div className="room-code-pill"># {room.roomCode}</div>
                <div className="room-meta">Created {timeAgo(room.createdAt)}</div>
              </div>
            </div>
            <button
              className="btn btn-outline"
              onClick={() => navigate(`/room/${room.roomCode}`, { state: { isCreator: true } })}
            >
              Join
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
