import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaChartBar,
  FaCheckCircle,
  FaTimesCircle,
  FaUsers,
  FaSeedling,
  FaBell,
  FaMapMarkerAlt,
  FaDownload,
  FaSyncAlt,
  FaShieldAlt,
  FaHistory
} from "react-icons/fa";
import API from "../../services/api";
import "../../styles/Admin.css";

const AdminReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/admin/reports");
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Reports fetch error:", err);
      setError(err.response?.data?.message || "Failed to generate analytics report from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-spinner" />
        <p>Computing real database aggregations & audit reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error-box">
        <div className="admin-error-icon">⚠️</div>
        <h3>Report Generation Failed</h3>
        <p>{error}</p>
        <button onClick={fetchReports} className="admin-retry-btn">
          <FaSyncAlt /> Retry Database Query
        </button>
      </div>
    );
  }

  const { summary, roleStats, userGrowth, regionalDistribution, cropDistribution, alertSeverityStats, recentAuditActivity } = data || {};

  return (
    <motion.div
      className="admin-dashboard-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            <FaChartBar style={{ color: "#15803d" }} /> Analytics & Audit Reports
          </h1>
          <p className="admin-page-subtitle">
            Real-time MongoDB aggregated metrics, user verification audits, and regional crop coverage.
          </p>
        </div>

        <div className="admin-header-actions">
          <button onClick={fetchReports} className="admin-action-btn secondary" title="Refresh data">
            <FaSyncAlt /> Refresh
          </button>
          <button onClick={handlePrint} className="admin-action-btn primary" title="Print or save as PDF">
            <FaDownload /> Export / Print
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-title">Total Registered Accounts</span>
            <div className="admin-metric-icon-box users">
              <FaUsers />
            </div>
          </div>
          <div className="admin-metric-value">{summary?.totalUsers || 0}</div>
          <div className="admin-metric-subtext">
            <span>{summary?.activeUsersCount || 0} active</span> • <span style={{ color: "#dc2626" }}>{summary?.suspendedUsersCount || 0} suspended</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-title">Email Verification Rate</span>
            <div className="admin-metric-icon-box" style={{ background: "#dcfce7", color: "#15803d" }}>
              <FaCheckCircle />
            </div>
          </div>
          <div className="admin-metric-value">{summary?.verificationRate || 0}%</div>
          <div className="admin-metric-subtext">
            <span>{summary?.verifiedUsersCount || 0} verified</span> • <span>{summary?.unverifiedUsersCount || 0} pending</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-title">Cultivated Crop Plots</span>
            <div className="admin-metric-icon-box crops">
              <FaSeedling />
            </div>
          </div>
          <div className="admin-metric-value">{summary?.totalCropsCount || 0}</div>
          <div className="admin-metric-subtext">
            <span>Across {regionalDistribution?.length || 0} registered districts</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-title">Dispatched Alerts</span>
            <div className="admin-metric-icon-box alerts">
              <FaBell />
            </div>
          </div>
          <div className="admin-metric-value">{summary?.totalAlertsCount || 0}</div>
          <div className="admin-metric-subtext">
            <span>Smart advisory & emergency broadcasts</span>
          </div>
        </div>
      </div>

      {/* Grid: Role Distribution & Regional Distribution */}
      <div className="admin-analytics-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", margin: "20px 0" }}>
        
        {/* Role Distribution Card */}
        <div className="admin-table-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <FaShieldAlt style={{ color: "#15803d" }} /> Role & Permission Breakdown
            </h3>
          </div>
          <div style={{ padding: "16px" }}>
            {roleStats && roleStats.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {roleStats.map((item) => {
                  const percentage = summary?.totalUsers > 0 ? Math.round((item.count / summary.totalUsers) * 100) : 0;
                  return (
                    <div key={item._id}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 650, marginBottom: "4px" }}>
                        <span style={{ textTransform: "capitalize" }}>
                          {item._id === "admin" ? "🛡️ Super Admin" : item._id === "officer" ? "👮 Krishi Officer" : "🌾 Farmer"}
                        </span>
                        <span>{item.count} users ({percentage}%)</span>
                      </div>
                      <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: "100%",
                            background: item._id === "admin" ? "#f59e0b" : item._id === "officer" ? "#3b82f6" : "#16a34a",
                            borderRadius: "4px"
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: "#64748b", fontSize: "13px" }}>No role distribution data available.</p>
            )}
          </div>
        </div>

        {/* Regional Locations Card */}
        <div className="admin-table-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <FaMapMarkerAlt style={{ color: "#15803d" }} /> Regional Distribution (Top Districts)
            </h3>
          </div>
          <div style={{ padding: "16px" }}>
            {regionalDistribution && regionalDistribution.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {regionalDistribution.map((loc, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "13px"
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>📍 {loc._id}</span>
                    <span className="admin-badge active">{loc.count} Registered</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#64748b", fontSize: "13px" }}>No regional data recorded yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* Real Audit History Table */}
      <div className="admin-table-card" style={{ marginTop: "20px" }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <FaHistory style={{ color: "#15803d" }} /> Recent System User Audit Log
          </h3>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Live Database Records</span>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Full Name</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Account Status</th>
                <th>Email Verification</th>
                <th>Registered At</th>
              </tr>
            </thead>
            <tbody>
              {recentAuditActivity && recentAuditActivity.length > 0 ? (
                recentAuditActivity.map((user) => (
                  <tr key={user._id}>
                    <td style={{ fontWeight: 700, color: "#0f172a" }}>{user.name}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "12.5px" }}>{user.email || "—"}</td>
                    <td>
                      <span
                        className={`admin-badge ${
                          user.role === "admin" ? "admin-tag" : user.role === "officer" ? "officer-tag" : "farmer-tag"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status-pill ${user.status || "active"}`}>
                        {user.status || "active"}
                      </span>
                    </td>
                    <td>
                      {user.isEmailVerified ? (
                        <span style={{ color: "#15803d", fontWeight: 700, fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <FaCheckCircle /> Verified
                        </span>
                      ) : (
                        <span style={{ color: "#dc2626", fontWeight: 700, fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <FaTimesCircle /> Pending
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: "12px", color: "#64748b" }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                    No audit records available in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminReportsPage;
