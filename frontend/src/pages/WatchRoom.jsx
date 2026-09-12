import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { socket } from "../socket.js";
import YouTubePlayer from "../components/YouTubePlayer.jsx";
import ParticipantsList from "../components/ParticipantsList.jsx";
import ChatPanel from "../components/ChatPanel.jsx";
import ManageParticipantsModal from "../components/ManageParticipantsModal.jsx";
import ChangeVideoModal from "../components/ChangeVideoModal.jsx";

function formatTime(seconds = 0) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function WatchRoom() {
  const { roomCode } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const playerRef = useRef(null);
  const lastLoadedVideoId = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);

  const [tab, setTab] = useState("participants");
  const [participants, setParticipants] = useState([]);
  const [videoId, setVideoId] = useState(null);
  const [playState, setPlayState] = useState("paused");
  const [displayTime, setDisplayTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [messages, setMessages] = useState([]);
  const [showManage, setShowManage] = useState(false);
  const [showChangeVideo, setShowChangeVideo] = useState(false);
  const [toast, setToast] = useState("");

  const me = participants.find((p) => p.userId === user.id);
  const myRole = me?.role || "Participant";
  const canControl = myRole === "Host" || myRole === "Moderator";
  const isHost = myRole === "Host";

  // Connect to the room on mount
  useEffect(() => {
    socket.connect();

    socket.emit("join_room", {
      roomId: roomCode,
      userId: user.id,
      username: user.fullName,
      isCreator: !!state?.isCreator,
    });

    socket.on("user_joined", ({ participants }) => setParticipants(participants));
    socket.on("user_left", ({ participants }) => setParticipants(participants));
    socket.on("role_assigned", ({ participants }) => setParticipants(participants));
    socket.on("participant_removed", ({ participants }) => setParticipants(participants));

    socket.on("sync_state", (state) => {
      setVideoId(state.videoId);
      setPlayState(state.playState);
      applyStateToPlayer(state);
    });

    socket.on("chat_message", (msg) => setMessages((prev) => [...prev, msg]));

    socket.on("you_were_removed", () => {
      alert("You have been removed from this room by the host.");
      navigate("/dashboard");
    });

    socket.on("error_message", ({ message }) => showToast(message));

    return () => {
      socket.emit("leave_room");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("role_assigned");
      socket.off("participant_removed");
      socket.off("sync_state");
      socket.off("chat_message");
      socket.off("you_were_removed");
      socket.off("error_message");
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  // Applies a state coming from the server to the actual YouTube player.
  function applyStateToPlayer(state) {
    if (!playerRef.current) return;

    if (state.videoId && state.videoId !== lastLoadedVideoId.current) {
      lastLoadedVideoId.current = state.videoId;
      playerRef.current.loadVideoById(state.videoId);
    }

    // Give the player a brief moment before seeking/playing a freshly loaded video.
    setTimeout(() => {
      if (state.currentTime !== undefined) playerRef.current.seekTo(state.currentTime);
      if (state.playState === "playing") playerRef.current.playVideo();
      else playerRef.current.pauseVideo();
    }, 300);
  }

  // Once the player fires onReady, apply whatever state we already have.
  function handlePlayerReady() {
    setPlayerReady(true);
    if (videoId) applyStateToPlayer({ videoId, playState, currentTime: 0 });
  }

  // Poll the player's current time so the seek bar / clock stay accurate.
  useEffect(() => {
    if (!playerReady) return;
    const interval = setInterval(() => {
      setDisplayTime(playerRef.current.getCurrentTime());
      setDuration(playerRef.current.getDuration());
    }, 500);
    return () => clearInterval(interval);
  }, [playerReady]);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  }

  //  Playback control handlers (Host/Moderator only) 
  function handlePlay() {
    playerRef.current.playVideo();
    socket.emit("play", { currentTime: playerRef.current.getCurrentTime() });
  }

  function handlePause() {
    playerRef.current.pauseVideo();
    socket.emit("pause", { currentTime: playerRef.current.getCurrentTime() });
  }

  function handleSeekBar(e) {
    const time = Number(e.target.value);
    playerRef.current.seekTo(time);
    setDisplayTime(time);
    socket.emit("seek", { time });
  }

  function handleSkip(deltaSeconds) {
    const newTime = Math.max(0, playerRef.current.getCurrentTime() + deltaSeconds);
    playerRef.current.seekTo(newTime);
    socket.emit("seek", { time: newTime });
  }

  function handleChangeVideo(newVideoId) {
    socket.emit("change_video", { videoId: newVideoId });
  }

  // Host actions
  function handleAssignRole(userId, role) {
    socket.emit("assign_role", { userId, role });
  }

  function handleMakeHost(userId) {
    socket.emit("transfer_host", { userId });
  }

  function handleRemove(userId) {
    socket.emit("remove_participant", { userId });
  }

  function handleSendChat(text) {
    socket.emit("chat_message", { message: text });
  }

  function copyRoomLink() {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomCode}`);
    showToast("Room link copied!");
  }

  return (
    <div className="page">
      <div className="watch-room">
        <div className="watch-room-topbar">
          <div>
            <strong>▶ WatchParty</strong>
            <span className="room-code-tag">Room: {roomCode}</span>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => navigate("/dashboard")}>
            Leave Room
          </button>
        </div>

        {toast && (
          <div style={{ background: "#fff3cd", color: "#856404", padding: "8px 16px", textAlign: "center" }}>
            {toast}
          </div>
        )}

        <div className="watch-room-body">
          <div className="player-column">
            {videoId ? (
              <YouTubePlayer ref={playerRef} videoId={videoId} onReady={handlePlayerReady} />
            ) : (
              <div className="player-frame" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                {canControl ? "Add a video to get started" : "Waiting for host to start a video..."}
              </div>
            )}

            <div className="controls-bar">
              <button onClick={handlePlay} disabled={!canControl || !videoId}>▶</button>
              <button onClick={handlePause} disabled={!canControl || !videoId}>⏸</button>
              <button onClick={() => handleSkip(-10)} disabled={!canControl || !videoId}>⏪10s</button>
              <button onClick={() => handleSkip(10)} disabled={!canControl || !videoId}>⏩10s</button>

              <input
                className="seek-bar"
                type="range"
                min={0}
                max={duration || 0}
                value={displayTime || 0}
                onChange={handleSeekBar}
                disabled={!canControl || !videoId}
              />

              <span className="time">
                {formatTime(displayTime)} / {formatTime(duration)}
              </span>

              {canControl && (
                <button
                  className="h-11 px-5 bg-white text-[#14142b] border border-gray-300 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200"
                  onClick={() => setShowChangeVideo(true)}
                >
                  🔗 Change Video
                </button>
              )}
            </div>

            <div className="room-link-box">
              <input readOnly value={`${window.location.origin}/room/${roomCode}`} />
              <button className="btn btn-outline btn-sm" onClick={copyRoomLink}>
                Copy Link
              </button>
            </div>
          </div>

          <div className="sidebar">
            <div className="sidebar-tabs">
              <button className={tab === "participants" ? "active" : ""} onClick={() => setTab("participants")}>
                Participants ({participants.length})
              </button>
              <button className={tab === "chat" ? "active" : ""} onClick={() => setTab("chat")}>
                Chat
              </button>
            </div>

            {tab === "participants" ? (
              <div style={{ overflowY: "auto" }}>
                {isHost && (
                  <div style={{ padding: 12 }}>
                    <button className="btn btn-primary btn-sm btn-block" onClick={() => setShowManage(true)}>
                      Manage Participants
                    </button>
                  </div>
                )}
                <ParticipantsList participants={participants} currentUserId={user.id} />
              </div>
            ) : (
              <ChatPanel messages={messages} onSend={handleSendChat} />
            )}
          </div>
        </div>
      </div>

      {showManage && (
        <ManageParticipantsModal
          participants={participants}
          currentUserId={user.id}
          onClose={() => setShowManage(false)}
          onAssignRole={handleAssignRole}
          onMakeHost={handleMakeHost}
          onRemove={handleRemove}
        />
      )}

      {showChangeVideo && (
        <ChangeVideoModal onClose={() => setShowChangeVideo(false)} onChangeVideo={handleChangeVideo} />
      )}
    </div>
  );
}
