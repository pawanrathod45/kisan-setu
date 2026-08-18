import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLock, FaMobileAlt, FaArrowRight, FaEye, FaEyeSlash,
  FaUser, FaMapMarkerAlt, FaSeedling, FaCloudSun, FaChartLine, FaRobot
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

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
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
  const [language, setLanguage]                       = useState(localStorage.getItem('language') || 'en');

  const t = translations[language] || translations.en;

  const handleLanguageChange = (code) => {
    setLanguage(code);
    localStorage.setItem('language', code);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const cleanPhone = formData.phone.trim().replace(/\D/g, '');

    if (cleanPhone.length !== 10) {
      setError(
        language === 'en'
          ? 'Please enter a valid 10-digit Indian mobile number'
          : language === 'mr'
          ? 'कृपया 10 अंकी वैध मोबाईल नंबर टाका'
          : 'कृपया 10-अंकीय मान्य मोबाइल नंबर दर्ज करें'
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
          : 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए'
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
          : 'पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते'
      );
      setLoading(false);
      return;
    }

    try {
      const response = await API.post('/auth/register', {
        name: formData.name,
        phone: cleanPhone,
        password: formData.password,
        location: formData.location,
        crop: formData.crop,
        role: 'farmer'
      });

      const { accessToken, token, refreshToken, user } = response.data;
      const validToken = accessToken || token;

      if (validToken) localStorage.setItem('token', validToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (user) localStorage.setItem('user', JSON.stringify(user));

      setSuccess(
        language === 'en'
          ? 'Registration successful! Welcome to Kisan Setu...'
          : language === 'mr'
          ? 'नोंदणी यशस्वी! किसान सेतूमध्ये आपले स्वागत आहे...'
          : 'पंजीकरण सफल! किसान सेतु डैशबोर्ड में आपका स्वागत है…'
      );

      setTimeout(() => {
        navigate('/farmer/dashboard');
      }, 1000);

    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.status === 409 || err.response?.data?.message?.includes('already')) {
        setError(
          language === 'en'
            ? 'Account already exists with this mobile number. Please login'
            : language === 'mr'
            ? 'हे खाते आधीच अस्तित्वात आहे. कृपया लॉगिन करा'
            : 'यह मोबाइल नंबर पहले से पंजीकृत है। कृपया लॉगिन करें'
        );
      } else {
        setError(err.response?.data?.message || (language === 'en' ? 'Registration failed' : 'पंजीकरण विफल रहा'));
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
        
        {/* Left Side: Brand Narrative & Feature Badges */}
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
              <span>{language === 'en' ? 'New Farmer Portal' : 'नवीन शेतकरी नोंदणी'}</span>
            </div>
            <h1>{t.registerHeading || 'New Farmer Registration'}</h1>
            <div className="ks-companion-subtitle">
              {t.showcaseTitle || 'Digital Agricultural Empowerment'}
            </div>
            <p>
              {t.showcaseDesc || 'Join India’s fastest-growing precision agriculture network. Empower your farm with AI disease diagnostics and APMC mandi rates.'}
            </p>
          </div>

          <div className="ks-card-badges-grid">
            
            <div className="ks-glass-badge">
              <div className="ks-glass-icon-box"><FaChartLine /></div>
              <span className="ks-glass-title">📈 {t.apmcTrans || 'Direct APMC Mandi Rates'}</span>
            </div>

            <div className="ks-glass-badge">
              <div className="ks-glass-icon-box"><FaRobot /></div>
              <span className="ks-glass-title">🤖 {t.aiAdvisor || '24/7 AI Crop Doctor'}</span>
            </div>

            <div className="ks-glass-badge">
              <div className="ks-glass-icon-box"><FaSeedling /></div>
              <span className="ks-glass-title">🌱 {t.freeAccess || '100% Free Kisan Platform'}</span>
            </div>

            <div className="ks-glass-badge">
              <div className="ks-glass-icon-box"><FaCloudSun /></div>
              <span className="ks-glass-title">🌦️ Smart Weather Alerts</span>
            </div>

          </div>

        </div>

        {/* Right Side: Registration Form */}
        <div className="ks-card-form-panel">
          
          <div className="ks-form-header">
            <h3>{t.registerHeading || 'New Farmer Registration'}</h3>
            <p>{t.registerSubheading || 'Fill in your details and start your digital farm account in 1 minute.'}</p>
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

            {/* Mobile Number */}
            <div className="ks-input-group">
              <label className="ks-input-label">
                <FaMobileAlt style={{ color: '#15803d' }} /> {t.mobile || 'Mobile Number'} *
              </label>
              <div className="ks-input-container">
                <span className="ks-country-badge">🇮🇳 +91</span>
                <input
                  type="tel"
                  name="phone"
                  className="ks-text-input has-prefix"
                  placeholder={t.mobilePlaceholder || '98765 43210'}
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  required
                />
              </div>
            </div>

            {/* District & Primary Crop Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="ks-input-group">
                <label className="ks-input-label">
                  <FaLock style={{ color: '#15803d' }} /> {t.password || 'Password'} *
                </label>
                <div className="ks-input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="ks-text-input"
                    placeholder="••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="ks-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="ks-input-group">
                <label className="ks-input-label">
                  <FaLock style={{ color: '#15803d' }} /> {t.confirmPassword || 'Confirm'} *
                </label>
                <div className="ks-input-container">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className="ks-text-input"
                    placeholder="••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="ks-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                <span>{t.creatingAccount || 'Creating farm account...'}</span>
              ) : (
                <>
                  <span>{t.registerBtn || 'Complete Registration'}</span>
                  <FaArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Footer Login Link */}
          <div className="ks-form-footer">
            <span style={{ color: '#64748b' }}>{t.alreadyAccount || 'Already have an account?'}</span>
            <Link to="/login" className="ks-register-link">
              {t.signInLink || 'Sign In Here'}
            </Link>
          </div>

        </div>

      </motion.div>

    </div>
  );
};

export default Register;
