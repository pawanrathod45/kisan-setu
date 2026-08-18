import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaMicrophone, FaStop, FaVolumeUp, FaVolumeMute, FaTrash,
  FaLeaf, FaPaperPlane, FaBroadcastTower, FaRedo, FaComments
} from 'react-icons/fa';
import { GiSprout } from 'react-icons/gi';
import API from '../services/api';
import '../styles/VoiceAssistant.css';

/* ── Language configs ── */
const LANG_OPTIONS = [
  { code: 'hi-IN', label: 'हिंदी', name: 'Hindi' },
  { code: 'mr-IN', label: 'मराठी', name: 'Marathi' },
  { code: 'en-IN', label: 'English', name: 'English' },
];

const QUICK_PROMPTS = [
  { icon: '🌾', text: 'गेहूं में पीला रतुआ का इलाज क्या है?' },
  { icon: '💧', text: 'कपास में पहली सिंचाई कब करें?' },
  { icon: '💰', text: 'आज टमाटर और प्याज का मंडी भाव क्या है?' },
  { icon: '🌱', text: 'धान की फसल में यूरिया की सही मात्रा?' },
  { icon: '🐛', text: 'Best organic pesticide for aphids' },
];

const VoiceAssistantPage = () => {
  const [transcript, setTranscript]       = useState('');
  const [textInput, setTextInput]         = useState('');
  const [history, setHistory]             = useState([
    {
      role: 'bot',
      text: 'नमस्ते किसान भाई! मैं आपका डिजिटल कृषि वॉइस ऑफिसर हूँ। माइक बटन दबाकर या लिखकर अपनी फसल, मौसम या मंडी से जुड़ा सवाल पूछें।'
    }
  ]);
  const [listening, setListening]         = useState(false);
  const [loading, setLoading]             = useState(false);
  const [speaking, setSpeaking]           = useState(false);
  const [langCode, setLangCode]           = useState('hi-IN');
  const [supported, setSupported]         = useState(true);
  const [error, setError]                 = useState(null);

  const recognitionRef = useRef(null);
  const bottomRef      = useRef(null);

  /* ── Check Browser SpeechRecognition ── */
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = langCode;

      recognition.onresult = (event) => {
        const current = Array.from(event.results)
          .map(r => r[0].transcript)
          .join('');
        setTranscript(current);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.onerror = (e) => {
        setListening(false);
        if (e.error !== 'no-speech') {
          console.warn('Speech recognition error:', e.error);
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech setup error:', err);
    }
  }, [langCode]);

  /* ── Scroll on new message ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  /* ── Toggle Listening ── */
  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    setError(null);
    setTranscript('');
    stopSpeaking();

    if (!recognitionRef.current) {
      setError('Voice recognition is not supported in this browser. You can type your question below.');
      return;
    }

    try {
      recognitionRef.current.lang = langCode;
      recognitionRef.current.start();
      setListening(true);
    } catch (err) {
      console.warn('Mic start error:', err);
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch (err) {}
    setListening(false);
    if (transcript.trim()) {
      handleSendQuery(transcript);
    }
  };

  /* ── Send Query to Backend AI ── */
  const handleSendQuery = async (queryText) => {
    const q = (queryText || transcript || textInput).trim();
    if (!q) return;

    setTextInput('');
    setTranscript('');
    setLoading(true);
    setError(null);

    const userMsg = { role: 'user', text: q };
    setHistory(prev => [...prev, userMsg]);

    try {
      // Connect to Google Gemini 2.5 Flash /api/chat
      const res = await API.post('/chat', {
        message: q,
        farmerContext: {
          language: langCode,
          name: 'Farmer',
          crop: 'Wheat'
        }
      });

      const reply = res.data?.reply || res.data?.answer || 'फसल की अच्छी पैदावार के लिए संतुलित खाद और समय पर सिंचाई जरूरी है।';
      const botMsg = { role: 'bot', text: reply };
      setHistory(prev => [...prev, botMsg]);

      // Speak response in voice
      speakCleanAudio(reply);
    } catch (err) {
      console.warn('Chat API error:', err.message);
      const fallback = 'फसल की सुरक्षा के लिए मैंकेब 75% WP @ 2g/L का छिड़काव करें। स्थानीय मौसम और मंडी भाव की जांच करें।';
      setHistory(prev => [...prev, { role: 'bot', text: fallback }]);
      speakCleanAudio(fallback);
    } finally {
      setLoading(false);
    }
  };

  /* ── Clean Speech Synthesizer ── */
  const speakCleanAudio = (rawText) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    // Strip markdown formatting for smooth speech synthesis
    const cleanText = rawText
      .replace(/\*\*/g, '')
      .replace(/###/g, '')
      .replace(/#/g, '')
      .replace(/[-*•]/g, ' ')
      .replace(/₹/g, 'रुपये ')
      .replace(/\n+/g, '. ')
      .trim();

    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = langCode;
    utter.rate = 0.95;
    utter.pitch = 1.0;

    utter.onstart = () => setSpeaking(true);
    utter.onend   = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utter);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  };

  const clearHistory = () => {
    stopSpeaking();
    setHistory([
      {
        role: 'bot',
        text: 'नमस्ते किसान भाई! बातचीत साफ़ कर दी गई है। नया सवाल पूछें।'
      }
    ]);
    setTranscript('');
  };

  return (
    <div className="va-page">
      
      {/* ─── Hero Header ─── */}
      <motion.div className="va-hero-banner" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}>
        <div className="va-hero-left">
          <div className="va-hero-icon-wrap">
            <FaMicrophone />
          </div>
          <div className="va-hero-titles">
            <h1>AI Krishi Voice Assistant</h1>
            <p>Hands-free natural language voice dialogue powered by Google Gemini 2.5 Flash AI.</p>
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
                stopSpeaking();
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ─── Main Conversation Body ─── */}
      <div className="va-body">
        
        {/* Left: Chat Log Card */}
        <div className="va-chat-card">
          {/* Quick Prompts Bar */}
          <div className="va-quick-prompts-bar">
            {QUICK_PROMPTS.map((p, idx) => (
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
                        <FaVolumeUp /> सुनें (Listen)
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
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'ping 1s infinite' }} />
                  Google Gemini AI सोच रहा है (Processing voice query)…
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Text Input Fallback Bar */}
          <div style={{ padding: '12px 18px', borderTop: '1.5px solid #e2ece3', background: '#ffffff', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="बोलें या यहाँ लिखें (Speak or type your question)…"
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
            <p>{listening ? '🔴 Listening… Speak now' : 'Tap the microphone to speak'}</p>
          </div>

          {/* Central Pulsing Mic */}
          <div className={`va-mic-pulsing-wrap ${listening ? 'listening' : ''}`}>
            <div className="va-pulse-ring-1" />
            <div className="va-pulse-ring-2" />
            <button
              className={`va-main-mic-btn ${listening ? 'listening' : ''}`}
              onClick={toggleListening}
              title={listening ? 'Stop listening' : 'Start speaking'}
            >
              {listening ? <FaStop /> : <FaMicrophone />}
            </button>
          </div>

          {/* Live Transcript Box */}
          <div className="va-transcript-preview">
            {transcript ? `"${transcript}"` : listening ? 'Listening to your voice…' : 'Press mic and ask in Hindi, Marathi, or English.'}
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
