const express = require("express");
const router = express.Router();
const {
  getCurrentMarketPrice,
  getPriceHistory,
  getArrivalData,
  getMultiMarketPrices,
  getStatesAndDistricts,
  getSummary,
  getChatbotResponse
} = require("../services/MarketService");
const { getCropIntelligence } = require("../services/cropIntelligenceService");

// Default GET /api/market?crop=xyz
router.get("/", async (req, res) => {
  try {
    const cropName = req.query.crop || req.query.commodity || "Wheat";
    const intel = getCropIntelligence(cropName);
    const data = await getCurrentMarketPrice({ commodity: cropName }).catch(() => null);

    res.json({
      crop: cropName,
      modalPrice: data?.modalPrice || intel.price,
      minPrice: data?.minPrice || Math.round(intel.price * 0.9),
      maxPrice: data?.maxPrice || Math.round(intel.price * 1.12),
      priceTrend: data?.priceTrend || intel.priceTrend,
      market: data?.market || "Pune APMC",
      state: data?.state || "Maharashtra",
      date: new Date().toISOString().split("T")[0]
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch market data", error: err.message });
  }
});

router.get("/current", async (req, res) => {
  try {
    const { commodity, state, district, market } = req.query;

    if (!commodity) {
      return res.status(400).json({ message: "Commodity parameter required" });
    }

    console.log(`📊 Fetching current market price: ${commodity}, ${state}, ${district}, ${market}`);
    const data = await getCurrentMarketPrice({ commodity, state, district, market });
    
    res.json(data);
  } catch (err) {
    console.error("❌ Current market price error:", err.message);
    res.status(500).json({ message: "Failed to fetch market data", error: err.message });
  }
});

router.get("/history", async (req, res) => {
  try {
    const { commodity, state, district, days } = req.query;

    if (!commodity) {
      return res.status(400).json({ message: "Commodity parameter required" });
    }

    console.log(`📈 Fetching price history: ${commodity}, ${days} days`);
    const data = await getPriceHistory({ 
      commodity, 
      state, 
      district, 
      days: parseInt(days) || 7 
    });
    
    res.json(data);
  } catch (err) {
    console.error("❌ Price history error:", err.message);
    res.status(500).json({ message: "Failed to fetch price history", error: err.message });
  }
});

router.get("/arrivals", async (req, res) => {
  try {
    const { commodity, state, district, days } = req.query;

    if (!commodity) {
      return res.status(400).json({ message: "Commodity parameter required" });
    }

    console.log(`🚚 Fetching arrival data: ${commodity}`);
    const data = await getArrivalData({ 
      commodity, 
      state, 
      district, 
      days: parseInt(days) || 7 
    });
    
    res.json(data);
  } catch (err) {
    console.error("❌ Arrival data error:", err.message);
    res.status(500).json({ message: "Failed to fetch arrival data", error: err.message });
  }
});

router.get("/multi-market", async (req, res) => {
  try {
    const { commodity, state, markets } = req.query;

    if (!commodity) {
      return res.status(400).json({ message: "Commodity parameter required" });
    }

    console.log(`🏪 Fetching multi-market prices: ${commodity}`);
    const marketList = markets ? markets.split(',') : [];
    const data = await getMultiMarketPrices({ commodity, state, markets: marketList });
    
    res.json(data);
  } catch (err) {
    console.error("❌ Multi-market error:", err.message);
    res.status(500).json({ message: "Failed to fetch multi-market data", error: err.message });
  }
});

router.get("/locations", async (req, res) => {
  try {
    console.log(`📍 Fetching states and districts`);
    const data = await getStatesAndDistricts();
    res.json(data);
  } catch (err) {
    console.error("❌ Locations error:", err.message);
    res.status(500).json({ message: "Failed to fetch locations", error: err.message });
  }
});

router.get("/summary", async (req, res) => {
  try {
    console.log(`📊 Fetching market summary`);
    const data = await getSummary();
    res.json(data);
  } catch (err) {
    console.error("❌ Summary error:", err.message);
    res.status(500).json({ message: "Failed to fetch summary", error: err.message });
  }
});

router.post("/chatbot", async (req, res) => {
  try {
    const { message, commodity, state, district, market } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    console.log(`🤖 Chatbot query: ${message} | ${commodity}`);
    const response = await getChatbotResponse({ message, commodity, state, district, market });
    
    res.json(response);
  } catch (err) {
    console.error("❌ Chatbot error:", err.message);
    res.status(500).json({ message: "Failed to process chatbot request", error: err.message });
  }
});

module.exports = router;
