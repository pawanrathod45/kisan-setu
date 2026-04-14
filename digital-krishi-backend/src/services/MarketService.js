const axios = require("axios");
const MarketPrice = require("../models/MarketPrice");

const getMarketPrice = async (commodity, district) => {
  try {
    // Try fetching from Data.gov.in API
    const apiKey = process.env.MARKET_API_KEY;
    const response = await axios.get(
      `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=10&filters[commodity]=${commodity}`
    );

    if (response.data && response.data.records && response.data.records.length > 0) {
      const record = response.data.records[0];
      return {
        commodity: record.commodity,
        market: record.market,
        minPrice: record.min_price,
        maxPrice: record.max_price,
        modalPrice: record.modal_price,
        date: record.arrival_date
      };
    }

    // Fallback to database if API fails
    const price = await MarketPrice.findOne({
      commodity: { $regex: new RegExp(commodity, "i") },
      district: { $regex: new RegExp(district, "i") }
    }).sort({ date: -1 });

    if (!price) {
      return null;
    }

    return {
      commodity: price.commodity,
      market: price.market,
      minPrice: price.minPrice,
      maxPrice: price.maxPrice,
      modalPrice: price.modalPrice,
      date: price.date
    };

  } catch (error) {
    console.error("Market API Error:", error.message);
    return null;
  }
};

module.exports = { getMarketPrice };
