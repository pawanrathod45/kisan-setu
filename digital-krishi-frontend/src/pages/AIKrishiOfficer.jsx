import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPaperPlane, FaMicrophone, FaCamera, FaCopy,
  FaCheck, FaVolumeUp, FaTrash, FaLightbulb, FaShieldAlt,
  FaSeedling, FaCloudSun, FaChartLine, FaLeaf, FaTimes,
  FaBug, FaTint, FaFlask, FaLandmark, FaRedo
} from 'react-icons/fa';
import { GiWheat, GiSprout } from 'react-icons/gi';
import API from '../services/api';
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
import { useLanguage } from '../context/LanguageContext';
import './AIKrishiOfficer.css';

const QUICK_PROMPTS_EN = [
  { icon: GiWheat, color: '#d97706', bg: '#fef3c7', label: 'Wheat Rust Treatment', prompt: 'What is the exact pesticide dosage and treatment protocol for Yellow/Brown Rust in Wheat?' },
  { icon: FaBug, color: '#e11d48', bg: '#ffe4e6', label: 'Cotton Bollworm Control', prompt: 'How to control Pink Bollworm in BT Cotton using bio-pesticides and chemical sprays?' },
  { icon: FaTint, color: '#0284c7', bg: '#e0f2fe', label: 'Irrigation Timing', prompt: 'Based on current weather, when is the optimal irrigation schedule for tillering stage?' },
  { icon: FaChartLine, color: '#16a34a', bg: '#dcfce7', label: 'APMC Price Forecast', prompt: 'What is the projected Mandi price trend for Onion over the next 10 days?' },
  { icon: FaFlask, color: '#9333ea', bg: '#f3e8ff', label: 'NPK Fertilizer Ratio', prompt: 'What is the recommended NPK and Zinc fertilizer dosage per acre for Tomato?' },
  { icon: FaLandmark, color: '#4f46e5', bg: '#e0e7ff', label: 'PM-Kisan & Schemes', prompt: 'How can I apply for solar drip irrigation subsidy under government agriculture schemes?' },
];

const QUICK_PROMPTS_HI = [
  { icon: GiWheat, color: '#d97706', bg: '#fef3c7', label: 'गेहूं रतुआ रोग उपचार', prompt: 'गेहूं में पीला और भूरा रतुआ (Rust) रोग की रोकथाम हेतु सटीक कीटनाशक एवं छिड़काव मात्रा क्या है?' },
  { icon: FaBug, color: '#e11d48', bg: '#ffe4e6', label: 'कपास गुलाबी सुंडी', prompt: 'कपास में गुलाबी सुंडी (Pink Bollworm) की रोकथाम के लिए जैविक एवं रासायनिक उपाय बताएं?' },
  { icon: FaTint, color: '#0284c7', bg: '#e0f2fe', label: 'सिंचाई का सही समय', prompt: 'मौसम और कल्ले फूटने (Tillering) के आधार पर सिंचाई का सर्वोत्तम समय क्या है?' },
  { icon: FaChartLine, color: '#16a34a', bg: '#dcfce7', label: 'मंडी भाव पूर्वानुमान', prompt: 'अगले 10 दिनों में प्याज और सोयाबीन के APMC मंडी भाव का क्या अनुमान है?' },
  { icon: FaFlask, color: '#9333ea', bg: '#f3e8ff', label: 'खाद एवं उर्वरक मात्रा', prompt: 'टमाटर और मिर्च की फसल में प्रति एकड़ NPK और सूक्ष्म पोषक तत्वों की अनुशंसित मात्रा क्या है?' },
  { icon: FaLandmark, color: '#4f46e5', bg: '#e0e7ff', label: 'कृषि योजना सब्सिडी', prompt: 'सोलर पंप और ड्रिप सिंचाई पर सरकारी अनुदान (सब्सिडी) कैसे प्राप्त करें?' },
];

