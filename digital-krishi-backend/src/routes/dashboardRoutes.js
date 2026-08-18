const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const User = require("../models/User");
const Alert = require("../models/Alert");
const Task = require("../models/Task");
const Market = require("../models/Market");
const Crop = require("../models/Crop");

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alerts = await Alert.find({ userId, read: false });
    
    const today = new Date().toISOString().split("T")[0];
    const tasks = await Task.find({ userId, date: today, status: "pending" });

    const crops = await Crop.find({ userId });

    let marketPrice = null;
    if (user.crop && user.location) {
      const marketData = await Market.findOne({ 
        crop: user.crop, 
        location: user.location 
      }).sort({ createdAt: -1 });
      
      if (marketData) {
        marketPrice = marketData.modalPrice;
      }
    }

    res.json({
      crops: crops.length,
      alerts: alerts.length,
      tasks: tasks.length,
      marketPrice,
      user: {
        name: user.name,
        location: user.location,
        crop: user.crop,
      }
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
