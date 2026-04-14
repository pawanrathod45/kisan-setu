const Query = require("../models/Query");
const Farmer = require("../models/Farmer");
const Alert = require("../models/Alert");

const getAnalytics = async (req, res) => {
  try {
    const totalQueries = await Query.countDocuments();

    const categoryStats = await Query.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    const escalationStats = await Query.aggregate([
      {
        $group: {
          _id: "$escalationRequired",
          count: { $sum: 1 }
        }
      }
    ]);

    const confidenceStats = await Query.aggregate([
      {
        $bucket: {
          groupBy: "$confidence",
          boundaries: [0, 50, 70, 90, 101],
          default: "Other",
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    const locationStats = await Query.aggregate([
      {
        $lookup: {
          from: "farmers",
          localField: "farmerId",
          foreignField: "_id",
          as: "farmer"
        }
      },
      { $unwind: "$farmer" },
      {
        $group: {
          _id: "$farmer.location",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      totalQueries,
      categoryStats,
      escalationStats,
      confidenceStats,
      locationStats
    });

  } catch (error) {
    console.error("Analytics Error:", error.message);
    res.status(500).json({
      message: "Failed to fetch analytics"
    });
  }
};

const getAdvancedAnalytics = async (req, res) => {
  try {
    const totalFarmers = await Farmer.countDocuments();
    const totalQueries = await Query.countDocuments();
    const totalAlerts = await Alert.countDocuments();

    const highRiskAlerts = await Alert.countDocuments({
      priority: { $in: ["High", "Critical"] }
    });

    const cropStats = await Farmer.aggregate([
      {
        $group: {
          _id: "$crop",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalFarmers,
      totalQueries,
      totalAlerts,
      highRiskAlerts,
      topCrops: cropStats.slice(0, 3)
    });
  } catch (error) {
    console.error("Advanced Analytics Error:", error.message);
    res.status(500).json({
      message: "Failed to fetch advanced analytics"
    });
  }
};

module.exports = { getAnalytics, getAdvancedAnalytics };
