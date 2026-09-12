
const ROLES = {
  HOST: "Host",
  MODERATOR: "Moderator",
  PARTICIPANT: "Participant",
};


const CAN_CONTROL_PLAYBACK = [ROLES.HOST, ROLES.MODERATOR];

class Participant {
  constructor({ userId, username, socketId, role }) {
    this.userId = userId;
    this.username = username;
    this.socketId = socketId;
    this.role = role;
  }

  // Shape sent to the frontend - never leak socketId to the client.
  toPublic() {
    return { userId: this.userId, username: this.username, role: this.role };
  }
}

class Room {
  constructor({ roomCode, videoId = null, playState = "paused", currentTime = 0 }) {
    this.roomCode = roomCode;
    this.videoId = videoId;
    this.playState = playState;
    this.currentTime = currentTime;
    this.participants = new Map(); // socketId -> Participant
  }

  addParticipant(participant) {
    this.participants.set(participant.socketId, participant);
  }

  removeBySocketId(socketId) {
    const participant = this.participants.get(socketId);
    this.participants.delete(socketId);
    return participant;
  }

  findBySocketId(socketId) {
    return this.participants.get(socketId);
  }

  findByUserId(userId) {
    return [...this.participants.values()].find((p) => p.userId === userId);
  }

  isEmpty() {
    return this.participants.size === 0;
  }

  getPublicParticipants() {
    return [...this.participants.values()].map((p) => p.toPublic());
  }

  // A user may control playback if they are Host or Moderator.
  canControlPlayback(socketId) {
    const participant = this.findBySocketId(socketId);
    return !!participant && CAN_CONTROL_PLAYBACK.includes(participant.role);
  }

  isHost(socketId) {
    const participant = this.findBySocketId(socketId);
    return !!participant && participant.role === ROLES.HOST;
  }

  updatePlaybackState({ playState, currentTime, videoId }) {
    if (playState !== undefined) this.playState = playState;
    if (currentTime !== undefined) this.currentTime = currentTime;
    if (videoId !== undefined) this.videoId = videoId;
  }

  getSyncState() {
    return { playState: this.playState, currentTime: this.currentTime, videoId: this.videoId };
  }
}

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomCode -> Room
  }

  getOrCreateRoom(roomCode, initialState = {}) {
    if (!this.rooms.has(roomCode)) {
      this.rooms.set(roomCode, new Room({ roomCode, ...initialState }));
    }
    return this.rooms.get(roomCode);
  }

  getRoom(roomCode) {
    return this.rooms.get(roomCode);
  }

  deleteRoomIfEmpty(roomCode) {
    const room = this.rooms.get(roomCode);
    if (room && room.isEmpty()) {
      this.rooms.delete(roomCode);
    }
  }
}


module.exports = { RoomManager: new RoomManager(), ROLES, Participant };
