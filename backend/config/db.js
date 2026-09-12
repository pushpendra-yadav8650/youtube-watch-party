const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb+srv://pushpendrayadav8434_db_user:uiGAGHWKU9PX7vyn@cluster0.qzim4sk.mongodb.net/?appName=Cluster0";

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected:", uri);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
