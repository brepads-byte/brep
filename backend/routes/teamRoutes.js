const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware"); // Your existing Multer setup
const {
  addMember,
  getMembers,
  updateMember,
  deleteMember,
} = require("../controllers/teamController");

// Public Route (View Team)
router.get("/", getMembers);

// Admin Routes (Add/Edit/Delete)
// Note: Add your 'protect' or 'admin' middleware here if needed
router.post("/", upload.single("photo"), addMember);
router.put("/:id", upload.single("photo"), updateMember);
router.delete("/:id", deleteMember);

module.exports = router;
