import React, { useState, useEffect, useCallback } from "react";
import {
  FaBell,
  FaPaperPlane,
  FaFilter,
  FaTrash,
  FaRedoAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaExclamationTriangle,
  FaBroadcastTower,
  FaCheck
} from "react-icons/fa";
import adminService from "../../services/adminService";
import ConfirmModal from "../../components/common/ConfirmModal";
import CustomSelect from "../../components/common/CustomSelect";

const TYPE_OPTIONS = [
  { value: "all", label: "All Alert Types" },
  { value: "weather", label: "Weather Warnings" },
  { value: "pest", label: "Pest & Disease Advisories" },
  { value: "market", label: "Market & Mandi Price Alerts" },
  { value: "task", label: "Farm Tasks" },
  { value: "general", label: "General Broadcasts" }
];

const SEVERITY_OPTIONS = [
  { value: "all", label: "All Severities" },
  { value: "low", label: "Low Severity" },
  { value: "medium", label: "Medium Severity" },
  { value: "high", label: "High / Urgent" }
];

const MODAL_CATEGORY_OPTIONS = [
  { value: "general", label: "General Broadcast" },
  { value: "weather", label: "Weather Warning" },
  { value: "pest", label: "Pest & Disease Advisory" },
  { value: "market", label: "Market & Mandi Notice" }
];

const MODAL_SEVERITY_OPTIONS = [
  { value: "low", label: "Low (Information)" },
  { value: "medium", label: "Medium (Advisory)" },
  { value: "high", label: "High (Urgent Emergency)" }
];

const TARGET_ROLE_OPTIONS = [
  { value: "farmer", label: "All Registered Farmers Only" },
  { value: "officer", label: "Krishi Officers Only" },
  { value: "all", label: "All Users (Farmers & Officers)" }
];

