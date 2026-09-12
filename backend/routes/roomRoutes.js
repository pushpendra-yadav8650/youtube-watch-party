const express = require("express");
const { nanoid } = require("nanoid");
const Room = require("../models/Room");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// Generates a short uppercase room code like "X7K9P2".
function generateRoomCode() {
  return nanoid(6).toUpperCase();
}


router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, privacy } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Room name is required" });
    }

    
    let roomCode = generateRoomCode();
    while (await Room.findOne({ roomCode })) {
      roomCode = generateRoomCode();
    }

    const room = await Room.create({
      roomCode,
      name,
      privacy: privacy === "private" ? "private" : "public",
      hostId: req.user._id,
    });

    res.status(201).json({ room });
  } catch (err) {
    res.status(500).json({ message: "Could not create room", error: err.message });
  }
});


router.get("/mine", requireAuth, async (req, res) => {
  try {
    const rooms = await Room.find({ hostId: req.user._id }).sort({ createdAt: -1 });
    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ message: "Could not load rooms", error: err.message });
  }
});


router.get("/:roomCode", requireAuth, async (req, res) => {
  try {
    // db query 
    const room = await Room.findOne({ roomCode: req.params.roomCode.toUpperCase() });
    if (!room) {
      return res.status(404).json({ message: "No room found with that code" });
    }
    res.json({ room });
  } catch (err) {
    res.status(500).json({ message: "Could not load room", error: err.message });
  }
});

module.exports = router;
