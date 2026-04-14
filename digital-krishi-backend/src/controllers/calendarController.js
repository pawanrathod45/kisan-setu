const CropCalendar = require("../models/models/CropCalendar");
const Farmer = require("../models/Farmer");
const { generateCropSchedule } = require("../services/CropScheduleService");

const createCalendar = async (req, res) => {
  try {
    const { farmerId, sowingDate } = req.body;

    const farmer = await Farmer.findById(farmerId);

    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    const schedule = generateCropSchedule(farmer.crop, sowingDate);

    const calendar = await CropCalendar.create({
      farmerId,
      crop: farmer.crop,
      location: farmer.location,
      sowingDate,
      schedule
    });

    res.json(calendar);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating calendar" });
  }
};

const getCalendar = async (req, res) => {
  try {
    const { farmerId } = req.params;

    const calendar = await CropCalendar.findOne({ farmerId });

    res.json(calendar);
  } catch (error) {
    res.status(500).json({ message: "Error fetching calendar" });
  }
};

module.exports = { createCalendar, getCalendar };
