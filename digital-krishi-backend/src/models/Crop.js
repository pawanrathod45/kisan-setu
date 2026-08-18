const mongoose = require("mongoose");

const pesticideSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, default: "2ml / litre of water" },
  type: { type: String, default: "Fungicide / Insecticide" },
  appliedOn: { type: Date, default: Date.now },
  status: { type: String, default: "Recommended" } // 'Recommended' | 'Applied'
});

const cropSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  variety: String,
  area: {
    type: Number,
    required: true
  },
  sowingDate: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ""
  },
  healthStatus: {
    type: String,
    default: "Healthy" // 'Healthy' | 'Mild Infection' | 'Infected' | 'Critical'
  },
  diseaseDetected: {
    type: String,
    default: "Healthy Plant"
  },
  confidence: {
    type: Number,
    default: 95
  },
  aiReview: {
    type: String,
    default: "Google Gemini AI Verified: Crop foliage is showing healthy growth stage with optimal chlorophyll vigor."
  },
  aiProvider: {
    type: String,
    default: "Google Gemini 2.0 AI"
  },
  currentPrice: {
    type: Number,
    default: 2450
  },
  priceTrend: {
    type: String,
    default: "+2.5% ▲"
  },
  appliedPesticides: [pesticideSchema],
  treatmentAdvice: {
    type: String,
    default: ""
  },
  preventionTips: {
    type: String,
    default: ""
  },
  lastScanDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Crop", cropSchema);
