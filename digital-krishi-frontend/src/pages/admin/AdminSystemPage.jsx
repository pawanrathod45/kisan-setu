import React, { useState, useEffect } from "react";
import {
  FaServer,
  FaDatabase,
  FaMemory,
  FaClock,
  FaShieldAlt,
  FaCheckCircle,
  FaRedoAlt,
  FaExclamationTriangle,
  FaLayerGroup
} from "react-icons/fa";
import adminService from "../../services/adminService";

const AdminSystemPage = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getSystemHealth();
      setHealth(res);
    } catch (err) {
      console.error("Failed to load system diagnostics:", err);
      setError(err.response?.data?.message || "Failed to query system diagnostics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const formatUptime = (seconds = 0) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d > 0 ? `${d}d ` : ""}${h}h ${m}m ${s}s`;
  };

  return (
    <div className="admin-page-container">
      {/* Top Banner */}
      <div className="admin-page-header">
        <div>
          <h2>System Health & Database Diagnostics</h2>
          <p>Real-time telemetry of MongoDB cluster collections, Node.js runtime, and memory utilization.</p>
        </div>
        <button className="admin-hero-refresh-btn" onClick={fetchHealth} title="Refresh diagnostics">
          <FaRedoAlt /> <span>Refresh Diagnostics</span>
        </button>
      </div>

      {loading ? (
        <div className="admin-loading-box">
          <div className="admin-spinner" />
          <p>Querying cluster telemetry and server memory metrics...</p>
        </div>
      ) : error ? (
        <div className="admin-error-box">
          <FaExclamationTriangle className="admin-error-icon" />
          <h3>Diagnostics Query Failed</h3>
          <p>{error}</p>
          <button className="admin-retry-btn" onClick={fetchHealth}>
            <FaRedoAlt /> Retry
          </button>
        </div>
      ) : (
        <>
          {/* Diagnostic Metric Cards */}
          <div className="admin-stats-grid">
            {/* MongoDB Connection Status */}
            <div className="admin-stat-card">
              <div className="admin-stat-top">
                <span className="admin-stat-label">MongoDB State</span>
                <div className="admin-stat-icon-wrap" style={{ background: "rgba(34, 197, 94, 0.15)", color: "#16a34a" }}>
                  <FaDatabase />
                </div>
              </div>
              <div className="admin-stat-value" style={{ color: "#15803d" }}>
                {health.database?.status || "Connected"}
              </div>
              <div className="admin-stat-footer">
                <span className="admin-stat-subtext">Database: <strong>{health.database?.databaseName || "kisan_setu"}</strong></span>
              </div>
            </div>

            {/* Server Uptime */}
            <div className="admin-stat-card">
              <div className="admin-stat-top">
                <span className="admin-stat-label">Node Process Uptime</span>
                <div className="admin-stat-icon-wrap" style={{ background: "rgba(96, 165, 250, 0.15)", color: "#2563eb" }}>
                  <FaClock />
                </div>
              </div>
              <div className="admin-stat-value" style={{ fontSize: "20px" }}>
                {formatUptime(health.system?.uptimeSeconds)}
              </div>
              <div className="admin-stat-footer">
                <span className="admin-stat-subtext">Node.js {health.system?.nodeVersion}</span>
              </div>
            </div>

            {/* Heap Memory */}
            <div className="admin-stat-card">
              <div className="admin-stat-top">
                <span className="admin-stat-label">Heap Memory Used</span>
                <div className="admin-stat-icon-wrap" style={{ background: "rgba(167, 139, 250, 0.15)", color: "#7c3aed" }}>
                  <FaMemory />
                </div>
              </div>
              <div className="admin-stat-value">
                {health.system?.memory?.heapUsedMB} MB
              </div>
              <div className="admin-stat-footer">
                <span className="admin-stat-subtext">Total Heap: {health.system?.memory?.heapTotalMB} MB</span>
              </div>
            </div>

            {/* Environment Security */}
            <div className="admin-stat-card">
              <div className="admin-stat-top">
                <span className="admin-stat-label">Environment</span>
                <div className="admin-stat-icon-wrap" style={{ background: "rgba(52, 211, 153, 0.15)", color: "#059669" }}>
                  <FaShieldAlt />
                </div>
              </div>
              <div className="admin-stat-value" style={{ textTransform: "capitalize", fontSize: "22px" }}>
                {health.system?.environment || "Production"}
              </div>
              <div className="admin-stat-footer">
                <span className="admin-stat-badge-green">
                  <FaCheckCircle /> JWT Auth & RBAC Active
                </span>
              </div>
            </div>
          </div>

          {/* Database Collections Inventory */}
          <div className="admin-panel-card" style={{ marginTop: "24px" }}>
            <div className="admin-panel-header">
              <div className="admin-panel-title-group">
                <FaLayerGroup style={{ color: "#38bdf8" }} />
                <h3>Real MongoDB Collections Document Inventory</h3>
              </div>
              <span className="admin-panel-tag">Live Query</span>
            </div>

            <div className="admin-panel-body">
              <div className="admin-collections-grid">
                {Object.entries(health.database?.collections || {}).map(([collName, docCount]) => (
                  <div key={collName} className="admin-collection-item">
                    <div className="admin-collection-icon">
                      <FaDatabase />
                    </div>
                    <div className="admin-collection-info">
                      <span className="admin-collection-name">{collName.toUpperCase()} Collection</span>
                      <strong className="admin-collection-count">{docCount.toLocaleString()} Documents</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminSystemPage;
