const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const adminController = require("../controllers/adminController");

// Protect ALL admin routes with both authentication & admin authorization
router.use(authMiddleware);
router.use(adminMiddleware);

// 1. Dashboard Overview Stats
router.get("/stats", adminController.getDashboardStats);

// 2. User Management
router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserById);
router.patch("/users/:id/status", adminController.updateUserStatus);
router.patch("/users/:id/role", adminController.updateUserRole);

// 3. Crops & Agricultural Monitoring
router.get("/crops", adminController.getCropsOverview);

// 4. Alerts & Notifications Management
router.get("/alerts", adminController.getAlerts);
router.post("/alerts/broadcast", adminController.createBroadcastAlert);
router.delete("/alerts/:id", adminController.deleteAlert);

// 5. Database Diagnostics & System Health
router.get("/system-health", adminController.getSystemHealth);

module.exports = router;
