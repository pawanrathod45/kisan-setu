const express = require("express");
const router = express.Router();
const Scheme = require("../models/Scheme");
const SchemeBookmark = require("../models/SchemeBookmark");
const User = require("../models/User");
const Crop = require("../models/Crop");
const authMiddleware = require("../middleware/authMiddleware");

// Optional auth helper (for public listings that enhance with user bookmarks)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }
  return authMiddleware(req, res, next);
};

/**
 * 🎯 Eligibility Engine
 * Evaluates a scheme against a farmer profile + farmer crops
 */
function evaluateEligibility(scheme, user, userCrops = []) {
  const reasons = [];
  const missingRequirements = [];
  let isEligible = true;
  let isPartial = false;

  const elig = scheme.eligibility || {};

  // 1. Residency check
  // (All listed schemes are for Maharashtra state)
  if (elig.residencyRequired && elig.residencyRequired.toLowerCase() === "maharashtra") {
    const loc = (user.location || user.district || "").toLowerCase();
    // Default location in app is Maharashtra/India
    if (loc && !loc.includes("maharashtra") && !loc.includes("pune") && !loc.includes("nashik") && !loc.includes("nagpur") && !loc.includes("india")) {
      isEligible = false;
      reasons.push("Only residents of Maharashtra are eligible for this state scheme.");
    }
  }

  // 2. District filter (if scheme is limited to specific districts)
  if (elig.applicableDistricts && elig.applicableDistricts.length > 0) {
    const userDist = (user.district || user.location || "").toLowerCase();
    const matchedDist = elig.applicableDistricts.some(d => userDist.includes(d.toLowerCase()));
    if (!matchedDist && userDist) {
      isEligible = false;
      reasons.push(`Scheme is currently active in select districts: ${elig.applicableDistricts.join(", ")}.`);
    } else if (!userDist) {
      isPartial = true;
      missingRequirements.push("District details required to verify local availability.");
    }
  }

  // 3. Farmer Category check (SC / ST / Women / Small & Marginal / All)
  if (elig.farmerCategories && elig.farmerCategories.length > 0 && !elig.farmerCategories.includes("all")) {
    const userCategory = (user.farmerCategory || "").toLowerCase();
    const landArea = Number(user.landArea) || 0;
    
    // Check if farmer is small/marginal based on land (< 2 hectares / 5 acres)
    const isSmallMarginal = landArea > 0 && landArea <= 2;
    const categoryMatches = elig.farmerCategories.some(cat => {
      if (cat === "small" || cat === "marginal") return isSmallMarginal;
      if (userCategory) return userCategory === cat;
      return false;
    });

    if (!userCategory && !isSmallMarginal) {
      isPartial = true;
      missingRequirements.push(`Scheme is targeted for: ${elig.farmerCategories.map(c => c.toUpperCase()).join(", ")}. Verify your category in profile.`);
    } else if (!categoryMatches) {
      isEligible = false;
      reasons.push(`Targeted exclusively for ${elig.farmerCategories.map(c => c.toUpperCase()).join(", ")} farmers.`);
    }
  }

  // 4. Land Limit check
  if (elig.maxLandHectares) {
    const land = Number(user.landArea) || 0;
    if (land > elig.maxLandHectares) {
      isEligible = false;
      reasons.push(`Land holding exceeds maximum ceiling of ${elig.maxLandHectares} hectares.`);
    }
  }
  if (elig.minLandHectares) {
    const land = Number(user.landArea) || 0;
    if (land > 0 && land < elig.minLandHectares) {
      isEligible = false;
      reasons.push(`Requires minimum land holding of ${elig.minLandHectares} hectares.`);
    }
  }

  // 5. Irrigation requirement check
  if (elig.irrigationRequired) {
    const hasWater = user.hasIrrigation || (user.irrigationSource && user.irrigationSource !== "none" && user.irrigationSource !== "rainfed");
    if (user.irrigationSource === "none" || (!user.hasIrrigation && user.irrigationSource === "rainfed")) {
      isPartial = true;
      missingRequirements.push("Assured water/irrigation source (Well, Borewell, Farm Pond, or Canal) required.");
    }
  }

  // 6. Crop matching
  if (elig.applicableCrops && elig.applicableCrops.length > 0 && !elig.applicableCrops.includes("all")) {
    const farmerCrops = [
      ...(user.crop ? [user.crop.toLowerCase()] : []),
      ...(Array.isArray(user.crops) ? user.crops.map(c => c.toLowerCase()) : []),
      ...userCrops.map(c => (c.name || "").toLowerCase())
    ];

    const matchedCrop = elig.applicableCrops.some(ac => 
      farmerCrops.some(fc => fc.includes(ac.toLowerCase()) || ac.toLowerCase().includes(fc))
    );

    if (farmerCrops.length > 0 && !matchedCrop) {
      isPartial = true;
      missingRequirements.push(`Recommended for crops: ${elig.applicableCrops.join(", ")}. Check if you cultivate these.`);
    }
  }

  // Final status compilation
  if (!isEligible) {
    return {
      status: "ineligible",
      statusBadge: "Not currently eligible",
      statusBadgeHi: "वर्तमान में पात्र नहीं",
      statusBadgeMr: "सध्या पात्र नाही",
      color: "#dc2626",
      bg: "#fee2e2",
      reasons: reasons.length > 0 ? reasons : ["Profile does not meet specific criteria."]
    };
  }

  if (isPartial || missingRequirements.length > 0) {
    return {
      status: "partial",
      statusBadge: "May be eligible – verify requirements",
      statusBadgeHi: "पात्र हो सकते हैं – शर्तें जांचें",
      statusBadgeMr: "पात्र असू शकतात – अटी तपासा",
      color: "#d97706",
      bg: "#fef3c7",
      reasons: missingRequirements
    };
  }

  return {
    status: "eligible",
    statusBadge: "Eligible",
    statusBadgeHi: "पात्र (Eligible)",
    statusBadgeMr: "पात्र (Eligible)",
    color: "#15803d",
    bg: "#dcfce7",
    reasons: ["Your farmer profile satisfies the core eligibility criteria for this scheme."]
  };
}

