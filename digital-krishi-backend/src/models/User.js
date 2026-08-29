const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: false,
    trim: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailOtp: {
    hash: String,
    expiresAt: Date,
    attempts: {
      type: Number,
      default: 0,
    },
    lastSentAt: Date,
  },
  passwordResetOtp: {
    hash: String,
    expiresAt: Date,
    attempts: {
      type: Number,
      default: 0,
    },
  },
  role: {
    type: String,
    enum: ["farmer", "officer", "agent", "admin"],
    default: "farmer",
  },
  status: {
    type: String,
    enum: ["active", "suspended", "inactive"],
    default: "active",
  },
  location: {
    type: String,
    default: "Maharashtra, India",
  },
  crop: {
    type: String,
    default: "Wheat",
  },
  crops: [String],
  profileImage: String,
  landArea: Number,
  farmingType: {
    type: String,
    enum: ["organic", "traditional"],
    default: "traditional",
  },
  language: {
    type: String,
    default: "en",
  },
  district: String,
  taluka: String,
  village: String,
  farmerCategory: {
    type: String,
    enum: ["general", "sc", "st", "obc", "women", "small", "marginal", ""],
    default: "general",
  },
  hasIrrigation: {
    type: Boolean,
    default: false,
  },
  irrigationSource: {
    type: String,
    enum: ["well", "borewell", "canal", "river", "farm_pond", "rainfed", "none", ""],
    default: "none",
  },
  bio: String,
  notificationsEnabled: {
    type: Boolean,
    default: true,
  },
  darkMode: {
    type: Boolean,
    default: false,
  },
  lastLogin: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);