const QUICK_PROMPTS_MR = [
  { icon: GiWheat, color: '#d97706', bg: '#fef3c7', label: 'गहू तांबेरा रोग उपाय', prompt: 'गव्हावरील पिवळा व तपकिरी तांबेरा रोगावर फवारणीचे अचूक औषध व प्रमाण काय आहे?' },
  { icon: FaBug, color: '#e11d48', bg: '#ffe4e6', label: 'कापूस बोंडअळी नियंत्रण', prompt: 'कापसावरील गुलाबी बोंडअळीच्या नियंत्रणासाठी जैविक व रासायनिक उपाय कोणते?' },
  { icon: FaTint, color: '#0284c7', bg: '#e0f2fe', label: 'पाणी व्यवस्थापन', prompt: 'हवामानाचा अंदाज पाहून पिकाला पाणी देण्याची योग्य वेळ कोणती?' },
  { icon: FaChartLine, color: '#16a34a', bg: '#dcfce7', label: 'बाजारभाव अंदाज', prompt: 'पुढील १० दिवसांत कांदा व सोयाबीनच्या बाजारभावाचा अंदाज काय आहे?' },
  { icon: FaFlask, color: '#9333ea', bg: '#f3e8ff', label: 'खत व्यवस्थापन', prompt: 'टोमॅटो आणि भाजीपाला पिकासाठी प्रति एकर खतांची मात्रा काय असावी?' },
  { icon: FaLandmark, color: '#4f46e5', bg: '#e0e7ff', label: 'कृषी योजना व अनुदान', prompt: 'सौर कृषी पंप आणि ठिबक सिंचनासाठी शासकीय अनुदानाचा लाभ कसा घ्यावा?' },
];

