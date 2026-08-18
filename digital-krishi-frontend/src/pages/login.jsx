import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLock, FaMobileAlt, FaArrowRight, FaEye, FaEyeSlash,
  FaCloudSun, FaChartLine, FaRobot, FaSeedling
} from 'react-icons/fa';
import { GiWheat } from 'react-icons/gi';
import API from '../services/api';
import { translations, languages } from '../utils/translations';
import '../styles/Login.css';

// Realistic Farming Video URL with fallback and poster
const FARMER_WELCOME_VIDEO_URL =
  'https://assets.mixkit.co/videos/preview/mixkit-farmer-walking-in-a-field-of-wheat-42617-large.mp4';
const FARMER_POSTER_IMAGE =
  'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=1200&auto=format&fit=crop';

const Login = () => {
  const navigate                              = useNavigate();
  const [phone, setPhone]                     = useState('');
  const [password, setPassword]               = useState('');
  const [error, setError]                     = useState('');
  const [success, setSuccess]                 = useState('');
  const [loading, setLoading]                 = useState(false);
  const [showPassword, setShowPassword]       = useState(false);
  const [language, setLanguage]               = useState(localStorage.getItem('language') || 'en');

  // Translation dictionary with safe fallback
  const t = translations[language] || translations.en;

  const handleLanguageChange = (code) => {
    setLanguage(code);
    localStorage.setItem('language', code);
  };

  const fillDemoCredentials = () => {
    setPhone('7972822860');
    setPassword('password123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const cleanPhone = phone.trim().replace(/\D/g, '');

    if (cleanPhone.length !== 10) {
      setError(
        language === 'en'
          ? 'Please enter a valid 10-digit Indian mobile number'
          : language === 'mr'
          ? 'कृपया 10 अंकी वैध मोबाईल नंबर टाका'
          : 'कृपया मान्य 10-अंकीय मोबाइल नंबर दर्ज करें'
      );
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(
        language === 'en'
          ? 'Password must be at least 6 characters'
          : language === 'mr'
          ? 'पासवर्ड किमान 6 अक्षरांचा असावा'
          : 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए'
      );
      setLoading(false);
      return;
    }

    try {
      const response = await API.post('/auth/login', {
        phone: cleanPhone,
        password: password,
      });

      const { accessToken, token, refreshToken, user } = response.data;
      const validToken = accessToken || token;

      if (validToken) {
        localStorage.setItem('token', validToken);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      setSuccess(
        language === 'en'
          ? 'Login successful! Redirecting to dashboard...'
          : language === 'mr'
          ? 'लॉगिन यशस्वी! डॅशबोर्ड सुरू होत आहे...'
          : 'लॉगिन सफल! किसान सेतु डैशबोर्ड लोड हो रहा है…'
      );

      setTimeout(() => {
        if (user && user.role === 'officer') {
          navigate('/officer/dashboard');
        } else {
          navigate('/farmer/dashboard');
        }
      }, 800);

    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        if (err.response.status === 401) {
          setError(
            language === 'en'
              ? 'Invalid mobile number or password'
              : language === 'mr'
              ? 'अवैध मोबाईल नंबर किंवा पासवर्ड'
              : 'अमान्य मोबाइल नंबर या पासवर्ड'
          );
        } else if (err.response.status === 404) {
          setError(
            language === 'en'
              ? 'Account not found. Please register'
              : language === 'mr'
              ? 'खाते सापडले नाही. कृपया नोंदणी करा'
              : 'खाता नहीं मिला। कृपया नया पंजीकरण करें'
          );
        } else {
          setError(err.response.data?.message || (language === 'en' ? 'Login failed' : 'लॉगिन विफल रहा'));
        }
      } else {
        setError(
          language === 'en'
            ? 'Network error. Please check your connection'
            : 'सर्वर से कनेक्ट करने में असमर्थ'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ks-auth-viewport">

      {/* ── Background Video covering whole window ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={FARMER_POSTER_IMAGE}
        className="ks-fullscreen-video-bg"
      >
        <source src={FARMER_WELCOME_VIDEO_URL} type="video/mp4" />
      </video>

      {/* ── Dark Green Gradient Overlay across entire window ── */}
      <div className="ks-fullscreen-video-overlay" />

      {/* ── Floating Language Switcher Top Right ── */}
      <div className="ks-lang-top-floating">
        {languages.map((l) => (
          <button
            key={l.code}
            className={`ks-lang-btn ${language === l.code ? 'active' : ''}`}
            onClick={() => handleLanguageChange(l.code)}
          >
            {l.name}
          </button>
        ))}
      </div>

      {/* ── Central Floating Executive Glassmorphic Auth Card ── */}
      <motion.div
        className="ks-floating-card-container"
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        
        {/* Left Side: Brand Narrative & Feature Highlights */}
        <div className="ks-card-brand-panel">
          
          <div className="ks-brand-top">
            <div className="ks-brand-logo-badge">
              <GiWheat />
            </div>
            <div className="ks-brand-top-text">
              <h2>🌾 किसान सेतु</h2>
              <p>Smart Agriculture • Real-Time Insights • AI Assistance</p>
            </div>
          </div>

          <div className="ks-card-narrative">
            <div className="ks-narrative-tag">
              <span>●</span>
              <span>{language === 'en' ? 'Live Precision Farming' : 'सक्रिय डिजिटल कृषी'}</span>
            </div>
            <h1>Welcome to Kisan Setu</h1>
            <div className="ks-companion-subtitle">
              Your Smart Digital Farming Companion
            </div>
            <p>
              Access real-time weather insights, live mandi prices, AI-powered crop guidance, disease detection, and smart farming recommendations — all in one platform.
            </p>
          </div>

          <div className="ks-card-badges-grid">
            
            <div className="ks-glass-badge">
              <div className="ks-glass-icon-box"><FaCloudSun /></div>
              <span className="ks-glass-title">🌦️ Live Weather Intelligence</span>
            </div>

            <div className="ks-glass-badge">
              <div className="ks-glass-icon-box"><FaChartLine /></div>
              <span className="ks-glass-title">📈 Real-Time Mandi Prices</span>
            </div>

            <div className="ks-glass-badge">
              <div className="ks-glass-icon-box"><FaRobot /></div>
              <span className="ks-glass-title">🤖 AI Krishi Officer</span>
            </div>

            <div className="ks-glass-badge">
              <div className="ks-glass-icon-box"><FaSeedling /></div>
              <span className="ks-glass-title">🌱 Smart Crop Guidance</span>
            </div>

          </div>

        </div>

        {/* Right Side: High-Contrast Login Form */}
        <div className="ks-card-form-panel">
          
          <div className="ks-form-header">
            <h3>{t.loginHeading || 'Farmer Account Login'}</h3>
            <p>{t.loginSubheading || 'Enter your registered mobile number and password to access your farm portal.'}</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: '#fee2e2',
                  border: '1.5px solid #fca5a5',
                  color: '#dc2626',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 650,
                  marginBottom: '16px'
                }}
              >
                ⚠️ {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: '#dcfce7',
                  border: '1.5px solid #86efac',
                  color: '#15803d',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 750,
                  marginBottom: '16px'
                }}
              >
                ✅ {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="ks-form-stack">
            
            {/* Mobile Number */}
            <div className="ks-input-group">
              <label className="ks-input-label">
                <FaMobileAlt style={{ color: '#15803d' }} /> {t.mobile || 'Mobile Number'}
              </label>
              <div className="ks-input-container">
                <span className="ks-country-badge">🇮🇳 +91</span>
                <input
                  type="tel"
                  className="ks-text-input has-prefix"
                  placeholder={t.mobilePlaceholder || '98765 43210'}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="ks-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="ks-input-label">
                  <FaLock style={{ color: '#15803d' }} /> {t.password || 'Password'}
                </label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '12px', color: '#15803d', fontWeight: 700, textDecoration: 'none' }}
                >
                  {t.forgotPassword || 'Forgot Password?'}
                </Link>
              </div>

              <div className="ks-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="ks-text-input"
                  placeholder={t.passwordPlaceholder || '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="ks-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="ks-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span>{t.loading || 'Verifying credentials...'}</span>
              ) : (
                <>
                  <span>{t.loginBtn || 'Sign In to Dashboard'}</span>
                  <FaArrowRight />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Demo Login Pill */}
          <div className="ks-demo-box">
            <span>{t.demoBadge || '💡 Instant Test Account (Demo)'}</span>
            <button
              type="button"
              className="ks-demo-btn"
              onClick={fillDemoCredentials}
            >
              {t.demoFill || '1-Click Auto-Fill'}
            </button>
          </div>

          {/* Footer Registration Link */}
          <div className="ks-form-footer">
            <span style={{ color: '#64748b' }}>{t.newFarmerPrompt || 'Need a new farmer account?'}</span>
            <Link to="/register" className="ks-register-link">
              {t.registerLink || 'Register Here'}
            </Link>
          </div>

        </div>

      </motion.div>

    </div>
  );
};

export default Login;
