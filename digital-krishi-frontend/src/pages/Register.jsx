import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLock, FaEnvelope, FaArrowRight, FaEye, FaEyeSlash,
  FaUser, FaMapMarkerAlt, FaSeedling
} from 'react-icons/fa';
import { GiWheat } from 'react-icons/gi';
import API from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Login.css';

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
      let msg = err.response?.data?.message || '';
      // Sanitize raw MongoDB/database errors — never expose internals
      if (!msg || msg.includes('E11000') || msg.includes('duplicate key') || msg.includes('MongoServer')) {
        msg = language === 'en'
          ? 'This email is already registered. Please use another email or sign in.'
          : language === 'mr'
          ? 'हा ईमेल आधीच नोंदणीकृत आहे. कृपया दुसरा ईमेल वापरा किंवा साइन इन करा.'
          : 'यह ईमेल पहले से पंजीकृत है। कृपया दूसरा ईमेल उपयोग करें या साइन इन करें।';
      }
      setError(msg || (language === 'en' ? 'Registration failed' : 'पंजीकरण विफल रहा'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ks-auth-viewport">

      {/* ── High-Res Farming Hero Background ── */}
      <div
        className="ks-fullscreen-video-bg"
        style={{
          backgroundImage: `url(${FARMER_POSTER_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* ── Dark Green Gradient Overlay ── */}
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

      {/* ── Centered Auth Card ── */}
      <motion.div
        className="ks-auth-card ks-register-card"
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        
        {/* Brand Header */}
        <div className="ks-auth-brand-header">
          <div className="ks-brand-logo-badge">
            <GiWheat />
          </div>
          <div className="ks-brand-header-text">
            <h2>{t.title || 'किसान सेतु'}</h2>
            <p>{t.tagline || 'सटीक कृषि और क्लाउड एआई'}</p>
          </div>
        </div>

        {/* Form Title */}
        <div className="ks-form-header">
          <h1 className="ks-form-title">
            {language === 'en' ? 'Create Farmer Account' : language === 'mr' ? 'नवीन शेतकरी खाते' : 'नया किसान खाता बनाएं'}
          </h1>
          <p className="ks-form-sub">
            {language === 'en'
              ? 'Enter your details below to get started with Kisan Setu.'
              : language === 'mr'
              ? 'आपली माहिती भरा. आम्ही ईमेल पडताळणीद्वारे खाते सुरू करू.'
              : 'अपनी जानकारी भरें। ईमेल सत्यापन द्वारा खाता सक्रिय होगा।'}
          </p>
        </div>

        {/* Error / Success Notifications */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="ks-auth-alert error"
            >
              ⚠️ {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="ks-auth-alert success"
            >
              ✅ {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Registration Form */}
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
              autoComplete="name"
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
              autoComplete="email"
            />
          </div>

          {/* District & Primary Crop Row */}
          <div className="ks-register-row-2col">
            <div className="ks-input-group">
              <label className="ks-input-label">
                <FaMapMarkerAlt style={{ color: '#15803d' }} /> {t.district || 'District / Location'}
              </label>
              <input
                type="text"
                name="location"
                className="ks-text-input"
                placeholder={t.districtPlaceholder || 'e.g. Pune, Maharashtra'}
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
                placeholder={t.mainCropPlaceholder || 'e.g. Wheat (गेहूं)'}
                value={formData.crop}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password & Confirm Password Row */}
          <div className="ks-register-row-2col">
            <div className="ks-input-group">
              <label className="ks-input-label">
                <FaLock style={{ color: '#15803d' }} /> {t.password || 'Password'} *
              </label>
              <div className="ks-password-input-box">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="ks-password-field"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="ks-password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="ks-input-group">
              <label className="ks-input-label">
                <FaLock style={{ color: '#15803d' }} /> {t.confirmPassword || 'Confirm'} *
              </label>
              <div className="ks-password-input-box">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="ks-password-field"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="ks-password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle password visibility"
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
              <span>{language === 'en' ? 'Sending code...' : 'पडताळणी कोड पाठवत आहे...'}</span>
            ) : (
              <>
                <span>{language === 'en' ? 'Continue to Email Verification' : 'ईमेल पडताळणीकडे पुढे जा'}</span>
                <FaArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="ks-auth-footer-prompt">
          <span>{t.alreadyHaveAccount || 'Already registered on Kisan Setu?'}</span>
          <Link to="/login" className="ks-footer-link">
            {t.loginLink || 'Sign In Here'}
          </Link>
        </div>

      </motion.div>

    </div>
  );
};

export default Register;