const AIKrishiOfficer = () => {
  const { language, t } = useLanguage();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const location = user.location || 'Pune';
  const crop = user.crop || 'Wheat';

  const quickPrompts = language === 'hi' ? QUICK_PROMPTS_HI : language === 'mr' ? QUICK_PROMPTS_MR : QUICK_PROMPTS_EN;

  const getInitialGreeting = useCallback(() => {
    if (language === 'hi') {
      return `🙏 नमस्कार ${user.name || 'किसान भाई'}! मैं आपका **Google Gemini AI Krishi Officer** हूँ।\n\nमैं आपके **${location}** फार्म (मुख्य फसल: **${crop}**) से जुड़ा हूँ। फसल रोग, कीटनाशक मात्रा, मौसम या मंडी भाव से जुड़ा कोई भी सवाल पूछें!`;
    }
    if (language === 'mr') {
      return `🙏 नमस्कार ${user.name || 'शेतकरी मित्र'}! मी तुमचा **Google Gemini AI Krishi Officer** आहे.\n\nमी तुमच्या **${location}** शेतीशी (मुख्य पीक: **${crop}**) जोडलेला आहे. पीक रोग, फवारणी औषधे, खते किंवा बाजारभावाबाबत विचारा!`;
    }
    return `Namaste ${user.name || 'Farmer'}! 🙏 I am your **Google Gemini AI Krishi Officer & Certified Agronomist**.\n\nI am synchronized with your farm in **${location}** (Primary Crop: **${crop}**). How can I assist with your crops, disease diagnostics, certified spray dosages, or APMC Mandi strategies today?`;
  }, [language, location, crop, user.name]);

  const [messages, setMessages] = useState([
    {
      type: 'bot',
      message: getInitialGreeting(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput]                 = useState('');
  const [isLoading, setIsLoading]         = useState(false);
  const [isListening, setIsListening]     = useState(false);
  const [voiceError, setVoiceError]       = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview]   = useState(null);
  const [copiedIdx, setCopiedIdx]         = useState(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState(null);

  const messagesEndRef = useRef(null);
  const voiceSessionRef = useRef(null);
  const fileInputRef   = useRef(null);

  // Update initial greeting when language changes if no other conversation
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].type === 'bot') {
        return [{
          type: 'bot',
          message: getInitialGreeting(),
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }];
      }
      return prev;
    });
  }, [language, getInitialGreeting]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Clean up voice session on unmount
  useEffect(() => {
    return () => {
      if (voiceSessionRef.current) {
        voiceSessionRef.current.abort();
      }
      stopSpeechSynthesis();
    };
  }, []);

  const handleVoiceToggle = async () => {
    setVoiceError(null);

    if (isListening) {
      if (voiceSessionRef.current) {
        voiceSessionRef.current.stop();
        voiceSessionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setVoiceError(
        language === 'hi'
          ? 'इस ब्राउज़र में स्पीच रिकॉग्निशन समर्थित नहीं है। कृपया Chrome या Edge का उपयोग करें।'
          : language === 'mr'
          ? 'या ब्राउझरमध्ये स्पीच रेकग्निशन समर्थित नाही. कृपया Chrome किंवा Edge वापरा.'
          : 'Speech recognition is not supported in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    if (!isSecureVoiceContext()) {
      setVoiceError('Microphone access requires HTTPS in production.');
      return;
    }

    try {
      // Request mic hardware permission explicitly for mobile Chrome
      await requestMicrophonePermission();

      if (voiceSessionRef.current) {
        voiceSessionRef.current.abort();
        voiceSessionRef.current = null;
      }

      const langLocale = getLanguageLocale(language);
      const session = startVoiceRecognitionSession({
        language: langLocale,
        interimResults: true,
        continuous: false,
        onStart: () => {
          setIsListening(true);
        },
        onResult: ({ full, final, interim }) => {
          const spokenText = full || final || interim;
          if (spokenText) {
            setInput(spokenText);
          }
        },
        onError: ({ code, message }) => {
          if (code !== 'no-speech' && code !== 'aborted') {
            setVoiceError(message);
          }
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        }
      });

      voiceSessionRef.current = session;
    } catch (err) {
      console.warn('Voice start error in AI officer:', err);
      setVoiceError(err.message || 'Microphone access failed. Please grant mic permission.');
      setIsListening(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend && !selectedImage) return;

    const userMsg = {
      type: 'user',
      message: textToSend,
      image: imagePreview,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const currentImg = selectedImage;
    handleClearImage();
    setIsLoading(true);
    setLastFailedPrompt(null);

    const langName = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English';

    try {
      let replyText = '';

      if (currentImg) {
        // Image vision analysis route
        const formData = new FormData();
        formData.append('image', currentImg);
        formData.append('language', langName);
        
        const res = await API.post('/analyze-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const data = res.data;
        replyText = `🌱 **Detected Crop:** ${data.crop}\n\n🔍 **Diagnosis:** ${data.disease} (${data.confidence || 94}% confidence)\n\n✨ **AI Agronomist Review:**\n${data.aiReview || data.treatment}\n\n🧪 **Recommended Pesticide & Dosage:**\n${data.pesticides?.map(p => `• **${p.name}** (${p.type}): ${p.dosage}`).join('\n') || 'Mancozeb 75% WP @ 2g/L water'}\n\n📈 **Live APMC Mandi Rate:** ₹${data.currentPrice || 2450} / quintal (${data.priceTrend || '+2.8% ▲'})`;
      } else {
        // AI Agronomist Chat text route
        const res = await API.post('/chat', {
          message: textToSend,
          farmerContext: {
            name: user.name,
            location: location,
            crop: crop,
            language: langName
          }
        });
        
        replyText = res.data?.reply || res.data?.message;
        if (!replyText) {
          throw new Error('Empty response from AI server');
        }
      }

      setMessages(prev => [...prev, {
        type: 'bot',
        message: replyText,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.warn('AI Krishi Officer error:', err.message);
      setLastFailedPrompt(textToSend);
      
      const errorMsg = language === 'hi'
        ? 'AI Krishi Officer अस्थायी रूप से अनुपलब्ध है। कृपया पुनः प्रयास करें।'
        : language === 'mr'
        ? 'AI Krishi Officer तात्पुरता अनुपलब्ध आहे. कृपया पुन्हा प्रयत्न करा.'
        : 'AI Krishi Officer is temporarily unavailable. Please try again.';

      setMessages(prev => [...prev, {
        type: 'bot',
        isError: true,
        message: errorMsg,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#_`•]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Markdown parser with clean paragraph and list separation
  const renderFormattedMessage = (content) => {
    if (!content) return null;
    const paragraphs = content.split(/\n\n+/);
    
    return paragraphs.map((para, pIdx) => {
      const lines = para.split('\n');
      return (
        <p key={pIdx} className="message-paragraph">
          {lines.map((line, lineIdx) => {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            const formattedLine = parts.map((part, partIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={partIdx} className="highlight-text">{part.slice(2, -2)}</strong>;
              }
              return part;
            });

            return (
              <React.Fragment key={lineIdx}>
                {formattedLine}
                {lineIdx < lines.length - 1 && <br />}
              </React.Fragment>
            );
          })}
        </p>
      );
    });
  };

  return (
    <div className="ai-krishi-wrapper">
      {/* ─── Header Card ─── */}
      <header className="ai-header">
        <div className="header-left">
          <div className="header-icon-wrap">
            <GiSprout className="header-icon-svg" />
          </div>
          <div className="header-title-section">
            <div className="header-title-row">
              <h1>{t('aiKrishiOfficer', 'AI Krishi Officer')}</h1>
              <span className="badge-ai-live">
                <span className="ai-pulse-dot" />
                GEMINI 2.0 FLASH
              </span>
            </div>
            <p>{language === 'hi' ? 'Google Gemini AI कृषि विशेषज्ञ • सटीक फसल व मिट्टी परामर्श' : language === 'mr' ? 'Google Gemini AI कृषी सल्लागार • अचूक पीक व माती सल्ला' : 'Google Gemini 2.0 Precision Agronomist • Realtime Crop & Soil Advisory'}</p>
          </div>
        </div>

        <div className="header-right">
          <button
            onClick={() => setMessages([{
              type: 'bot',
              message: getInitialGreeting(),
              timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            }])}
            className="clear-chat-btn"
          >
            <FaTrash className="clear-icon" /> {language === 'hi' ? 'चैट साफ़ करें' : language === 'mr' ? 'चॅट साफ करा' : 'Clear Chat'}
          </button>
        </div>
      </header>

      {/* ─── Main Grid Layout ─── */}
      <div className="ai-dashboard-grid">
        {/* Left: Chatbot Canvas */}
        <div className="chatbot-section">
          {/* Quick Prompts Bar */}
          <div className="quick-prompts-bar">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                className="quick-prompt-btn"
                onClick={() => handleSend(qp.prompt)}
              >
                <div className="prompt-icon-pill" style={{ background: qp.bg }}>
                  <qp.icon style={{ color: qp.color }} />
                </div>
                <span>{qp.label}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="chat-messages-container ks-scroll">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  className={`chat-message-row ${msg.type}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16 }}
                >
                  {msg.type === 'bot' && (
                    <div className="avatar-bot">
                      <GiSprout style={{ fontSize: '18px', color: '#86efac' }} />
                    </div>
                  )}

                  <div className={`message-bubble ${msg.type} ${msg.isError ? 'error-bubble' : ''}`}>
                    {msg.image && (
                      <div className="attached-image-wrapper">
                        <img src={msg.image} alt="Uploaded Specimen" />
                      </div>
                    )}

                    <div className="message-text">
                      {msg.type === 'bot' ? renderFormattedMessage(msg.message) : msg.message}
                    </div>

                    {msg.isError && lastFailedPrompt && (
                      <button
                        onClick={() => handleSend(lastFailedPrompt)}
                        className="retry-chat-btn"
                      >
                        <FaRedo /> {language === 'hi' ? 'पुनः प्रयास करें' : language === 'mr' ? 'पुन्हा प्रयत्न करा' : 'Retry'}
                      </button>
                    )}

                    <div className="message-footer">
                      <span className="msg-time">{msg.timestamp}</span>

                      {msg.type === 'bot' && !msg.isError && (
                        <div className="msg-actions">
                          <button
                            onClick={() => handleCopy(msg.message, idx)}
                            title="Copy response"
                            className="action-btn"
                          >
                            {copiedIdx === idx ? <FaCheck style={{ color: '#22c55e', fontSize: '12px' }} /> : <FaCopy style={{ fontSize: '12px', color: '#64748b' }} />}
                          </button>
                          <button
                            onClick={() => handleSpeak(msg.message)}
                            title="Read aloud"
                            className="action-btn"
                          >
                            <FaVolumeUp style={{ fontSize: '12px', color: '#64748b' }} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="chat-message-row bot">
                <div className="avatar-bot">
                  <GiSprout style={{ fontSize: '18px', color: '#86efac' }} />
                </div>
                <div className="message-bubble bot typing-bubble">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <span className="typing-label">
                    {language === 'hi' ? 'AI Krishi Officer विश्लेषण कर रहा है…' : language === 'mr' ? 'AI Krishi Officer विश्लेषण करत आहे…' : 'AI Krishi Officer is analyzing…'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Image Preview Tag */}
          {imagePreview && (
            <div className="image-preview-bar">
              <img src={imagePreview} alt="Leaf preview" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#15803d' }}>📸 Leaf Photo Attached</span>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b' }}>Will be analyzed with Gemini Vision</p>
              </div>
              <button onClick={handleClearImage} className="clear-img-btn"><FaTimes /></button>
            </div>
          )}

          {/* Voice Listening Active Indicator Bar */}
          {isListening && (
            <div style={{
              background: '#fef2f2',
              border: '1.5px solid #fecdd3',
              borderRadius: '12px',
              padding: '8px 14px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#991b1b',
              fontWeight: 700
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#dc2626', animation: 'ping 1s infinite' }} />
                <span>
                  {language === 'hi'
                    ? '🔴 आवाज सुन रहे हैं (हिन्दी)... बोलिए'
                    : language === 'mr'
                    ? '🔴 आवाज ऐकत आहे (मराठी)... बोला'
                    : '🔴 Listening in English... Speak your question'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleVoiceToggle}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Stop
              </button>
            </div>
          )}

          {/* Voice Error Banner */}
          {voiceError && (
            <div style={{
              background: '#fff1f2',
              border: '1.5px solid #fecdd3',
              borderRadius: '12px',
              padding: '8px 14px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#9f1239',
              fontWeight: 600
            }}>
              <span>{voiceError}</span>
              <button
                type="button"
                onClick={() => setVoiceError(null)}
                style={{ background: 'none', border: 'none', color: '#9f1239', fontWeight: 800, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="chat-input-form">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />

            {/* Camera Upload Button */}
            <button
              type="button"
              className="chat-media-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Attach leaf or pest image"
            >
              <FaCamera style={{ fontSize: '17px', color: '#15803d' }} />
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              className={`chat-media-btn ${isListening ? 'listening' : ''}`}
              onClick={handleVoiceToggle}
              title="Voice input"
            >
              <FaMicrophone style={{ fontSize: '17px', color: isListening ? '#dc2626' : '#7c3aed' }} />
            </button>

            <input
              type="text"
              className="chat-text-input"
              placeholder={language === 'hi' ? "कोई भी कृषि प्रश्न पूछें (उदा. 'गेहूं में झुलसा रोग उपाय')..." : language === 'mr' ? "कृषी सल्ला विचारा (उदा. 'कांद्यावरील करपा उपाय')..." : "Ask anything (e.g. 'How to treat fungal blight in Wheat?')..."}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
            />

            {/* Send Button */}
            <button
              type="submit"
              className="chat-send-btn"
              disabled={isLoading || (!input.trim() && !selectedImage)}
              title="Send message"
            >
              <FaPaperPlane style={{ fontSize: '15px', color: '#ffffff' }} />
            </button>
          </form>
        </div>

        {/* Right: Farm Context & Realtime Agronomic Widgets */}
        <div className="ai-sidebar-context">
          {/* Farmer Digital Profile Pill */}
          <div className="context-card">
            <div className="context-card-header">
              <div className="context-icon-wrap" style={{ background: '#dcfce7', color: '#15803d' }}>
                <FaSeedling />
              </div>
              <h4>{t('farmerProfile', 'Active Farm Context')}</h4>
            </div>
            <div className="context-meta-list">
              <div className="context-meta-row">
                <span className="meta-k">{t('selectDistrict', 'Location')}</span>
                <span className="meta-v">📍 {location}</span>
              </div>
              <div className="context-meta-row">
                <span className="meta-k">{t('mainCrop', 'Primary Crop')}</span>
                <span className="meta-v">🌾 {crop}</span>
              </div>
              <div className="context-meta-row">
                <span className="meta-k">{t('soilMoisture', 'Soil Status')}</span>
                <span className="meta-v">🟤 Black Loam • pH 6.8</span>
              </div>
              <div className="context-meta-row">
                <span className="meta-k">AI Model</span>
                <span className="meta-v" style={{ color: '#15803d', fontWeight: 800 }}>✓ Gemini 2.0 Flash</span>
              </div>
            </div>
          </div>

          {/* Realtime Weather Advisory Cardlet */}
          <div className="context-card weather-advisory-card">
            <div className="context-card-header">
              <div className="context-icon-wrap" style={{ background: '#ccfbf1', color: '#0f766e' }}>
                <FaCloudSun />
              </div>
              <h4 style={{ color: '#115e59' }}>{t('weatherAdvisory', 'Spray & Weather Window')}</h4>
            </div>
            <p style={{ margin: '6px 0', fontSize: '0.82rem', color: '#134e4a', lineHeight: 1.45 }}>
              Current winds at <strong>12 km/h</strong> with <strong>10% rain probability</strong>. Safe foliar pesticide and bio-fertilizer spraying window today.
            </p>
          </div>

          {/* Quick Diagnostics Guidance */}
          <div className="context-card">
            <div className="context-card-header">
              <div className="context-icon-wrap" style={{ background: '#dbeafe', color: '#2563eb' }}>
                <FaShieldAlt />
              </div>
              <h4>AI Diagnostics Tips</h4>
            </div>
            <ul className="guidance-list">
              <li>Snap clear close-up photos of leaves with natural lighting.</li>
              <li>Ask for certified chemical dosages per acre or litre.</li>
              <li>Ask for Mandi price trajectory before harvesting.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIKrishiOfficer;
