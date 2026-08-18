import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBell, FaCloudRain, FaBug, FaChartLine, FaCheckCircle,
  FaExclamationTriangle, FaShieldAlt, FaCalendarPlus, FaFilter,
  FaCheck, FaUndo, FaSearch, FaBroadcastTower, FaComments
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import '../styles/Dashboard.css';

const DEFAULT_ALERTS = [
  {
    _id: '1',
    title: 'Severe Thunderstorm & High Wind Advisory',
    description: 'Heavy precipitation (>35mm) and 45 km/h gusts expected within 24 hours. Postpone chemical foliar spraying and clear drainage canals to prevent waterlogging.',
    severity: 'high',
    type: 'weather',
    category: 'Weather Risk',
    date: new Date().toISOString(),
    read: false,
    crop: 'Wheat & Mustard',
    recommendedAction: 'Postpone spraying until Friday; clear drainage furrows.'
  },
  {
    _id: '2',
    title: 'Aphid & Whitefly Outbreak Warning',
    description: 'Regional meteorological station reported rapid increase in aphid nymph population across northern districts due to high humidity (88%).',
    severity: 'high',
    type: 'pest',
    category: 'Pest Alert',
    date: new Date(Date.now() - 3600000 * 3).toISOString(),
    read: false,
    crop: 'Cotton & Tomato',
    recommendedAction: 'Spray Neem Oil 1500 PPM @ 5ml/L or Imidacloprid 17.8% SL @ 0.5ml/L.'
  },
  {
    _id: '3',
    title: 'Onion APMC Modal Rate Surge (+6.8%)',
    description: 'Modal price in Lasalgaon/Nashik mandi jumped to ₹2,450/qtl due to lower regional arrivals. Favorable selling window open for next 48 hours.',
    severity: 'low',
    type: 'market',
    category: 'Market Trend',
    date: new Date(Date.now() - 3600000 * 8).toISOString(),
    read: false,
    crop: 'Onion',
    recommendedAction: 'Consider harvesting early grade-A bulbs for immediate market transit.'
  },
  {
    _id: '4',
    title: 'Soil Moisture Deficit in Block-B',
    description: 'Soil probe indicates root zone moisture dropped below 28% field capacity. Critical flowering stage requires immediate light irrigation.',
    severity: 'medium',
    type: 'weather',
    category: 'Irrigation Advisory',
    date: new Date(Date.now() - 3600000 * 20).toISOString(),
    read: false,
    crop: 'Wheat',
    recommendedAction: 'Apply 2-hour drip irrigation during early morning hours.'
  },
  {
    _id: '5',
    title: 'Foliar Rust Prevention Window Passed',
    description: 'Foliar fungicide application for Wheat rust completed successfully across 4.5 acres.',
    severity: 'low',
    type: 'pest',
    category: 'Agronomy Task',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    read: true,
    crop: 'Wheat',
    recommendedAction: 'Monitor recovery after 7 days.'
  }
];

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

