const axios = require("axios");
const { generateResponse } = require("../ai/geminiService");

// Weather API Handler
const handleWeather = async (question, farmer) => {
  try {
    // Use OpenWeatherMap API (free tier available)
    const apiKey = process.env.WEATHER_API_KEY; // Add to .env
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${farmer.location}&appid=${apiKey}&units=metric`
    );
    
    const weatherData = response.data;
    return JSON.stringify({
      problem: `Weather query for ${farmer.location}`,
      solution: `Temperature: ${weatherData.main.temp}°C, Condition: ${weatherData.weather[0].description}, Humidity: ${weatherData.main.humidity}%`,
      dosage: "N/A",
      prevention: "Monitor weather regularly for crop planning",
      confidence: 95
    });
  } catch (error) {
    console.error("Weather API Error:", error.message);
    return await handleAI(question, farmer);
  }
};

// Market Price API Handler
const handleMarket = async (question, farmer) => {
  try {
    // Use Agmarknet API or similar (India government API)
    // Example: https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
    const apiKey = process.env.MARKET_API_KEY; // Add to .env
    const response = await axios.get(
      `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&filters[commodity]=${farmer.crop}`
    );
    
    const marketData = response.data.records[0];
    return JSON.stringify({
      problem: `Market price for ${farmer.crop}`,
      solution: `Current price: ₹${marketData.modal_price} per quintal in ${marketData.market}`,
      dosage: "N/A",
      prevention: "N/A",
      confidence: 90
    });
  } catch (error) {
    console.error("Market API Error:", error.message);
    return await handleAI(question, farmer);
  }
};

// Government Scheme Handler (Use AI for now, can integrate govt API later)
const handleScheme = async (question, farmer) => {
  const prompt = `You are a government scheme advisor for farmers in India.
Location: ${farmer.location}
Crop: ${farmer.crop}
Question: ${question}

Provide scheme information in JSON format:
{
  "problem": "...",
  "solution": "...",
  "dosage": "N/A",
  "prevention": "N/A",
  "confidence": 80
}`;
  return await generateResponse(prompt);
};

// General AI Handler
const handleAI = async (question, farmer) => {
  const prompt = `You are an agricultural advisor.
Location: ${farmer.location}
Crop: ${farmer.crop}
Question: ${question}

Provide advice in JSON format:
{
  "problem": "...",
  "solution": "...",
  "dosage": "...",
  "prevention": "...",
  "confidence": 75
}`;
  return await generateResponse(prompt);
};

const routeQuestion = async (category, question, farmer) => {
  switch (category) {
    case "Weather":
      return await handleWeather(question, farmer);
    case "Market Price":
      return await handleMarket(question, farmer);
    case "Government Scheme":
      return await handleScheme(question, farmer);
    default:
      return await handleAI(question, farmer);
  }
};

module.exports = { routeQuestion };
