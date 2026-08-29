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
    const lang = farmerContext?.language || "English";

    const prompt = `You are "AI Krishi Officer", an empathetic, highly certified Google AI agricultural scientist & agronomist assisting Indian farmers.
Farmer Name: ${farmerName}
Farm Location: ${location}
Primary Crop: ${crop}
Response Language: ${lang}

Farmer's Question: "${message}"

Instructions:
1. Provide practical, step-by-step agricultural advice (organic & certified chemical solutions with exact dosages like grams/litre or ml/acre where applicable).
2. Answer STRICTLY in ${lang} language (use natural, clear terms familiar to farmers).
3. Keep the tone helpful, professional, and respectful.
4. Format your answer with clean paragraphs, bullet points (•), and bold keywords (**keyword**) so it is easy to read on mobile.`;

    let reply = "";
    try {
      reply = await generateResponse(prompt);
    } catch (err) {
      console.warn("Gemini chat fallback:", err.message);
      if (lang === "Hindi") {
        reply = `**${crop}** (${location}) के लिए, खेत में पर्याप्त नमी बनाए रखें और ट्राइकोडर्मा विरिडी 5 ग्राम/किग्रा से बीज उपचार करें या पर्ण झुलसा रोकथाम के लिए मैंकोज़ेब 75% WP @ 2 ग्राम/लीटर का छिड़काव करें। कटाई से पहले स्थानीय APMC मंडी भाव की निगरानी करें।`;
      } else if (lang === "Marathi") {
        reply = `**${crop}** (${location}) पिकासाठी योग्य ओलावा राखा आणि बियाणे प्रक्रियेसाठी ट्रायकोडर्मा व्हिरिडी ५ ग्रॅम/किलो वापरा किंवा पानावरील करपा नियंत्रणासाठी मॅनकोझेब ७५% WP २ ग्रॅम/लिटर फवारणी करा. काढणीपूर्वी स्थानिक APMC बाजारभावाची माहिती घ्या.`;
      } else {
        reply = `For **${crop}** in **${location}**, ensure adequate soil moisture and apply certified Trichoderma viride @ 5g/kg for seed treatment, or Mancozeb 75% WP @ 2g/L for foliar blight prevention. Keep monitoring local APMC Mandi price trends before harvesting.`;
      }
    }

    res.json({ reply, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    res.status(500).json({ message: "Failed to process question", error: error.message });
  }
});

module.exports = router;
