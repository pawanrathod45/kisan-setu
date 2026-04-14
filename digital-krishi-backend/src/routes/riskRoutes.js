const express = require("express");
const router = express.Router();
const { getFarmerRisk } = require("../controllers/riskController");

router.get("/farmer-risk/:farmerId", getFarmerRisk);

module.exports = router;
