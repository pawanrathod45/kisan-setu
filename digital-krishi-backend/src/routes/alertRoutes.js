const express = require("express");
const router = express.Router();
const { getAlerts } = require("../controllers/alertController");

router.get("/alerts/:farmerId", getAlerts);

module.exports = router;
