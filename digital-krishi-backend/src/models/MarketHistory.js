const mongoose = require("mongoose");

const MarketHistorySchema = new mongoose.Schema({
  commodity: String,
  location: String,
  date: Date,
  minPrice: Number,
  maxPrice: Number,
  modalPrice: Number,
  arrivalQty: Number
}, { timestamps: true });

module.exports = mongoose.model("MarketHistory", MarketHistorySchema);
