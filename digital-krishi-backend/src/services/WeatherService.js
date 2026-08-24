const axios = require("axios");

// Fallback meteorological weather generator
const generateFallbackWeather = (location = "Pune") => {
  const loc = (location || "Pune").split(",")[0].trim();
  const now = new Date();
  const hour = now.getHours();
  
  // Seasonal baseline for Indian agricultural belts
  let baseTemp = 28;
  if (hour >= 12 && hour <= 16) baseTemp = 32;
  else if (hour >= 20 || hour <= 6) baseTemp = 22;

  return {
    location: loc,
    temperature: baseTemp,
    feelsLike: baseTemp + 1,
    humidity: 58,
    condition: "Clear",
    description: "Optimal agricultural conditions with clear skies",
    windSpeed: 12,
    rainProbability: 10,
    uvIndex: 6,
    airQuality: 45,
    updatedAt: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    main: {
      temp: baseTemp,
      feels_like: baseTemp + 1,
      humidity: 58,
      pressure: 1012,
    },
    weather: [{ main: "Clear", description: "Clear and sunny" }],
    wind: { speed: 3.3 },
    clouds: { all: 15 },
    sys: {
      sunrise: Math.floor(Date.now() / 1000) - 14400,
      sunset: Math.floor(Date.now() / 1000) + 14400,
    },
    visibility: 10000,
  };
};

const generateFallbackForecast = (location = "Pune") => {
  const loc = (location || "Pune").split(",")[0].trim();
  const list = [];
  const now = Math.floor(Date.now() / 1000);

  for (let i = 0; i < 40; i++) {
    const timestamp = now + i * 3 * 3600;
    const dateObj = new Date(timestamp * 1000);
    const hour = dateObj.getHours();
    const temp = (hour >= 11 && hour <= 16) ? 31 + (i % 3) : 23 + (i % 2);

    list.push({
      dt: timestamp,
      main: {
        temp,
        feels_like: temp + 1,
        humidity: 55 + (i % 15),
        pressure: 1012
      },
      weather: [{ main: "Clouds", description: "Scattered clouds" }],
      wind: { speed: 3.5 },
      pop: (i % 5 === 0) ? 0.25 : 0.05
    });
  }

  return {
    city: { name: loc, country: "IN" },
    list
  };
};

const getWeather = async (location = "Pune") => {
  const cleanLoc = (location || "Pune").split(",")[0].trim();
  const apiKey = process.env.WEATHER_API_KEY;

  if (apiKey && apiKey !== "your_openweather_api_key_here") {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cleanLoc)}&appid=${apiKey}&units=metric`,
        { timeout: 7000 }
      );

      const data = response.data;
      return {
        location: data.name,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        condition: data.weather?.[0]?.main || "Clear",
        description: data.weather?.[0]?.description || "Clear skies",
        windSpeed: Math.round((data.wind?.speed || 3) * 3.6),
        updatedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        main: data.main,
        weather: data.weather,
        wind: data.wind,
        clouds: data.clouds,
        sys: data.sys,
        visibility: data.visibility
      };
    } catch (error) {
      console.warn("⚠️ OpenWeatherMap API unavailable, using localized weather simulation:", error.message);
    }
  }

  return generateFallbackWeather(cleanLoc);
};

const getForecast = async (location = "Pune") => {
  const cleanLoc = (location || "Pune").split(",")[0].trim();
  const apiKey = process.env.WEATHER_API_KEY;

  if (apiKey && apiKey !== "your_openweather_api_key_here") {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cleanLoc)}&appid=${apiKey}&units=metric`,
        { timeout: 7000 }
      );
      return response.data;
    } catch (error) {
      console.warn("⚠️ OpenWeatherMap forecast unavailable, using forecast simulation:", error.message);
    }
  }

  return generateFallbackForecast(cleanLoc);
};

module.exports = { getWeather, getForecast };