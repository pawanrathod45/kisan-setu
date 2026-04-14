const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^[6-9]\d{9}$/
  },
  password: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  crop: {
    type: String,
    required: true
  },
  lastLogin: {
    type: Date
  },
  loginHistory: [{
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String
  }]
}, { timestamps: true });

module.exports = mongoose.model("Farmer", farmerSchema);
