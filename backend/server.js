require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const registerSocketHandlers = require("./socket/socketHandler");

//Connect Frontend to backend  using CORS
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173https://probable-barnacle-ww9q55rx6rjhv4vx-5173.app.github.dev/";

const app = express();
const server = http.createServer(app);

// Socket.IO server, allowed to receive connections from our frontend origin.
const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST"] },
});

// Middleware
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// REST API routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

//WebSocket events
registerSocketHandlers(io);


connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`WatchParty server running on http://localhost:${PORT}`);
  });
});
