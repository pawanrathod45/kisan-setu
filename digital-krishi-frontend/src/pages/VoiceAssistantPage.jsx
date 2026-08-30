import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaMicrophone, FaStop, FaVolumeUp, FaVolumeMute, FaTrash,
  FaLeaf, FaPaperPlane, FaBroadcastTower, FaRedo, FaComments,
  FaExclamationTriangle, FaCheckCircle, FaSpinner
} from 'react-icons/fa';
import API from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  getLanguageLocale,
  getLanguageDisplayName,
  isSpeechRecognitionSupported,
  isSecureVoiceContext,
  requestMicrophonePermission,
  startVoiceRecognitionSession,
  speakTextWithSynthesis,
  stopSpeechSynthesis
} from '../services/voiceService';
import '../styles/VoiceAssistant.css';

/* ── Language configs ── */
const LANG_OPTIONS = [
  { code: 'hi-IN', label: 'हिंदी', name: 'Hindi' },
  { code: 'mr-IN', label: 'मराठी', name: 'Marathi' },
  { code: 'en-IN', label: 'English', name: 'English' },
];

const QUICK_PROMPTS_EN = [
  { icon: '🌾', text: 'What is the best treatment for Yellow Rust in Wheat?' },
  { icon: '💧', text: 'When should I do the first irrigation for Cotton?' },
  { icon: '💰', text: 'What are today Mandi prices for Tomato and Onion?' },
  { icon: '🌱', text: 'Correct dosage of Urea for Paddy crop per acre?' },
  { icon: '🐛', text: 'Best organic pesticide spray for aphids and thrips?' },
];

const QUICK_PROMPTS_HI = [
  { icon: '🌾', text: 'गेहूं में पीला रतुआ का इलाज क्या है?' },
  { icon: '💧', text: 'कपास में पहली सिंचाई कब करें?' },
  { icon: '💰', text: 'आज टमाटर और प्याज का मंडी भाव क्या है?' },
  { icon: '🌱', text: 'धान की फसल में यूरिया की सही मात्रा?' },
  { icon: '🐛', text: 'माहो व कीटों के लिए सबसे अच्छा जैविक कीटनाशक?' },
];

const QUICK_PROMPTS_MR = [
  { icon: '🌾', text: 'गव्हावरील पिवळा तांबेरा रोगावर उपाय काय?' },
  { icon: '💧', text: 'कापूस पिकाला पहिले पाणी कधी द्यावे?' },
  { icon: '💰', text: 'आज टोमॅटो आणि कांद्याचे बाजारभाव काय आहेत?' },
  { icon: '🌱', text: 'भात पिकासाठी युरिया खताची योग्य मात्रा किती?' },
  { icon: '🐛', text: 'मावा व तुडतुडे नियंत्रणासाठी जैविक कीटकनाशक?' },
];

