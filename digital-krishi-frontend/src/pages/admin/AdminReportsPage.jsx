import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  FaHistory,
  FaCalendarAlt,
  FaDatabase,
  FaExclamationTriangle,
  FaUserCheck,
  FaFileAlt
} from "react-icons/fa";
import adminService from "../../services/adminService";
import "../../styles/Admin.css";

const DATE_RANGES = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 3 Months" },
  { value: "180d", label: "Last 6 Months" },
  { value: "1y", label: "Last 1 Year" },
  { value: "all", label: "All Time" }
];

const AdminReportsPage = () => {
  const [data, setData] = useState(null);
  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminService.getReports({ range });
      if (res?.success) {
        setData(res.data);
      } else if (res?.data) {
        setData(res.data);
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err) {
      console.error("Reports fetch error:", err);
      setError(
        err.response?.data?.message ||
        "Unable to retrieve analytics data from the MongoDB database. Please check your database connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handlePrint = () => {
    window.print();
  };

  const {
    summary = {},
    roleStats = [],
    userGrowth = [],
    regionalDistribution = [],
    cropDistribution = [],
    alertSeverityStats = [],
    recentAuditActivity = []
  } = data || {};

  const dbConnected = summary.dbStatus === "Connected";

  return (
    <motion.div
      className="admin-dashboard-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Top Header Bar */}
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
          {/* Real DB Status Indicator */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 700,
              background: dbConnected ? "#dcfce7" : "#fee2e2",
              color: dbConnected ? "#15803d" : "#dc2626",
              border: `1px solid ${dbConnected ? "#86efac" : "#fca5a5"}`
            }}
          >
            <FaDatabase style={{ fontSize: "11px" }} />
            <span>{dbConnected ? "MongoDB Connected" : "MongoDB Disconnected"}</span>
          </div>

          {/* Date Range Selector */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "4px 8px" }}>
            <FaCalendarAlt style={{ color: "#15803d", fontSize: "13px" }} />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: "13px", fontWeight: 600, color: "#0f172a", background: "transparent", cursor: "pointer" }}
            >
              {DATE_RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <button onClick={fetchReports} className="admin-action-btn secondary" title="Refresh data">
            <FaSyncAlt /> Refresh
          </button>
          <button onClick={handlePrint} className="admin-action-btn primary" title="Print or save as PDF">
            <FaDownload /> Export Report
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="admin-loading-screen" style={{ minHeight: "340px" }}>
          <div className="admin-spinner" />
          <p style={{ marginTop: "12px", fontWeight: 650, color: "#334155" }}>
            Generating real-time analytics from MongoDB...
          </p>
        </div>
      ) : error ? (
        /* Error State with Working Retry Button */
        <div className="admin-error-box" style={{ maxWidth: "560px", margin: "40px auto", padding: "32px 24px", textAlign: "center" }}>
          <FaExclamationTriangle style={{ fontSize: "42px", color: "#dc2626", marginBottom: "12px" }} />
          <h3 style={{ fontSize: "18px", color: "#0f172a", margin: "0 0 8px" }}>Unable to Load Analytics</h3>
          <p style={{ fontSize: "13.5px", color: "#64748b", lineHeight: 1.5, margin: "0 0 20px" }}>
            {error}
          </p>
          <button onClick={fetchReports} className="admin-retry-btn" style={{ padding: "10px 20px", fontSize: "13.5px" }}>
            <FaSyncAlt /> Retry Database Query
          </button>
        </div>
      ) : summary?.totalUsers === 0 ? (
        /* Empty Database State */
        <div className="admin-empty-state" style={{ maxWidth: "500px", margin: "40px auto", padding: "40px 20px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2ece3", textAlign: "center" }}>
          <FaUsers style={{ fontSize: "48px", color: "#94a3b8", marginBottom: "12px" }} />
          <h3 style={{ fontSize: "17px", color: "#0f172a", margin: "0 0 6px" }}>No Analytics Data Recorded</h3>
          <p style={{ fontSize: "13.5px", color: "#64748b", margin: 0 }}>
            No user or farm activity matches the selected time filter.
          </p>
        </div>
      ) : (
        /* Success Analytics View */
        <>
          {/* Summary Metric Cards */}
          <div className="admin-metrics-grid">
            <div className="admin-metric-card">
              <div className="admin-metric-header">
                <span className="admin-metric-title">Total Registered Users</span>
                <div className="admin-metric-icon-box users">
                  <FaUsers />
                </div>
              </div>
              <div className="admin-metric-value">{summary?.totalUsers || 0}</div>
              <div className="admin-metric-subtext">
                <span>{summary?.activeUsersCount || 0} active</span> •{" "}
                <span style={{ color: summary?.suspendedUsersCount > 0 ? "#dc2626" : "#64748b" }}>
                  {summary?.suspendedUsersCount || 0} suspended
                </span>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="admin-metric-header">
                <span className="admin-metric-title">Email Verification Rate</span>
                <div className="admin-metric-icon-box" style={{ background: "#dcfce7", color: "#15803d" }}>
                  <FaUserCheck />
                </div>
              </div>
              <div className="admin-metric-value">{summary?.verificationRate || 0}%</div>
              <div className="admin-metric-subtext">
                <span>{summary?.verifiedUsersCount || 0} verified</span> •{" "}
                <span>{summary?.unverifiedUsersCount || 0} pending</span>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="admin-metric-header">
                <span className="admin-metric-title">Period New Registrations</span>
                <div className="admin-metric-icon-box" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                  <FaFileAlt />
                </div>
              </div>
              <div className="admin-metric-value">{summary?.periodNewUsers || 0}</div>
              <div className="admin-metric-subtext">
                <span>Created in selected period ({range})</span>
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
                <span>Across {regionalDistribution?.length || 0} registered regions</span>
              </div>
            </div>
          </div>

          {/* Grid: User Growth Timeline & Role Distribution */}
          <div className="admin-analytics-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "16px", margin: "20px 0" }}>
            
            {/* Real User Growth Timeline */}
            <div className="admin-table-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <FaChartBar style={{ color: "#15803d" }} /> Registration Growth Timeline
                </h3>
                <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>
                  Real MongoDB Aggregation
                </span>
              </div>
              <div style={{ padding: "18px" }}>
                {userGrowth && userGrowth.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {userGrowth.map((point) => (
                      <div key={point._id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ width: "90px", fontSize: "12px", color: "#475569", fontWeight: 650 }}>
                          {point._id}
                        </span>
                        <div style={{ flex: 1, height: "14px", background: "#f1f5f9", borderRadius: "6px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${Math.min(100, point.registrations * 30)}%`,
                              height: "100%",
                              background: "linear-gradient(90deg, #15803d, #22c55e)",
                              borderRadius: "6px"
                            }}
                          />
                        </div>
                        <span style={{ width: "60px", fontSize: "12px", fontWeight: 750, color: "#15803d", textAlign: "right" }}>
                          +{point.registrations} users
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                    No registrations recorded within the selected date window.
                  </p>
                )}
              </div>
            </div>

            {/* Role & Permission Breakdown */}
            <div className="admin-table-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <FaShieldAlt style={{ color: "#15803d" }} /> Role Distribution
                </h3>
              </div>
              <div style={{ padding: "18px" }}>
                {roleStats && roleStats.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {roleStats.map((item) => {
                      const percentage = summary?.totalUsers > 0 ? Math.round((item.count / summary.totalUsers) * 100) : 0;
                      return (
                        <div key={item._id}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 650, marginBottom: "4px" }}>
                            <span style={{ textTransform: "capitalize" }}>
                              {item._id === "admin" ? "🛡️ Super Admin" : item._id === "officer" ? "👮 Krishi Officer" : "🌾 Farmer"}
                            </span>
                            <span>{item.count} ({percentage}%)</span>
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

          </div>

          {/* Regional Locations & Crop Distribution Grid */}
          <div className="admin-analytics-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", margin: "20px 0" }}>
            
            {/* Regional Locations Card */}
            <div className="admin-table-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <FaMapMarkerAlt style={{ color: "#15803d" }} /> Regional Distribution (Top Districts)
                </h3>
              </div>
              <div style={{ padding: "16px" }}>
                {regionalDistribution && regionalDistribution.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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

            {/* Crop Plots & Acreage Card */}
            <div className="admin-table-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <FaSeedling style={{ color: "#15803d" }} /> Crop Plots & Acreage in Database
                </h3>
              </div>
              <div style={{ padding: "16px" }}>
                {cropDistribution && cropDistribution.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {cropDistribution.map((crop, idx) => (
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
                        <span style={{ fontWeight: 600, color: "#0f172a" }}>🌱 {crop._id}</span>
                        <span style={{ fontWeight: 700, color: "#15803d" }}>
                          {crop.totalPlots} plot(s) • {crop.totalAcreage} acres
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#64748b", fontSize: "13px" }}>No crop records in database yet.</p>
                )}
              </div>
            </div>

          </div>

          {/* Real System Audit History Table */}
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
        </>
      )}
    </motion.div>
  );
};

export default AdminReportsPage;
