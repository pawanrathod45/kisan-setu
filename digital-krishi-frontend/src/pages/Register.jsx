import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLock, FaMobileAlt, FaArrowRight, FaEye, FaEyeSlash,
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

  const { language, setLanguage, t, languages } = useLanguage();

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
          : 'कृपया मान्य 10-अंकीय मोबाइल नंबर दर्ज करें'
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
        phone: cleanPhone,
        password: formData.password,
        role: 'farmer',
        location: formData.location.trim() || 'Maharashtra, India',
        crop: formData.crop.trim() || 'Wheat (गेहूं)'
      });

      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        setSuccess(
          language === 'en'
            ? 'Account created successfully! Loading dashboard...'
            : language === 'mr'
            ? 'नोंदणी यशस्वी! डॅशबोर्ड सुरू होत आहे...'
            : 'पंजीकरण सफल! डैशबोर्ड लोड हो रहा है...'
        );

        setTimeout(() => {
          navigate('/farmer/dashboard');
        }, 700);
      } else {
        throw new Error('Missing registration token');
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
              <h2>{t.title || 'किसान सेतु'}</h2>
              <p>{t.tagline || 'सटीक कृषि और क्लाउड एआई'}</p>
            </div>
          </div>

          <div className="ks-card-narrative">
            <span className="ks-narrative-tag">
              🌾 {language === 'en' ? 'New Farmer Portal' : 'नवीन शेतकरी नोंदणी'}
            </span>
            <h1>{t.registerHeading || 'New Farmer Registration'}</h1>
            <p className="ks-companion-subtitle">
              {t.registerSubheading || 'Fill in your details and start your digital farm account in 1 minute.'}
            </p>
          </div>

          {/* 3 Value Pillars */}
          <div className="ks-card-badges-grid">
            <div className="ks-glass-badge">
              <div className="ks-glass-icon-box"><FaCloudSun /></div>
              <span className="ks-glass-title">100% Free Kisan Access</span>
            </div>

            <div className="ks-glass-badge">
              <div className="ks-glass-icon-box"><FaRobot /></div>
              <span className="ks-glass-title">24/7 AI Agronomist</span>
            </div>

            <div className="ks-glass-badge">
              <div className="ks-glass-icon-box"><FaChartLine /></div>
              <span className="ks-glass-title">Direct APMC Mandi Rates</span>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="ks-card-form-panel">
          <div className="ks-form-header">
            <h2 className="ks-form-title">{t.registerHeading || 'New Farmer Registration'}</h2>
            <p className="ks-form-sub">{t.registerSubheading || 'Fill in your details and start your digital farm account.'}</p>
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

            {/* Mobile Number - Two distinct side-by-side boxes (Zero overlap possible) */}
            <div className="ks-input-group">
              <label className="ks-input-label">
                <FaMobileAlt style={{ color: '#15803d' }} /> {t.mobile || 'Mobile Number'} *
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    background: '#dcfce7',
                    border: '1.5px solid #86efac',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    color: '#15803d',
                    fontWeight: 800,
                    fontSize: '14px',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                    lineHeight: 1
                  }}
                >
                  <span style={{ fontSize: '15px' }}>🇮🇳</span>
                  <span>+91</span>
                </div>

                <input
                  type="tel"
                  name="phone"
                  style={{
                    flex: '1 1 auto',
                    minWidth: 0,
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: '15px',
                    color: '#0f172a',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder={t.mobilePlaceholder || '10-digit mobile number'}
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  required
                />
              </div>
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
                    aria-label="Toggle confirm password visibility"
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
                <span>{t.creatingAccount || 'Creating farm account...'}</span>
              ) : (
                <>
                  <span>{t.registerBtn || 'Complete Registration'}</span>
                  <FaArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Footer Sign In Link */}
          <div className="ks-auth-footer-prompt">
            <span>{t.alreadyAccount || 'Already have an account?'}</span>
            <Link to="/login" className="ks-footer-link">
              {t.signInLink || 'Sign In Here'}
            </Link>
          </div>

        </div>

      </motion.div>

    </div>
  );
};

export default Register;
