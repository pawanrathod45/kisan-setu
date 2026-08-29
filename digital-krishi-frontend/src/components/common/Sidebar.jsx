import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome, FaCloudSun, FaChartLine, FaRobot, FaCamera,
  FaBell, FaCalendarAlt, FaChartBar, FaMicrophone,
  FaUser, FaCog, FaSeedling, FaCalendarCheck, FaSignOutAlt,
  FaChevronRight, FaCheckCircle, FaTimes, FaLandmark
} from 'react-icons/fa';
import { GiWheat } from 'react-icons/gi';
import { useLanguage } from '../../context/LanguageContext';
import ConfirmModal from './ConfirmModal';

const SidebarItem = ({ item, index, closeSidebar }) => (
  <motion.div
    initial={{ opacity: 0, x: -6 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.012, duration: 0.15 }}
  >
    <NavLink
      to={item.path}
      className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
      onClick={() => {
        if (closeSidebar) closeSidebar();
      }}
    >
      <div className="sidebar-icon-container">
        <item.icon className="sidebar-icon" style={{ color: item.iconColor }} />
      </div>

      <span className="sidebar-label">{item.label}</span>

      {item.badge && (
        <span
          className="sidebar-badge"
          style={{
            color: item.badgeColor || '#15803d',
            background: item.badgeBg || '#dcfce7',
            border: `1px solid ${item.badgeColor ? `${item.badgeColor}35` : '#bbf7d0'}`
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

  const navGroups = [
    {
      group: t.mainWorkspace || 'MAIN WORKSPACE',
      items: [
        { path: '/farmer/dashboard',        icon: FaHome,          label: t.dashboard || 'Dashboard',                     iconColor: '#15803d' },
        { path: '/farmer/crops',            icon: FaSeedling,      label: t.myCrops || 'My Crops',                        iconColor: '#16a34a' },
        { path: '/farmer/tasks',            icon: FaCalendarCheck, label: t.tasksSowing || 'Tasks & Sowing',              iconColor: '#7c3aed', badge: 'Daily', badgeColor: '#7c3aed', badgeBg: 'rgba(124, 58, 237, 0.12)' },
        { path: '/farmer/calendar',         icon: FaCalendarAlt,   label: t.cropCalendar || 'Crop Calendar',             iconColor: '#059669' },
      ]
    },
    {
      group: t.intelligenceGroup || 'FARM INTELLIGENCE',
      items: [
        { path: '/farmer/weather',          icon: FaCloudSun,      label: t.weatherAdvisory || 'Weather Advisory',        iconColor: '#0284c7', badge: 'Live',  badgeColor: '#0284c7', badgeBg: 'rgba(2, 132, 199, 0.12)' },
        { path: '/farmer/market',           icon: FaChartLine,     label: t.marketIntelligence || 'Market Intelligence',  iconColor: '#d97706', badge: 'Mandi', badgeColor: '#d97706', badgeBg: 'rgba(217, 119, 6, 0.12)' },
        { path: '/farmer/ai-assistant',     icon: FaRobot,         label: t.aiKrishiOfficer || 'AI Krishi Officer',       iconColor: '#0d9488', badge: '✨ AI',  badgeColor: '#0d9488', badgeBg: 'rgba(13, 148, 136, 0.14)' },
        { path: '/farmer/disease-detection',icon: FaCamera,        label: t.diseaseDetection || 'Disease Detection',      iconColor: '#db2777', badge: 'Scan',  badgeColor: '#db2777', badgeBg: 'rgba(219, 39, 119, 0.12)' },
        { path: '/farmer/alerts',           icon: FaBell,          label: t.smartAlerts || 'Smart Alerts',                iconColor: '#dc2626', badge: 'Alerts', badgeColor: '#dc2626', badgeBg: 'rgba(220, 38, 38, 0.12)' },
        { path: '/farmer/voice',            icon: FaMicrophone,    label: t.voiceAssistant || 'Voice Assistant',          iconColor: '#9333ea', badge: 'Mic',   badgeColor: '#9333ea', badgeBg: 'rgba(147, 51, 234, 0.12)' },
        { path: '/farmer/schemes',          icon: FaLandmark,      label: t.govtSchemes || 'Govt Schemes',                iconColor: '#059669', badge: 'MahaDBT', badgeColor: '#059669', badgeBg: 'rgba(5, 150, 105, 0.12)' },
        { path: '/farmer/analytics',        icon: FaChartBar,      label: t.farmAnalytics || 'Farm Analytics',            iconColor: '#4f46e5' },
      ]
    },
    {
      group: t.preferencesAccount || 'ACCOUNT & SETTINGS',
      items: [
        { path: '/farmer/profile',  icon: FaUser, label: t.farmerProfile || 'Farmer Profile',  iconColor: '#2563eb' },
        { path: '/farmer/settings', icon: FaCog,  label: t.farmSettings || 'Farm Settings',   iconColor: '#475569' },
      ]
    }
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

        {/* Scrollable Nav Section with Clear Semantic Hierarchy */}
        <nav className="sidebar-nav ks-scroll">
          {navGroups.map((groupObj, gIdx) => (
            <div key={groupObj.group} className="sidebar-nav-group-box">
              <div className="sidebar-section-header">
                <span className="sidebar-group-label">{groupObj.group}</span>
              </div>

              <div className="sidebar-items-list">
                {groupObj.items.map((item, i) => (
                  <SidebarItem
                    key={item.path}
                    item={item}
                    index={gIdx * 4 + i}
                    closeSidebar={closeSidebar}
                  />
                ))}
              </div>
            </div>
          ))}

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
                src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Farmer')}&background=15803d&color=fff&size=100&bold=true`}
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
