const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PRIMARY_MODEL = "gemini-2.0-flash-lite";
const FALLBACK_MODEL = "gemini-flash-lite-latest";


const generateResponse = async (input) => {
  const contents = [];

  if (typeof input === "string") {
    contents.push({
      parts: [{ text: input }],
    });
  } else {
    contents.push({
      parts: [
        { text: input.text },
        {
          inline_data: {
            mime_type: "image/jpeg",
            data: input.image,
          },
        },
      ],
    });
  }

  try {
    return await callGemini(PRIMARY_MODEL, contents);
  } catch (error) {
    if (error.message.includes("429")) {
      console.log("⚠ Primary model quota exceeded. Switching...");
      return await callGemini(FALLBACK_MODEL, contents);
    }
    throw error;
  }
};

const generateVisionResponse = async (prompt, imageBase64) => {
  try {
    const model = genAI.getGenerativeModel({
      model: PRIMARY_MODEL,
    });

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64,
        },
      },
    ]);

    return result.response.text();
  } catch (error) {
    if (error.message.includes("429")) {
      console.log("⚠ Vision quota exceeded. Switching...");

      const fallback = genAI.getGenerativeModel({
        model: FALLBACK_MODEL,
      });

      const result = await fallback.generateContent([
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64,
          },
        },
      ]);

      return result.response.text();
    }

    console.error("Vision Gemini Error:", error.message);
    throw new Error("Vision AI failed");
  }
};


const callGemini = async (model, contents) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error("429");
    }

    console.error("Gemini API Error:", error.response?.data || error.message);
    throw new Error("Gemini request failed");
  }
};

module.exports = {
  generateResponse,
  generateVisionResponse,
};
