import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome, FaCloudSun, FaChartLine, FaRobot, FaCamera,
  FaBell, FaCalendarAlt, FaChartBar, FaMicrophone,
  FaUser, FaCog, FaSeedling, FaCalendarCheck, FaSignOutAlt,
  FaChevronRight, FaCheckCircle, FaTimes
} from 'react-icons/fa';
import { GiWheat } from 'react-icons/gi';
import { useLanguage } from '../../context/LanguageContext';
import ConfirmModal from './ConfirmModal';

const SidebarItem = ({ item, index, closeSidebar }) => (
  <motion.div
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.012, duration: 0.16 }}
  >
    <NavLink
      to={item.path}
      className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
      onClick={() => {
        if (closeSidebar) closeSidebar();
      }}
    >
      <div className="sidebar-icon-container" style={{ background: `${item.iconColor}16` }}>
        <item.icon className="sidebar-icon" style={{ color: item.iconColor }} />
      </div>

      <span className="sidebar-label">{item.label}</span>

      {item.badge && (
        <span
          className="sidebar-badge"
          style={{
            color: item.badgeColor || '#ffffff',
            background: item.badgeBg || 'rgba(255,255,255,0.12)',
            border: `1px solid ${item.badgeColor ? `${item.badgeColor}40` : 'rgba(255,255,255,0.15)'}`
          }}
        >
          {item.badge}
        </span>
      )}

      <FaChevronRight className="sidebar-active-arrow" />
    </NavLink>
  </motion.div>
);

