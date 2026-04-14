const mongoose = require("mongoose");

const querySchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
    },
    question: String,

    aiResponse: Object,

    confidence: {
      type: Number,
      default: 0,
    },

    escalationRequired: {
      type: Boolean,
      default: false,
    },

    category: {
      type: String,
      default: "General",
    },

    riskLevel: {
      type: String,
      default: "Low",
    },

    imagePath: {
      type: String,
    },

    officerResponse: {
      type: String,
    },

    officerRemarks: {
      type: String,
    },

    resolvedByOfficer: {
      type: Boolean,
      default: false,
    },

    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Query", querySchema);
