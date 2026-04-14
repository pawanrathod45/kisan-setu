const axios = require("axios");

const getWeather = async (location) => {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    
    console.log("🌤️ Fetching weather for:", location);
    console.log("🔑 API Key exists:", !!apiKey);

    if (!apiKey) {
      console.error("❌ WEATHER_API_KEY not found in environment variables");
      return null;
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
    );

    const data = response.data;
    
    console.log("✅ Weather data fetched successfully for", data.name);

    return {
      location: data.name,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      updatedAt: new Date().toLocaleTimeString(),
    };
  } catch (error) {
    console.error("❌ Weather API Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    return null;
  }
};

module.exports = { getWeather };