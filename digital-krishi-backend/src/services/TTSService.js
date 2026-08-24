const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Language detection helper
const detectLanguage = (text) => {
  const str = String(text || "");
  // Devanagari (Hindi / Marathi)
  if (/[\u0900-\u097F]/.test(str)) return "hi";
  // Malayalam
  if (/[\u0D00-\u0D7F]/.test(str)) return "ml";
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(str)) return "ta";
  // Telugu
  if (/[\u0C00-\u0C7F]/.test(str)) return "te";
  // Kannada
  if (/[\u0C80-\u0CFF]/.test(str)) return "kn";
  // Bengali
  if (/[\u0980-\u09FF]/.test(str)) return "bn";
  // Gujarati
  if (/[\u0A80-\u0AFF]/.test(str)) return "gu";
  // Punjabi
  if (/[\u0A00-\u0A7F]/.test(str)) return "pa";
  
  return "en";
};

const generateSpeech = async (text, language = null) => {
  try {
    const cleanText = String(text || "").trim();
    if (!cleanText) {
      return { success: false, error: "Text is required" };
    }

    let langCode = "hi";
    if (typeof language === "string" && language.trim().length >= 2) {
      langCode = language.trim().substring(0, 2).toLowerCase();
    } else {
      langCode = detectLanguage(cleanText);
    }

    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `speech_${Date.now()}.mp3`;
    const filepath = path.join(uploadDir, filename);

    // Limit chunk to 200 characters for Google TTS URL limits
    const truncatedText = cleanText.length > 200 ? cleanText.substring(0, 200) : cleanText;
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(truncatedText)}&tl=${langCode}&client=tw-ob`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      responseType: "arraybuffer",
      timeout: 8000
    });

    fs.writeFileSync(filepath, Buffer.from(response.data));

    return {
      audioUrl: `/uploads/${filename}`,
      language: langCode,
      success: true
    };
  } catch (error) {
    console.warn("TTS generation error:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = { generateSpeech };
