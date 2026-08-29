import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBell, FaCloudRain, FaBug, FaChartLine, FaCheckCircle,
  FaExclamationTriangle, FaShieldAlt, FaCalendarPlus, FaFilter,
  FaCheck, FaUndo, FaSearch, FaBroadcastTower, FaComments
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import './AlertsPage.css';

const SEVERITY_CONFIG = {
  high:   { label: 'Critical Alert', color: '#dc2626', bg: '#fee2e2', border: '#fca5a5', icon: <FaExclamationTriangle /> },
  medium: { label: 'Moderate Risk',  color: '#d97706', bg: '#fef3c7', border: '#fcd34d', icon: <FaBell /> },
  low:    { label: 'Market / Info',  color: '#15803d', bg: '#dcfce7', border: '#86efac', icon: <FaCheckCircle /> },
};

const TYPE_CONFIG = {
  weather: { icon: <FaCloudRain />, label: 'Weather', color: '#0284c7', bg: '#e0f2fe' },
  pest:    { icon: <FaBug />,       label: 'Pest & Disease', color: '#b91c1c', bg: '#fee2e2' },
  market:  { icon: <FaChartLine />, label: 'Market Trend', color: '#15803d', bg: '#dcfce7' },
};

// Safe date formatter to prevent "Invalid Date"
const formatAlertDate = (dateVal) => {
  if (!dateVal) return 'Date unavailable';
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    // Attempt parsing DD/MM/YYYY or DD-MM-YYYY
    if (typeof dateVal === 'string') {
      const parts = dateVal.split(/[-/]/);
      if (parts.length === 3) {
        const parsed = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        if (!isNaN(parsed.getTime())) {
          return parsed.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
      }
    }
    return 'Date unavailable';
  } catch (e) {
    return 'Date unavailable';
  }
};

const AlertsPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [alerts, setAlerts]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('all'); // all | unread | resolved
  const [selectedType, setSelectedType] = useState('all'); // all | weather | pest | market
  const [searchQuery, setSearchQuery]   = useState('');
  const [resolvingId, setResolvingId]   = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/alerts');
      if (res.data && Array.isArray(res.data)) {
        setAlerts(res.data);
      }
    } catch (err) {
      console.warn('Alerts service: loaded empty state');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResolve = async (id, currentStatus) => {
    setResolvingId(id);
    try {
      await API.put(`/alerts/${id}`, { read: !currentStatus }).catch(() => {});
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, read: !currentStatus } : a));
    } finally {
      setResolvingId(null);
    }
  };

  const criticalCount = alerts.filter(a => !a.read && a.severity === 'high').length;
  const activeCount   = alerts.filter(a => !a.read).length;
  const resolvedCount = alerts.filter(a => a.read).length;

  /* Filtering */
  const filteredAlerts = alerts.filter(alert => {
    if (activeTab === 'unread' && alert.read) return false;
    if (activeTab === 'resolved' && !alert.read) return false;
    if (selectedType !== 'all' && alert.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return alert.title?.toLowerCase().includes(q) ||
             alert.description?.toLowerCase().includes(q) ||
             (alert.crop && alert.crop.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="alerts-page-container">
      
      {/* ─── Forest Hero Banner ─── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        className="alerts-hero-banner"
      >
        <div className="alerts-hero-left">
          <div className="alerts-hero-icon">
            <FaBell />
          </div>
          <div className="alerts-hero-titles">
            <h1>
              {t('alertsAdvisoriesTitle', 'Smart Agricultural Alerts & Hazard Radar')}
            </h1>
            <p>
              {t('dashboardSubtitle', 'Live real-time monitoring of severe weather warnings, pest/disease outbreaks, soil moisture deficits, and APMC Mandi price spikes.')}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            className="alerts-status-badge"
            style={{
              background: criticalCount > 0 ? 'rgba(239, 68, 68, 0.28)' : 'rgba(34, 197, 94, 0.22)',
              color: criticalCount > 0 ? '#fca5a5' : '#86efac',
              border: `1px solid ${criticalCount > 0 ? 'rgba(239, 68, 68, 0.45)' : 'rgba(34, 197, 94, 0.45)'}`,
            }}
          >
            <span
              className="alerts-pulse-dot"
              style={{
                background: criticalCount > 0 ? '#ef4444' : '#4ade80',
                boxShadow: `0 0 8px ${criticalCount > 0 ? '#ef4444' : '#4ade80'}`
              }}
            />
            {criticalCount > 0 ? `${criticalCount} ${t('criticalAlerts', 'CRITICAL THREATS')}` : t('allPendingTasksDone', 'ALL FIELDS CLEAR')}
          </div>
        </div>
      </motion.div>

      {/* ─── Metric Summary Counters ─── */}
      <div className="alerts-metrics-grid">
        <div className="alert-metric-card">
          <div className="alert-metric-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <FaExclamationTriangle />
          </div>
          <div>
            <div className="alert-metric-title" style={{ color: '#991b1b' }}>{t('criticalAlerts', 'Critical Urgency')}</div>
            <div className="alert-metric-val">{criticalCount}</div>
          </div>
        </div>

        <div className="alert-metric-card">
          <div className="alert-metric-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <FaCloudRain />
          </div>
          <div>
            <div className="alert-metric-title" style={{ color: '#075985' }}>{t('weatherAlerts', 'Weather Risks')}</div>
            <div className="alert-metric-val">{alerts.filter(a => a.type === 'weather' && !a.read).length}</div>
          </div>
        </div>

        <div className="alert-metric-card">
          <div className="alert-metric-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <FaBug />
          </div>
          <div>
            <div className="alert-metric-title" style={{ color: '#92400e' }}>{t('pestAlerts', 'Pest Outbreaks')}</div>
            <div className="alert-metric-val">{alerts.filter(a => a.type === 'pest' && !a.read).length}</div>
          </div>
        </div>

        <div className="alert-metric-card">
          <div className="alert-metric-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <FaChartLine />
          </div>
          <div>
            <div className="alert-metric-title" style={{ color: '#166534' }}>{t('marketAlerts', 'Market Spikes')}</div>
            <div className="alert-metric-val">{alerts.filter(a => a.type === 'market' && !a.read).length}</div>
          </div>
        </div>
      </div>

      {/* ─── Interactive Filter & Search Bar ─── */}
      <div className="alerts-filter-bar">
        {/* Status Tabs */}
        <div className="alerts-tabs-group">
          {[
            { id: 'all', label: `${t('all', 'All')} (${alerts.length})` },
            { id: 'unread', label: `${t('active', 'Active')} (${activeCount})` },
            { id: 'resolved', label: `${t('completed', 'Resolved')} (${resolvedCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="alert-tab-btn"
              style={{
                background: activeTab === tab.id ? '#155e2d' : '#f8fafc',
                color: activeTab === tab.id ? '#ffffff' : '#475569',
                border: `1.5px solid ${activeTab === tab.id ? '#155e2d' : '#e2e8f0'}`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Filter Chips */}
        <div className="alerts-chips-group">
          {[
            { id: 'all', label: t('all', 'All Types') },
            { id: 'weather', label: `🌧️ ${t('weatherAdvisory', 'Weather')}` },
            { id: 'pest', label: `🐛 ${t('pestAlerts', 'Pests')}` },
            { id: 'market', label: `📈 ${t('liveRates', 'Mandi Rates')}` },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedType(cat.id)}
              className="alert-chip-btn"
              style={{
                background: selectedType === cat.id ? '#f0fdf4' : '#ffffff',
                color: selectedType === cat.id ? '#155e2d' : '#64748b',
                border: `1.5px solid ${selectedType === cat.id ? '#86efac' : '#e2e8f0'}`,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="alerts-search-box">
          <FaSearch className="alerts-search-icon" />
          <input
            type="text"
            placeholder={language === 'hi' ? "फसल या चेतावनी खोजें…" : language === 'mr' ? "पीक किंवा अलर्ट शोधा…" : "Search crop or alert keyword…"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="alerts-search-input"
          />
        </div>
      </div>

      {/* ─── Responsive CSS Grid for Alerts Cards (2 columns desktop/tablet, 1 col mobile) ─── */}
      <div className="alerts-cards-grid">
        <AnimatePresence>
          {filteredAlerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="alerts-empty-state"
            >
              <FaCheckCircle style={{ fontSize: '42px', color: '#22c55e', marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800 }}>
                {language === 'hi' ? 'कोई चेतावनी नहीं मिली' : language === 'mr' ? 'कोणताही इशारा उपलब्ध नाही' : 'No alerts matching your criteria'}
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13.5px' }}>
                {language === 'hi' ? 'आपके क्षेत्र में सभी कृषि सुरक्षा पैरामीटर सामान्य हैं।' : language === 'mr' ? 'आपल्या परिसरातील सर्व कृषी मापदंड सुरक्षित आहेत.' : 'All agricultural safety parameters in your region are operating under normal conditions.'}
              </p>
            </motion.div>
          ) : (
            filteredAlerts.map(alert => {
              const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.medium;
              const typ = TYPE_CONFIG[alert.type] || TYPE_CONFIG.weather;
              const dateText = formatAlertDate(alert.date || alert.createdAt || alert.timestamp);

              return (
                <motion.div
                  key={alert._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="alert-item-card"
                  style={{
                    border: `1.5px solid ${alert.read ? '#e2ece3' : sev.border}`,
                    borderLeft: `5px solid ${sev.color}`,
                    boxShadow: alert.read ? 'none' : '0 4px 16px rgba(15, 23, 42, 0.05)',
                    opacity: alert.read ? 0.78 : 1,
                  }}
                >
                  <div>
                    <div className="alert-item-header">
                      <div className="alert-item-badges">
                        <span
                          className="alert-type-badge"
                          style={{ background: typ.bg, color: typ.color }}
                        >
                          {typ.icon} {typ.label}
                        </span>

                        {alert.crop && (
                          <span className="alert-crop-badge">
                            🌱 {alert.crop}
                          </span>
                        )}

                        <span
                          className="alert-severity-badge"
                          style={{ background: sev.bg, color: sev.color }}
                        >
                          {sev.label}
                        </span>
                      </div>

                      <div className="alert-date-label">
                        {dateText}
                      </div>
                    </div>

                    <h3 className="alert-card-title">
                      {alert.title}
                    </h3>

                    <p className="alert-card-desc">
                      {alert.description}
                    </p>

                    {alert.recommendedAction && (
                      <div className="alert-action-protocol-box">
                        <span style={{ fontWeight: 800, color: '#15803d', flexShrink: 0 }}>⚡ Action:</span>
                        <span>{alert.recommendedAction}</span>
                      </div>
                    )}
                  </div>

                  <div className="alert-card-footer">
                    <div className="alert-footer-actions-left">
                      <button
                        onClick={() => navigate('/farmer/tasks')}
                        className="alert-action-btn-planner"
                      >
                        <FaCalendarPlus /> Add to Planner
                      </button>

                      <button
                        onClick={() => navigate('/farmer/ai-assistant')}
                        className="alert-action-btn-ai"
                      >
                        <FaComments /> Ask AI Krishi Officer
                      </button>
                    </div>

                    <button
                      onClick={() => handleToggleResolve(alert._id, alert.read)}
                      disabled={resolvingId === alert._id}
                      className={`alert-resolve-btn ${alert.read ? 'resolved-btn' : 'active-btn'}`}
                    >
                      {alert.read ? <><FaUndo /> Mark as Active</> : <><FaCheck /> Mark as Resolved</>}
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default AlertsPage;
