const mongoose = require("mongoose");

const cropCalendarSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farmer",
    required: true
  },
  crop: String,
  location: String,
  sowingDate: Date,
  schedule: [
    {
      activity: String,
      description: String,
      date: Date,
      completed: {
        type: Boolean,
        default: false
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("CropCalendar", cropCalendarSchema);
