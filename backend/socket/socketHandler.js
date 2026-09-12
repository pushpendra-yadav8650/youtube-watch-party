const { RoomManager, ROLES, Participant } = require("./RoomManager");
const RoomModel = require("../models/Room");



function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.data.roomCode = null;
    socket.data.userId = null;

    //join_room 

    socket.on("join_room", async ({ roomId, userId, username, isCreator }) => {
      try {
        const roomCode = roomId.toUpperCase();
        const roomDoc = await RoomModel.findOne({ roomCode });
        if (!roomDoc) {
          socket.emit("error_message", { message: "Room not found" });
          return;
        }

        const room = RoomManager.getOrCreateRoom(roomCode, {
          videoId: roomDoc.videoId,
          playState: roomDoc.playState,
          currentTime: roomDoc.currentTime,
        });

        // Decide the role for this participant.
        let role = ROLES.PARTICIPANT;
        if (isCreator || String(roomDoc.hostId) === String(userId)) {
          role = ROLES.HOST;
        }

        const participant = new Participant({ userId, username, socketId: socket.id, role });
        room.addParticipant(participant);

        socket.join(roomCode);
        socket.data.roomCode = roomCode;
        socket.data.userId = userId;

        // Let everyone (including the new joiner) know who is in the room now.
        io.to(roomCode).emit("user_joined", {
          username,
          userId,
          role,
          participants: room.getPublicParticipants(),
        });

        // Send the new joiner the current video state so they are in sync.
        socket.emit("sync_state", room.getSyncState());
      } catch (err) {
        socket.emit("error_message", { message: "Could not join room", error: err.message });
      }
    });

    //leave_room
    socket.on("leave_room", () => {
      handleLeave(io, socket);
    });

    // play
    socket.on("play", ({ currentTime }) => {
      broadcastIfAllowed(io, socket, { playState: "playing", currentTime });
    });

    // pause
    socket.on("pause", ({ currentTime }) => {
      broadcastIfAllowed(io, socket, { playState: "paused", currentTime });
    });

    //seek
    socket.on("seek", ({ time }) => {
      broadcastIfAllowed(io, socket, { currentTime: time });
    });

    //change_video
    socket.on("change_video", async ({ videoId }) => {
      const roomCode = socket.data.roomCode;
      const room = RoomManager.getRoom(roomCode);
      if (!room || !room.canControlPlayback(socket.id)) {
        socket.emit("error_message", { message: "You do not have permission to change the video" });
        return;
      }

      room.updatePlaybackState({ videoId, playState: "paused", currentTime: 0 });
      io.to(roomCode).emit("sync_state", room.getSyncState());

     
      await RoomModel.updateOne({ roomCode }, { videoId, playState: "paused", currentTime: 0 });
    });

    //assign_role
    
    socket.on("assign_role", ({ userId, role }) => {
      const roomCode = socket.data.roomCode;
      const room = RoomManager.getRoom(roomCode);
      if (!room || !room.isHost(socket.id)) {
        socket.emit("error_message", { message: "Only the host can assign roles" });
        return;
      }

      const target = room.findByUserId(userId);
      if (!target) return;

      const validRoles = [ROLES.MODERATOR, ROLES.PARTICIPANT];
      if (!validRoles.includes(role)) return;

      target.role = role;
      io.to(roomCode).emit("role_assigned", {
        userId,
        username: target.username,
        role,
        participants: room.getPublicParticipants(),
      });
    });

    // transfer host
    socket.on("transfer_host", async ({ userId }) => {
      const roomCode = socket.data.roomCode;
      const room = RoomManager.getRoom(roomCode);
      if (!room || !room.isHost(socket.id)) {
        socket.emit("error_message", { message: "Only the host can transfer host" });
        return;
      }

      const currentHost = room.findBySocketId(socket.id);
      const newHost = room.findByUserId(userId);
      if (!newHost) return;

      currentHost.role = ROLES.MODERATOR;
      newHost.role = ROLES.HOST;

      await RoomModel.updateOne({ roomCode }, { hostId: newHost.userId });

      io.to(roomCode).emit("role_assigned", {
        userId: newHost.userId,
        username: newHost.username,
        role: ROLES.HOST,
        participants: room.getPublicParticipants(),
      });
    });

    // remove_participant only host remove
    // 
    socket.on("remove_participant", ({ userId }) => {
      const roomCode = socket.data.roomCode;
      const room = RoomManager.getRoom(roomCode);
      if (!room || !room.isHost(socket.id)) {
        socket.emit("error_message", { message: "Only the host can remove participants" });
        return;
      }

      const target = room.findByUserId(userId);
      if (!target) return;

      room.removeBySocketId(target.socketId);
      io.to(roomCode).emit("participant_removed", {
        userId,
        participants: room.getPublicParticipants(),
      });

      
      io.to(target.socketId).emit("you_were_removed");
      io.sockets.sockets.get(target.socketId)?.leave(roomCode);
    });

    //chat 
    socket.on("chat_message", ({ message }) => {
      const roomCode = socket.data.roomCode;
      const room = RoomManager.getRoom(roomCode);
      const sender = room?.findBySocketId(socket.id);
      if (!sender || !message?.trim()) return;

      io.to(roomCode).emit("chat_message", {
        userId: sender.userId,
        username: sender.username,
        message: message.trim(),
        time: new Date().toISOString(),
      });
    });

    // disconnect network closed
    socket.on("disconnect", () => {
      handleLeave(io, socket);
    });
  });
}


function handleLeave(io, socket) {
  const roomCode = socket.data.roomCode;
  if (!roomCode) return;

  const room = RoomManager.getRoom(roomCode);
  if (!room) return;

  const participant = room.removeBySocketId(socket.id);
  socket.leave(roomCode);
  socket.data.roomCode = null;

  if (participant) {
    io.to(roomCode).emit("user_left", {
      username: participant.username,
      userId: participant.userId,
      participants: room.getPublicParticipants(),
    });
  }

  RoomManager.deleteRoomIfEmpty(roomCode);
}

// Only Host and Moderatorcontrol playback
function broadcastIfAllowed(io, socket, partialState) {
  const roomCode = socket.data.roomCode;
  const room = RoomManager.getRoom(roomCode);
  if (!room) return;

  if (!room.canControlPlayback(socket.id)) {
    socket.emit("error_message", { message: "You do not have permission to control playback" });
    return;
  }

  room.updatePlaybackState(partialState);
  io.to(roomCode).emit("sync_state", room.getSyncState());
}

module.exports = registerSocketHandlers;
