const express = require("express");
const router = express.Router();
const { login, verify } = require("../controllers/authController");

// 👇 FIX: Destructure 'protect' from the middleware object
const { protect } = require("../middleware/auth"); 

router.post("/login", login);

// 👇 Use 'protect' instead of 'auth'
router.get("/verify", protect, verify);

module.exports = router;