const SEVERITY_COLORS = {
  low: { bg: "#dcfce7", text: "#15803d", border: "#86efac" },
  medium: { bg: "#fef3c7", text: "#b45309", border: "#fcd34d" },
  high: { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" }
};

const AdminAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [pagination, setPagination] = useState({ totalAlerts: 0, page: 1, totalPages: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Broadcast Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    message: "",
    type: "general",
    severity: "medium",
    targetRole: "farmer"
  });
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState("");

  // Filters
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Delete Confirm Modal
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    alertId: null
  });

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getAlerts({
        type: typeFilter,
        severity: severityFilter,
        page,
        limit: 10
      });
      setAlerts(res.alerts || []);
      setPagination(res.pagination || { totalAlerts: 0, page: 1, totalPages: 1, limit: 10 });
    } catch (err) {
      console.error("Failed to load alerts:", err);
      setError(err.response?.data?.message || "Failed to fetch alerts from database.");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, severityFilter, page]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Handle Broadcast Dispatch
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.message.trim()) return;

    try {
      setBroadcasting(true);
      const res = await adminService.broadcastAlert(broadcastForm);
      setBroadcastSuccess(res.message || "Alert dispatched to MongoDB!");
      setBroadcastForm({
        message: "",
        type: "general",
        severity: "medium",
        targetRole: "farmer"
      });
      setTimeout(() => {
        setBroadcastSuccess("");
        setShowBroadcastModal(false);
        fetchAlerts();
      }, 1200);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to broadcast alert");
    } finally {
      setBroadcasting(false);
    }
  };

  // Handle Delete
  const handleDeleteAlert = async () => {
    try {
      await adminService.deleteAlert(deleteConfirm.alertId);
      setDeleteConfirm({ isOpen: false, alertId: null });
      fetchAlerts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete alert");
    }
  };

  return (
    <div className="admin-page-container">
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Dispatched Alert?"
        message="Are you sure you want to permanently delete this alert record from the system?"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDeleteAlert}
        onCancel={() => setDeleteConfirm({ isOpen: false, alertId: null })}
      />

      {/* Top Header */}
      <div className="admin-page-header">
        <div>
          <h2>System Broadcast & Alert Dispatch</h2>
          <p>Deliver critical agricultural weather, pest warnings, and market notifications to farmers in real-time.</p>
        </div>
        <button
          className="admin-primary-btn"
          onClick={() => setShowBroadcastModal(true)}
        >
          <FaBroadcastTower /> <span>Dispatch Broadcast</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-controls-card">
        <div className="admin-filters-group" style={{ width: "100%", margin: 0 }}>
          <CustomSelect
            options={TYPE_OPTIONS}
            value={typeFilter}
            onChange={(val) => {
              setTypeFilter(val);
              setPage(1);
            }}
            icon={FaFilter}
          />

          <CustomSelect
            options={SEVERITY_OPTIONS}
            value={severityFilter}
            onChange={(val) => {
              setSeverityFilter(val);
              setPage(1);
            }}
            icon={FaBell}
          />

          <button className="admin-reset-btn" onClick={fetchAlerts} title="Refresh alerts">
            <FaRedoAlt />
          </button>
        </div>
      </div>

      {/* Alerts Table Card */}
      <div className="admin-panel-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="admin-loading-box" style={{ padding: "40px 20px" }}>
            <div className="admin-spinner" />
            <p>Fetching alerts from MongoDB...</p>
          </div>
        ) : error ? (
          <div className="admin-error-box" style={{ padding: "30px 20px" }}>
            <FaExclamationTriangle className="admin-error-icon" />
            <p>{error}</p>
            <button className="admin-retry-btn" onClick={fetchAlerts}>
              <FaRedoAlt /> Retry
            </button>
          </div>
        ) : alerts.length === 0 ? (
          <div className="admin-empty-state" style={{ padding: "40px 20px" }}>
            <FaBell style={{ fontSize: "36px", color: "#94a3b8" }} />
            <h3>No system alerts found</h3>
            <p>Click "Dispatch Broadcast" above to send a real alert to all registered farmers.</p>
          </div>
        ) : (
          <>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Alert Message</th>
                    <th>Category</th>
                    <th>Severity</th>
                    <th>Recipient</th>
                    <th>Status</th>
                    <th>Dispatched Date</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((a) => {
                    const sevStyle = SEVERITY_COLORS[a.severity] || SEVERITY_COLORS.medium;
                    return (
                      <tr key={a._id}>
                        <td style={{ maxWidth: "340px" }}>
                          <p className="admin-table-alert-msg">{a.message}</p>
                        </td>

                        <td>
                          <span className="admin-crop-pill" style={{ textTransform: "capitalize" }}>
                            {a.type || "general"}
                          </span>
                        </td>

                        <td>
                          <span
                            className="admin-health-badge-pill"
                            style={{
                              background: sevStyle.bg,
                              color: sevStyle.text,
                              border: `1px solid ${sevStyle.border}`,
                              textTransform: "uppercase",
                              fontSize: "11px"
                            }}
                          >
                            {a.severity || "medium"}
                          </span>
                        </td>

                        <td>
                          <div>
                            <span className="admin-table-name">{a.userId?.name || "All Registered Farmers"}</span>
                            {a.userId?.phone && <div className="admin-table-sub">{a.userId.phone}</div>}
                          </div>
                        </td>

                        <td>
                          <span className={`admin-status-pill ${a.read ? "admin-status-active" : "admin-status-suspended"}`}>
                            <span>{a.read ? "Read" : "Unread"}</span>
                          </span>
                        </td>

                        <td>{new Date(a.createdAt).toLocaleString()}</td>

                        <td style={{ textAlign: "right" }}>
                          <button
                            className="admin-action-btn delete"
                            onClick={() => setDeleteConfirm({ isOpen: true, alertId: a._id })}
                            title="Delete Alert"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="admin-pagination-bar">
              <span className="admin-page-info">
                Showing <strong>{alerts.length}</strong> of <strong>{pagination.totalAlerts}</strong> alerts (Page {pagination.page} of {pagination.totalPages})
              </span>

              <div className="admin-page-buttons">
                <button
                  className="admin-page-btn"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <FaChevronLeft /> Previous
                </button>

                <button
                  className="admin-page-btn"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <FaChevronRight />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Broadcast Creation Modal ── */}
      {showBroadcastModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowBroadcastModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px", maxHeight: "min(580px, 88vh)" }}>
            <div className="admin-modal-header">
              <div className="admin-modal-title-group">
                <div className="admin-avatar-lg" style={{ background: "#fee2e2", color: "#dc2626" }}>
                  <FaBroadcastTower />
                </div>
                <div>
                  <h3>Dispatch System Broadcast</h3>
                  <p>Publish a live alert directly to farmers' notification trays.</p>
                </div>
              </div>
              <button className="admin-modal-close" onClick={() => setShowBroadcastModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleBroadcast} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
              <div className="admin-modal-body ks-scroll" style={{ overflowY: "auto", flex: 1, padding: "16px 20px" }}>
                {broadcastSuccess && (
                  <div className="admin-success-box">
                    <FaCheck /> {broadcastSuccess}
                  </div>
                )}

                <div className="admin-form-group">
                  <label>Alert Message *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Weather Warning: Heavy rains expected in Maharashtra districts over next 48 hours. Ensure field drainage."
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Category</label>
                    <CustomSelect
                      options={MODAL_CATEGORY_OPTIONS}
                      value={broadcastForm.type}
                      onChange={(val) => setBroadcastForm({ ...broadcastForm, type: val })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Severity Level</label>
                    <CustomSelect
                      options={MODAL_SEVERITY_OPTIONS}
                      value={broadcastForm.severity}
                      onChange={(val) => setBroadcastForm({ ...broadcastForm, severity: val })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Recipient Target</label>
                  <CustomSelect
                    options={TARGET_ROLE_OPTIONS}
                    value={broadcastForm.targetRole}
                    onChange={(val) => setBroadcastForm({ ...broadcastForm, targetRole: val })}
                  />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={() => setShowBroadcastModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-primary-btn"
                  disabled={broadcasting || !broadcastForm.message.trim()}
                >
                  {broadcasting ? "Dispatching to MongoDB..." : "🚀 Dispatch Alert Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAlertsPage;