// 1. GET /api/schemes - List all active schemes with filters
router.get("/schemes", optionalAuth, async (req, res) => {
  try {
    const { category, search, crop, benefitType, status } = req.query;
    const filter = { isActive: true };

    if (category && category !== "all") {
      filter.category = category;
    }
    if (status && status !== "all") {
      filter.applicationStatus = status;
    }
    if (benefitType && benefitType !== "all") {
      filter["benefits.benefitType"] = benefitType;
    }
    if (crop && crop !== "all") {
      filter.$or = [
        { "eligibility.applicableCrops": { $in: [new RegExp(crop, "i"), "all"] } },
        { "eligibility.applicableCrops": { $size: 0 } }
      ];
    }
    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { nameHi: { $regex: q, $options: "i" } },
        { nameMr: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { department: { $regex: q, $options: "i" } }
      ];
    }

    const schemes = await Scheme.find(filter).sort({ createdAt: 1 });

    // Fetch user bookmarks if logged in
    let bookmarkedIds = new Set();
    let user = null;
    let userCrops = [];

    if (req.user?.id) {
      const [bookmarks, dbUser, dbCrops] = await Promise.all([
        SchemeBookmark.find({ userId: req.user.id }).select("schemeId"),
        User.findById(req.user.id).select("-password"),
        Crop.find({ userId: req.user.id }).select("name")
      ]);
      bookmarkedIds = new Set(bookmarks.map(b => b.schemeId.toString()));
      user = dbUser;
      userCrops = dbCrops;
    }

    // Attach bookmark status & eligibility match
    const result = schemes.map(scheme => {
      const isBookmarked = bookmarkedIds.has(scheme._id.toString());
      const evaluation = user ? evaluateEligibility(scheme, user, userCrops) : null;
      return {
        ...scheme.toObject(),
        isBookmarked,
        evaluation
      };
    });

    res.json({
      success: true,
      count: result.length,
      schemes: result,
      officialSource: "MahaDBT Agriculture Portal (https://mahadbt.maharashtra.gov.in)",
      verifiedInfoNote: "Information verified from official Maharashtra Government notifications and MahaDBT portal."
    });
  } catch (err) {
    console.error("Schemes list error:", err);
    res.status(500).json({ message: "Error fetching government schemes" });
  }
});

