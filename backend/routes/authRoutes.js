const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const requireAuth = require("../middleware/auth");

const router = express.Router();


function toPublicUser(user) {
  return { id: user._id, fullName: user.fullName, email: user.email };
}

// Generates a random, token used to identify the logged-in user.
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}


router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "fullName, email and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const authToken = generateToken();

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      authToken,
    });

    res.status(201).json({ token: authToken, user: toPublicUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Issue a fresh token every time the user logs in.
    user.authToken = generateToken();
    await user.save();

    res.json({ token: user.authToken, user: toPublicUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});


router.post("/logout", requireAuth, async (req, res) => {
  req.user.authToken = null;
  await req.user.save();
  res.json({ message: "Logged out" });
});


router.get("/me", requireAuth, async (req, res) => {
  res.json({ user: toPublicUser(req.user) });
});

module.exports = router;
