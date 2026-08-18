const express = require("express");
const router = express.Router();
const { askQuestion } = require("../controllers/askController");
const { generateResponse } = require("../ai/geminiService");

router.post("/ask", askQuestion);

// General Conversational AI Krishi Officer Chat endpoint
router.post("/chat", async (req, res) => {
  try {
    const { message, farmerContext } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const crop = farmerContext?.crop || "Crop";
    const location = farmerContext?.location || "India";
    const farmerName = farmerContext?.name || "Farmer";

    const prompt = `You are "AI Krishi Officer", an empathetic, highly certified Google AI agricultural scientist & agronomist assisting Indian farmers.
Farmer Name: ${farmerName}
Farm Location: ${location}
Primary Crop: ${crop}

Farmer's Question: "${message}"

Instructions:
1. Provide practical, step-by-step agricultural advice (organic & certified chemical solutions with exact dosages like grams/litre or ml/acre where applicable).
2. Keep the tone helpful, professional, and respectful.
3. If they ask in Hindi, Marathi, or English, answer in that same language or bilingual for clarity.
4. Format key recommendations with bullet points and clear bold headings.`;

    let reply = "";
    try {
      reply = await generateResponse(prompt);
    } catch (err) {
      console.warn("Gemini chat fallback:", err.message);
      reply = `For **${crop}** in **${location}**, ensure adequate soil moisture and apply certified Trichoderma viride @ 5g/kg for seed treatment, or Mancozeb 75% WP @ 2g/L for foliar blight prevention. Keep monitoring local APMC Mandi price trends before harvesting.`;
    }

    res.json({ reply, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    res.status(500).json({ message: "Failed to process question", error: error.message });
  }
});

module.exports = router;
