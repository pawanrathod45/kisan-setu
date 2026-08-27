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
  FaHome
} from "react-icons/fa";
import ConfirmModal from "../common/ConfirmModal";

const ADMIN_PAGE_META = {
  "/admin/dashboard": { title: "Executive Command Center", subtitle: "Real-time ecosystem metrics & analytics", emoji: "📊", badge: "Live System" },
  "/admin/users":     { title: "User Directory & Access",   subtitle: "Manage farmer and officer accounts",       emoji: "👥", badge: "MongoDB Users" },
  "/admin/crops":     { title: "Agricultural Monitoring",  subtitle: "Crops, acreages & AI disease diagnostics", emoji: "🌱", badge: "Crop Health" },
  "/admin/alerts":    { title: "Broadcast & Alert Radar",   subtitle: "Dispatched system warnings & advisories", emoji: "🔔", badge: "Live Dispatch" },
  "/admin/system":    { title: "Database & Node Health",    subtitle: "MongoDB connection & memory diagnostics",  emoji: "🖥️", badge: "Infrastructure" },
};

const AdminHeader = ({ toggleSidebar, sidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const page = ADMIN_PAGE_META[location.pathname] || {
    title: "Admin Command Center",
    subtitle: "Precision Agriculture Administration",
    emoji: "🛡️",
    badge: "Admin"
  };

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Sign Out of Admin Console?"
        message="Are you sure you want to logout? You can securely sign back in with admin credentials at any time."
        confirmText="Yes, Logout"
        cancelText="Cancel"
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
          {/* Live DB Connection Badge */}
          <div className="admin-db-pill d-none d-md-flex">
            <FaDatabase style={{ color: "#22c55e", fontSize: "12px" }} />
            <span>MongoDB Connected</span>
          </div>

          {/* Quick Broadcast Button */}
          <button
            className="admin-quick-broadcast-btn"
            onClick={() => navigate("/admin/alerts")}
            title="Dispatch Broadcast Alert"
          >
            <FaBell />
            <span className="d-none d-sm-inline">Dispatch Alert</span>
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
                <span className="admin-profile-name">{user?.name || "Admin"}</span>
                <span className="admin-profile-sub">SuperAdmin</span>
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
                    <span>Sign Out</span>
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
