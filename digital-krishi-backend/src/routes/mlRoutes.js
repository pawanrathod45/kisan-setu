const express = require("express");
const router = express.Router();
const { exportTrainingData } = require("../controllers/mlController");

router.get("/ml/export", exportTrainingData);

module.exports = router;
