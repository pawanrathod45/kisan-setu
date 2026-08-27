import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaBars, FaTimes, FaBell, FaCheckCircle, FaCloudRain,
  FaBug, FaChartLine, FaMicrophone, FaGlobe, FaCheck
} from 'react-icons/fa';
import ProfileDropdown from './ProfileDropdown';
import { useLanguage } from '../../context/LanguageContext';

const DashboardHeader = ({ toggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t, languages } = useLanguage();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [notifOpen, setNotifOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const sampleNotifs = [
    { id: 1, icon: <FaCloudRain />, color: '#0284c7', bg: '#e0f2fe', title: language === 'hi' ? 'कल आपके जिले में बारिश की संभावना' : language === 'mr' ? 'उद्या आपल्या जिल्ह्यात पावसाचा अंदाज' : 'Rain expected tomorrow in your district', sub: language === 'hi' ? 'दवा छिड़काव स्थगित करें' : language === 'mr' ? 'कीटकनाशक फवारणी पुढे ढकला' : 'Postpone pesticide spraying to avoid chemical runoff', time: '10m ago', read: false },
    { id: 2, icon: <FaBug />,       color: '#d97706', bg: '#fef3c7', title: language === 'hi' ? 'माहू/एफिड कीट प्रकोप चेतावनी' : language === 'mr' ? 'मावा कीड प्रादुर्भाव सतर्कता' : 'Aphid infestation alert in North zone', sub: language === 'hi' ? 'गेहूं के खेतों का निरीक्षण करें' : language === 'mr' ? 'गव्हाच्या पिकाची पाहणी करा' : 'Monitor wheat fields closely for yellowing leaf tips', time: '1h ago', read: false },
    { id: 3, icon: <FaChartLine />, color: '#155e2d', bg: '#dcfce7', title: language === 'hi' ? 'कपास मंडी भाव +5.8% बढ़े' : language === 'mr' ? 'कापूस बाजारभाव +5.8% वाढले' : 'Cotton Mandi modal price surged +5.8%', sub: language === 'hi' ? 'नजदीकी मंडी में उच्चतम भाव' : language === 'mr' ? 'जवळच्या बाजारात चांगला भाव' : 'Target sell price achieved in nearby market', time: '3h ago', read: true },
  ];

  const [notifs, setNotifs] = useState(sampleNotifs);

  const pageMetaMap = {
    '/farmer/dashboard':         { title: t.dashboard || 'Dashboard',                     emoji: '🌾', badge: 'Live Overview' },
    '/farmer/crops':             { title: t.myCrops || 'My Crops',                        emoji: '🌱', badge: 'Crop Manager' },
    '/farmer/tasks':             { title: t.tasksSowing || 'Tasks & Sowing',              emoji: '📅', badge: 'Daily Planner' },
    '/farmer/weather':           { title: t.weatherAdvisory || 'Weather Advisory',        emoji: '⛅', badge: '24h Forecast' },
    '/farmer/market':            { title: t.marketIntelligence || 'Market Intelligence',  emoji: '📈', badge: 'Mandi Rates' },
    '/farmer/ai-assistant':      { title: t.aiKrishiOfficer || 'AI Krishi Officer',       emoji: '🤖', badge: 'Smart Advisor' },
    '/farmer/disease-detection': { title: t.diseaseDetection || 'Disease Detection',      emoji: '🔬', badge: 'Instant Scan' },
    '/farmer/alerts':            { title: t.smartAlerts || 'Smart Alerts',                emoji: '🔔', badge: 'Priority Alerts' },
    '/farmer/calendar':          { title: t.cropCalendar || 'Crop Calendar',             emoji: '📆', badge: 'Season Stages' },
    '/farmer/analytics':         { title: t.farmAnalytics || 'Farm Analytics',            emoji: '📊', badge: 'Yield & Profits' },
    '/farmer/voice':             { title: t.voiceAssistant || 'Voice Assistant',          emoji: '🎙', badge: 'Hands-Free' },
    '/farmer/profile':           { title: t.farmerProfile || 'Farmer Profile',            emoji: '👤', badge: 'Account Info' },
    '/farmer/settings':          { title: t.farmSettings || 'Farm Settings',             emoji: '⚙️', badge: 'Preferences' },
  };

  const page = pageMetaMap[location.pathname] || { title: t.title || 'Kisan Setu', emoji: '🌾', badge: 'Smart Agriculture' };
  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(ns => ns.map(n => ({ ...n, read: true })));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

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

      {/* Right side: Quick Lang + Voice + Notifications + Profile */}
      <div className="header-right">
        {/* Compact Header Language Selector */}
        <div style={{ position: 'relative' }}>
          <button
            className="header-lang-btn"
            onClick={() => setLangDropdownOpen(o => !o)}
            title="Switch Language"
            aria-label="Switch Language"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 9px',
              borderRadius: '10px',
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              color: '#15803d',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <FaGlobe style={{ fontSize: '13px' }} />
            <span className="d-none d-md-inline">{currentLangObj.native || currentLangObj.name}</span>
          </button>

          {langDropdownOpen && (
            <>
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 1040 }} 
                onClick={() => setLangDropdownOpen(false)} 
              />
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  background: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 28px rgba(15, 23, 42, 0.14)',
                  border: '1.5px solid #e2ece3',
                  padding: '4px',
                  zIndex: 1050,
                  width: '130px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      background: language === l.code ? '#dcfce7' : 'transparent',
                      color: language === l.code ? '#15803d' : '#334155',
                      fontWeight: language === l.code ? 800 : 600,
                      fontSize: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s'
                    }}
                  >
                    <span>{l.native || l.name}</span>
                    {language === l.code && <FaCheck style={{ fontSize: '10px', color: '#15803d' }} />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Quick Voice Assistant shortcut (Desktop only) */}
        <button
          className="header-quick-action-btn d-none d-lg-inline-flex"
          onClick={() => navigate('/farmer/voice')}
          title="Open Voice Assistant"
          aria-label="Voice Assistant"
        >
          <FaMicrophone />
          <span className="header-quick-action-label">{t.voiceShortcut || 'Voice'}</span>
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
                    <span className="notif-panel-title">{t.farmNotifications || 'Farm Notifications'}</span>
                    {unreadCount > 0 && (
                      <span className="notif-unread-tag">{unreadCount} {t.newTag || 'new'}</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button className="notif-mark-read" onClick={markAllRead}>
                      <FaCheckCircle style={{ fontSize: '.75rem' }} /> {t.markAllRead || 'Mark all read'}
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
                  <span>{t.viewAllAlerts || 'View All Alerts & Advisories'}</span>
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

