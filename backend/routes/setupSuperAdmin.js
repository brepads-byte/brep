const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const router = express.Router();

/**
 * PUT /api/setup-super-admin
 * Create a new super admin (one-time setup)
 */
router.put("/setup-super-admin", async (req, res) => {
  try {
    const { name, email, password, phoneNumber, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    // Prevent duplicate super admins
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Super admin already exists with this email." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create super admin
    const superAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      location,
      role: "super_admin",
      isActive: true,
    });

    await superAdmin.save();

    const { password: _, ...response } = superAdmin.toObject();

    res.status(201).json({
      message: "✅ Super admin created successfully!",
      admin: response,
    });
  } catch (error) {
    console.error("Error creating super admin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
