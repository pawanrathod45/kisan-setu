import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLock, FaEnvelope, FaArrowRight, FaEye, FaEyeSlash
} from 'react-icons/fa';
import { GiWheat } from 'react-icons/gi';
import API from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Login.css';

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
    if (loading) return;

    setError('');
    setSuccess('');

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
      return;
    }

    setLoading(true);

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
        }, 500);
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
        className="ks-auth-card"
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
          <h1 className="ks-form-title">{t.loginHeading || 'Farmer Account Login'}</h1>
          <p className="ks-form-sub">
            {language === 'en'
              ? 'Enter your registered email and password to sign in.'
              : language === 'mr'
              ? 'आपला नोंदणीकृत ईमेल आणि पासवर्ड प्रविष्ट करा.'
              : 'अपना पंजीकृत ईमेल और पासवर्ड दर्ज करें।'}
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="ks-form-stack">
          
          {/* Email Field */}
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
              autoComplete="email"
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div className="ks-input-group">
            <label className="ks-input-label">
              <FaLock style={{ color: '#15803d' }} /> {t.password || 'Password'} *
            </label>
            <div className="ks-password-input-box">
              <input
                type={showPassword ? 'text' : 'password'}
                className="ks-password-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="ks-password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
                disabled={loading}
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
              <span>{t.loading || 'Signing In...'}</span>
            ) : (
              <>
                <span>{language === 'en' ? 'Sign In to Farm Portal' : language === 'mr' ? 'खात्यात प्रवेश करा' : 'लॉग इन करें'}</span>
                <FaArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Footer Prompt */}
        <div className="ks-auth-footer-prompt">
          <span>{t.dontHaveAccount || 'New to Kisan Setu?'}</span>
          <Link to="/register" className="ks-footer-link">
            {t.registerLink || 'Create Farmer Account'}
          </Link>
        </div>

      </motion.div>

    </div>
  );
};

export default Login;
