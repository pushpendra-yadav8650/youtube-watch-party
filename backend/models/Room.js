const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomCode: { type: String, required: true, unique: true }, // short shareable code, e.g. X7K9P2
    name: { type: String, required: true, trim: true },
    privacy: { type: String, enum: ["public", "private"], default: "public" },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    
    videoId: { type: String, default: null },
    playState: { type: String, enum: ["playing", "paused"], default: "paused" },
    currentTime: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
