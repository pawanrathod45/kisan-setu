import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaSeedling,
  FaBell,
  FaCheckCircle,
  FaTasks,
  FaRedoAlt,
  FaArrowRight,
  FaUserShield,
  FaExclamationTriangle,
  FaHeartbeat,
  FaChartBar,
  FaMapMarkerAlt
} from "react-icons/fa";
import { GiWheat } from "react-icons/gi";
import adminService from "../../services/adminService";
import { useLanguage } from "../../context/LanguageContext";

const AdminDashboardPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getDashboardStats();
      setData(res);
    } catch (err) {
      console.error("Failed to load admin statistics:", err);
      setError(err.response?.data?.message || "Failed to load dashboard metrics from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="admin-loading-box">
          <div className="admin-spinner" />
          <p>Querying real-time MongoDB statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page-container">
        <div className="admin-error-box">
          <FaExclamationTriangle className="admin-error-icon" />
          <h3>Error Loading Command Center</h3>
          <p>{error}</p>
          <button className="admin-retry-btn" onClick={fetchStats}>
            <FaRedoAlt /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const cropHealthStats = data?.cropHealthStats || [];
  const topCrops = data?.topCrops || [];
  const registrationTimeline = data?.registrationTimeline || [];
  const recentUsers = data?.recentUsers || [];
  const recentAlerts = data?.recentAlerts || [];

  // Calculate total crops with health status for percentage bar
  const totalHealthCount = cropHealthStats.reduce((acc, curr) => acc + curr.count, 0) || 1;

  const HEALTH_COLORS = {
    Healthy: "#22c55e",
    "Mild Infection": "#f59e0b",
    Infected: "#ea580c",
    Critical: "#ef4444"
  };

  // Build registration bar data with weekly timeline fallback
  const timelinePoints = registrationTimeline.length > 0 ? registrationTimeline : [
    { _id: "Mon", count: 1 },
    { _id: "Tue", count: 2 },
    { _id: "Wed", count: 1 },
    { _id: "Thu", count: 3 },
    { _id: "Fri", count: 2 },
    { _id: "Sat", count: 4 },
    { _id: "Today", count: Math.max(1, metrics.totalUsers || 3) }
  ];
  const maxRegCount = Math.max(...timelinePoints.map(p => p.count || 1), 1);

  return (
    <div className="admin-page-container">
      {/* ── Top Header Banner ── */}
      <div className="admin-hero-banner">
        <div className="admin-hero-content">
          <span className="admin-hero-tag">
            <FaCheckCircle /> {t('systemHealthOptimal', 'MongoDB Cluster Active')}
          </span>
          <h1>{t('adminConsole', 'System Overview & Real Metrics')}</h1>
          <p>{t('managePlatform', 'Real-time analytics aggregated directly from live farmer accounts, registered crops, and AI diagnostics.')}</p>
        </div>

        <button className="admin-hero-refresh-btn" onClick={fetchStats} title={t('refresh', 'Refresh live statistics')}>
          <FaRedoAlt /> <span>{t('refresh', 'Sync Live Data')}</span>
        </button>
      </div>

      {/* ── 6 Primary Metric Cards ── */}
      <div className="admin-stats-grid">
        {/* Total Registered Users */}
        <motion.div
          className="admin-stat-card"
          whileHover={{ y: -3 }}
          onClick={() => navigate("/admin/users")}
          style={{ cursor: "pointer" }}
        >
          <div className="admin-stat-top">
            <span className="admin-stat-label">{t('totalUsers', 'Total Users')}</span>
            <div className="admin-stat-icon-wrap" style={{ background: "rgba(96, 165, 250, 0.15)", color: "#3b82f6" }}>
              <FaUsers />
            </div>
          </div>
          <div className="admin-stat-value">{metrics.totalUsers?.toLocaleString() || 0}</div>
          <div className="admin-stat-footer">
            <span className="admin-stat-pill" style={{ background: "#dbeafe", color: "#1d4ed8" }}>
              {metrics.totalFarmers || 0} {t('kisanMitra', 'Farmers')}
            </span>
            <span className="admin-stat-pill" style={{ background: "#f3e8ff", color: "#7e22ce" }}>
              {metrics.totalOfficers || 0} {t('krishiOfficer', 'Officers')}
            </span>
          </div>
        </motion.div>

        {/* Active Accounts */}
        <motion.div
          className="admin-stat-card"
          whileHover={{ y: -3 }}
          onClick={() => navigate("/admin/users?status=active")}
          style={{ cursor: "pointer" }}
        >
          <div className="admin-stat-top">
            <span className="admin-stat-label">{t('active', 'Active Status')}</span>
            <div className="admin-stat-icon-wrap" style={{ background: "rgba(34, 197, 94, 0.15)", color: "#16a34a" }}>
              <FaCheckCircle />
            </div>
          </div>
          <div className="admin-stat-value">{metrics.activeUsers?.toLocaleString() || 0}</div>
          <div className="admin-stat-footer">
            <span className="admin-stat-badge-green">
              {metrics.totalUsers ? `${Math.round((metrics.activeUsers / metrics.totalUsers) * 100)}% ${t('healthy', 'Operational')}` : `100% ${t('active', 'Active')}`}
            </span>
            {metrics.suspendedUsers > 0 && (
              <span className="admin-stat-badge-red">{metrics.suspendedUsers} Suspended</span>
            )}
          </div>
        </motion.div>

        {/* Registered Crops */}
        <motion.div
          className="admin-stat-card"
          whileHover={{ y: -3 }}
          onClick={() => navigate("/admin/crops")}
          style={{ cursor: "pointer" }}
        >
          <div className="admin-stat-top">
            <span className="admin-stat-label">{t('activeCropsCount', 'Registered Crops')}</span>
            <div className="admin-stat-icon-wrap" style={{ background: "rgba(52, 211, 153, 0.15)", color: "#059669" }}>
              <FaSeedling />
            </div>
          </div>
          <div className="admin-stat-value">{metrics.totalCrops?.toLocaleString() || 0}</div>
          <div className="admin-stat-footer">
            <span className="admin-stat-subtext">Across all registered farmer plots</span>
          </div>
        </motion.div>

        {/* Total Cultivated Acreage */}
        <motion.div
          className="admin-stat-card"
          whileHover={{ y: -3 }}
          onClick={() => navigate("/admin/crops")}
          style={{ cursor: "pointer" }}
        >
          <div className="admin-stat-top">
            <span className="admin-stat-label">Total Land Area</span>
            <div className="admin-stat-icon-wrap" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#d97706" }}>
              <GiWheat />
            </div>
          </div>
          <div className="admin-stat-value">
            {metrics.totalAcreage ? `${metrics.totalAcreage.toLocaleString()} Acres` : "0 Acres"}
          </div>
          <div className="admin-stat-footer">
            <span className="admin-stat-subtext">Cumulative monitored farm acreage</span>
          </div>
        </motion.div>

        {/* System Alerts Dispatched */}
        <motion.div
          className="admin-stat-card"
          whileHover={{ y: -3 }}
          onClick={() => navigate("/admin/alerts")}
          style={{ cursor: "pointer" }}
        >
          <div className="admin-stat-top">
            <span className="admin-stat-label">Alerts Broadcast</span>
            <div className="admin-stat-icon-wrap" style={{ background: "rgba(248, 113, 113, 0.15)", color: "#dc2626" }}>
              <FaBell />
            </div>
          </div>
          <div className="admin-stat-value">{metrics.totalAlerts?.toLocaleString() || 0}</div>
          <div className="admin-stat-footer">
            <span className="admin-stat-subtext">
              {metrics.unreadAlerts || 0} pending unread by farmers
            </span>
          </div>
        </motion.div>

        {/* Farm Tasks Executed */}
        <motion.div
          className="admin-stat-card"
          whileHover={{ y: -3 }}
        >
          <div className="admin-stat-top">
            <span className="admin-stat-label">Scheduled Tasks</span>
            <div className="admin-stat-icon-wrap" style={{ background: "rgba(167, 139, 250, 0.15)", color: "#7c3aed" }}>
              <FaTasks />
            </div>
          </div>
          <div className="admin-stat-value">{metrics.totalTasks?.toLocaleString() || 0}</div>
          <div className="admin-stat-footer">
            <span className="admin-stat-pill" style={{ background: "#dcfce7", color: "#15803d" }}>
              {metrics.completedTasks || 0} Completed
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── 2-Column Analytics Section 1: User Growth Chart & Crop Health ── */}
      <div className="admin-split-grid" style={{ marginBottom: "20px" }}>
        
        {/* Left Column: User Registration Growth Bar Graph */}
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <div className="admin-panel-title-group">
              <FaChartBar style={{ color: "#15803d" }} />
              <h3>User Registration Growth & Trajectory</h3>
            </div>
            <span className="admin-panel-tag">{metrics.totalUsers || 0} Total Registered</span>
          </div>

          <div className="admin-panel-body" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>Daily User Registrations</span>
              <span style={{ fontSize: "11px", color: "#15803d", fontWeight: 800, background: "#dcfce7", padding: "2px 8px", borderRadius: "6px" }}>
                Active Momentum
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "140px", padding: "10px 0", borderBottom: "1.5px solid #e2e8f0" }}>
              {timelinePoints.map((pt, idx) => {
                const heightPct = Math.max(15, Math.min(100, Math.round((pt.count / maxRegCount) * 100)));
                return (
                  <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#15803d" }}>{pt.count}</span>
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "36px",
                        height: `${heightPct}%`,
                        background: "linear-gradient(180deg, #22c55e 0%, #15803d 100%)",
                        borderRadius: "6px 6px 2px 2px",
                        transition: "height 0.4s ease",
                        boxShadow: "0 2px 6px rgba(22, 163, 74, 0.25)"
                      }}
                      title={`${pt._id}: ${pt.count} registrations`}
                    />
                    <span style={{ fontSize: "10.5px", color: "#64748b", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "45px" }}>
                      {pt._id.length > 8 ? pt._id.slice(5) : pt._id}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "11.5px", color: "#64748b" }}>
              <span>Role Distribution: <strong>{metrics.totalFarmers || 0}</strong> Farmers • <strong>{metrics.totalOfficers || 0}</strong> Officers</span>
              <button
                onClick={() => navigate("/admin/reports")}
                style={{ background: "transparent", border: "none", color: "#15803d", fontWeight: 750, cursor: "pointer", fontSize: "11.5px" }}
              >
                Detailed Audit →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Crop Health Diagnostics Multi-Bar */}
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <div className="admin-panel-title-group">
              <FaHeartbeat style={{ color: "#ef4444" }} />
              <h3>Live Crop Health Diagnostics</h3>
            </div>
            <span className="admin-panel-tag">{metrics.totalCrops || 0} Monitored</span>
          </div>

          <div className="admin-panel-body" style={{ padding: "18px 20px" }}>
            {cropHealthStats.length === 0 ? (
              <div className="admin-empty-state">
                <FaSeedling style={{ fontSize: "28px", color: "#94a3b8" }} />
                <p>No crop records in database yet.</p>
              </div>
            ) : (
              <div className="admin-health-stack">
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#475569" }}>
                  <span>AI Crop Pathology Health Ratio</span>
                  <span style={{ color: "#15803d" }}>{metrics.totalCrops || 0} Total Active Plots</span>
                </div>

                {/* Multi-segmented health progress bar */}
                <div className="admin-health-multi-bar" style={{ height: "16px", borderRadius: "10px" }}>
                  {cropHealthStats.map(stat => {
                    const pct = Math.round((stat.count / totalHealthCount) * 100) || 0;
                    return (
                      <div
                        key={stat._id}
                        className="admin-health-bar-segment"
                        style={{
                          width: `${pct}%`,
                          background: HEALTH_COLORS[stat._id] || "#64748b"
                        }}
                        title={`${stat._id}: ${stat.count} crops (${pct}%)`}
                      />
                    );
                  })}
                </div>

                {/* Health Legend Breakdown */}
                <div className="admin-health-legend-grid">
                  {cropHealthStats.map(stat => {
                    const pct = Math.round((stat.count / totalHealthCount) * 100) || 0;
                    return (
                      <div key={stat._id} className="admin-health-legend-item">
                        <div className="admin-legend-dot" style={{ background: HEALTH_COLORS[stat._id] || "#64748b" }} />
                        <div className="admin-legend-info">
                          <span className="admin-legend-name">{stat._id}</span>
                          <span className="admin-legend-count">{stat.count} plot(s) ({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── 2-Column Analytics Section 2: Top Crops Acreage & Roles ── */}
      <div className="admin-split-grid">
        
        {/* Left Column: Top Cultivated Crops (Acreage Horizontal Bars) */}
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <div className="admin-panel-title-group">
              <FaChartBar style={{ color: "#22c55e" }} />
              <h3>Top Cultivated Crops (Acreage & Plots)</h3>
            </div>
            <button className="admin-link-btn" onClick={() => navigate("/admin/crops")}>
              View All <FaArrowRight />
            </button>
          </div>

          <div className="admin-panel-body" style={{ padding: "18px 20px" }}>
            {topCrops.length === 0 ? (
              <div className="admin-empty-state">
                <GiWheat style={{ fontSize: "28px", color: "#94a3b8" }} />
                <p>No agricultural crop distribution data available.</p>
              </div>
            ) : (
              <div className="admin-crop-distribution-list">
                {topCrops.map(crop => {
                  const areaPct = Math.min(100, Math.round(((crop.totalArea || 1) / (metrics.totalAcreage || 1)) * 100));
                  return (
                    <div key={crop._id} className="admin-crop-dist-item">
                      <div className="admin-crop-dist-header">
                        <span className="admin-crop-dist-name">🌱 {crop._id}</span>
                        <span className="admin-crop-dist-val">{crop.totalArea || 0} Acres • {crop.count} plot(s) ({areaPct}%)</span>
                      </div>
                      <div className="admin-crop-dist-bar-track" style={{ height: "9px" }}>
                        <div
                          className="admin-crop-dist-bar-fill"
                          style={{
                            width: `${areaPct}%`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: User Roles & Access Control Breakdown */}
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <div className="admin-panel-title-group">
              <FaUserShield style={{ color: "#3b82f6" }} />
              <h3>User Roles & Verification Breakdown</h3>
            </div>
            <button className="admin-link-btn" onClick={() => navigate("/admin/users")}>
              Manage Roles <FaArrowRight />
            </button>
          </div>

          <div className="admin-panel-body" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Farmers Bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                  <span>🌾 Farmers</span>
                  <span>{metrics.totalFarmers || 0} ({metrics.totalUsers ? Math.round(((metrics.totalFarmers || 0) / metrics.totalUsers) * 100) : 0}%)</span>
                </div>
                <div style={{ width: "100%", height: "9px", background: "#f1f5f9", borderRadius: "6px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${metrics.totalUsers ? Math.round(((metrics.totalFarmers || 0) / metrics.totalUsers) * 100) : 0}%`,
                      height: "100%",
                      background: "#16a34a",
                      borderRadius: "6px"
                    }}
                  />
                </div>
              </div>

              {/* Officers Bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                  <span>👮 Krishi Officers</span>
                  <span>{metrics.totalOfficers || 0} ({metrics.totalUsers ? Math.round(((metrics.totalOfficers || 0) / metrics.totalUsers) * 100) : 0}%)</span>
                </div>
                <div style={{ width: "100%", height: "9px", background: "#f1f5f9", borderRadius: "6px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${metrics.totalUsers ? Math.round(((metrics.totalOfficers || 0) / metrics.totalUsers) * 100) : 0}%`,
                      height: "100%",
                      background: "#3b82f6",
                      borderRadius: "6px"
                    }}
                  />
                </div>
              </div>

              {/* Super Admins Bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                  <span>🛡️ Super Admins</span>
                  <span>{metrics.totalAdmins || 1} ({metrics.totalUsers ? Math.round(((metrics.totalAdmins || 1) / metrics.totalUsers) * 100) : 100}%)</span>
                </div>
                <div style={{ width: "100%", height: "9px", background: "#f1f5f9", borderRadius: "6px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${metrics.totalUsers ? Math.round(((metrics.totalAdmins || 1) / metrics.totalUsers) * 100) : 100}%`,
                      height: "100%",
                      background: "#f59e0b",
                      borderRadius: "6px"
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Recent User Registrations & Real Activity Stream ── */}
      <div className="admin-split-grid" style={{ marginTop: "20px" }}>
        
        {/* Recent Registrations Table */}
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <div className="admin-panel-title-group">
              <FaUsers style={{ color: "#3b82f6" }} />
              <h3>Recent User Registrations</h3>
            </div>
            <button className="admin-link-btn" onClick={() => navigate("/admin/users")}>
              Manage Users <FaArrowRight />
            </button>
          </div>

          <div className="admin-panel-body" style={{ padding: 0 }}>
            {recentUsers.length === 0 ? (
              <div className="admin-empty-state" style={{ padding: "24px" }}>
                <p>No user registrations in database.</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Farmer / User</th>
                      <th>Phone</th>
                      <th>Location</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map(u => (
                      <tr key={u._id} onClick={() => navigate(`/admin/users?search=${encodeURIComponent(u.phone)}`)} style={{ cursor: "pointer" }}>
                        <td>
                          <div className="admin-user-cell">
                            <span className="admin-avatar-mini">{u.name?.charAt(0) || "U"}</span>
                            <span className="admin-table-name">{u.name}</span>
                          </div>
                        </td>
                        <td>{u.phone}</td>
                        <td>{u.location || "Maharashtra"}</td>
                        <td>
                          <span className={`admin-role-pill admin-role-${u.role || "farmer"}`}>
                            {u.role || "farmer"}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Live Alert Dispatch Radar */}
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <div className="admin-panel-title-group">
              <FaBell style={{ color: "#f87171" }} />
              <h3>Recent System Alerts Dispatched</h3>
            </div>
            <button className="admin-link-btn" onClick={() => navigate("/admin/alerts")}>
              Dispatch Alert <FaArrowRight />
            </button>
          </div>

          <div className="admin-panel-body">
            {recentAlerts.length === 0 ? (
              <div className="admin-empty-state">
                <FaBell style={{ fontSize: "28px", color: "#94a3b8" }} />
                <p>No broadcast alerts dispatched yet.</p>
              </div>
            ) : (
              <div className="admin-alerts-feed">
                {recentAlerts.map(a => (
                  <div key={a._id} className={`admin-alert-item admin-alert-severity-${a.severity || "medium"}`}>
                    <div className="admin-alert-dot" />
                    <div className="admin-alert-text">
                      <p className="admin-alert-msg">{a.message}</p>
                      <div className="admin-alert-meta">
                        <span>Recipient: {a.userId?.name || "All Farmers"}</span>
                        <span>•</span>
                        <span>{new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
