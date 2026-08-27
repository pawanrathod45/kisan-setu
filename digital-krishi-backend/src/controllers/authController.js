const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { sendVerificationOtpEmail } = require("../services/emailService");

const isDatabaseConnected = () => mongoose.connection.readyState === 1;
const JWT_SECRET = process.env.JWT_SECRET || "kisan_setu_jwt_super_secret_key_2026";

// Secure 6-digit OTP Generator
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Fast deterministic OTP Hash (SHA-256)
const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

// 1. REGISTER NEW USER (EMAIL-BASED)
exports.register = async (req, res) => {
  try {
    const { name, email, password, location, crop, farmingType, role } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(503).json({
        message: "Database is not connected. Please try again in a few moments.",
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Full name, email address, and password are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address format." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    // Check existing user
    let user = await User.findOne({ email: cleanEmail });

    if (user && user.isEmailVerified) {
      return res.status(400).json({
        message: "An account with this email already exists. Please sign in.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (user && !user.isEmailVerified) {
      // Update unverified user details & dispatch new OTP
      user.name = name.trim();
      user.password = hashedPassword;
      user.location = location || user.location || "Maharashtra, India";
      user.crop = crop || user.crop || "Wheat";
      user.farmingType = farmingType || user.farmingType || "traditional";
      user.emailOtp = {
        hash: hashedOtp,
        expiresAt: otpExpiry,
        attempts: 0,
        lastSentAt: new Date(),
      };
      await user.save();
    } else {
      // Create new user record
      user = new User({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        location: location || "Maharashtra, India",
        crop: crop || "Wheat",
        farmingType: farmingType || "traditional",
        role: role || "farmer",
        isEmailVerified: false,
        emailOtp: {
          hash: hashedOtp,
          expiresAt: otpExpiry,
          attempts: 0,
          lastSentAt: new Date(),
        },
      });
      await user.save();
    }

    // Send real email OTP
    await sendVerificationOtpEmail(cleanEmail, otp, name);

    res.status(201).json({
      success: true,
      requiresVerification: true,
      email: cleanEmail,
      message: `Verification code dispatched to ${cleanEmail}. Please verify your account.`,
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: err.message || "Registration failed" });
  }
};

// 2. VERIFY EMAIL OTP
exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and 6-digit OTP code are required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({ message: "Please enter a valid 6-digit numeric verification code." });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: "Account not found." });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: "Email is already verified. You may sign in directly.",
      });
    }

    if (!user.emailOtp || !user.emailOtp.hash || !user.emailOtp.expiresAt) {
      return res.status(400).json({
        message: "No active verification code found. Please request a new code.",
      });
    }

    // Expiration check
    if (new Date() > new Date(user.emailOtp.expiresAt)) {
      return res.status(400).json({
        message: "Verification code has expired. Please request a new code.",
      });
    }

    // Brute-force limit check (max 5 attempts)
    if (user.emailOtp.attempts >= 5) {
      return res.status(429).json({
        message: "Too many incorrect attempts. Please request a new verification code.",
      });
    }

    // Compare hash
    const inputHash = hashOtp(cleanOtp);
    if (inputHash !== user.emailOtp.hash) {
      user.emailOtp.attempts = (user.emailOtp.attempts || 0) + 1;
      await user.save();
      const remaining = Math.max(0, 5 - user.emailOtp.attempts);
      return res.status(400).json({
        message: `Incorrect verification code. ${remaining} attempt(s) remaining.`,
      });
    }

    // Mark as Verified & Clear OTP
    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.lastLogin = new Date();
    await user.save();

    console.log(`✅ Email verified successfully for: ${cleanEmail}`);

    // Generate JWT Session Tokens
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      success: true,
      message: "Email verified successfully! Welcome to Kisan Setu.",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        crop: user.crop,
      },
    });
  } catch (err) {
    console.error("❌ OTP verification error:", err);
    res.status(500).json({ message: err.message || "OTP verification failed" });
  }
};

// 3. RESEND EMAIL OTP (WITH 60-SEC COOLDOWN)
exports.resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email address is required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Account is already verified. Please sign in." });
    }

    // 60-Second Cooldown Enforcement
    if (user.emailOtp && user.emailOtp.lastSentAt) {
      const timeSinceLast = Date.now() - new Date(user.emailOtp.lastSentAt).getTime();
      if (timeSinceLast < 60000) {
        const waitSeconds = Math.ceil((60000 - timeSinceLast) / 1000);
        return res.status(429).json({
          message: `Please wait ${waitSeconds}s before requesting a new code.`,
        });
      }
    }

    // Generate fresh OTP
    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.emailOtp = {
      hash: hashedOtp,
      expiresAt: otpExpiry,
      attempts: 0,
      lastSentAt: new Date(),
    };
    await user.save();

    // Dispatch email
    await sendVerificationOtpEmail(cleanEmail, otp, user.name);

    res.status(200).json({
      success: true,
      message: `A fresh 6-digit verification code was sent to ${cleanEmail}.`,
    });
  } catch (err) {
    console.error("❌ Resend OTP error:", err);
    res.status(500).json({ message: err.message || "Failed to resend verification code" });
  }
};

// 4. LOGIN (EMAIL + PASSWORD)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(503).json({
        message: "Database is not connected. Please try again in a few moments.",
      });
    }

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    // Auto-seed demo accounts if missing
    if (!user && cleanEmail === "admin@kisansetu.com" && password === "AdminPassword@123") {
      const hashedPassword = await bcrypt.hash("AdminPassword@123", 10);
      user = new User({
        name: "Kisan Setu Super Admin",
        email: "admin@kisansetu.com",
        password: hashedPassword,
        role: "admin",
        status: "active",
        isEmailVerified: true,
        location: "Kisan Setu Command Center, Pune",
        crop: "Precision Agriculture",
        farmingType: "organic"
      });
      await user.save();
    } else if (!user && cleanEmail === "farmer.demo@kisansetu.com" && password === "password123") {
      const hashedPassword = await bcrypt.hash("password123", 10);
      user = new User({
        name: "Ramesh Patil (Demo Farmer)",
        email: "farmer.demo@kisansetu.com",
        password: hashedPassword,
        role: "farmer",
        status: "active",
        isEmailVerified: true,
        location: "Pune, Maharashtra",
        crop: "Wheat (गेहूं)",
        farmingType: "traditional"
      });
      await user.save();
    }

    if (!user) {
      return res.status(404).json({ message: "Account not found with this email. Please register." });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Enforce Email Verification
    if (!user.isEmailVerified) {
      // Generate and dispatch fresh OTP automatically
      const otp = generateOtp();
      user.emailOtp = {
        hash: hashOtp(otp),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
        lastSentAt: new Date(),
      };
      await user.save();

      await sendVerificationOtpEmail(cleanEmail, otp, user.name);

      return res.status(403).json({
        requiresVerification: true,
        email: cleanEmail,
        message: "Your email is not verified yet. We have sent a verification code to your email.",
      });
    }

    // Account status check
    if (user.status === "suspended" || user.status === "inactive") {
      return res.status(403).json({
        message: "Your account is currently suspended. Please contact Kisan Setu support.",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    console.log(`✅ Successful login for: ${cleanEmail} (${user.role})`);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
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
