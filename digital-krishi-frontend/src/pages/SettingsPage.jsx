import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaCog, FaGlobe, FaBell, FaMoon, FaSun, FaShieldAlt, FaSignOutAlt,
  FaCheck, FaSave, FaRobot, FaLeaf, FaDatabase, FaTrashAlt
} from 'react-icons/fa';
import { GiWheat, GiFertilizerBag } from 'react-icons/gi';
import '../styles/Settings.css';
import { useLanguage } from '../context/LanguageContext';
import { usePWA } from '../context/PWAContext';
import ConfirmModal from '../components/common/ConfirmModal';
import { FaMobileAlt, FaDownload } from 'react-icons/fa';

/* Reusable Toggle */
const Toggle = ({ checked, onChange, disabled }) => (
  <button
    role="switch"
    aria-checked={checked}
    className={`settings-toggle ${checked ? 'settings-toggle--on' : ''}`}
    onClick={() => !disabled && onChange(!checked)}
    style={{ opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
  >
    <span className="settings-toggle-thumb" />
  </button>
);

const SettingsPage = () => {
  /* ── Global Language Context ── */
  const { language, setLanguage, t, languages } = useLanguage();
  const { isInstallable, installPWA, isInstalled } = usePWA();

  /* ── State ── */
  const [darkMode, setDarkMode]             = useState(localStorage.getItem('darkMode') === 'true');
  const [notifications, setNotifs]          = useState(localStorage.getItem('notifications') !== 'false');
  const [marketAlerts, setMarket]           = useState(localStorage.getItem('marketAlerts') !== 'false');
  const [weatherAlerts, setWeather]         = useState(localStorage.getItem('weatherAlerts') !== 'false');
  const [aiDiagnosticEngine, setAiEngine]   = useState(true);
  const [soilCardSync, setSoilSync]         = useState(true);
  const [calendarAutoSync, setCalSync]       = useState(true);
  const [saved, setSaved]                   = useState(false);
  const [clearedCache, setClearedCache]     = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /* Apply dark mode class on mount */
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, []);

  /* ── Handlers ── */
  const handleDarkMode = (val) => {
    setDarkMode(val);
    document.body.classList.toggle('dark-mode', val);
    localStorage.setItem('darkMode', val);
  };

  const handleLanguage = (code) => {
    setLanguage(code);
  };

  const handleSave = () => {
    localStorage.setItem('language', language);
    localStorage.setItem('darkMode', darkMode);
    localStorage.setItem('notifications', notifications);
    localStorage.setItem('marketAlerts', marketAlerts);
    localStorage.setItem('weatherAlerts', weatherAlerts);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClearCache = () => {
    setClearedCache(true);
    setTimeout(() => setClearedCache(false), 2500);
  };

  const confirmLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  /* ── Section Card Component ── */
  const Section = ({ icon, iconBg, iconColor, title, children }) => (
    <motion.div
      className="settings-section"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="settings-section-header">
        <span className="settings-section-icon" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </span>
        <h3 className="settings-section-title">{title}</h3>
      </div>
      <div className="settings-section-body">{children}</div>
    </motion.div>
  );

  const Row = ({ label, sub, children }) => (
    <div className="settings-row">
      <div className="settings-row-info">
        <span className="settings-row-label">{label}</span>
        {sub && <span className="settings-row-sub">{sub}</span>}
      </div>
      <div>{children}</div>
    </div>
  );

  return (
    <div className="settings-page">
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title={t.signOutTitle || "Terminate Farm Session?"}
        message={t.signOutDesc || "Are you sure you want to logout of Kisan Setu on this device?"}
        confirmText={t.yesLogout || "Yes, Logout"}
        cancelText={t.cancel || "Cancel"}
        type="danger"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
      
      {/* ─── Hero Banner ─── */}
      <motion.div className="settings-hero" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}>
        <div className="settings-hero-left">
          <div className="settings-hero-icon">
            <FaCog />
          </div>
          <div className="settings-hero-titles">
            <h1>{t.settingsTitle || 'Farm & System Configuration'}</h1>
            <p>{t.settingsSubtitle || 'Customize language dialects, precision AI thresholds, alert radars, and security preferences.'}</p>
          </div>
        </div>

        <button className="settings-btn-save" onClick={handleSave}>
          {saved ? <FaCheck style={{ color: '#15803d' }} /> : <FaSave />}
          <span>{saved ? (t.preferencesSaved || 'Preferences Saved!') : (t.savePreferences || 'Save All Preferences')}</span>
        </button>
      </motion.div>

      {/* ─── Settings Grid ─── */}
      <div className="settings-grid">
        
        {/* 1. Regional & Language */}
        <Section icon={<FaGlobe />} iconBg="#dcfce7" iconColor="#15803d" title={t.regionalLanguage || "Regional Dialect & Currency"}>
          <div className="settings-lang-grid">
            {languages.map(l => (
              <button
                key={l.code}
                className={`settings-lang-card ${language === l.code ? 'active' : ''}`}
                onClick={() => handleLanguage(l.code)}
                type="button"
              >
                <span className="settings-lang-native">{l.native || l.name}</span>
                <span className="settings-lang-name">{l.label || l.name}</span>
                {language === l.code && <FaCheck className="settings-lang-check" />}
              </button>
            ))}
          </div>

          <Row
            label={t.mandiCurrency || "Mandi Price Currency"}
            sub="Indian Rupee (₹ / Quintal) standardized across APMC markets"
          >
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '4px 10px', borderRadius: '8px' }}>
              ₹ INR (Standard)
            </span>
          </Row>
        </Section>

        {/* 2. Precision Agronomy AI */}
        <Section icon={<FaRobot />} iconBg="#e0e7ff" iconColor="#4338ca" title="Precision Agronomy AI Engine">
          <Row
            label="Google Gemini 2.5 Vision Diagnostics"
            sub="High-confidence multi-modal crop disease and pest identification"
          >
            <Toggle checked={aiDiagnosticEngine} onChange={setAiEngine} />
          </Row>

          <Row
            label="Soil Health Card Auto-Optimization"
            sub="Automatically adjust fertilizer NPK recommendations based on soil health test records"
          >
            <Toggle checked={soilCardSync} onChange={setSoilSync} />
          </Row>

          <Row
            label="Dynamic Crop Calendar Synchronization"
            sub="Auto-schedule drip irrigation and foliar sprays based on local precipitation radar"
          >
            <Toggle checked={calendarAutoSync} onChange={setCalSync} />
          </Row>
        </Section>

        {/* 3. Notifications & Alert Radars */}
        <Section icon={<FaBell />} iconBg="#fee2e2" iconColor="#dc2626" title="Notification Radars & Alerts">
          <Row
            label="Enable Real-Time Alerts"
            sub="Receive instant notifications on severe weather, pest outbreaks, and price surges"
          >
            <Toggle checked={notifications} onChange={setNotifs} />
          </Row>

          <Row
            label="Mandi Arbitrage & Price Spike Alerts"
            sub="Alert when modal APMC prices for your crop exceed 5% gain threshold"
          >
            <Toggle checked={marketAlerts} onChange={setMarket} disabled={!notifications} />
          </Row>

          <Row
            label="Meteorological Radar Warnings"
            sub="High-wind, hailstorm, and unseasonal rainfall advance warnings"
          >
            <Toggle checked={weatherAlerts} onChange={setWeather} disabled={!notifications} />
          </Row>
        </Section>

        {/* 4. Progressive Web App (PWA) Mobile Experience */}
        <Section icon={<FaMobileAlt />} iconBg="#dcfce7" iconColor="#15803d" title="Mobile App & PWA Status">
          <Row
            label="Kisan Setu Mobile App"
            sub={isInstalled ? "✓ App is installed on this device (Standalone Mode)" : "Install as an app on your Android, iOS, or Desktop device for 1-tap offline access"}
          >
            {isInstalled ? (
              <span style={{ background: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '12px', padding: '6px 12px', borderRadius: '8px' }}>
                ✓ Installed
              </span>
            ) : isInstallable ? (
              <button
                onClick={installPWA}
                style={{
                  background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaDownload /> Install App
              </button>
            ) : (
              <span style={{ background: '#f1f5f9', color: '#64748b', fontWeight: 600, fontSize: '12px', padding: '6px 12px', borderRadius: '8px' }}>
                PWA Ready (Use browser menu "Install" / "Add to Home Screen")
              </span>
            )}
          </Row>
        </Section>

        {/* 5. Account, Storage & Data Governance */}
        <Section icon={<FaShieldAlt />} iconBg="#fef3c7" iconColor="#d97706" title="Account Security & Data Management">
          <Row
            label="Offline Farm Data Cache"
            sub="Clear temporary cached advisory reports and image specimen data"
          >
            <button
              onClick={handleClearCache}
              style={{
                background: clearedCache ? '#dcfce7' : '#f8fafc',
                border: '1.5px solid #cbd5e1',
                color: clearedCache ? '#15803d' : '#475569',
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaTrashAlt /> {clearedCache ? '✓ Cache Cleared' : 'Clear Cache'}
            </button>
          </Row>

          <Row
            label="Farm Account Session"
            sub="Securely sign out of your Kisan Setu session on this device"
          >
            <button
              onClick={handleLogout}
              style={{
                background: '#fee2e2',
                border: '1.5px solid #fca5a5',
                color: '#dc2626',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaSignOutAlt /> Terminate Session
            </button>
          </Row>
        </Section>

      </div>

    </div>
  );
};

export default SettingsPage;
