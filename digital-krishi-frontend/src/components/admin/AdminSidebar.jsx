import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartPie,
  FaUsers,
  FaSeedling,
  FaBell,
  FaChartBar,
  FaServer,
  FaShieldAlt,
  FaSignOutAlt,
  FaChevronRight,
  FaTimes,
  FaExternalLinkAlt
} from "react-icons/fa";
import { GiWheat } from "react-icons/gi";
import ConfirmModal from "../common/ConfirmModal";

const ADMIN_SECTIONS = [
  {
    group: "MAIN",
    items: [
      { path: "/admin/dashboard", icon: FaChartPie, label: "Overview", badge: "Live", badgeColor: "#15803d", iconColor: "#15803d" },
    ]
  },
  {
    group: "MANAGEMENT",
    items: [
      { path: "/admin/users", icon: FaUsers, label: "User Directory", iconColor: "#2563eb" },
      { path: "/admin/alerts", icon: FaBell, label: "Alerts & Broadcasts", iconColor: "#dc2626" },
      { path: "/admin/crops", icon: FaSeedling, label: "Crop Database", iconColor: "#16a34a" },
    ]
  },
  {
    group: "INSIGHTS & REPORTS",
    items: [
      { path: "/admin/reports", icon: FaChartBar, label: "Analytics & Reports", badge: "Real", badgeColor: "#7c3aed", iconColor: "#7c3aed" },
    ]
  },
  {
    group: "SYSTEM",
    items: [
      { path: "/admin/system", icon: FaServer, label: "Database Health", badge: "MongoDB", badgeColor: "#059669", iconColor: "#059669" },
      { path: "/farmer/dashboard", icon: FaExternalLinkAlt, label: "Farmer Portal View", iconColor: "#16a34a", isExternal: true },
    ]
  }
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
                  <FaShieldAlt style={{ fontSize: "9px" }} /> ADMIN
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

        {/* Scrollable Nav Items with Clear Semantic Groups */}
        <nav className="admin-sidebar-nav ks-scroll">
          {ADMIN_SECTIONS.map((section, sIdx) => (
            <div key={section.group} className="admin-nav-group-box">
              <div className="admin-section-header">
                <span className="admin-group-label">{section.group}</span>
              </div>

              <div className="admin-nav-list">
                {section.items.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (sIdx * 2 + index) * 0.015, duration: 0.15 }}
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
                      onClick={() => {
                        if (closeSidebar) closeSidebar();
                      }}
                    >
                      <div className="admin-nav-icon-box">
                        <item.icon style={{ color: item.iconColor }} />
                      </div>

                      <span className="admin-nav-label">{item.label}</span>

                      {item.badge && (
                        <span
                          className="admin-nav-badge"
                          style={{
                            color: item.badgeColor,
                            background: `${item.badgeColor}18`,
                            border: `1px solid ${item.badgeColor}35`
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
            </div>
          ))}

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
              <span>{(user?.name || "Admin").charAt(0).toUpperCase()}</span>
              <span className="admin-user-online-dot" />
            </div>

            <div className="admin-user-info">
              <span className="admin-user-name">{user?.name || "System Admin"}</span>
              <span className="admin-user-role">🛡️ Super Administrator</span>
            </div>

            <button
              className="admin-logout-icon-btn"
              onClick={() => setShowLogoutConfirm(true)}
              title="Sign Out"
              aria-label="Sign Out"
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
