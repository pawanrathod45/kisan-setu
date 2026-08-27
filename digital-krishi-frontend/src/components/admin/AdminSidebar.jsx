import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartPie,
  FaUsers,
  FaSeedling,
  FaBell,
  FaServer,
  FaShieldAlt,
  FaSignOutAlt,
  FaChevronRight,
  FaTimes,
  FaExternalLinkAlt
} from "react-icons/fa";
import { GiWheat } from "react-icons/gi";
import ConfirmModal from "../common/ConfirmModal";

const ADMIN_NAV = [
  { path: "/admin/dashboard", icon: FaChartPie, label: "Command Center", badge: "Live", badgeColor: "#4ade80", iconColor: "#4ade80" },
  { path: "/admin/users", icon: FaUsers, label: "User Directory", iconColor: "#60a5fa" },
  { path: "/admin/crops", icon: FaSeedling, label: "Crop Monitoring", iconColor: "#34d399" },
  { path: "/admin/alerts", icon: FaBell, label: "Alert Dispatch", iconColor: "#f87171" },
  { path: "/admin/system", icon: FaServer, label: "Database & Health", badge: "MongoDB", badgeColor: "#a78bfa", iconColor: "#a78bfa" },
];

const AdminSidebar = ({ isOpen, toggleSidebar, closeSidebar }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Sign Out of Admin Console?"
        message="Are you sure you want to end your administrator session? You will need admin credentials to sign back in."
        confirmText="Yes, Sign Out"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`} aria-label="Admin Navigation">
        {/* Top Brand Header */}
        <div className="admin-sidebar-header">
          <div className="admin-brand-left">
            <div className="admin-logo-wrap">
              <GiWheat className="admin-logo-icon" />
            </div>
            <div className="admin-brand-text">
              <div className="admin-title-row">
                <h2 className="admin-brand-title">Kisan Setu</h2>
                <span className="admin-shield-badge">
                  <FaShieldAlt style={{ fontSize: "10px" }} /> ADMIN
                </span>
              </div>
              <p className="admin-brand-tagline">Central Operations Command</p>
            </div>
          </div>

          <button
            className="admin-sidebar-close-btn"
            onClick={closeSidebar || toggleSidebar}
            aria-label="Close navigation menu"
          >
            <FaTimes />
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <nav className="admin-sidebar-nav ks-scroll">
          <div className="admin-section-header">
            <span className="admin-group-label">ADMINISTRATION</span>
          </div>

          <div className="admin-nav-list">
            {ADMIN_NAV.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02, duration: 0.16 }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => {
                    if (closeSidebar) closeSidebar();
                  }}
                >
                  <div className="admin-nav-icon-box" style={{ background: `${item.iconColor}18` }}>
                    <item.icon style={{ color: item.iconColor }} />
                  </div>

                  <span className="admin-nav-label">{item.label}</span>

                  {item.badge && (
                    <span
                      className="admin-nav-badge"
                      style={{
                        color: item.badgeColor,
                        background: `${item.badgeColor}20`,
                        border: `1px solid ${item.badgeColor}40`
                      }}
                    >
                      {item.badge}
                    </span>
                  )}

                  <FaChevronRight className="admin-nav-arrow" />
                </NavLink>
              </motion.div>
            ))}
          </div>

          <div className="admin-section-header" style={{ marginTop: "20px" }}>
            <span className="admin-group-label">QUICK SWITCH</span>
          </div>

          <div className="admin-nav-list">
            <NavLink
              to="/farmer/dashboard"
              className="admin-nav-item"
              onClick={() => {
                if (closeSidebar) closeSidebar();
              }}
            >
              <div className="admin-nav-icon-box" style={{ background: "rgba(34, 197, 94, 0.15)" }}>
                <FaExternalLinkAlt style={{ color: "#22c55e", fontSize: "12px" }} />
              </div>
              <span className="admin-nav-label">Farmer Portal View</span>
            </NavLink>
          </div>

          {/* Database Live Pulse Indicator */}
          <div className="admin-system-pulse-card">
            <div className="admin-pulse-row">
              <div className="admin-pulse-beacon">
                <span className="admin-pulse-dot" />
                <span className="admin-pulse-label">MongoDB Cluster</span>
              </div>
              <span className="admin-pulse-val">Live & Synced</span>
            </div>
          </div>
        </nav>

        {/* Pinned Bottom User Card */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-pill">
            <div className="admin-user-avatar-box">
              <span className="admin-user-initials">
                {(user?.name || "Admin").charAt(0).toUpperCase()}
              </span>
              <span className="admin-user-online-dot" />
            </div>

            <div className="admin-user-info">
              <span className="admin-user-name">{user?.name || "System Admin"}</span>
              <span className="admin-user-role">🛡️ Super Administrator</span>
            </div>

            <button
              className="admin-logout-icon-btn"
              onClick={() => setShowLogoutConfirm(true)}
              title="Logout"
              aria-label="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="admin-sidebar-overlay"
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

export default AdminSidebar;
