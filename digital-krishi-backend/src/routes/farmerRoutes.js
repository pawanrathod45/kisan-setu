const express = require("express");
const router = express.Router();
const { createFarmer, loginFarmer } = require("../controllers/farmerController");

router.post("/v1/farmers", createFarmer);
router.post("/v1/auth/login", loginFarmer);

module.exports = router;
