const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const DigestFetch = require("digest-fetch").default;

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
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
      });
    }

    // 3. 🛑 CHECK: Backend Complexity Validation (Optional but recommended)
    // Prevents Postman/API bypassing the frontend checks
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({
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

// Global Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const getUsageStats = async (req, res) => {
  try {
    // --- 1. MONGODB DRIVER DATA (Metadata) ---
    const dbStats = await mongoose.connection.db.command({ dbStats: 1 });

    // --- 2. ATLAS ADMIN API (Live Connections) ---
    const publicKey = process.env.ATLAS_PUBLIC_KEY;
    const privateKey = process.env.ATLAS_PRIVATE_KEY;
    const groupId = process.env.ATLAS_PROJECT_ID;
    const processId = process.env.ATLAS_PROCESS_ID;

    let mongoMetrics = { connections: 0, lastUpdated: null };

    try {
      const client = new DigestFetch(publicKey, privateKey);
      const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/processes/${processId}/measurements?granularity=PT1M&period=PT5M&m=CONNECTIONS`;

      const response = await client.fetch(url);
      const data = await response.json();

      if (data.measurements && data.measurements[0]) {
        const points = data.measurements[0].dataPoints.filter(
          (p) => p.value !== null
        );
        if (points.length > 0) {
          const latestPoint = points[points.length - 1];
          mongoMetrics.connections = Math.round(latestPoint.value);
          mongoMetrics.lastUpdated = latestPoint.timestamp;
        }
      }
    } catch (apiErr) {
      console.warn("⚠️ Atlas API Sync Failed");
    }

    // --- 3. CLOUDINARY API (Media Usage) ---
    // We initialize cloudUsage with safe defaults to prevent frontend crashes
    let cloudUsage = {
      plan: "Free",
      credits: { usage: 0, limit: 25 },
      storage: { usedMB: "0.00", creditsUsed: 0 },
      bandwidth: { usedMB: "0.00", creditsUsed: 0 },
      transformations: { count: 0, creditsUsed: 0 },
      resources: 0,
      requests: 0,
      rateLimit: { remaining: 500, resetAt: "--:--" },
      lastUpdated: null,
    };

    try {
      const cloudinaryRes = await cloudinary.api.usage();

      if (cloudinaryRes) {
        const resetUTC = new Date(cloudinaryRes.rate_limit_reset_at);
        const resetIST = resetUTC.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        // Map the API response to our cloudUsage object
        cloudUsage = {
          plan: cloudinaryRes.plan || "Free",
          credits: {
            usage: cloudinaryRes.credits?.usage || 0,
            limit: cloudinaryRes.credits?.limit || 25,
          },
          storage: {
            usedMB: (cloudinaryRes.storage?.usage / (1024 * 1024)).toFixed(2),
            creditsUsed: cloudinaryRes.storage?.credits_usage || 0,
          },
          bandwidth: {
            usedMB: (cloudinaryRes.bandwidth?.usage / (1024 * 1024)).toFixed(2),
            creditsUsed: cloudinaryRes.bandwidth?.credits_usage || 0,
          },
          transformations: {
            count: cloudinaryRes.transformations?.usage || 0,
            creditsUsed: cloudinaryRes.transformations?.credits_usage || 0,
          },
          resources: cloudinaryRes.resources || 0,
          requests: cloudinaryRes.requests || 0,
          rateLimit: {
            remaining: cloudinaryRes.rate_limit_remaining ?? 500,
            resetAt: resetIST,
          },
          lastUpdated: cloudinaryRes.last_updated,
        };
      }
    } catch (err) {
      console.error("Cloudinary Sync Error:", err.message);
    }

    // --- 4. FINAL RESPONSE ---
    // Use the cloudUsage variable we built above
    res.json({
      mongodb: {
        activeConnections: mongoMetrics.connections,
        dataSizeMB: (dbStats.dataSize / (1024 * 1024)).toFixed(2),
        documentCount: dbStats.objects,
        limitMB: 512,
        tier: "M0 Free Tier",
        lastUpdated: mongoMetrics.lastUpdated,
      },
      cloudinary: cloudUsage,
    });
  } catch (error) {
    console.error("❌ Stats Controller Error:", error);
    res.status(500).json({ message: "Infrastructure telemetry failed" });
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
  getUsageStats,
};
