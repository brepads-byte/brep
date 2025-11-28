const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

// Get all admins
const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get admin by ID
const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get current admin profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update admin profile
const updateAdminProfile = async (req, res) => {
  try {
    const { name, email, phoneNumber, location } = req.body;
    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.name = name || admin.name;
    admin.email = email || admin.email;
    admin.phoneNumber = phoneNumber;
    admin.location = location;

    const updatedAdmin = await admin.save();
    const adminResponse = updatedAdmin.toObject();
    delete adminResponse.password;
    res.json(adminResponse);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create new admin
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, location, role } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    let admin = await Admin.findOne({ email });
    if (admin) return res.status(400).json({ message: "Admin already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    admin = new Admin({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      location,
      role: role || "admin",
    });

    await admin.save();
    const adminResponse = admin.toObject();
    delete adminResponse.password;
    res.status(201).json(adminResponse);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update admin
const updateAdmin = async (req, res) => {
  try {
    const { name, email, phoneNumber, location, role, isActive } = req.body;
    const updateData = { name, email, phoneNumber, location, role, isActive };

    // Remove undefined fields so they don't overwrite existing data
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete admin
const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin.id);

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // 1. Verify Current Password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    // 2. 🛑 CHECK: Is New Password same as Old?
    const isSameAsOld = await bcrypt.compare(newPassword, admin.password);
    if (isSameAsOld) {
      return res
        .status(400)
        .json({
          message: "New password cannot be the same as the old password",
        });
    }

    // 3. 🛑 CHECK: Backend Complexity Validation (Optional but recommended)
    // Prevents Postman/API bypassing the frontend checks
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      return res
        .status(400)
        .json({
          message:
            "Password is too weak. Must contain Caps, Number, and Special Char.",
        });
    }

    // 4. Hash and Save
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to change password", error: error.message });
  }
};

module.exports = {
  getAdmins,
  getAdminById,
  getAdminProfile,
  updateAdminProfile,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  changePassword,
};
