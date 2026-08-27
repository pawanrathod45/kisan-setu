import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaUserShield,
  FaCheckCircle,
  FaBan,
  FaEye,
  FaRedoAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaSeedling,
  FaTasks,
  FaBell,
  FaExclamationTriangle,
  FaUserCog
} from "react-icons/fa";
import adminService from "../../services/adminService";
import ConfirmModal from "../../components/common/ConfirmModal";

const AdminUsersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ totalUsers: 0, page: 1, totalPages: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [role, setRole] = useState(searchParams.get("role") || "all");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [verified, setVerified] = useState(searchParams.get("verified") || "all");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  // Details Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDossier, setUserDossier] = useState(null);
  const [dossierLoading, setDossierLoading] = useState(false);

  // Status/Role Change Confirm Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
    type: "warning"
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getUsers({
        search,
        role,
        status,
        verified,
        page,
        limit: 10
      });
      setUsers(res.users || []);
      setPagination(res.pagination || { totalUsers: 0, page: 1, totalPages: 1, limit: 10 });
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(err.response?.data?.message || "Failed to retrieve user directory from database.");
    } finally {
      setLoading(false);
    }
  }, [search, role, status, verified, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Load User Dossier
  const handleViewUser = async (user) => {
    setSelectedUser(user);
    try {
      setDossierLoading(true);
      const res = await adminService.getUserById(user._id);
      setUserDossier(res);
    } catch (err) {
      console.error("Failed to load user dossier:", err);
    } finally {
      setDossierLoading(false);
    }
  };

  // Safe Status Toggle
  const handleToggleStatus = (user) => {
    const nextStatus = user.status === "active" ? "suspended" : "active";
    setConfirmModal({
      isOpen: true,
      title: `${nextStatus === "suspended" ? "Suspend" : "Activate"} User Account?`,
      message: `Are you sure you want to change ${user.name}'s account status to '${nextStatus}'? ${
        nextStatus === "suspended" ? "They will be temporarily blocked from signing in." : "They will regain immediate access to Kisan Setu."
      }`,
      type: nextStatus === "suspended" ? "danger" : "info",
      action: async () => {
        try {
          await adminService.updateUserStatus(user._id, nextStatus);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          fetchUsers();
        } catch (err) {
          alert(err.response?.data?.message || "Failed to update status");
        }
      }
    });
  };

  // Safe Role Change
  const handleRoleChange = (user, newRole) => {
    if (user.role === newRole) return;
    setConfirmModal({
      isOpen: true,
      title: `Update Role to ${newRole.toUpperCase()}?`,
      message: `Are you sure you want to change ${user.name}'s permission level from '${user.role}' to '${newRole}'?`,
      type: newRole === "admin" ? "danger" : "warning",
      action: async () => {
        try {
          await adminService.updateUserRole(user._id, newRole);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          fetchUsers();
        } catch (err) {
          alert(err.response?.data?.message || "Failed to change role");
        }
      }
    });
  };

  return (
    <div className="admin-page-container">
      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Confirm Change"
        cancelText="Cancel"
        type={confirmModal.type}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Top Banner */}
      <div className="admin-page-header">
        <div>
          <h2>User Directory & Access Control</h2>
          <p>Real-time farmer, officer, and administrator registry synced with MongoDB.</p>
        </div>
        <div className="admin-header-counts">
          <span className="admin-badge-stat">Total: {pagination.totalUsers} Accounts</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-controls-card">
        <div className="admin-search-box">
          <FaSearch className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search by name, phone number, location, crop..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {search && (
            <button className="admin-clear-search-btn" onClick={() => setSearch("")}>
              <FaTimes />
            </button>
          )}
        </div>

        <div className="admin-filters-group">
          {/* Role Filter */}
          <div className="admin-filter-item">
            <FaUserShield className="admin-filter-icon" />
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Roles</option>
              <option value="farmer">Farmers</option>
              <option value="officer">Krishi Officers</option>
              <option value="admin">Super Admins</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="admin-filter-item">
            <FaFilter className="admin-filter-icon" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>

          {/* Email Verification Filter */}
          <div className="admin-filter-item">
            <FaCheckCircle className="admin-filter-icon" />
            <select
              value={verified}
              onChange={(e) => {
                setVerified(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Verification</option>
              <option value="true">Verified Email</option>
              <option value="false">Pending Verification</option>
            </select>
          </div>

          <button className="admin-reset-btn" onClick={fetchUsers} title="Refresh directory">
            <FaRedoAlt />
          </button>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="admin-panel-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="admin-loading-box" style={{ padding: "40px 20px" }}>
            <div className="admin-spinner" />
            <p>Fetching user accounts from MongoDB...</p>
          </div>
        ) : error ? (
          <div className="admin-error-box" style={{ padding: "30px 20px" }}>
            <FaExclamationTriangle className="admin-error-icon" />
            <p>{error}</p>
            <button className="admin-retry-btn" onClick={fetchUsers}>
              <FaRedoAlt /> Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty-state" style={{ padding: "40px 20px" }}>
            <FaUserShield style={{ fontSize: "36px", color: "#94a3b8" }} />
            <h3>No users found matching query</h3>
            <p>Try clearing your search terms or changing role filters.</p>
          </div>
        ) : (
          <>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Mobile Phone</th>
                    <th>Location</th>
                    <th>Primary Crop</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-avatar-circle">
                            {u.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="admin-table-name">{u.name}</div>
                            {u.email && <div className="admin-table-sub">{u.email}</div>}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="admin-phone-tag">{u.phone}</span>
                      </td>

                      <td>{u.location || "Maharashtra, India"}</td>

                      <td>
                        <span className="admin-crop-pill">
                          🌱 {u.crop || "Not Specified"}
                        </span>
                      </td>

                      <td>
                        <select
                          className={`admin-role-select admin-role-${u.role || "farmer"}`}
                          value={u.role || "farmer"}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                        >
                          <option value="farmer">Farmer</option>
                          <option value="officer">Officer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td>
                        <span className={`admin-status-pill admin-status-${u.status || "active"}`}>
                          {u.status === "suspended" ? <FaBan /> : <FaCheckCircle />}
                          <span>{u.status || "active"}</span>
                        </span>
                      </td>

                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>

                      <td style={{ textAlign: "right" }}>
                        <div className="admin-actions-group">
                          <button
                            className="admin-action-btn view"
                            onClick={() => handleViewUser(u)}
                            title="View Full Profile Dossier"
                          >
                            <FaEye />
                          </button>

                          <button
                            className={`admin-action-btn ${u.status === "suspended" ? "activate" : "suspend"}`}
                            onClick={() => handleToggleStatus(u)}
                            title={u.status === "suspended" ? "Activate User" : "Suspend User"}
                          >
                            {u.status === "suspended" ? <FaCheckCircle /> : <FaBan />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="admin-pagination-bar">
              <span className="admin-page-info">
                Showing <strong>{users.length}</strong> of <strong>{pagination.totalUsers}</strong> accounts (Page {pagination.page} of {pagination.totalPages})
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

      {/* ── User Dossier Drawer / Modal ── */}
      {selectedUser && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="admin-modal-title-group">
                <div className="admin-avatar-lg">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{selectedUser.name}</h3>
                  <p>{selectedUser.phone} • {selectedUser.location || "India"}</p>
                </div>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedUser(null)}>
                <FaTimes />
              </button>
            </div>

            <div className="admin-modal-body ks-scroll">
              {dossierLoading ? (
                <div className="admin-loading-box">
                  <div className="admin-spinner" />
                  <p>Loading linked agricultural data...</p>
                </div>
              ) : (
                <>
                  {/* Account Summary Badges */}
                  <div className="admin-dossier-summary">
                    <div className="admin-dossier-pill">
                      <span>Role:</span> <strong>{selectedUser.role?.toUpperCase()}</strong>
                    </div>
                    <div className="admin-dossier-pill">
                      <span>Status:</span> <strong>{selectedUser.status?.toUpperCase() || "ACTIVE"}</strong>
                    </div>
                    <div className="admin-dossier-pill">
                      <span>Farming Type:</span> <strong>{selectedUser.farmingType || "Traditional"}</strong>
                    </div>
                    <div className="admin-dossier-pill">
                      <span>Land Area:</span> <strong>{selectedUser.landArea || 0} Acres</strong>
                    </div>
                  </div>

                  {/* Associated Crops */}
                  <div className="admin-dossier-section">
                    <h4><FaSeedling style={{ color: "#22c55e" }} /> Registered Crops ({userDossier?.crops?.length || 0})</h4>
                    {userDossier?.crops?.length === 0 ? (
                      <p className="admin-empty-subtext">No crop records registered yet.</p>
                    ) : (
                      <div className="admin-dossier-items-list">
                        {userDossier?.crops?.map((crop) => (
                          <div key={crop._id} className="admin-dossier-item">
                            <div>
                              <strong>🌱 {crop.name} ({crop.variety || "Standard"})</strong>
                              <p>{crop.area} Acres • Sown: {crop.sowingDate || "N/A"}</p>
                            </div>
                            <span className="admin-health-tag" style={{ background: crop.healthStatus === "Healthy" ? "#dcfce7" : "#fee2e2", color: crop.healthStatus === "Healthy" ? "#15803d" : "#dc2626" }}>
                              {crop.healthStatus || "Healthy"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Scheduled Tasks */}
                  <div className="admin-dossier-section">
                    <h4><FaTasks style={{ color: "#3b82f6" }} /> Farm Tasks ({userDossier?.tasks?.length || 0})</h4>
                    {userDossier?.tasks?.length === 0 ? (
                      <p className="admin-empty-subtext">No tasks created by farmer.</p>
                    ) : (
                      <div className="admin-dossier-items-list">
                        {userDossier?.tasks?.map((task) => (
                          <div key={task._id} className="admin-dossier-item">
                            <div>
                              <strong>{task.title}</strong>
                              <p>{task.date} • Category: {task.category}</p>
                            </div>
                            <span className="admin-task-status-pill">
                              {task.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* User Alerts */}
                  <div className="admin-dossier-section">
                    <h4><FaBell style={{ color: "#f87171" }} /> Alerts Received ({userDossier?.alerts?.length || 0})</h4>
                    {userDossier?.alerts?.length === 0 ? (
                      <p className="admin-empty-subtext">No alerts dispatched to this user.</p>
                    ) : (
                      <div className="admin-dossier-items-list">
                        {userDossier?.alerts?.map((alert) => (
                          <div key={alert._id} className="admin-dossier-item">
                            <div>
                              <p style={{ margin: 0, fontSize: "13px" }}>{alert.message}</p>
                              <span style={{ fontSize: "11px", color: "#64748b" }}>
                                {new Date(alert.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