const VoiceAssistantPage = () => {
  const { language, setLanguage, t } = useLanguage();
  const [transcript, setTranscript]       = useState('');
  const [textInput, setTextInput]         = useState('');
  const [history, setHistory]             = useState([
    {
      role: 'bot',
      text: language === 'hi'
        ? 'नमस्ते किसान भाई! मैं आपका डिजिटल कृषि वॉइस ऑफिसर हूँ। माइक बटन दबाकर या लिखकर अपनी फसल, मौसम या मंडी से जुड़ा सवाल पूछें।'
        : language === 'mr'
        ? 'नमस्कार शेतकरी मित्र! मी तुमचा डिजिटल कृषी व्हॉइस ऑफिसर आहे. माइक बटण दाबून किंवा टाईप करून पीक, हवामान किंवा बाजारभावाबाबत विचारा.'
        : 'Welcome Farmer! I am your Digital Krishi Voice Officer. Tap the microphone button or type below to ask any questions about your crops, weather spray radar, or Mandi rates.'
    }
  ]);
  
  // States: 'ready' | 'permission' | 'listening' | 'processing' | 'error'
  const [voiceState, setVoiceState]       = useState('ready');
  const [loading, setLoading]             = useState(false);
  const [speaking, setSpeaking]           = useState(false);
  const [langCode, setLangCode]           = useState(getLanguageLocale(language));
  const [supported, setSupported]         = useState(true);
  const [errorMsg, setErrorMsg]           = useState(null);

  const quickPrompts = language === 'hi' ? QUICK_PROMPTS_HI : language === 'mr' ? QUICK_PROMPTS_MR : QUICK_PROMPTS_EN;

  const sessionRef     = useRef(null);
  const bottomRef      = useRef(null);
  const activeLangRef  = useRef(langCode);
  const capturedRef    = useRef('');

  // Sync language with context
  useEffect(() => {
    const code = getLanguageLocale(language);
    setLangCode(code);
    activeLangRef.current = code;
  }, [language]);

  // Check hardware and browser support on mount
  useEffect(() => {
    const isSupp = isSpeechRecognitionSupported();
    setSupported(isSupp);
    if (!isSupp) {
      setErrorMsg('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Android Chrome.');
    }
    return () => {
      // Unmount cleanup
      if (sessionRef.current) {
        sessionRef.current.abort();
      }
      stopSpeechSynthesis();
    };
  }, []);

  /* ── Scroll on new message ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading, voiceState]);

  /* ── Stop Voice Session ── */
  const stopVoiceSession = useCallback((shouldSubmit = true) => {
    if (sessionRef.current) {
      sessionRef.current.stop();
      sessionRef.current = null;
    }
    setVoiceState('ready');

    const finalText = capturedRef.current.trim();
    if (shouldSubmit && finalText) {
      capturedRef.current = '';
      setTranscript('');
      handleSendQuery(finalText);
    }
  }, []);

  /* ── Send Query to Backend AI ── */
  const handleSendQuery = async (queryText) => {
    const q = (queryText || transcript || textInput).trim();
    if (!q) return;

    setTextInput('');
    setTranscript('');
    capturedRef.current = '';
    setLoading(true);
    setVoiceState('processing');
    setErrorMsg(null);

    const userMsg = { role: 'user', text: q };
    setHistory(prev => [...prev, userMsg]);

    try {
      // Query Google Gemini Multi-Lingual Agronomy Assistant
      const userObj = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await API.post('/chat', {
        message: q,
        farmerContext: {
          language: activeLangRef.current === 'hi-IN' ? 'Hindi' : activeLangRef.current === 'mr-IN' ? 'Marathi' : 'English',
          name: userObj.name || 'Farmer',
          location: userObj.location || 'Maharashtra',
          crop: userObj.crop || 'Wheat'
        }
      });

      const reply = res.data?.reply || res.data?.answer || 'फसल की अच्छी पैदावार के लिए संतुलित खाद और समय पर सिंचाई जरूरी है।';
      const botMsg = { role: 'bot', text: reply };
      setHistory(prev => [...prev, botMsg]);

      // Automatically speak the response in the chosen language
      speakCleanAudio(reply);
    } catch (err) {
      console.error('Chat API error:', err);
      const fallback = activeLangRef.current === 'hi-IN'
        ? 'फसल की सुरक्षा के लिए मौसम और नमी अनुसार कीटनाशक की सही मात्रा का उपयोग करें।'
        : activeLangRef.current === 'mr-IN'
        ? 'पिकांच्या संरक्षणासाठी हवामानानुसार योग्य प्रमाणात फवारणी करा.'
        : 'For optimal crop protection, apply certified organic bio-pesticides according to current weather humidity.';
      setHistory(prev => [...prev, { role: 'bot', text: fallback }]);
      speakCleanAudio(fallback);
    } finally {
      setLoading(false);
      setVoiceState('ready');
    }
  };

  /* ── Start Voice Recognition with Permission & Mobile Lifecycle Handling ── */
  const startListening = async () => {
    setErrorMsg(null);
    setTranscript('');
    capturedRef.current = '';
    stopSpeaking();

    if (!isSpeechRecognitionSupported()) {
      setErrorMsg(
        activeLangRef.current === 'mr-IN'
          ? 'आपल्या ब्राऊझरमध्ये व्हॉइस रेकग्निशन उपलब्ध नाही. कृपया खाली प्रश्न टाईप करा किंवा Google Chrome वापरा.'
          : activeLangRef.current === 'hi-IN'
          ? 'आपके ब्राउज़र में वॉइस रिकग्निशन उपलब्ध नहीं है। कृपया नीचे प्रश्न टाइप करें या Google Chrome का उपयोग करें।'
          : 'Speech recognition is not supported in this browser. Please type your query below or use Google Chrome / Edge.'
      );
      setVoiceState('error');
      return;
    }

    // Check HTTPS / Secure context
    if (!isSecureVoiceContext()) {
      setErrorMsg('Microphone access requires a secure connection (HTTPS).');
      setVoiceState('error');
      return;
    }

    // Step 1: Stop any existing session
    if (sessionRef.current) {
      try {
        sessionRef.current.abort();
      } catch (e) {}
      sessionRef.current = null;
    }

    setVoiceState('listening');

    try {
      // Step 2: Launch SpeechRecognition session directly in user gesture
      const session = startVoiceRecognitionSession({
        language: activeLangRef.current,
        interimResults: true,
        continuous: false,
        onStart: () => {
          setVoiceState('listening');
        },
        onResult: ({ final, interim, full }) => {
          const display = full || final || interim;
          setTranscript(display);
          if (final) {
            capturedRef.current = final;
          } else if (full) {
            capturedRef.current = full;
          }
        },
        onError: ({ code, message }) => {
          if (code !== 'no-speech' && code !== 'aborted') {
            setErrorMsg(message);
            setVoiceState('error');
          } else {
            setVoiceState('ready');
          }
        },
        onEnd: () => {
          const captured = capturedRef.current.trim();
          if (captured) {
            handleSendQuery(captured);
          } else {
            setVoiceState('ready');
          }
        }
      });

      sessionRef.current = session;
    } catch (err) {
      console.warn('Voice start exception:', err);
      setErrorMsg(err.message || 'Failed to start microphone. Please check browser permissions.');
      setVoiceState('error');
    }
  };

  /* ── Toggle Listening Button ── */
  const toggleListening = () => {
    if (voiceState === 'listening' || voiceState === 'permission') {
      stopVoiceSession(true);
    } else {
      startListening();
    }
  };

  /* ── Clean Speech Synthesizer ── */
  const speakCleanAudio = (rawText) => {
    speakTextWithSynthesis({
      text: rawText,
      language: activeLangRef.current,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false)
    });
  };

  const stopSpeaking = () => {
    stopSpeechSynthesis();
    setSpeaking(false);
  };

  const clearHistory = () => {
    stopSpeaking();
    setHistory([
      {
        role: 'bot',
        text: language === 'hi'
          ? 'नमस्ते किसान भाई! बातचीत साफ़ कर दी गई है। नया सवाल पूछें।'
          : language === 'mr'
          ? 'नमस्कार शेतकरी मित्र! संवाद साफ केला आहे. नवीन प्रश्न विचारा.'
          : 'Chat history cleared. Tap the mic to ask a new question.'
      }
    ]);
    setTranscript('');
    capturedRef.current = '';
    setErrorMsg(null);
  };

  const isListening = voiceState === 'listening' || voiceState === 'permission';

  return (
    <div className="va-page">
      
      {/* ─── Hero Header ─── */}
      <motion.div className="va-hero-banner" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}>
        <div className="va-hero-left">
          <div className="va-hero-icon-wrap">
            <FaMicrophone />
          </div>
          <div className="va-hero-titles">
            <h1>{t('voiceAssistant', 'Voice Assistant')}</h1>
            <p>
              {language === 'hi'
                ? 'Google Gemini AI द्वारा संचालित प्राकृतिक आवाज संवाद।'
                : language === 'mr'
                ? 'Google Gemini AI द्वारे समर्थित नैसर्गिक आवाज संवाद.'
                : 'Hands-free natural language voice dialogue powered by Google Gemini AI.'}
            </p>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="va-lang-tabs">
          {LANG_OPTIONS.map(l => (
            <button
              key={l.code}
              className={`va-lang-btn ${langCode === l.code ? 'active' : ''}`}
              onClick={() => {
                setLangCode(l.code);
                activeLangRef.current = l.code;
                setLanguage(l.code.split('-')[0]);
                stopSpeaking();
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Error Alert Banner */}
      {errorMsg && (
        <div style={{
          background: '#fff1f2',
          border: '1.5px solid #fecdd3',
          color: '#9f1239',
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: 600
        }}>
          <FaExclamationTriangle style={{ color: '#e11d48', flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            style={{ background: 'none', border: 'none', color: '#9f1239', fontWeight: 800, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── Main Conversation Body ─── */}
      <div className="va-body">
        
        {/* Left: Chat Log Card */}
        <div className="va-chat-card">
          {/* Quick Prompts Bar */}
          <div className="va-quick-prompts-bar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                className="va-prompt-chip"
                onClick={() => handleSendQuery(p.text)}
              >
                <span>{p.icon}</span>
                <span>{p.text}</span>
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="va-messages-scroll">
            {history.map((msg, i) => (
              <div key={i} className={`va-msg-row ${msg.role}`}>
                <div className={`va-msg-bubble ${msg.role}`}>
                  <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                  
                  {msg.role === 'bot' && (
                    <div className="va-msg-footer">
                      <button
                        className="va-speak-btn"
                        onClick={() => speakCleanAudio(msg.text)}
                      >
                        <FaVolumeUp /> {language === 'hi' ? 'सुनें' : language === 'mr' ? 'ऐका' : 'Listen'}
                      </button>
                      <span style={{ fontSize: '10.5px', color: '#64748b' }}>Google Gemini AI</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="va-msg-row bot">
                <div className="va-msg-bubble bot" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 700 }}>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                  {language === 'hi' ? 'Google Gemini AI सोच रहा है…' : language === 'mr' ? 'Google Gemini AI प्रक्रिया करत आहे…' : 'Processing voice query…'}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Text Input Fallback Bar */}
          <div style={{ padding: '12px 18px', borderTop: '1.5px solid #e2ece3', background: '#ffffff', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder={language === 'hi' ? 'बोलें या यहाँ लिखें…' : language === 'mr' ? 'बोला किंवा येथे टाईप करा…' : 'Speak or type your question…'}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery(textInput)}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: '12px', border: '1.5px solid #cbd5e1',
                fontSize: '13.5px', outline: 'none', background: '#f8fafc'
              }}
            />
            <button
              onClick={() => handleSendQuery(textInput)}
              disabled={loading || !textInput.trim()}
              style={{
                background: 'linear-gradient(135deg, #155e2d 0%, #16a34a 100%)',
                color: '#ffffff', border: 'none', padding: '0 18px', borderRadius: '12px',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>

        {/* Right: Glowing Mic Console */}
        <div className="va-console-card">
          <div className="va-console-head">
            <h3>Microphone Console</h3>
            <p>
              {voiceState === 'permission'
                ? 'Allow microphone access in browser prompt…'
                : voiceState === 'listening'
                ? `🔴 Listening in ${getLanguageDisplayName(langCode)}… Speak now`
                : voiceState === 'processing'
                ? '⏳ Processing your speech…'
                : `Tap mic to speak (${getLanguageDisplayName(langCode)})`}
            </p>
          </div>

          {/* Central Pulsing Mic */}
          <div className={`va-mic-pulsing-wrap ${isListening ? 'listening' : ''}`}>
            <div className="va-pulse-ring-1" />
            <div className="va-pulse-ring-2" />
            <button
              className={`va-main-mic-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
              title={isListening ? 'Stop listening' : 'Start speaking'}
              aria-label="Toggle microphone"
            >
              {isListening ? <FaStop /> : <FaMicrophone />}
            </button>
          </div>

          {/* Live Transcript Box */}
          <div className="va-transcript-preview">
            {transcript
              ? `"${transcript}"`
              : voiceState === 'listening'
              ? 'Listening to your voice…'
              : `Press mic and ask in Hindi, Marathi, or English.`}
          </div>

          {/* Console Actions */}
          <div className="va-bottom-actions">
            {speaking && (
              <button
                className="va-clear-btn"
                style={{ background: '#fef3c7', color: '#b45309', borderColor: '#fcd34d' }}
                onClick={stopSpeaking}
              >
                <FaVolumeMute /> Stop Audio
              </button>
            )}

            <button className="va-clear-btn" onClick={clearHistory}>
              <FaTrash /> Clear Chat
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default VoiceAssistantPage;
