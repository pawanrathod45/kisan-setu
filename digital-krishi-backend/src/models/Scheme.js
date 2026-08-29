const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema({
  schemeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: { type: String, required: true, trim: true },
  nameHi: { type: String, trim: true },
  nameMr: { type: String, trim: true },

  department: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: [
      "irrigation",
      "mechanization",
      "horticulture",
      "food-security",
      "tribal-welfare",
      "sc-welfare",
      "rainfed",
      "infrastructure",
      "general",
    ],
    default: "general",
  },

  description: { type: String, required: true },
  descriptionHi: String,
  descriptionMr: String,

  // Eligibility criteria
  eligibility: {
    farmerCategories: {
      type: [String],
      enum: ["all", "sc", "st", "general", "obc", "women", "small", "marginal"],
      default: ["all"],
    },
    maxLandHectares: { type: Number, default: null },
    minLandHectares: { type: Number, default: null },
    irrigationRequired: { type: Boolean, default: false },
    applicableCrops: [String],
    applicableDistricts: [String], // empty = all Maharashtra
    residencyRequired: { type: String, default: "Maharashtra" },
    aadhaarRequired: { type: Boolean, default: true },
    bankAccountRequired: { type: Boolean, default: true },
    landDocumentsRequired: { type: Boolean, default: true },
    additionalCriteria: [String],
    additionalCriteriaHi: [String],
    additionalCriteriaMr: [String],
  },

  // Benefits
  benefits: {
    subsidyPercentage: { type: String, default: null },
    maxSubsidyAmount: { type: String, default: null },
    benefitType: {
      type: String,
      enum: ["subsidy", "grant", "equipment", "seeds", "training", "infrastructure", "mixed"],
      default: "subsidy",
    },
    benefitDescription: String,
    benefitDescriptionHi: String,
    benefitDescriptionMr: String,
  },

  // Required documents
  requiredDocuments: [String],
  requiredDocumentsHi: [String],
  requiredDocumentsMr: [String],

  // Official links
  officialLink: { type: String, default: "https://mahadbt.maharashtra.gov.in" },
  sourceGrLink: String,
  helplineNumber: String,

  // Application status
  applicationStatus: {
    type: String,
    enum: ["open", "closed", "upcoming", "year-round"],
    default: "year-round",
  },

  // Verification metadata
  lastVerifiedDate: { type: Date, default: Date.now },
  verifiedSource: { type: String, default: "MahaDBT Portal – mahadbt.maharashtra.gov.in" },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

schemeSchema.index({ category: 1, isActive: 1 });
schemeSchema.index({ "eligibility.applicableCrops": 1 });
schemeSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Scheme", schemeSchema);
