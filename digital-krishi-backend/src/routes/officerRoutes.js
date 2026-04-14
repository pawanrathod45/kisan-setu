const express = require("express");
const router = express.Router();

const {
  getEscalations,
  resolveEscalation,
} = require("../controllers/officerController");

router.get("/officer/escalations", getEscalations);

router.put("/officer/escalations/:id", resolveEscalation);

module.exports = router;
    