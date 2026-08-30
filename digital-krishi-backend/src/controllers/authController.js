const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { sendVerificationOtpEmail, maskEmail } = require("../services/emailService");

const isDatabaseConnected = () => mongoose.connection.readyState === 1;
const JWT_SECRET = process.env.JWT_SECRET || "kisan_setu_jwt_super_secret_key_2026";

// Cryptographically secure 6-digit OTP Generator
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// Fast deterministic OTP Hash (SHA-256)
const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

// 1. REGISTER NEW USER (EMAIL-BASED)
exports.register = async (req, res) => {
  const reqStart = Date.now();
  let stepValidation = 0;
  let stepMongo = 0;
  let stepOtp = 0;
  let stepEmail = 0;

  try {
    const t0 = Date.now();
    const { name, email, password, location, crop, farmingType, role } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        message: "Database is not connected. Please try again in a few moments.",
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email address, and password are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address format.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    stepValidation = Date.now() - t0;

    // Check existing user in MongoDB
    const t1 = Date.now();
    let user = await User.findOne({ email: cleanEmail });

    if (user && user.isEmailVerified) {
      stepMongo = Date.now() - t1;
      console.log(`[REGISTER] Email: ${maskEmail(cleanEmail)} | validation: ${stepValidation}ms | mongodb: ${stepMongo}ms | total: ${Date.now() - reqStart}ms | status: 409 (already exists)`);
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please sign in.",
      });
    }

    // Generate secure OTP & hash
    const t2 = Date.now();
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    stepOtp = Date.now() - t2;

    if (user && !user.isEmailVerified) {
      // Update unverified user details & reset OTP
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
      // Create new user record (unverified)
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
    stepMongo = Date.now() - t1;

    // Send OTP verification email
    const t3 = Date.now();
    const emailResult = await sendVerificationOtpEmail(cleanEmail, otp, name.trim());
    stepEmail = Date.now() - t3;

    if (!emailResult.success) {
      console.error(`❌ [REGISTER] Email delivery failed for ${maskEmail(cleanEmail)}: ${emailResult.error}`);
      console.log(`[REGISTER] validation: ${stepValidation}ms | mongodb: ${stepMongo}ms | otp: ${stepOtp}ms | email: ${stepEmail}ms | total: ${Date.now() - reqStart}ms | status: 503`);
      return res.status(503).json({
        success: false,
        code: "EMAIL_DELIVERY_FAILED",
        message: "Account could not be verified because the verification email could not be sent. Please try again.",
      });
    }

    const totalTime = Date.now() - reqStart;
    console.log(`[REGISTER] validation: ${stepValidation}ms | mongodb: ${stepMongo}ms | otp: ${stepOtp}ms | email: ${stepEmail}ms | total: ${totalTime}ms | status: 201`);

    return res.status(201).json({
      success: true,
      requiresVerification: true,
      emailSent: true,
      email: cleanEmail,
      message: `Verification code sent to ${cleanEmail}. Please verify your account.`,
    });
  } catch (err) {
    console.error("❌ Registration error:", err.message);
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists. Please sign in.",
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message || "Registration failed. Please try again.",
    });
  }
};

// 2. VERIFY EMAIL OTP
exports.verifyEmailOtp = async (req, res) => {
  const reqStart = Date.now();
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and 6-digit OTP code are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit numeric verification code.",
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: "Email is already verified. You may sign in directly.",
      });
    }

    if (!user.emailOtp || !user.emailOtp.hash || !user.emailOtp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "No active verification code found. Please request a new code.",
      });
    }

    // Expiration check (10 minutes)
    if (new Date() > new Date(user.emailOtp.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: "This verification code has expired. Please request a new one.",
      });
    }

    // Brute-force limit check (max 5 attempts)
    if (user.emailOtp.attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new verification code.",
      });
    }

    // Compare SHA-256 hash
    const inputHash = hashOtp(cleanOtp);
    if (inputHash !== user.emailOtp.hash) {
      user.emailOtp.attempts = (user.emailOtp.attempts || 0) + 1;
      await user.save();
      const remaining = Math.max(0, 5 - user.emailOtp.attempts);
      return res.status(400).json({
        success: false,
        message: `Incorrect verification code. ${remaining} attempt(s) remaining.`,
      });
    }

    // Mark as Verified & Clear OTP
    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.lastLogin = new Date();
    await user.save();

    console.log(`✅ [VERIFY_OTP] Email verified successfully for: ${maskEmail(cleanEmail)} in ${Date.now() - reqStart}ms`);

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

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! Welcome to Kisan Setu.",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        crop: user.crop,
      },
    });
  } catch (err) {
    console.error("❌ OTP verification error:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message || "OTP verification failed",
    });
  }
};

// 3. RESEND EMAIL OTP (WITH 60-SEC COOLDOWN)
exports.resendEmailOtp = async (req, res) => {
  const reqStart = Date.now();
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified. Please sign in.",
      });
    }

    // 60-Second Cooldown Enforcement to prevent spam
    if (user.emailOtp && user.emailOtp.lastSentAt) {
      const timeSinceLast = Date.now() - new Date(user.emailOtp.lastSentAt).getTime();
      if (timeSinceLast < 60000) {
        const waitSeconds = Math.ceil((60000 - timeSinceLast) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSeconds}s before requesting a new code.`,
        });
      }
    }

    // Generate fresh cryptographically secure OTP & 10-minute expiry
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

    // Send email
    const emailResult = await sendVerificationOtpEmail(cleanEmail, otp, user.name);

    if (!emailResult.success) {
      console.error(`❌ [RESEND_OTP] Email delivery failed for ${maskEmail(cleanEmail)}: ${emailResult.error}`);
      return res.status(503).json({
        success: false,
        code: "EMAIL_DELIVERY_FAILED",
        message: "Failed to send verification code. Please try again.",
      });
    }

    console.log(`✅ [RESEND_OTP] Fresh OTP sent to ${maskEmail(cleanEmail)} in ${Date.now() - reqStart}ms`);

    return res.status(200).json({
      success: true,
      message: `A fresh 6-digit verification code was sent to ${cleanEmail}.`,
    });
  } catch (err) {
    console.error("❌ Resend OTP error:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to resend verification code",
    });
  }
};

// 4. LOGIN (EMAIL + PASSWORD)
exports.login = async (req, res) => {
  const reqStart = Date.now();
  try {
    const { email, password } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        message: "Database is not connected. Please try again in a few moments.",
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found with this email. Please register.",
      });
    }

    // Verify Password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Enforce Email Verification
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: cleanEmail,
        message: "Your email is not verified yet. Please verify your account.",
      });
    }

    // Account status check
    if (user.status === "suspended" || user.status === "inactive") {
      return res.status(403).json({
        success: false,
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

    console.log(`✅ [LOGIN] Successful login for: ${maskEmail(cleanEmail)} (${user.role}) in ${Date.now() - reqStart}ms`);

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        crop: user.crop,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message || "Login failed",
    });
  }
};
