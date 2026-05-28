const express = require("express");
const router = express.Router();
const { 
  login, 
  verify, 
  forgotPassword, 
  verifyOtpAndReset 
} = require("../controllers/authController");

// 👇 FIX: Destructure 'protect' from the middleware object
const { protect } = require("../middleware/auth"); 

// 🟢 Public Entry Endpoints
router.post("/login", login);
router.post("/forgot-password", forgotPassword); // 🔥 Dispatches OTP via Nodemailer
router.post("/verify-otp-reset", verifyOtpAndReset); // 🔥 Re-computes TOTP window and saves new pass

// 🔴 Protected Active Session Verifier
router.get("/verify", protect, verify);

module.exports = router;