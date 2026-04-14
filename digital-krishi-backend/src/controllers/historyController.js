const Query = require("../models/Query");
const Farmer = require("../models/Farmer");

const getFarmerHistory = async (req, res) => {
  try {
    const farmerId = req.params.id;

    const farmer = await Farmer.findById(farmerId);

    if (!farmer) {
      return res.status(404).json({
        message: "Farmer not found",
      });
    }

    const queries = await Query.find({ farmerId }).sort({ createdAt: -1 });

    const totalQueries = queries.length;

    const diseaseCount = queries.filter(
      (q) => q.category === "Disease Detection"
    ).length;

    const marketCount = queries.filter(
      (q) => q.category === "Market Price"
    ).length;

    const weatherCount = queries.filter(
      (q) => q.category === "Weather"
    ).length;

    const escalations = queries.filter(
      (q) => q.escalationRequired === true
    ).length;

    const avgConfidence =
      queries.reduce((sum, q) => sum + (q.confidence || 0), 0) /
      (totalQueries || 1);

    const riskDistribution = {
      Low: queries.filter((q) => q.riskLevel === "Low").length,
      Medium: queries.filter((q) => q.riskLevel === "Medium").length,
      High: queries.filter((q) => q.riskLevel === "High").length,
      Critical: queries.filter((q) => q.riskLevel === "Critical").length,
    };

    res.status(200).json({
      farmer: {
        name: farmer.name,
        location: farmer.location,
        crop: farmer.crop,
      },
      stats: {
        totalQueries,
        diseaseCount,
        marketCount,
        weatherCount,
        escalations,
        averageConfidence: Math.round(avgConfidence),
        riskDistribution,
      },
      history: queries,
    });
  } catch (error) {
    console.error("History Error:", error.message);
    res.status(500).json({
      message: "Failed to fetch history",
    });
  }
};

module.exports = { getFarmerHistory };
