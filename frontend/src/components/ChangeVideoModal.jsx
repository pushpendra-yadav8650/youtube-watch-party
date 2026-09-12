import { useState } from "react";

function extractVideoId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function ChangeVideoModal({ onClose, onChangeVideo }) {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState(null);
  const [error, setError] = useState("");

  function handleUrlChange(value) {
    setUrl(value);
    setError("");
    setVideoId(extractVideoId(value));
  }

  function handleConfirm() {
    if (!videoId) {
      setError("That doesn't look like a valid YouTube link.");
      return;
    }
    onChangeVideo(videoId);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔗 Add YouTube Video</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="field">
          <div className="input-wrap">
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="error-text">{error}</div>}

        {videoId && (
          <div className="thumb-preview">
            <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt="preview" />
            <span>Video ready to load</span>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={!videoId}>
            Change Video
          </button>
        </div>
      </div>
    </div>
  );
}
