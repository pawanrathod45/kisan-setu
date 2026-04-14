const Farmer = require("../models/Farmer");
const Query = require("../models/Query");
const { generateResponse } = require("../ai/geminiService");

const generateAdvisory = async (farmerId, question) => {
  const farmer = await Farmer.findById(farmerId);

  if (!farmer) {
    throw new Error("Farmer not found");
  }

  const prompt = `
You are an expert agricultural advisor.

Farmer Details:
- Location: ${farmer.location}
- Crop: ${farmer.crop}

Farmer Question:
"${question}"

Respond strictly in the SAME language as the question.

Return ONLY valid JSON:

{
  "problem": "...",
  "solution": "...",
  "dosage": "...",
  "prevention": "...",
  "confidence": number
}
`;

  const rawResponse = await generateResponse(prompt);

  let aiData;

  try {
    aiData = JSON.parse(rawResponse);
  } catch (err) {
    throw new Error("Invalid AI JSON format");
  }

  const escalation = aiData.confidence < 60;

  const newQuery = new Query({
    farmerId,
    question,
    aiResponse: aiData,
    confidence: aiData.confidence,
    escalationRequired: escalation,
  });

  await newQuery.save();

  return {
    data: aiData,
    escalationRequired: escalation,
  };
};

module.exports = { generateAdvisory };
