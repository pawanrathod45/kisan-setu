const express = require("express");
const router = express.Router();

const { getFarmerHistory } = require("../controllers/historyController");

router.get("/farmers/:id/history", getFarmerHistory);

module.exports = router;
