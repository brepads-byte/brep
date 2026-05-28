const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto"); // ✅ Core cryptographic module - no dependency bugs

// ✉️ Configure Nodemailer Transport using your Gmail app profile
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "brep.ads@gmail.com",
    pass: process.env.EMAIL_APP_PASS, // Your 16-character Google App Password in your .env
  },
});

// 1. RESTORED: Admin Login Handler
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    if (!admin.isActive)
      return res.status(403).json({ message: "Account is deactivated" });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.json({ token, admin: adminResponse });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 2. RESTORED: Session Token Verifier
const verify = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin)
      return res
        .status(401)
        .json({ message: "Invalid token: Admin not found" });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 3. GENERATE STATELESS OTP & ENCRYPTED REFERENCE DISPATCH (No DB Storage)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email address is required" });

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(404)
        .json({
          message: "No administrative account linked to this email address",
        });
    }

    // Generate a secure 6-digit random number
    const otp = crypto.randomInt(100000, 999999).toString();

    // Set an expiration timestamp (5 minutes from now)
    const expires = Date.now() + 5 * 60 * 1000;

    // Pack data layout: "adminId.otp.expiresAt"
    const dataString = `${admin._id}.${otp}.${expires}`;

    // Encrypt the components string using your server JWT_SECRET as a secure seed
    const cipher = crypto.createCipheriv(
      "aes-256-ctr",
      crypto.scryptSync(process.env.JWT_SECRET, "salt", 32),
      Buffer.alloc(16, 0)
    );
    const encryptedToken =
      cipher.update(dataString, "utf8", "hex") + cipher.final("hex");

    const mailOptions = {
      from: '"BREP Panel Security" <brep.ads@gmail.com>',
      to: admin.email,
      subject: "Your Password Reset Verification Code",
      html: `
        <div style="font-family: sans-serif; max-width: 450px; margin: 0 auto; padding: 24px; border: 1px solid #eef0f2; border-radius: 4px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #000; margin-bottom: 16px;">Password Recovery Request</h2>
          <p style="font-size: 14px; color: #555; line-height: 1.6;">Use this authorization code to commit your change. It remains active for exactly <strong>5 minutes</strong>.</p>
          <div style="background-color: #f8f9fa; padding: 18px; text-align: center; margin: 24px 0; border: 1px dashed #ddd; border-radius: 4px;">
            <span style="font-family: monospace; font-size: 34px; font-weight: bold; letter-spacing: 4px; color: #000;">${otp}</span>
          </div>
          <p style="font-size: 11px; color: #999; margin-top: 20px;">If you didn't authorize this password reset change, you can safely disregard this report.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Provide the secure text string back to frontend state mapping hooks
    res.status(200).json({
      message: "Verification OTP has been dispatched to your inbox.",
      resetTokenId: encryptedToken,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed processing automated recovery deployment",
        error: error.message,
      });
  }
};

// 4. STATELESS TOKEN DECRYPTION VALIDATION AND RESET
const verifyOtpAndReset = async (req, res) => {
  try {
    const { resetTokenId, otp, newPassword } = req.body; 

    // 1. Validate incoming payload structure
    if (!resetTokenId || !otp || !newPassword) {
      return res.status(400).json({ message: "All elements are mandatory" });
    }

    // 2. Decrypt the tracking reference token string
    const decipher = crypto.createDecipheriv(
      "aes-256-ctr", 
      crypto.scryptSync(process.env.JWT_SECRET, "salt", 32), 
      Buffer.alloc(16, 0)
    );
    const decryptedData = decipher.update(resetTokenId, "hex", "utf8") + decipher.final("utf8");

    // Extract structural variables: [adminId, originalOtp, expiresAt]
    const [adminId, originalOtp, expiresAt] = decryptedData.split(".");

    // 3. Security Check: Validate OTP match
    if (otp !== originalOtp) {
      return res.status(400).json({ message: "The verification code is incorrect" });
    }

    // 4. Security Check: Validate Expiration Window (5 Minutes)
    if (Date.now() > parseInt(expiresAt, 10)) {
      return res.status(400).json({ message: "The verification code has expired" });
    }

    // 5. Security Check: Enforce Backend Password Complexity Validation
    // Prevents API-bypassing tools (like Postman) from sending weak passwords
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password is too weak. Must be at least 8 characters long and contain uppercase letters, lowercase letters, numbers, and special characters (@$!%*?&).",
      });
    }

    // 6. Locate targeted database document and explicitly force password field selection
    const admin = await Admin.findById(adminId).select("+password");
    if (!admin) {
      return res.status(404).json({ message: "User account context no longer exists" });
    }

    // 7. Security Check: Ensure the new password does not match the old operating password hash
    const isSamePassword = await bcrypt.compare(newPassword, admin.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        message: "New password cannot be identical to your current password. Please choose a unique combination." 
      });
    }

    // 8. Cryptographic Hashing and Save Database Changes
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    res.status(200).json({ message: "Password override record committed successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Verification failed: Token signature manipulation detected", error: error.message });
  }
};

module.exports = { login, verify, forgotPassword, verifyOtpAndReset };
