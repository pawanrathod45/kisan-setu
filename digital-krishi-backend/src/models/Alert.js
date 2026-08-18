const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["weather", "pest", "market", "task", "general"],
    default: "general"
  },
  severity: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Alert", alertSchema);
