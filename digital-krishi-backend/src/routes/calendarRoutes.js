const express = require("express");
const router = express.Router();
const { createCalendar, getCalendar } = require("../controllers/calendarController");

router.post("/calendar", createCalendar);
router.get("/calendar/:farmerId", getCalendar);

module.exports = router;
