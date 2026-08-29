import React, { useState, useEffect, useCallback } from "react";
import {
  FaSeedling,
  FaSearch,
  FaFilter,
  FaRedoAlt,
  FaRobot,
  FaHeartbeat,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaExclamationTriangle
} from "react-icons/fa";
import { GiWheat } from "react-icons/gi";
import adminService from "../../services/adminService";
import CustomSelect from "../../components/common/CustomSelect";

const HEALTH_COLORS = {
  Healthy: { bg: "#dcfce7", text: "#15803d", border: "#86efac" },
  "Mild Infection": { bg: "#fef3c7", text: "#b45309", border: "#fcd34d" },
  Infected: { bg: "#ffedd5", text: "#c2410c", border: "#fdba74" },
  Critical: { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" }
};

const HEALTH_OPTIONS = [
  { value: "all", label: "All Health Statuses" },
  { value: "Healthy", label: "Healthy" },
  { value: "Mild Infection", label: "Mild Infection" },
  { value: "Infected", label: "Infected" },
  { value: "Critical", label: "Critical" }
];

const AdminCropsPage = () => {
  const [crops, setCrops] = useState([]);
  const [pagination, setPagination] = useState({ totalCrops: 0, page: 1, totalPages: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [healthStatus, setHealthStatus] = useState("all");
  const [page, setPage] = useState(1);

  const fetchCrops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getCrops({
        search,
        healthStatus,
        page,
        limit: 10
      });
      setCrops(res.crops || []);
      setPagination(res.pagination || { totalCrops: 0, page: 1, totalPages: 1, limit: 10 });
    } catch (err) {
      console.error("Failed to load crops:", err);
      setError(err.response?.data?.message || "Failed to retrieve crop records from database.");
    } finally {
      setLoading(false);
    }
  }, [search, healthStatus, page]);

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  return (
    <div className="admin-page-container">
      {/* Top Banner */}
      <div className="admin-page-header">
        <div>
          <h2>Agricultural & Crop Monitoring</h2>
          <p>Real-time agronomy telemetry, crop varieties, acreage, and AI disease scans across farms.</p>
        </div>
        <div className="admin-header-counts">
          <span className="admin-badge-stat">Total: {pagination.totalCrops} Crops</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-controls-card">
        <div className="admin-search-box">
          <FaSearch className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search crop name, variety, disease detected..."
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
          <CustomSelect
            options={HEALTH_OPTIONS}
            value={healthStatus}
            onChange={(val) => {
              setHealthStatus(val);
              setPage(1);
            }}
            icon={FaHeartbeat}
          />

          <button className="admin-reset-btn" onClick={fetchCrops} title="Refresh crops">
            <FaRedoAlt />
          </button>
        </div>
      </div>

      {/* Crops Table Card */}
      <div className="admin-panel-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="admin-loading-box" style={{ padding: "40px 20px" }}>
            <div className="admin-spinner" />
            <p>Fetching crop telemetry from MongoDB...</p>
          </div>
        ) : error ? (
          <div className="admin-error-box" style={{ padding: "30px 20px" }}>
            <FaExclamationTriangle className="admin-error-icon" />
            <p>{error}</p>
            <button className="admin-retry-btn" onClick={fetchCrops}>
              <FaRedoAlt /> Retry
            </button>
          </div>
        ) : crops.length === 0 ? (
          <div className="admin-empty-state" style={{ padding: "40px 20px" }}>
            <GiWheat style={{ fontSize: "36px", color: "#94a3b8" }} />
            <h3>No crop records found</h3>
            <p>Try clearing filters or search query.</p>
          </div>
        ) : (
          <>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Crop & Variety</th>
                    <th>Farmer / Plot Owner</th>
                    <th>Plot Acreage</th>
                    <th>Sowing Date</th>
                    <th>Health Diagnosis</th>
                    <th>AI Scan & Confidence</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {crops.map((crop) => {
                    const healthStyle = HEALTH_COLORS[crop.healthStatus] || HEALTH_COLORS.Healthy;
                    return (
                      <tr key={crop._id}>
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-avatar-circle" style={{ background: "#dcfce7", color: "#15803d" }}>
                              🌱
                            </div>
                            <div>
                              <div className="admin-table-name">{crop.name}</div>
                              <div className="admin-table-sub">{crop.variety || "Standard Variety"}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div>
                            <span className="admin-table-name">{crop.userId?.name || "Unknown Farmer"}</span>
                            <div className="admin-table-sub">{crop.userId?.phone || "N/A"} • {crop.userId?.location || "Maharashtra"}</div>
                          </div>
                        </td>

                        <td>
                          <strong>{crop.area || 0} Acres</strong>
                        </td>

                        <td>{crop.sowingDate || "N/A"}</td>

                        <td>
                          <span
                            className="admin-health-badge-pill"
                            style={{
                              background: healthStyle.bg,
                              color: healthStyle.text,
                              border: `1px solid ${healthStyle.border}`
                            }}
                          >
                            <FaHeartbeat />
                            <span>{crop.healthStatus || "Healthy"}</span>
                          </span>
                        </td>

                        <td>
                          <div>
                            <span className="admin-ai-scan-tag">
                              <FaRobot /> {crop.diseaseDetected || "Healthy Plant"}
                            </span>
                            <div className="admin-confidence-text">
                              Confidence: <strong>{crop.confidence || 95}%</strong>
                            </div>
                          </div>
                        </td>

                        <td>{new Date(crop.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="admin-pagination-bar">
              <span className="admin-page-info">
                Showing <strong>{crops.length}</strong> of <strong>{pagination.totalCrops}</strong> crops (Page {pagination.page} of {pagination.totalPages})
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
    </div>
  );
};

export default AdminCropsPage;
