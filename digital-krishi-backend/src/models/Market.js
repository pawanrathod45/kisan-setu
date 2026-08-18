const mongoose = require("mongoose");

const marketSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  modalPrice: {
    type: Number,
    required: true
  },
  minPrice: Number,
  maxPrice: Number,
  unit: {
    type: String,
    default: "quintal"
  },
  date: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Market", marketSchema);