const Sidebar = ({ isOpen, toggleSidebar, closeSidebar }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const primaryNav = [
    { path: '/farmer/dashboard',        icon: FaHome,          label: t.dashboard || 'Dashboard',                     iconColor: '#4ade80' },
    { path: '/farmer/crops',            icon: FaSeedling,      label: t.myCrops || 'My Crops',                        iconColor: '#22c55e' },
    { path: '/farmer/tasks',            icon: FaCalendarCheck, label: t.tasksSowing || 'Tasks & Sowing',              iconColor: '#c084fc', badge: 'Daily', badgeColor: '#c084fc', badgeBg: 'rgba(192, 132, 252, 0.18)' },
    { path: '/farmer/weather',          icon: FaCloudSun,      label: t.weatherAdvisory || 'Weather Advisory',        iconColor: '#38bdf8', badge: 'Live',  badgeColor: '#38bdf8', badgeBg: 'rgba(56, 189, 248, 0.18)' },
    { path: '/farmer/market',           icon: FaChartLine,     label: t.marketIntelligence || 'Market Intelligence',  iconColor: '#fbbf24', badge: 'Mandi', badgeColor: '#fbbf24', badgeBg: 'rgba(251, 191, 36, 0.18)' },
    { path: '/farmer/ai-assistant',     icon: FaRobot,         label: t.aiKrishiOfficer || 'AI Krishi Officer',       iconColor: '#2dd4bf', badge: '✨ AI',  badgeColor: '#2dd4bf', badgeBg: 'rgba(45, 212, 191, 0.22)' },
    { path: '/farmer/disease-detection',icon: FaCamera,        label: t.diseaseDetection || 'Disease Detection',      iconColor: '#f472b6', badge: 'Scan',  badgeColor: '#f472b6', badgeBg: 'rgba(244, 114, 182, 0.18)' },
    { path: '/farmer/alerts',           icon: FaBell,          label: t.smartAlerts || 'Smart Alerts',                iconColor: '#f87171', badge: '2 New', badgeColor: '#f87171', badgeBg: 'rgba(248, 113, 113, 0.22)' },
    { path: '/farmer/calendar',         icon: FaCalendarAlt,   label: t.cropCalendar || 'Crop Calendar',             iconColor: '#34d399' },
    { path: '/farmer/analytics',        icon: FaChartBar,      label: t.farmAnalytics || 'Farm Analytics',            iconColor: '#818cf8' },
    { path: '/farmer/voice',            icon: FaMicrophone,    label: t.voiceAssistant || 'Voice Assistant',          iconColor: '#a78bfa', badge: 'Mic',   badgeColor: '#a78bfa', badgeBg: 'rgba(167, 139, 250, 0.18)' },
  ];

  const secondaryNav = [
    { path: '/farmer/profile',  icon: FaUser, label: t.farmerProfile || 'Farmer Profile',  iconColor: '#60a5fa' },
    { path: '/farmer/settings', icon: FaCog,  label: t.farmSettings || 'Farm Settings',   iconColor: '#cbd5e1' },
  ];

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  return (
    <>
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title={t.signOutTitle || "Sign Out of Kisan Setu?"}
        message={t.signOutDesc || "Are you sure you want to logout? You can securely sign back in at any time."}
        confirmText={t.yesLogout || "Yes, Logout"}
        cancelText={t.cancel || "Cancel"}
        type="danger"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Main Navigation">
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand-left">
            <div className="sidebar-logo-wrap">
              <GiWheat className="sidebar-logo" />
            </div>
            <div className="sidebar-brand-text">
              <div className="sidebar-title-row">
                <h2 className="sidebar-title">{t.title || 'Kisan Setu'}</h2>
                <span className="sidebar-version-tag">🌾 FARMER</span>
              </div>
              <p className="sidebar-tagline">{t.tagline || 'Smart Farming Dashboard'}</p>
            </div>
          </div>

          {/* Close button visible only on mobile/tablet drawer */}
          <button
            className="sidebar-close-btn"
            onClick={closeSidebar || toggleSidebar}
            aria-label="Close navigation menu"
          >
            <FaTimes />
          </button>
        </div>

        {/* Scrollable Nav Section */}
        <nav className="sidebar-nav ks-scroll">
          <div className="sidebar-section-header">
            <span className="sidebar-group-label">{t.mainWorkspace || 'MAIN WORKSPACE'}</span>
          </div>

          <div className="sidebar-items-list">
            {primaryNav.map((item, i) => (
              <SidebarItem
                key={item.path}
                item={item}
                index={i}
                closeSidebar={closeSidebar}
              />
            ))}
          </div>

          <div className="sidebar-section-header" style={{ marginTop: '18px' }}>
            <span className="sidebar-group-label">{t.preferencesAccount || 'PREFERENCES & ACCOUNT'}</span>
          </div>

          <div className="sidebar-items-list">
            {secondaryNav.map((item, i) => (
              <SidebarItem
                key={item.path}
                item={item}
                index={primaryNav.length + i}
                closeSidebar={closeSidebar}
              />
            ))}
          </div>

          {/* Quick Farm Health Pulse Badge */}
          <div className="sidebar-health-card">
            <div className="sidebar-health-row">
              <div className="sidebar-health-beacon">
                <span className="sidebar-health-dot" />
                <span className="sidebar-health-title">{t.systemStatus || 'System Status'}</span>
              </div>
              <span className="sidebar-health-val">{t.operational || '100% Operational'}</span>
            </div>
          </div>
        </nav>

        {/* Pinned Bottom User Card */}
        <div className="sidebar-footer">
          <div className="sidebar-user-pill">
            <div className="sidebar-user-avatar-wrap">
              <img
                src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Farmer')}&background=d97706&color=fff&size=100&bold=true`}
                alt={user?.name || 'Farmer'}
                className="sidebar-user-avatar"
              />
              <span className="sidebar-user-online-dot" />
            </div>

            <div className="sidebar-user-info">
              <div className="sidebar-user-name-row">
                <span className="sidebar-user-name">{user?.name || 'Farmer User'}</span>
                <FaCheckCircle className="sidebar-user-verified" title="Verified Account" />
              </div>
              <span className="sidebar-user-role">{user?.crop ? `🌱 ${user.crop}` : '🌾 Precision Farmer'}</span>
            </div>

            <button
              className="sidebar-logout-icon-btn"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              <FaSignOutAlt className="sidebar-logout-icon" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSidebar || toggleSidebar}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

