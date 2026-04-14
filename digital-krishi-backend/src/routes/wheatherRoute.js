const express = require("express");
const router = express.Router();
const { getWeather } = require("../services/WeatherService");

router.get("/", async (req, res) => {
  const location = req.query.city || "Pune";
  
  console.log("🌍 Weather API called for city:", location);

  try {
    const data = await getWeather(location);

    if (!data) {
      console.error("❌ Failed to fetch weather data");
      return res.status(500).json({ error: "Failed to fetch weather" });
    }
    
    console.log("✅ Sending weather data:", data);
    res.json(data);
  } catch (error) {
    console.error("❌ Weather route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;