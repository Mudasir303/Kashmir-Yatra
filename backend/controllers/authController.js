const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../utils/emailService");

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email });
    if (!admin)
      return res.status(401).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// register admin
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      password,
      role: "admin"
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send email
    const frontendUrl = req.body.baseUrl || req.get("origin") || `${req.protocol}://${req.get("host")}`;
    const resetUrl = `${frontendUrl}/reset-password.html?token=${resetToken}`;

    // In a production environment, you might want to use a specific frontend URL
    // const resetUrl = `https://yourdomain.com/reset-password.html?token=${resetToken}`;

    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: message,
    });

    res.json({ success: true, message: "Reset link sent to email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
