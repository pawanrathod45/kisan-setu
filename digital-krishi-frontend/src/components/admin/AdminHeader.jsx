import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaShieldAlt,
  FaDatabase,
  FaSignOutAlt,
  FaBell,
  FaUserShield,
  FaHome,
  FaGlobe,
  FaChevronDown
} from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";
import ConfirmModal from "../common/ConfirmModal";

const AdminHeader = ({ toggleSidebar, sidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t, languages } = useLanguage();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const getPageMeta = () => {
    switch (location.pathname) {
      case "/admin/dashboard":
        return { title: t('adminConsole', 'Command Center'), subtitle: t('precisionEngine', 'Real-time ecosystem metrics & analytics'), emoji: "📊", badge: "Live" };
      case "/admin/users":
        return { title: t('adminUsers', 'User Directory'), subtitle: "Manage farmer and officer accounts", emoji: "👥", badge: "Users" };
      case "/admin/crops":
        return { title: t('adminCrops', 'Agricultural Monitoring'), subtitle: "Crops, acreages & AI diagnostics", emoji: "🌱", badge: "Crops" };
      case "/admin/alerts":
        return { title: t('adminAlerts', 'Broadcast & Alerts'), subtitle: "Dispatched warnings & advisories", emoji: "🔔", badge: "Alerts" };
      case "/admin/reports":
        return { title: t('adminReports', 'Analytics & Reports'), subtitle: "MongoDB aggregated metrics & audit history", emoji: "📈", badge: "Reports" };
      case "/admin/system":
        return { title: t('adminSystem', 'Database Health'), subtitle: "MongoDB connection & diagnostics", emoji: "🖥️", badge: "Database" };
      default:
        return { title: t('adminConsole', 'Admin Command Center'), subtitle: "Precision Agriculture Administration", emoji: "🛡️", badge: "Admin" };
    }
  };

  const page = getPageMeta();

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setLangOpen(false);
  };

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title={t('signOutTitle', 'Sign Out of Admin Console?')}
        message={t('signOutDesc', 'Are you sure you want to logout? You can securely sign back in with admin credentials at any time.')}
        confirmText={t('yesLogout', 'Yes, Logout')}
        cancelText={t('cancel', 'Cancel')}
        type="danger"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <header className="admin-top-header">
        {/* Left: Hamburger + Page Info */}
        <div className="admin-header-left">
          <button
            className="admin-hamburger-btn"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>

          <div className="admin-header-title-wrap">
            <div className="admin-header-icon-pill">
              <span>{page.emoji}</span>
            </div>
            <div className="admin-header-text">
              <div className="admin-header-title-row">
                <h1 className="admin-header-title">{page.title}</h1>
                <span className="admin-header-badge">{page.badge}</span>
              </div>
              <p className="admin-header-subtitle">{page.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions & Admin Profile */}
        <div className="admin-header-right">
          {/* Live DB Connection Badge with Pulsing Beacon */}
          <div className="admin-db-pill d-none d-md-flex">
            <span className="admin-pulse-dot" />
            <FaDatabase style={{ color: "#16a34a", fontSize: "12px" }} />
            <span>{t('clusterConnected', 'MongoDB Connected')}</span>
          </div>

          {/* Language Selector Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              className="lang-select-btn"
              onClick={() => setLangOpen(o => !o)}
              title="Switch Language"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <FaGlobe style={{ color: '#4ade80' }} />
              <span>{currentLangObj.native}</span>
              <FaChevronDown style={{ fontSize: '9px', opacity: 0.7 }} />
            </button>

            {langOpen && (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 1040 }}
                  onClick={() => setLangOpen(false)}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    zIndex: 1050,
                    background: "#0f172a",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "10px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                    minWidth: "140px",
                    padding: "6px"
                  }}
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleLanguageChange(l.code)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "8px 12px",
                        border: "none",
                        background: language === l.code ? "rgba(34, 197, 94, 0.15)" : "transparent",
                        color: language === l.code ? "#4ade80" : "#cbd5e1",
                        fontSize: "12px",
                        fontWeight: language === l.code ? 700 : 500,
                        borderRadius: "6px",
                        cursor: "pointer",
                        textAlign: "left"
                      }}
                    >
                      <span>{l.native}</span>
                      {language === l.code && <span style={{ color: "#4ade80" }}>✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quick Broadcast Button */}
          <button
            className="admin-quick-broadcast-btn"
            onClick={() => navigate("/admin/alerts")}
            title="Dispatch Broadcast Alert"
          >
            <FaBell className="admin-bell-icon" />
            <span className="d-none d-sm-inline">{t('dispatchAlert', 'Dispatch Alert')}</span>
          </button>

          {/* Profile Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              className="admin-profile-btn"
              onClick={() => setProfileOpen(o => !o)}
              aria-label="Admin account menu"
            >
              <div className="admin-profile-avatar">
                <FaUserShield />
              </div>
              <div className="admin-profile-text d-none d-lg-block">
                <span className="admin-profile-name">{user?.name || "Kisan Setu Super Admin"}</span>
                <span className="admin-profile-sub">Super Admin</span>
              </div>
            </button>

            {profileOpen && (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 1040 }}
                  onClick={() => setProfileOpen(false)}
                />
                <div className="admin-profile-dropdown">
                  <div className="admin-dropdown-header">
                    <p className="admin-dropdown-user">{user?.name || "Super Admin"}</p>
                    <p className="admin-dropdown-phone">{user?.phone || "+91 99999 99999"}</p>
                    <span className="admin-dropdown-role-tag">👑 System Administrator</span>
                  </div>

                  <div className="admin-dropdown-divider" />

                  <button
                    className="admin-dropdown-item"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/farmer/dashboard");
                    }}
                  >
                    <FaHome style={{ color: "#22c55e" }} />
                    <span>Switch to Farmer View</span>
                  </button>

                  <button
                    className="admin-dropdown-item"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/admin/system");
                    }}
                  >
                    <FaDatabase style={{ color: "#38bdf8" }} />
                    <span>Database Diagnostics</span>
                  </button>

                  <div className="admin-dropdown-divider" />

                  <button
                    className="admin-dropdown-item text-danger"
                    onClick={() => {
                      setProfileOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                  >
                    <FaSignOutAlt style={{ color: "#ef4444" }} />
                    <span>{t('signOut', 'Sign Out')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default AdminHeader;
