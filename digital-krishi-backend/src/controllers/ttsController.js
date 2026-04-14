const { generateSpeech } = require("../services/TTSService");

const textToSpeech = async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text) {
      return res.status(400).json({
        message: "Text is required"
      });
    }

    const result = await generateSpeech(text, language);

    if (!result.success) {
      return res.status(500).json({
        message: "TTS generation failed",
        error: result.error
      });
    }

    res.status(200).json({
      audioUrl: result.audioUrl,
      language: result.language,
      message: "Audio generated successfully"
    });

  } catch (error) {
    console.error("TTS Controller Error:", error.message);
    res.status(500).json({
      message: "Something went wrong"
    });
  }
};

module.exports = { textToSpeech };
