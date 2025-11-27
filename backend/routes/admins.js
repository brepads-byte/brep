const express = require("express");
const router = express.Router();
const {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminProfile,
  updateAdminProfile,
  changePassword,
} = require("../controllers/adminController");

// Import the middleware functions we defined in Step 1
const { protect, superAdmin } = require("../middleware/auth");

// --- 1. PROFILE ROUTES (Accessible by any logged-in Admin) ---
// These allow an admin to manage their OWN profile
router.get("/profile", protect, getAdminProfile);
router.put("/profile", protect, updateAdminProfile);
router.put("/profile/password", protect, changePassword);

// --- 2. MANAGEMENT ROUTES (Restricted) ---

// GET /api/admins -> View list (Allowed for any logged-in Admin)
router.get("/", protect, getAdmins);

// POST /api/admins -> Create New Admin (🔒 LOCKED: Super Admin Only)
// This fixes the issue where anyone could create an admin
router.post("/", protect, superAdmin, createAdmin);

// --- 3. ID OPERATIONS ---

// GET /api/admins/:id -> View details (Allowed for any Admin)
router.get("/:id", protect, getAdminById);

// PUT /api/admins/:id -> Update another admin (🔒 LOCKED: Super Admin Only)
router.put("/:id", protect, superAdmin, updateAdmin);

// DELETE /api/admins/:id -> Delete an admin (🔒 LOCKED: Super Admin Only)
router.delete("/:id", protect, superAdmin, deleteAdmin);

module.exports = router;