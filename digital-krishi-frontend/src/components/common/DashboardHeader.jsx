import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaBars, FaTimes, FaBell, FaCheckCircle, FaCloudRain,
  FaBug, FaChartLine, FaMicrophone
} from 'react-icons/fa';
import ProfileDropdown from './ProfileDropdown';

const PAGE_META = {
  '/farmer/dashboard':         { title: 'Dashboard',           emoji: '🌾', badge: 'Live Overview' },
  '/farmer/crops':             { title: 'My Crops',            emoji: '🌱', badge: 'Crop Manager' },
  '/farmer/tasks':             { title: 'Tasks & Sowing',      emoji: '📅', badge: 'Daily Planner' },
  '/farmer/weather':           { title: 'Weather Advisory',    emoji: '⛅', badge: '24h Forecast' },
  '/farmer/market':            { title: 'Market Intelligence', emoji: '📈', badge: 'Mandi Rates' },
  '/farmer/ai-assistant':      { title: 'AI Krishi Officer',   emoji: '🤖', badge: 'Smart Advisor' },
  '/farmer/disease-detection': { title: 'Disease Detection',   emoji: '🔬', badge: 'Instant Scan' },
  '/farmer/alerts':            { title: 'Smart Alerts',        emoji: '🔔', badge: 'Priority Alerts' },
  '/farmer/calendar':          { title: 'Crop Calendar',       emoji: '📆', badge: 'Season Stages' },
  '/farmer/analytics':         { title: 'Farm Analytics',      emoji: '📊', badge: 'Yield & Profits' },
  '/farmer/voice':             { title: 'Voice Assistant',     emoji: '🎙', badge: 'Hands-Free' },
  '/farmer/profile':           { title: 'Farmer Profile',      emoji: '👤', badge: 'Account Info' },
  '/farmer/settings':          { title: 'Farm Settings',       emoji: '⚙️', badge: 'Preferences' },
};

const SAMPLE_NOTIFS = [
  { id: 1, icon: <FaCloudRain />, color: '#0284c7', bg: '#e0f2fe', title: 'Rain expected tomorrow in your district', sub: 'Postpone pesticide spraying to avoid chemical runoff', time: '10m ago', read: false },
  { id: 2, icon: <FaBug />,       color: '#d97706', bg: '#fef3c7', title: 'Aphid infestation alert in North zone', sub: 'Monitor wheat fields closely for yellowing leaf tips', time: '1h ago', read: false },
  { id: 3, icon: <FaChartLine />, color: '#155e2d', bg: '#dcfce7', title: 'Cotton Mandi modal price surged +5.8%', sub: 'Target sell price achieved in nearby market', time: '3h ago', read: true },
];

const DashboardHeader = ({ toggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState(SAMPLE_NOTIFS);

  const page = PAGE_META[location.pathname] || { title: 'Kisan Setu', emoji: '🌾', badge: 'Smart Agriculture' };
  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(ns => ns.map(n => ({ ...n, read: true })));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="dashboard-top-header">
      {/* Left side: Hamburger + Page Badge */}
      <div className="header-left">
        <button 
          className="hamburger-btn" 
          onClick={toggleSidebar} 
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className="header-page-title-box">
          <div className="header-page-icon-pill">
            <span className="header-page-emoji">{page.emoji}</span>
          </div>
          <div className="header-page-text-wrap">
            <div className="header-page-row">
              <h1 className="header-page-name">{page.title}</h1>
              <span className="header-page-badge">{page.badge}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Quick Voice + Notifications + Profile */}
      <div className="header-right">
        {/* Quick Voice Assistant shortcut */}
        <button
          className="header-quick-action-btn"
          onClick={() => navigate('/farmer/voice')}
          title="Open Voice Assistant"
          aria-label="Voice Assistant"
        >
          <FaMicrophone />
          <span className="header-quick-action-label">Voice</span>
        </button>

        {/* Notification Bell & Dropdown */}
        <div className="notif-wrapper">
          <button
            className={`header-bell-btn ${notifOpen ? 'active' : ''}`}
            onClick={() => setNotifOpen(o => !o)}
            aria-label="View farm notifications"
            aria-expanded={notifOpen}
          >
            <FaBell className="header-bell-svg-icon" />
            {unreadCount > 0 && (
              <span className="header-bell-badge">{unreadCount}</span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {notifOpen && (
            <>
              <div className="notif-backdrop" onClick={() => setNotifOpen(false)} />
              <div className="notif-panel">
                <div className="notif-panel-header">
                  <div className="notif-title-group">
                    <span className="notif-panel-title">Farm Notifications</span>
                    {unreadCount > 0 && (
                      <span className="notif-unread-tag">{unreadCount} new</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button className="notif-mark-read" onClick={markAllRead}>
                      <FaCheckCircle style={{ fontSize: '.75rem' }} /> Mark all read
                    </button>
                  )}
                </div>

                <div className="notif-list">
                  {notifs.map(n => (
                    <div
                      key={n.id}
                      className={`notif-item ${!n.read ? 'notif-item--unread' : ''}`}
                      onClick={() => {
                        setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x));
                      }}
                    >
                      <div className="notif-icon" style={{ background: n.bg, color: n.color }}>
                        {n.icon}
                      </div>
                      <div className="notif-content">
                        <p className="notif-title">{n.title}</p>
                        <p className="notif-sub">{n.sub}</p>
                        <span className="notif-time">{n.time}</span>
                      </div>
                      {!n.read && <span className="notif-dot" title="Unread" />}
                    </div>
                  ))}
                </div>

                <button
                  className="notif-view-all"
                  onClick={() => { setNotifOpen(false); navigate('/farmer/alerts'); }}
                >
                  <span>View All Alerts & Advisories</span>
                  <span className="notif-arrow">→</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <ProfileDropdown user={user} onLogout={handleLogout} />
      </div>
    </header>
  );
};

export default DashboardHeader;
