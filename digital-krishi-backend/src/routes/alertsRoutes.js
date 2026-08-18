const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Alert = require("../models/Alert");

// Get all alerts for user
router.get("/alerts", authMiddleware, async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Mark alert as read
router.put("/alerts/:id", authMiddleware, async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: req.body.read },
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ message: "Failed to update alert" });
  }
});

module.exports = router;
