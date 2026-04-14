const MarketHistory = require("../models/MarketHistory");

const exportTrainingData = async (req, res) => {
  try {
    const data = await MarketHistory.find()
      .sort({ date: 1 })
      .lean();

    res.json({
      total: data.length,
      data: data
    });
  } catch (error) {
    console.error("ML Export Error:", error.message);
    res.status(500).json({
      message: "Failed to export training data"
    });
  }
};

module.exports = { exportTrainingData };
