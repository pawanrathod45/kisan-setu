const mongoose = require("mongoose");

const marketPriceSchema = new mongoose.Schema({
  state: String,
  district: String,
  market: String,
  commodity: String,
  minPrice: Number,
  maxPrice: Number,
  modalPrice: Number,
  date: String
}, { timestamps: true });

module.exports = mongoose.model("MarketPrice", marketPriceSchema);
