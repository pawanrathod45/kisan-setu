const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  phone: {
    type: String,
    unique: true,
    required: true,
  },
  email: String,
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["farmer", "officer", "agent"],
    default: "farmer",
  },
  location: String,
  crop: String,
  crops: [String],
  profileImage: String,
  landArea: Number,
  farmingType: {
    type: String,
    enum: ["organic", "traditional"],
  },
  language: {
    type: String,
    default: "en",
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
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);