// ============================================================
// KISAN SETU — ENTERPRISE VOICE & SPEECH RECOGNITION SERVICE
// Handles browser compatibility, mobile Chrome/Edge, mic permissions,
// HTTPS secure context validation, and multi-language dialect mapping.
// ============================================================

export const getLanguageLocale = (lang) => {
  switch (lang) {
    case 'hi':
    case 'hi-IN':
      return 'hi-IN';
    case 'mr':
    case 'mr-IN':
      return 'mr-IN';
    case 'en':
    case 'en-IN':
    case 'en-US':
    default:
      return 'en-IN';
  }
};

export const getLanguageDisplayName = (lang) => {
  const code = getLanguageLocale(lang);
  if (code === 'hi-IN') return 'हिन्दी (Hindi)';
  if (code === 'mr-IN') return 'मराठी (Marathi)';
  return 'English';
};

/**
 * Checks if the browser supports Web Speech Recognition
 */
export const isSpeechRecognitionSupported = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
};

/**
 * Checks if the current origin is running in a secure context (HTTPS or localhost)
 */
export const isSecureVoiceContext = () => {
  if (typeof window === 'undefined') return false;
  if (window.isSecureContext) return true;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
};

/**
 * Explicitly requests microphone hardware permissions via MediaDevices API.
 * This triggers the native browser/OS permission modal on Chrome Desktop and Android Mobile.
 */
export const requestMicrophonePermission = async () => {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    if (!isSecureVoiceContext()) {
      throw new Error('Microphone requires HTTPS in production. Please access via secure HTTPS URL.');
    }
    throw new Error('MediaDevices API not supported on this browser.');
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Immediately stop tracks to free hardware for SpeechRecognition engine
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (err) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      throw new Error('Microphone permission was blocked or denied. Please allow microphone access in your browser site settings.');
    }
    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      throw new Error('No microphone hardware detected on your device.');
    }
    throw new Error(err.message || 'Failed to initialize microphone hardware.');
  }
};

/**
 * Creates and starts a managed SpeechRecognition session
 */
export const startVoiceRecognitionSession = ({
  language = 'hi-IN',
  interimResults = true,
  continuous = false,
  onStart,
  onResult,
  onError,
  onEnd
}) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    throw new Error('Speech Recognition is not supported by your browser. Please use Google Chrome, Microsoft Edge, or Android Chrome.');
  }

  const recognition = new SpeechRecognition();
  recognition.lang = getLanguageLocale(language);
  recognition.interimResults = interimResults;
  recognition.continuous = continuous;
  recognition.maxAlternatives = 1;

  let hasEnded = false;

  recognition.onstart = () => {
    if (onStart) onStart();
  };

  recognition.onresult = (event) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const trans = event.results[i][0]?.transcript || '';
      if (event.results[i].isFinal) {
        finalTranscript += trans;
      } else {
        interimTranscript += trans;
      }
    }

    if (onResult) {
      onResult({
        final: finalTranscript.trim(),
        interim: interimTranscript.trim(),
        full: (finalTranscript + ' ' + interimTranscript).trim()
      });
    }
  };

  recognition.onerror = (event) => {
    let friendlyMessage = 'Voice recognition encountered an error.';
    const errCode = event.error;

    switch (errCode) {
      case 'not-allowed':
      case 'service-not-allowed':
        friendlyMessage = 'Microphone permission denied. Tap the lock icon in your browser URL bar to allow microphone.';
        break;
      case 'no-speech':
        friendlyMessage = 'No speech heard. Please tap the microphone and speak again.';
        break;
      case 'audio-capture':
        friendlyMessage = 'No microphone device was found.';
        break;
      case 'network':
        friendlyMessage = 'Network error occurred during speech-to-text processing.';
        break;
      case 'aborted':
        friendlyMessage = 'Voice listening was stopped.';
        break;
      default:
        friendlyMessage = `Voice recognition error: ${errCode || 'Unknown'}`;
    }

    if (onError) onError({ code: errCode, message: friendlyMessage });
  };

  recognition.onend = () => {
    if (!hasEnded) {
      hasEnded = true;
      if (onEnd) onEnd();
    }
  };

  try {
    recognition.start();
  } catch (err) {
    if (onError) onError({ code: 'start-failed', message: err.message });
  }

  return {
    recognition,
    stop: () => {
      try {
        recognition.stop();
      } catch (e) {}
    },
    abort: () => {
      try {
        recognition.abort();
      } catch (e) {}
    }
  };
};

/**
 * Text-to-Speech synthesis with clean markdown stripping and dialect support
 */
export const speakTextWithSynthesis = ({
  text,
  language = 'hi-IN',
  rate = 0.95,
  pitch = 1.0,
  onStart,
  onEnd,
  onError
}) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onError) onError(new Error('Speech Synthesis not supported in this browser.'));
    return;
  }

  window.speechSynthesis.cancel();

  // Strip markdown, asterisks, bullet points and hash headers
  const clean = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/###/g, '')
    .replace(/#/g, '')
    .replace(/[-*•]/g, ' ')
    .replace(/₹/g, 'रुपये ')
    .replace(/\n+/g, '. ')
    .trim();

  if (!clean) return;

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = getLanguageLocale(language);
  utterance.rate = rate;
  utterance.pitch = pitch;

  // Try selecting native language voice if available
  const voices = window.speechSynthesis.getVoices();
  const targetLang = getLanguageLocale(language);
  const matchedVoice = voices.find(v => v.lang === targetLang || v.lang.startsWith(targetLang.split('-')[0]));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  if (onError) utterance.onerror = onError;

  window.speechSynthesis.speak(utterance);
};

export const stopSpeechSynthesis = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export default {
  getLanguageLocale,
  getLanguageDisplayName,
  isSpeechRecognitionSupported,
  isSecureVoiceContext,
  requestMicrophonePermission,
  startVoiceRecognitionSession,
  speakTextWithSynthesis,
  stopSpeechSynthesis
};
