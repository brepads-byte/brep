const TeamMember = require('../models/TeamMember');
const cloudinary = require('cloudinary').v2;

// --- Helper: Delete from Cloudinary ---
const destroyImage = async (publicId) => {
  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️ Deleted Cloudinary Image: ${publicId}`);
  }
};

// 1. ADD Member
exports.addMember = async (req, res) => {
  try {
    const { name, role } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const newMember = new TeamMember({
      name,
      role,
      photo: {
        url: req.file.path,        // Cloudinary URL
        public_id: req.file.filename // Cloudinary Public ID (Saved by Multer)
      }
    });

    await newMember.save();
    res.status(201).json(newMember);

  } catch (error) {
    // If DB save fails, delete the uploaded image so it doesn't become a ghost
    if (req.file) await destroyImage(req.file.filename);
    res.status(500).json({ message: error.message });
  }
};

// 2. UPDATE Member (Handles Ghost Image Deletion)
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    let member = await TeamMember.findById(id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    // Logic: If a NEW file is uploaded, delete the OLD one
    if (req.file) {
      // 1. Delete the old image
      await destroyImage(member.photo.public_id);

      // 2. Update with new image
      member.photo = {
        url: req.file.path,
        public_id: req.file.filename
      };
    }

    // Update text fields
    member.name = name || member.name;
    member.role = role || member.role;

    await member.save();
    res.json(member);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. DELETE Member (Handles Ghost Image Deletion)
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await TeamMember.findById(id);

    if (!member) return res.status(404).json({ message: "Member not found" });

    // 1. Delete image from Cloudinary
    await destroyImage(member.photo.public_id);

    // 2. Delete from DB
    await member.deleteOne();

    res.json({ message: "Member and image deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. GET All Members
exports.getMembers = async (req, res) => {
  try {
    // Sort by 'createdAt' or your custom 'order' field
    const members = await TeamMember.find().sort({ createdAt: 1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};