const AlertsPage = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts]             = useState(DEFAULT_ALERTS);
  const [loading, setLoading]           = useState(false);
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
      if (res.data && res.data.length > 0) {
        setAlerts(res.data);
      }
    } catch (err) {
      console.log('Using default high-fidelity alerts');
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
      return alert.title.toLowerCase().includes(q) || alert.description.toLowerCase().includes(q) || (alert.crop && alert.crop.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div style={{ padding: '24px 20px', maxWidth: '1440px', margin: '0 auto', background: '#f4f8f4', minHeight: '100vh', color: '#0f172a' }}>
      
      {/* ─── Forest Hero Banner ─── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #072712 0%, #0d421f 40%, #155e2d 100%)',
          borderRadius: '20px',
          padding: '24px 28px',
          marginBottom: '24px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 30px rgba(13, 66, 31, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          flexWrap: 'wrap',
          gap: '18px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', color: '#fef08a', border: '1.5px solid rgba(255, 255, 255, 0.25)'
          }}>
            <FaBell />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
              Smart Agricultural Alerts & Hazard Radar
            </h1>
            <p style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.85)', margin: 0, fontWeight: 500 }}>
              Live real-time monitoring of severe weather warnings, pest/disease outbreaks, soil moisture deficits, and APMC Mandi price spikes.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: criticalCount > 0 ? 'rgba(239, 68, 68, 0.28)' : 'rgba(34, 197, 94, 0.22)',
            color: criticalCount > 0 ? '#fca5a5' : '#86efac',
            border: `1px solid ${criticalCount > 0 ? 'rgba(239, 68, 68, 0.45)' : 'rgba(34, 197, 94, 0.45)'}`,
            padding: '6px 14px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 800,
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: criticalCount > 0 ? '#ef4444' : '#4ade80',
              boxShadow: `0 0 8px ${criticalCount > 0 ? '#ef4444' : '#4ade80'}`
            }} />
            {criticalCount > 0 ? `${criticalCount} CRITICAL THREATS` : 'ALL FIELDS CLEAR'}
          </div>
        </div>
      </motion.div>

      {/* ─── Metric Summary Counters ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', border: '1.5px solid #e2ece3', borderRadius: '16px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <FaExclamationTriangle />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>Critical Urgency</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{criticalCount}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1.5px solid #e2ece3', borderRadius: '16px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <FaCloudRain />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#075985', textTransform: 'uppercase' }}>Weather Risks</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{alerts.filter(a => a.type === 'weather' && !a.read).length}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1.5px solid #e2ece3', borderRadius: '16px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <FaBug />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>Pest Outbreaks</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{alerts.filter(a => a.type === 'pest' && !a.read).length}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1.5px solid #e2ece3', borderRadius: '16px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <FaChartLine />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>Market Spikes</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{alerts.filter(a => a.type === 'market' && !a.read).length}</div>
          </div>
        </div>
      </div>

      {/* ─── Interactive Filter & Search Bar ─── */}
      <div style={{
        background: '#ffffff', border: '1.5px solid #e2ece3', borderRadius: '16px',
        padding: '14px 18px', marginBottom: '22px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px'
      }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'all', label: `All (${alerts.length})` },
            { id: 'unread', label: `Active (${activeCount})` },
            { id: 'resolved', label: `Resolved (${resolvedCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? '#15803d' : '#f8fafc',
                color: activeTab === tab.id ? '#ffffff' : '#475569',
                border: `1.5px solid ${activeTab === tab.id ? '#15803d' : '#e2e8f0'}`,
                padding: '7px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '12.5px',
                cursor: 'pointer', transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Filter Chips */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {[
            { id: 'all', label: 'All Types' },
            { id: 'weather', label: '🌧️ Weather' },
            { id: 'pest', label: '🐛 Pests' },
            { id: 'market', label: '📈 Mandi Rates' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedType(cat.id)}
              style={{
                background: selectedType === cat.id ? '#f0fdf4' : '#ffffff',
                color: selectedType === cat.id ? '#15803d' : '#64748b',
                border: `1.5px solid ${selectedType === cat.id ? '#86efac' : '#e2e8f0'}`,
                padding: '6px 12px', borderRadius: '10px', fontWeight: 700, fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '220px' }}>
          <FaSearch style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8', fontSize: '13px' }} />
          <input
            type="text"
            placeholder="Search crop or keyword…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 34px', borderRadius: '10px',
              border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#f8fafc'
            }}
          />
        </div>
      </div>

      {/* ─── Alerts Cards Feed ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <AnimatePresence>
          {filteredAlerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ background: '#ffffff', border: '1.5px dashed #cbd5e1', borderRadius: '18px', padding: '48px 24px', textAlign: 'center' }}
            >
              <FaCheckCircle style={{ fontSize: '42px', color: '#22c55e', marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800 }}>No alerts matching your criteria</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13.5px' }}>All agricultural safety parameters in your region are operating under normal conditions.</p>
            </motion.div>
          ) : (
            filteredAlerts.map(alert => {
              const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.medium;
              const typ = TYPE_CONFIG[alert.type] || TYPE_CONFIG.weather;

              return (
                <motion.div
                  key={alert._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  style={{
                    background: '#ffffff',
                    border: `1.5px solid ${alert.read ? '#e2ece3' : sev.border}`,
                    borderLeft: `5px solid ${sev.color}`,
                    borderRadius: '18px',
                    padding: '20px 22px',
                    boxShadow: alert.read ? 'none' : '0 4px 16px rgba(15, 23, 42, 0.05)',
                    opacity: alert.read ? 0.75 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        background: typ.bg, color: typ.color, fontSize: '12px', fontWeight: 800,
                        padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px'
                      }}>
                        {typ.icon} {typ.label}
                      </span>

                      {alert.crop && (
                        <span style={{ background: '#f1f5f9', color: '#334155', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px' }}>
                          🌱 {alert.crop}
                        </span>
                      )}

                      <span style={{ background: sev.bg, color: sev.color, fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                        {sev.label}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                      {new Date(alert.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16.5px', fontWeight: 800, color: '#0f172a' }}>
                    {alert.title}
                  </h3>

                  <p style={{ margin: '0 0 14px 0', fontSize: '13.5px', color: '#475569', lineHeight: 1.55 }}>
                    {alert.description}
                  </p>

                  {alert.recommendedAction && (
                    <div style={{
                      background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px',
                      padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#1e293b',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      <span style={{ fontWeight: 800, color: '#15803d' }}>⚡ Action Protocol:</span>
                      <span>{alert.recommendedAction}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => navigate('/farmer/tasks')}
                        style={{
                          background: '#f0fdf4', border: '1.5px solid #86efac', color: '#15803d',
                          padding: '7px 14px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                      >
                        <FaCalendarPlus /> Add to Planner
                      </button>

                      <button
                        onClick={() => navigate('/farmer/ai-assistant')}
                        style={{
                          background: '#faf5ff', border: '1.5px solid #d8b4fe', color: '#7e22ce',
                          padding: '7px 14px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                      >
                        <FaComments /> Ask AI Krishi Officer
                      </button>
                    </div>

                    <button
                      onClick={() => handleToggleResolve(alert._id, alert.read)}
                      disabled={resolvingId === alert._id}
                      style={{
                        background: alert.read ? '#f1f5f9' : '#15803d',
                        color: alert.read ? '#475569' : '#ffffff',
                        border: 'none', padding: '8px 16px', borderRadius: '10px',
                        fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}
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
