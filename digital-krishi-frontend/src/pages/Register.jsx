import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLock, FaEnvelope, FaArrowRight, FaEye, FaEyeSlash,
  FaUser, FaMapMarkerAlt, FaSeedling, FaCloudSun, FaChartLine, FaRobot
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

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: 'Pune, Maharashtra',
    crop: 'Wheat (गेहूं)'
  });
  const [error, setError]                             = useState('');
  const [success, setSuccess]                         = useState('');
  const [loading, setLoading]                         = useState(false);
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { language, setLanguage, t, languages } = useLanguage();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const cleanEmail = formData.email.trim().toLowerCase();
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

    if (!formData.name.trim()) {
      setError(
        language === 'en'
          ? 'Please enter your full name'
          : language === 'mr'
          ? 'कृपया आपले पूर्ण नाव प्रविष्ट करा'
          : 'कृपया अपना पूरा नाम दर्ज करें'
      );
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
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

    if (formData.password !== formData.confirmPassword) {
      setError(
        language === 'en'
          ? 'Passwords do not match'
          : language === 'mr'
          ? 'पासवर्ड जुळत नाहीत'
          : 'पासवर्ड मेल नहीं खाते'
      );
      setLoading(false);
      return;
    }

    try {
      const response = await API.post('/auth/register', {
        name: formData.name.trim(),
        email: cleanEmail,
        password: formData.password,
        role: 'farmer',
        location: formData.location.trim() || 'Maharashtra, India',
        crop: formData.crop.trim() || 'Wheat (गेहूं)'
      });

      if (response.data?.requiresVerification) {
        setSuccess(
          language === 'en'
            ? 'Verification code sent to your email! Redirecting...'
            : language === 'mr'
            ? 'पडताळणी कोड आपल्या ईमेलवर पाठवला आहे! कृपया प्रतीक्षा करा...'
            : 'सत्यापन कोड आपके ईमेल पर भेजा गया है! कृपया प्रतीक्षा करें...'
        );

        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(cleanEmail)}`);
        }, 700);
      } else {
        navigate(`/verify-email?email=${encodeURIComponent(cleanEmail)}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || (language === 'en' ? 'Registration failed' : 'पंजीकरण विफल रहा'));
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

      {/* ── Central Floating Glassmorphic Auth Card (Compact Executive View) ── */}
      <motion.div
        className="ks-floating-card-container"
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      >
        
        {/* Left Side: Brand Narrative & Capability Badges */}
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
              🌾 {language === 'en' ? 'Verified Farmer Registration' : 'शेतकरी नोंदणी'}
            </span>
            <h1>{language === 'en' ? 'Join Kisan Setu' : language === 'mr' ? 'किसान सेतू मध्ये सामील व्हा' : 'किसान सेतु से जुड़ें'}</h1>
            <p className="ks-companion-subtitle">
              {language === 'en'
                ? 'Your Smart Digital Farming Companion'
                : language === 'mr'
                ? 'आपला डिजिटल शेती साथी'
                : 'आपका स्मार्ट डिजिटल कृषि साथी'}
            </p>
            <p className="ks-narrative-desc">
              {language === 'en'
                ? 'Register with your verified email to access AI plant diagnostics, live APMC mandi prices, and micro-climate advisories.'
                : 'एआय पीक रोग निदान, थेट बाजारभाव आणि हवामान सल्ल्यासाठी आपल्या ईमेलद्वारे नोंदणी करा.'}
            </p>
          </div>

          {/* Feature Badges Grid */}
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

        {/* Right Side: Registration Form */}
        <div className="ks-card-form-panel">
          <div className="ks-form-header">
            <h2 className="ks-form-title">
              {language === 'en' ? 'Create Farmer Account' : language === 'mr' ? 'नवीन शेतकरी खाते' : 'नया किसान खाता बनाएं'}
            </h2>
            <p className="ks-form-sub">
              {language === 'en' ? 'Enter your details. We will verify your account via email OTP.' : 'आपली माहिती भरा. आम्ही ईमेल कोडद्वारे खात्याची पडताळणी करू.'}
            </p>
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
            
            {/* Full Name */}
            <div className="ks-input-group">
              <label className="ks-input-label">
                <FaUser style={{ color: '#15803d' }} /> {t.fullName || 'Farmer Full Name'} *
              </label>
              <input
                type="text"
                name="name"
                className="ks-text-input"
                placeholder={t.fullNamePlaceholder || 'e.g. Ramesh Patil'}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email Address */}
            <div className="ks-input-group">
              <label className="ks-input-label">
                <FaEnvelope style={{ color: '#15803d' }} /> {t.email || 'Email Address'} *
              </label>
              <input
                type="email"
                name="email"
                className="ks-text-input"
                placeholder="farmer@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* District & Primary Crop Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="ks-input-group">
                <label className="ks-input-label">
                  <FaMapMarkerAlt style={{ color: '#15803d' }} /> {t.district || 'District'}
                </label>
                <input
                  type="text"
                  name="location"
                  className="ks-text-input"
                  placeholder={t.districtPlaceholder || 'e.g. Pune'}
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="ks-input-group">
                <label className="ks-input-label">
                  <FaSeedling style={{ color: '#15803d' }} /> {t.mainCrop || 'Primary Crop'}
                </label>
                <input
                  type="text"
                  name="crop"
                  className="ks-text-input"
                  placeholder={t.mainCropPlaceholder || 'e.g. Wheat'}
                  value={formData.crop}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password & Confirm Password Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="ks-input-group">
                <label className="ks-input-label">
                  <FaLock style={{ color: '#15803d' }} /> {t.password || 'Password'} *
                </label>
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
                    name="password"
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
                    placeholder="••••••"
                    value={formData.password}
                    onChange={handleChange}
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

              <div className="ks-input-group">
                <label className="ks-input-label">
                  <FaLock style={{ color: '#15803d' }} /> {t.confirmPassword || 'Confirm'} *
                </label>
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
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
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
                    placeholder="••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="ks-password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="ks-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span>{language === 'en' ? 'Sending verification code...' : 'पडताळणी कोड पाठवत आहे...'}</span>
              ) : (
                <>
                  <span>{language === 'en' ? 'Continue to Email Verification' : 'ईमेल पडताळणीकडे पुढे जा'}</span>
                  <FaArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="ks-auth-footer-prompt">
            <span>{t.alreadyHaveAccount || 'Already registered on Kisan Setu?'}</span>
            <Link to="/login" className="ks-footer-link">
              {t.loginLink || 'Sign In Here'}
            </Link>
          </div>

        </div>

      </motion.div>

    </div>
  );
};

export default Register;
