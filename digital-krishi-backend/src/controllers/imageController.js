const fs = require("fs");
const Farmer = require("../models/Farmer");
const Query = require("../models/Query");
const { generateResponse } = require("../ai/geminiService");

const analyzeImage = async (req, res) => {
  try {
    const { farmerId } = req.body;

    if (!farmerId) {
      return res.status(400).json({
        message: "farmerId is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Image file is required",
      });
    }

    const farmer = await Farmer.findById(farmerId);

    if (!farmer) {
      return res.status(404).json({
        message: "Farmer not found",
      });
    }

    const imageBase64 = fs.readFileSync(req.file.path, {
      encoding: "base64",
    });

    const prompt = `
You are an expert agricultural plant disease specialist.

Analyze the crop image and respond ONLY in valid JSON.

Return format:

{
  "disease": "...",
  "severity": "Low | Medium | High | Critical",
  "treatment": "...",
  "dosage": "...",
  "prevention": "...",
  "confidence": number_between_0_and_100
}

Do NOT add explanation outside JSON.
`;

    const rawResponse = await generateResponse({
      text: prompt,
      image: imageBase64
    });

    const cleaned = rawResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let aiData;

    try {
      aiData = JSON.parse(cleaned);
    } catch (error) {
      return res.status(500).json({
        message: "AI returned invalid JSON format",
      });
    }

    // Risk Level Logic
    let riskLevel = "Low";

    if (aiData.severity === "Critical") riskLevel = "Critical";
    else if (aiData.severity === "High") riskLevel = "High";
    else if (aiData.severity === "Medium") riskLevel = "Medium";

    const escalation = aiData.confidence < 60 || riskLevel === "Critical";

    await Query.create({
      farmerId,
      question: "Image Disease Detection",
      aiResponse: aiData,
      confidence: aiData.confidence,
      escalationRequired: escalation,
      category: "Disease Detection",
      riskLevel,
      imagePath: req.file.path,
    });

    res.status(200).json({
      category: "Disease Detection",
      riskLevel,
      escalationRequired: escalation,
      data: aiData,
    });
  } catch (error) {
    console.error("Image Detection Error:", error.message);
    res.status(500).json({
      message: "Image processing failed",
    });
  }
};

module.exports = { analyzeImage };