// 2. GET /api/schemes/matched - Schemes sorted/filtered by farmer eligibility
router.get("/schemes/matched/eligibility", authMiddleware, async (req, res) => {
  try {
    const [user, userCrops, schemes, bookmarks] = await Promise.all([
      User.findById(req.user.id).select("-password"),
      Crop.find({ userId: req.user.id }).select("name"),
      Scheme.find({ isActive: true }).sort({ createdAt: 1 }),
      SchemeBookmark.find({ userId: req.user.id }).select("schemeId")
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });

    const bookmarkedIds = new Set(bookmarks.map(b => b.schemeId.toString()));

    const evaluated = schemes.map(scheme => {
      const evaluation = evaluateEligibility(scheme, user, userCrops);
      return {
        ...scheme.toObject(),
        isBookmarked: bookmarkedIds.has(scheme._id.toString()),
        evaluation
      };
    });

    // Group into Eligible, May be Eligible, Ineligible
    const eligible = evaluated.filter(s => s.evaluation.status === "eligible");
    const partial = evaluated.filter(s => s.evaluation.status === "partial");
    const ineligible = evaluated.filter(s => s.evaluation.status === "ineligible");

    res.json({
      success: true,
      total: evaluated.length,
      counts: {
        eligible: eligible.length,
        partial: partial.length,
        ineligible: ineligible.length
      },
      farmerProfileSummary: {
        name: user.name,
        location: user.location || user.district || "Maharashtra",
        landArea: user.landArea ? `${user.landArea} ha` : "Not specified",
        crop: user.crop || "Not specified",
        farmerCategory: user.farmerCategory || "General",
        irrigation: user.hasIrrigation ? "Assured" : (user.irrigationSource || "Rainfed")
      },
      schemes: [...eligible, ...partial, ...ineligible]
    });
  } catch (err) {
    console.error("Matched schemes error:", err);
    res.status(500).json({ message: "Error evaluating scheme eligibility" });
  }
});

// 3. GET /api/schemes/saved/bookmarks - Get bookmarked schemes
router.get("/schemes/saved/bookmarks", authMiddleware, async (req, res) => {
  try {
    const bookmarks = await SchemeBookmark.find({ userId: req.user.id })
      .populate("schemeId")
      .sort({ savedAt: -1 });

    const schemes = bookmarks
      .filter(b => b.schemeId && b.schemeId.isActive)
      .map(b => ({
        ...b.schemeId.toObject(),
        isBookmarked: true,
        savedAt: b.savedAt
      }));

    res.json({ success: true, count: schemes.length, schemes });
  } catch (err) {
    console.error("Bookmarks error:", err);
    res.status(500).json({ message: "Error fetching saved schemes" });
  }
});

// 4. POST /api/schemes/:id/bookmark - Toggle bookmark
router.post("/schemes/:id/bookmark", authMiddleware, async (req, res) => {
  try {
    const schemeId = req.params.id;
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });

    const existing = await SchemeBookmark.findOne({
      userId: req.user.id,
      schemeId
    });

    if (existing) {
      await SchemeBookmark.deleteOne({ _id: existing._id });
      return res.json({ success: true, isBookmarked: false, message: "Scheme removed from bookmarks" });
    } else {
      await SchemeBookmark.create({
        userId: req.user.id,
        schemeId
      });
      return res.json({ success: true, isBookmarked: true, message: "Scheme saved to bookmarks" });
    }
  } catch (err) {
    console.error("Bookmark toggle error:", err);
    res.status(500).json({ message: "Error saving bookmark" });
  }
});

// 5. GET /api/schemes/:id - Specific scheme detail
router.get("/schemes/:id", optionalAuth, async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });

    let isBookmarked = false;
    let evaluation = null;

    if (req.user?.id) {
      const [bm, user, crops] = await Promise.all([
        SchemeBookmark.findOne({ userId: req.user.id, schemeId: scheme._id }),
        User.findById(req.user.id).select("-password"),
        Crop.find({ userId: req.user.id }).select("name")
      ]);
      isBookmarked = !!bm;
      if (user) {
        evaluation = evaluateEligibility(scheme, user, crops);
      }
    }

    res.json({
      success: true,
      scheme: {
        ...scheme.toObject(),
        isBookmarked,
        evaluation
      }
    });
  } catch (err) {
    console.error("Scheme detail error:", err);
    res.status(500).json({ message: "Error fetching scheme details" });
  }
});

module.exports = router;
