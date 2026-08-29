import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLock, FaEnvelope, FaArrowRight, FaEye, FaEyeSlash,
  FaCloudSun, FaChartLine, FaRobot, FaSeedling
} from 'react-icons/fa';
import { GiWheat } from 'react-icons/gi';
import API from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Login.css';

// Realistic Farming Video URL with fallback and poster
const FARMER_WELCOME_VIDEO_URL =
  'https://assets.mixkit.co/videos/preview/mixkit-farmer-walking-in-a-field-of-wheat-42617-large.mp4';
const FARMER_POSTER_IMAGE =
  'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=1200&auto=format&fit=crop';

const Login = () => {
  const navigate                        = useNavigate();
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { language, setLanguage, t, languages } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError(
        language === 'en'
          ? 'Please enter a valid email address'
          : language === 'mr'
          ? 'कृपया वैध ईमेल पत्ता प्रविष्ट करा'
          : 'कृपया मान्य ईमेल पता दर्ज करें'
      );
      setLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setError(
        language === 'en'
          ? 'Password must be at least 6 characters'
          : language === 'mr'
          ? 'पासवर्ड किमान 6 अक्षरांचा असावा'
          : 'पासवर्ड कम से कम 6 वर्णों का होना चाहिए'
      );
      setLoading(false);
      return;
    }

    try {
      const response = await API.post('/auth/login', {
        email: cleanEmail,
        password: password.trim()
      });

      const authToken = response.data?.accessToken || response.data?.token;

      if (authToken) {
        localStorage.setItem('token', authToken);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(response.data.user));

        setSuccess(
          language === 'en'
            ? 'Access granted! Loading your farm dashboard...'
            : language === 'mr'
            ? 'लॉगिन यशस्वी! डॅशबोर्ड उघडत आहे...'
            : 'सफलतापूर्वक लॉग इन हुआ! डैशबोर्ड लोड हो रहा है...'
        );

        setTimeout(() => {
          if (response.data.user?.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/farmer/dashboard');
          }
        }, 600);
      } else {
        throw new Error('Authentication payload missing');
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 403 && err.response.data?.requiresVerification) {
          setError('Email verification required. Redirecting to verification...');
          setTimeout(() => {
            navigate(`/verify-email?email=${encodeURIComponent(cleanEmail)}`);
          }, 800);
        } else if (err.response.status === 400 || err.response.status === 401) {
          setError(
            language === 'en'
              ? 'Invalid email or password'
              : language === 'mr'
              ? 'अवैध ईमेल किंवा पासवर्ड'
              : 'अमान्य ईमेल या पासवर्ड'
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
            : language === 'mr'
            ? 'नेटवर्क त्रुटी. कृपया आपले इंटरनेट तपासा'
            : 'नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें'
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
            onClick={() => setLanguage(l.code)}
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
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      >
        
        {/* Left Side: Brand Narrative & Feature Highlights */}
        <div className="ks-card-brand-panel">
          <div className="ks-brand-top">
            <div className="ks-brand-logo-badge">
              <GiWheat />
            </div>
            <div className="ks-brand-top-text">
              <h2>{t.title || 'किसान सेतु'}</h2>
              <p>{t.tagline || 'सटीक कृषि और क्लाउड एआई'}</p>
            </div>
          </div>

          <div className="ks-card-narrative">
            <span className="ks-narrative-tag">
              🌾 {language === 'en' ? 'Smart Agriculture Engine' : 'डिजिटल शेती साथी'}
            </span>
            <h1>{t.showcaseTitle || 'Welcome to Kisan Setu'}</h1>
            <p className="ks-companion-subtitle">
              {language === 'en'
                ? 'Your Smart Digital Farming Companion'
                : language === 'mr'
                ? 'आपला डिजिटल शेती साथी'
                : 'आपका स्मार्ट डिजिटल कृषि साथी'}
            </p>
            <p className="ks-narrative-desc">
              {t.showcaseDesc || 'AI-driven crop disease diagnostics, precision weather forecasts, and live AGMARKNET APMC mandi prices.'}
            </p>
          </div>

          {/* Feature Badges (Desktop Only / Compact) */}
          <div className="ks-card-badges-grid">
            <div className="ks-glass-badge">
              <div className="ks-glass-icon-box">
                <FaCloudSun />
              </div>
              <span className="ks-glass-title">
                ⛅ {language === 'en' ? 'Live Weather' : language === 'mr' ? 'हवामान अंदाज' : 'लाइव मौसम'}
              </span>
            </div>

            <div className="ks-glass-badge">
              <div className="ks-glass-icon-box">
                <FaChartLine />
              </div>
              <span className="ks-glass-title">
                📈 {language === 'en' ? 'Mandi Prices' : language === 'mr' ? 'थेट बाजारभाव' : 'लाइव मंडी भाव'}
              </span>
            </div>

            <div className="ks-glass-badge">
              <div className="ks-glass-icon-box">
                <FaRobot />
              </div>
              <span className="ks-glass-title">
                🤖 {language === 'en' ? 'AI Krishi Officer' : language === 'mr' ? 'एआय कृषी सल्ला' : 'एआई कृषि अधिकारी'}
              </span>
            </div>

            <div className="ks-glass-badge">
              <div className="ks-glass-icon-box">
                <FaSeedling />
              </div>
              <span className="ks-glass-title">
                🌱 {language === 'en' ? 'Crop Guidance' : language === 'mr' ? 'स्मार्ट पीक सल्ला' : 'सटीक फसल सलाह'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: High-Precision Sign-In Form */}
        <div className="ks-card-form-panel">
          <div className="ks-form-header">
            <h2 className="ks-form-title">{t.loginHeading || 'Farmer Account Login'}</h2>
            <p className="ks-form-sub">{language === 'en' ? 'Enter your registered email and password.' : 'आपला नोंदणीकृत ईमेल आणि पासवर्ड प्रविष्ट करा.'}</p>
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
                  padding: '9px 12px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: 650,
                  marginBottom: '12px'
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
                  padding: '9px 12px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: 750,
                  marginBottom: '12px'
                }}
              >
                ✅ {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="ks-form-stack">
            
            {/* Email Address */}
            <div className="ks-input-group">
              <label className="ks-input-label">
                <FaEnvelope style={{ color: '#15803d' }} /> {t.email || 'Email Address'} *
              </label>
              <input
                type="email"
                className="ks-text-input"
                placeholder="farmer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="ks-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="ks-input-label">
                  <FaLock style={{ color: '#15803d' }} /> {t.password || 'Password'} *
                </label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '11.5px', color: '#15803d', fontWeight: 700, textDecoration: 'none' }}
                >
                  {t.forgotPassword || 'Forgot Password?'}
                </Link>
              </div>

              <div
                className="ks-password-input-box"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '100%',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '3px 8px 3px 12px',
                  gap: '6px',
                  boxSizing: 'border-box'
                }}
              >
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="ks-password-field"
                  style={{
                    flex: '1 1 auto',
                    minWidth: 0,
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    padding: '8px 0',
                    margin: 0,
                    fontSize: '15px',
                    color: '#0f172a',
                    fontWeight: 600,
                    boxShadow: 'none'
                  }}
                  placeholder={t.passwordPlaceholder || '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="ks-password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  style={{
                    flexShrink: 0,
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '4px 6px',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
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

          <div className="ks-auth-footer-prompt">
            <span>{t.newFarmerPrompt || 'Need a new farmer account?'}</span>
            <Link to="/register" className="ks-footer-link">
              {t.registerLink || 'Register Here'}
            </Link>
          </div>

        </div>

      </motion.div>

    </div>
  );
};

export default Login;
