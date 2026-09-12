const User = require("../models/User");

async function requireAuth(req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ message: "No auth token provided" });
  }

  const user = await User.findOne({ authToken: token });
  if (!user) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  req.user = user; 
  next();
}

module.exports = requireAuth;
