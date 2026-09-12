import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <span className="youtube-icon">▶</span> WatchParty
      </Link>

      {user && (
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">My Rooms</Link>
        </div>
      )}

      <div className="nav-right">
        {user ? (
          <>
            <span className="avatar" title={user.fullName}>
              {initials}
            </span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline btn-sm">
              Login
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
