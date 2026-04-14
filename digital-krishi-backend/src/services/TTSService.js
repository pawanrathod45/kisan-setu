const gtts = require('node-gtts');
const fs = require('fs');
const path = require('path');

// Language detection helper
const detectLanguage = (text) => {
  // Hindi detection
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  // Malayalam detection
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
  // Tamil detection
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  // Marathi detection
  if (/[\u0900-\u097F]/.test(text)) return 'mr';
  // Telugu detection
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  // Kannada detection
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  // Bengali detection
  if (/[\u0980-\u09FF]/.test(text)) return 'bn';
  // Gujarati detection
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu';
  // Punjabi detection
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa';
  
  // Default to English
  return 'en';
};

const generateSpeech = async (text, language = null) => {
  return new Promise((resolve, reject) => {
    try {
      // Auto-detect language if not provided
      const detectedLang = language || detectLanguage(text);
      
      const filename = `speech_${Date.now()}.mp3`;
      const filepath = path.join(__dirname, '../../uploads', filename);
      
      // Create TTS instance
      const tts = gtts(detectedLang);
      
      // Generate speech and save
      tts.save(filepath, text, (err) => {
        if (err) {
          console.error('TTS Error:', err);
          resolve({ success: false, error: err.message });
        } else {
          resolve({
            audioUrl: `/uploads/${filename}`,
            language: detectedLang,
            success: true
          });
        }
      });

    } catch (error) {
      console.error('TTS Error:', error.message);
      resolve({ success: false, error: error.message });
    }
  });
};

module.exports = { generateSpeech };
