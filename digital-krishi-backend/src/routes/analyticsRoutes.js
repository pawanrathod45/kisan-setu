const express = require("express");
const router = express.Router();
const { getAnalytics, getAdvancedAnalytics } = require("../controllers/analyticsController");

router.get("/analytics", getAnalytics);
router.get("/admin/analytics-advanced", getAdvancedAnalytics);

module.exports = router;
