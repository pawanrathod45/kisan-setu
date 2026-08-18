const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Task = require("../models/Task");

// Get all tasks for user
router.get("/tasks", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const tasks = await Task.find({ userId }).sort({ date: 1 });
    res.json(tasks);
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Add new task
router.post("/tasks", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const { title, description, date, category } = req.body;
    const task = new Task({
      userId,
      title,
      description,
      date: date || new Date().toISOString().split("T")[0],
      category: category || "sowing"
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error("Add task error:", err);
    res.status(500).json({ message: "Failed to add task", error: err.message });
  }
});

// Update task
router.put("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to update task" });
  }
});

// Delete task
router.delete("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete task" });
  }
});

module.exports = router;
