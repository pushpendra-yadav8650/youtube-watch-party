
export default function ManageParticipantsModal({
  participants,
  currentUserId,
  onClose,
  onAssignRole,
  onMakeHost,
  onRemove,
}) {
  const others = participants.filter((p) => p.userId !== currentUserId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Manage Participants</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {others.length === 0 && <p>No other participants yet.</p>}

        {others.map((p) => (
          <div className="manage-row" key={p.userId}>
            <span>{p.username}</span>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select
                value={p.role === "Host" ? "Moderator" : p.role}
                onChange={(e) => onAssignRole(p.userId, e.target.value)}
              >
                <option value="Participant">Participant</option>
                <option value="Moderator">Moderator</option>
              </select>

              <button className="btn btn-outline btn-sm" onClick={() => onMakeHost(p.userId)}>
                👑 Make Host
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => onRemove(p.userId)}>
                Remove
              </button>
            </div>
          </div>
        ))}

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
