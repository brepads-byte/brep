const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  // Check if we already have an active connection
  if (mongoose.connection.readyState >= 20) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
