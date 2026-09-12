import RoleBadge from "./RoleBadge.jsx";

export default function ParticipantsList({ participants, currentUserId }) {
  return (
    <div>
      {participants.map((p) => (
        <div className="participant-row" key={p.userId}>
          <div className="participant-left">
            <span className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
              {p.username.slice(0, 2).toUpperCase()}
            </span>
            <span>
              {p.username}
              {p.userId === currentUserId ? " (You)" : ""}
            </span>
          </div>
          <RoleBadge role={p.role} />
        </div>
      ))}
    </div>
  );
}
