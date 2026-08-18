const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, phone, email, password, location, crop, role } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(503).json({
        message: "Database is not connected. Start MongoDB and try again.",
      });
    }

    if (!name || !phone || !password || !location || !crop) {
      return res.status(400).json({
        message: "Name, phone, password, location, and crop are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      phone,
      email,
      password: hashedPassword,
      location,
      crop,
      role: role || "farmer",
    });

    await user.save();

    console.log("✅ User registered:", phone);

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("❌ Registration error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    res.status(500).json({ message: err.message || "Registration failed" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    console.log("🔍 Login attempt for phone:", phone);

    if (!isDatabaseConnected()) {
      return res.status(503).json({
        message: "Database is not connected. Start MongoDB and try again.",
      });
    }

    if (!phone || !password) {
      return res.status(400).json({ message: "Phone and password are required" });
    }

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      console.log("❌ User not found:", phone);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ User found:", user.name);

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Invalid password for:", phone);
      return res.status(401).json({ message: "Invalid password" });
    }

    console.log("✅ Password verified for:", phone);

    // Generate JWT token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "7d" }
    );

    // Generate refresh token (optional)
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "30d" }
    );

    console.log("✅ Token generated for:", phone);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        location: user.location,
        crop: user.crop,
      },
    });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: err.message || "Login failed" });
  }
};
