const Farmer = require("../models/Farmer");
const Query = require("../models/Query");
const { generateResponse } = require("../ai/geminiService");
const { detectIntent } = require("../ai/intentDetection");
const { getMarketPrice } = require("../services/MarketService");
const { getWeather } = require("../services/WeatherService");
const { createAlert } = require("../services/AlertService");
const MarketHistory = require("../models/MarketHistory");
const { predictPrice } = require("../services/MLService");
const { generateDecision } = require("../services/DecisionEngine");
const { calculateRiskScore } = require("../services/RiskScoringEngine");
const { generateSpeech } = require("../services/TTSService");

const askQuestion = async (req, res) => {
  try {
    const { farmerId, question } = req.body;

    if (!farmerId || !question) {
      return res.status(400).json({
        message: "farmerId and question are required",
      });
    }

    const farmer = await Farmer.findById(farmerId);

    if (!farmer) {
      return res.status(404).json({
        message: "Farmer not found",
      });
    }

    console.log("Farmer:", farmer.name);

    const category = await detectIntent(question);
    console.log("Detected Category:", category);

    // =====================================================
    // 🟢 MARKET FLOW
    // =====================================================
    if (category === "Market Price") {

      const marketData = await getMarketPrice(
        farmer.crop,
        farmer.location
      );

      if (!marketData) {
        return res.status(200).json({
          category,
          message: "Market price not available for your area",
        });
      }

      // Save market data to history
      await MarketHistory.create({
        commodity: marketData.commodity,
        location: farmer.location,
        date: new Date(),
        minPrice: marketData.minPrice,
        maxPrice: marketData.maxPrice,
        modalPrice: marketData.modalPrice,
        arrivalQty: marketData.arrivalQty || 0
      });

      // Get ML price prediction
      const predictedPrice = await predictPrice();
      if (predictedPrice) {
        console.log("🤖 ML Predicted Price:", predictedPrice);
      }

      const marketPrompt = `
You are an agricultural market advisor.

Farmer Crop: ${farmer.crop}
Farmer Location: ${farmer.location}

Market Data:
- Commodity: ${marketData.commodity}
- Market: ${marketData.market}
- Minimum Price: ${marketData.minPrice}
- Maximum Price: ${marketData.maxPrice}
- Modal Price: ${marketData.modalPrice}
- Date: ${marketData.date}

Farmer Question:
"${question}"

STRICT LANGUAGE RULE:
Detect the language of the question.
Respond ONLY in that exact language.
Do NOT translate.
Ignore location for language choice.

Return ONLY valid JSON:

{
  "marketSummary": "...",
  "recommendation": "...",
  "sellAdvice": "...",
  "confidence": number_between_0_and_100
}
`;

      const rawResponse = await generateResponse(marketPrompt);

      const cleaned = rawResponse
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      let aiData;

      try {
        aiData = JSON.parse(cleaned);
      } catch (err) {
        console.error("Market JSON Error:", err.message);
        return res.status(500).json({
          message: "AI returned invalid JSON format",
        });
      }

      if (typeof aiData.confidence !== "number") {
        aiData.confidence = 75;
      }

      const escalation = aiData.confidence < 60;

      await Query.create({
        farmerId,
        question,
        aiResponse: aiData,
        confidence: aiData.confidence || 60,
        escalationRequired: escalation ?? false,
        category: category || "General",
      });

      // 📊 MARKET ALERT LOGIC
      let marketAlertMessage = null;
      let marketSeverity = "Low";

      if (marketData.modalPrice < marketData.previousPrice * 0.8) {
        marketSeverity = "Critical";
        marketAlertMessage = "Market price dropped sharply. Avoid selling immediately.";
      }
      else if (marketData.modalPrice < marketData.previousPrice * 0.9) {
        marketSeverity = "High";
        marketAlertMessage = "Market price decreasing. Consider holding produce.";
      }
      else if (marketData.modalPrice > marketData.previousPrice * 1.1) {
        marketSeverity = "Low";
        marketAlertMessage = "Market price increased. Good selling opportunity.";
      }

      if (marketAlertMessage) {
        await createAlert(
          farmerId,
          "Market Trend",
          marketAlertMessage,
          marketSeverity
        );
      }


      return res.status(200).json({
        category,
        marketData,
        advisory: aiData,
        escalationRequired: escalation,
        mlPrediction: {
          currentPrice: marketData.modalPrice,
          predictedPrice: predictedPrice || null,
          trend: predictedPrice > marketData.modalPrice ? "Rising" : "Falling"
        },
        smartDecision: generateDecision({
          currentPrice: marketData.modalPrice,
          predictedPrice: predictedPrice || marketData.modalPrice,
          rainfall: 0,
          confidence: aiData.confidence || 70
        })
      });
    }

    // =====================================================
    // 🌦 WEATHER FLOW
    // =====================================================
    if (category === "Weather") {

      const weatherData = await getWeather(farmer.location);

      if (!weatherData) {
        return res.status(200).json({
          category,
          message: "Weather data not available",
        });
      }

      const weatherPrompt = `
You are an agricultural weather advisor.

Farmer Location: ${farmer.location}
Farmer Crop: ${farmer.crop}

Weather Data:
- Temperature: ${weatherData.temperature}
- Humidity: ${weatherData.humidity}
- Rain: ${weatherData.rain}
- Wind Speed: ${weatherData.windSpeed}

Farmer Question:
"${question}"

STRICT LANGUAGE RULE:
Detect the language of the question.
Respond ONLY in that exact language.
Do NOT translate.
Ignore location for language choice.

Return ONLY valid JSON:

{
  "weatherSummary": "...",
  "farmingAdvice": "...",
  "precaution": "...",
  "confidence": number_between_0_and_100
}
`;

      const rawResponse = await generateResponse(weatherPrompt);

      const cleaned = rawResponse
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      let aiData;

      try {
        aiData = JSON.parse(cleaned);
      } catch (err) {
        console.error("Weather JSON Error:", err.message);
        return res.status(500).json({
          message: "AI returned invalid JSON format",
        });
      }

      if (typeof aiData.confidence !== "number") {
        aiData.confidence = 80;
      }

      const escalation = aiData.confidence < 60;

      await Query.create({
        farmerId,
        question,
        aiResponse: aiData,
        confidence: aiData.confidence || 60,
        escalationRequired: escalation ?? false,
        category: category || "General",
      });

      // 🔔 SMART WEATHER RISK ENGINE
      let weatherRiskLevel = "Low";
      let weatherMessage = null;

      if (weatherData.rain >= 50) {
        weatherRiskLevel = "Critical";
        weatherMessage = "Severe rainfall expected. Risk of flooding and root damage.";
      } 
      else if (weatherData.rain >= 25) {
        weatherRiskLevel = "High";
        weatherMessage = "Heavy rainfall expected. Ensure proper drainage.";
      } 
      else if (weatherData.humidity >= 85) {
        weatherRiskLevel = "Medium";
        weatherMessage = "High humidity may increase fungal disease risk.";
      } 
      else if (weatherData.windSpeed >= 40) {
        weatherRiskLevel = "High";
        weatherMessage = "Strong winds may damage crops. Provide structural support.";
      } 
      else if (weatherData.temperature >= 38) {
        weatherRiskLevel = "Medium";
        weatherMessage = "High temperature stress. Increase irrigation monitoring.";
      }

      if (weatherMessage) {
        await createAlert(
          farmerId,
          "Weather Risk",
          weatherMessage,
          weatherRiskLevel
        );
      }

      return res.status(200).json({
        category,
        weatherData,
        advisory: aiData,
        escalationRequired: escalation,
      });
    }

    // =====================================================
    // 🔵 GENERAL AGRI FLOW
    // =====================================================

    const generalPrompt = `
You are an expert agricultural advisor.

Farmer Details:
- Location: ${farmer.location}
- Crop: ${farmer.crop}

Farmer Question:
"${question}"

STRICT LANGUAGE RULE:
Detect the language of the question.
Respond ONLY in that exact language.
Do NOT translate.
Ignore location for language choice.

Return ONLY valid JSON:

{
  "problem": "...",
  "solution": "...",
  "dosage": "...",
  "prevention": "...",
  "confidence": number_between_0_and_100
}
`;

    const rawResponse = await generateResponse(generalPrompt);

    const cleaned = rawResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let aiData;

    try {
      aiData = JSON.parse(cleaned);
    } catch (err) {
      console.error("General JSON Error:", err.message);
      return res.status(500).json({
        message: "AI returned invalid JSON format",
      });
    }

    if (typeof aiData.confidence !== "number") {
      aiData.confidence = 65;
    }

    const escalation = aiData.confidence < 60;

    await Query.create({
      farmerId,
      question,
      aiResponse: aiData,
      confidence: aiData.confidence || 60,
      escalationRequired: escalation ?? false,
      category: category || "General",
    });

    return res.status(200).json({
      category,
      data: aiData,
      escalationRequired: escalation,
    });

  } catch (error) {
    console.error("Ask Controller Error:", error.message);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = { askQuestion };
