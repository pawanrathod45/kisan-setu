import React, { useState, useEffect, useCallback } from "react";
import {
  FaLandmark,
  FaSearch,
  FaPlus,
  FaRedoAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaShieldAlt,
  FaExternalLinkAlt,
  FaFilter,
  FaCalendarCheck,
  FaFileAlt,
  FaMoneyBillWave,
  FaSeedling,
  FaMapMarkerAlt,
  FaUsers,
  FaInfoCircle,
  FaCheck,
  FaTimes,
  FaPhoneAlt
} from "react-icons/fa";
import adminService from "../../services/adminService";
import ConfirmModal from "../../components/common/ConfirmModal";
import "./AdminSchemesPage.css";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "irrigation", label: "Irrigation (सिंचन)" },
  { value: "mechanization", label: "Mechanization (यांत्रिकीकरण)" },
  { value: "horticulture", label: "Horticulture (फलोत्पादन)" },
  { value: "food-security", label: "Food Security (अन्न सुरक्षा)" },
  { value: "tribal-welfare", label: "Tribal Welfare (आदिवासी कल्याण)" },
  { value: "sc-welfare", label: "SC Welfare (अनुसूचित जाती)" },
  { value: "rainfed", label: "Rainfed Farming (कोरडवाहू)" },
  { value: "infrastructure", label: "Infrastructure (पायाभूत सुविधा)" },
  { value: "general", label: "General Agriculture (सर्वसाधारण)" }
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active Only (Live)" },
  { value: "inactive", label: "Archived / Inactive" }
];

const APPLICATION_STATUS_OPTIONS = [
  { value: "all", label: "All Application Timelines" },
  { value: "year-round", label: "Year-Round (कायमस्वरूपी)" },
  { value: "open", label: "Currently Open (सुरू)" },
  { value: "upcoming", label: "Upcoming (लवकरच)" },
  { value: "closed", label: "Closed (बंद)" }
];

const BENEFIT_TYPE_OPTIONS = [
  { value: "subsidy", label: "Direct Subsidy (अनुदान)" },
  { value: "grant", label: "Government Grant (मदत निधी)" },
  { value: "equipment", label: "Equipment / Machinery (यंत्रसामग्री)" },
  { value: "seeds", label: "Seeds & Inputs (बियाणे/खते)" },
  { value: "training", label: "Skill & Training (प्रशिक्षण)" },
  { value: "infrastructure", label: "Infrastructure (बांधकाम/विहीर)" },
  { value: "mixed", label: "Mixed Package (मिश्र योजना)" }
];

const FARMER_CATEGORY_LIST = [
  { id: "all", label: "All Farmers (सर्व शेतकरी)" },
  { id: "small", label: "Small Farmers (< 2 ha)" },
  { id: "marginal", label: "Marginal Farmers (< 1 ha)" },
  { id: "sc", label: "Scheduled Caste (SC)" },
  { id: "st", label: "Scheduled Tribe (ST)" },
  { id: "obc", label: "OBC" },
  { id: "women", label: "Women Farmers (महिला)" },
  { id: "general", label: "General" }
];

const INITIAL_SCHEME_FORM = {
  schemeId: "",
  name: "",
  nameMr: "",
  nameHi: "",
  department: "Department of Agriculture, Govt. of Maharashtra",
  category: "general",
  description: "",
  descriptionMr: "",
  descriptionHi: "",
  benefits: {
    benefitType: "subsidy",
    subsidyPercentage: "",
    maxSubsidyAmount: "",
    benefitDescription: "",
    benefitDescriptionMr: "",
    benefitDescriptionHi: ""
  },
  eligibility: {
    farmerCategories: ["all"],
    minLandHectares: "",
    maxLandHectares: "",
    irrigationRequired: false,
    applicableCrops: "",
    applicableDistricts: "",
    residencyRequired: "Maharashtra",
    aadhaarRequired: true,
    bankAccountRequired: true,
    landDocumentsRequired: true,
    additionalCriteria: ""
  },
  requiredDocuments: "7/12 Extract, 8-A Extract, Aadhaar Card, Bank Passbook",
  requiredDocumentsMr: "७/१२ उतारा, ८-अ उतारा, आधार कार्ड, बँक पासबुक",
  requiredDocumentsHi: "७/१२ खतौनी, ८-ए प्रति, आधार कार्ड, बैंक पासबुक",
  officialLink: "https://mahadbt.maharashtra.gov.in",
  sourceGrLink: "",
  helplineNumber: "1800-120-8040",
  applicationStatus: "year-round",
  verifiedSource: "MahaDBT Agriculture Portal – mahadbt.maharashtra.gov.in",
  lastVerifiedDate: new Date().toISOString().split("T")[0],
  isActive: true
};

const AdminSchemesPage = () => {
  const [schemes, setSchemes] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0, verifiedRecently: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [appStatus, setAppStatus] = useState("all");

  // Modals
  const [selectedScheme, setSelectedScheme] = useState(null); // For Details View Modal
  const [formModalOpen, setFormModalOpen] = useState(false); // For Add / Edit Modal
  const [editingSchemeId, setEditingSchemeId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_SCHEME_FORM);
  const [formTab, setFormTab] = useState("basic");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: null
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch schemes from Real MongoDB Backend
  const fetchSchemes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getAdminSchemes({
        search,
        category,
        status,
        applicationStatus: appStatus
      });

      if (res && res.success && res.data) {
        setSchemes(res.data.schemes || []);
        setSummary(res.data.summary || { total: 0, active: 0, inactive: 0, verifiedRecently: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch government schemes:", err);
      setError(err.response?.data?.message || "Failed to load government schemes from database.");
    } finally {
      setLoading(false);
    }
  }, [search, category, status, appStatus]);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  // Open Add Scheme Modal
  const handleOpenAddModal = () => {
    setEditingSchemeId(null);
    setFormData({
      ...INITIAL_SCHEME_FORM,
      schemeId: `MAHA-SCHEME-${Math.floor(1000 + Math.random() * 9000)}`,
      lastVerifiedDate: new Date().toISOString().split("T")[0]
    });
    setFormTab("basic");
    setFormModalOpen(true);
  };

  // Open Edit Scheme Modal
  const handleOpenEditModal = (scheme) => {
    setEditingSchemeId(scheme._id);
    setFormData({
      schemeId: scheme.schemeId || "",
      name: scheme.name || "",
      nameMr: scheme.nameMr || "",
      nameHi: scheme.nameHi || "",
      department: scheme.department || "",
      category: scheme.category || "general",
      description: scheme.description || "",
      descriptionMr: scheme.descriptionMr || "",
      descriptionHi: scheme.descriptionHi || "",
      benefits: {
        benefitType: scheme.benefits?.benefitType || "subsidy",
        subsidyPercentage: scheme.benefits?.subsidyPercentage || "",
        maxSubsidyAmount: scheme.benefits?.maxSubsidyAmount || "",
        benefitDescription: scheme.benefits?.benefitDescription || "",
        benefitDescriptionMr: scheme.benefits?.benefitDescriptionMr || "",
        benefitDescriptionHi: scheme.benefits?.benefitDescriptionHi || ""
      },
      eligibility: {
        farmerCategories: scheme.eligibility?.farmerCategories || ["all"],
        minLandHectares: scheme.eligibility?.minLandHectares || "",
        maxLandHectares: scheme.eligibility?.maxLandHectares || "",
        irrigationRequired: Boolean(scheme.eligibility?.irrigationRequired),
        applicableCrops: Array.isArray(scheme.eligibility?.applicableCrops) ? scheme.eligibility.applicableCrops.join(", ") : "",
        applicableDistricts: Array.isArray(scheme.eligibility?.applicableDistricts) ? scheme.eligibility.applicableDistricts.join(", ") : "",
        residencyRequired: scheme.eligibility?.residencyRequired || "Maharashtra",
        aadhaarRequired: scheme.eligibility?.aadhaarRequired !== undefined ? scheme.eligibility.aadhaarRequired : true,
        bankAccountRequired: scheme.eligibility?.bankAccountRequired !== undefined ? scheme.eligibility.bankAccountRequired : true,
        landDocumentsRequired: scheme.eligibility?.landDocumentsRequired !== undefined ? scheme.eligibility.landDocumentsRequired : true,
        additionalCriteria: Array.isArray(scheme.eligibility?.additionalCriteria) ? scheme.eligibility.additionalCriteria.join("\n") : ""
      },
      requiredDocuments: Array.isArray(scheme.requiredDocuments) ? scheme.requiredDocuments.join(", ") : "",
      requiredDocumentsMr: Array.isArray(scheme.requiredDocumentsMr) ? scheme.requiredDocumentsMr.join(", ") : "",
      requiredDocumentsHi: Array.isArray(scheme.requiredDocumentsHi) ? scheme.requiredDocumentsHi.join(", ") : "",
      officialLink: scheme.officialLink || "https://mahadbt.maharashtra.gov.in",
      sourceGrLink: scheme.sourceGrLink || "",
      helplineNumber: scheme.helplineNumber || "",
      applicationStatus: scheme.applicationStatus || "year-round",
      verifiedSource: scheme.verifiedSource || "MahaDBT Portal – mahadbt.maharashtra.gov.in",
      lastVerifiedDate: scheme.lastVerifiedDate ? new Date(scheme.lastVerifiedDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      isActive: scheme.isActive !== undefined ? scheme.isActive : true
    });
    setFormTab("basic");
    setFormModalOpen(true);
  };

  // Submit Add / Edit Form
  const handleSaveScheme = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Please provide the Scheme Name in English.", "error");
      setFormTab("basic");
      return;
    }
    if (!formData.department.trim()) {
      showToast("Please specify the Government Department.", "error");
      setFormTab("basic");
      return;
    }
    if (!formData.description.trim()) {
      showToast("Please provide the Scheme Description.", "error");
      setFormTab("description");
      return;
    }

    try {
      setFormSubmitting(true);

      const payload = {
        schemeId: formData.schemeId.trim(),
        name: formData.name.trim(),
        nameMr: formData.nameMr.trim(),
        nameHi: formData.nameHi.trim(),
        department: formData.department.trim(),
        category: formData.category,
        description: formData.description.trim(),
        descriptionMr: formData.descriptionMr.trim(),
        descriptionHi: formData.descriptionHi.trim(),
        benefits: {
          benefitType: formData.benefits.benefitType,
          subsidyPercentage: formData.benefits.subsidyPercentage.trim() || null,
          maxSubsidyAmount: formData.benefits.maxSubsidyAmount.trim() || null,
          benefitDescription: formData.benefits.benefitDescription.trim(),
          benefitDescriptionMr: formData.benefits.benefitDescriptionMr.trim(),
          benefitDescriptionHi: formData.benefits.benefitDescriptionHi.trim()
        },
        eligibility: {
          farmerCategories: formData.eligibility.farmerCategories,
          minLandHectares: formData.eligibility.minLandHectares ? Number(formData.eligibility.minLandHectares) : null,
          maxLandHectares: formData.eligibility.maxLandHectares ? Number(formData.eligibility.maxLandHectares) : null,
          irrigationRequired: Boolean(formData.eligibility.irrigationRequired),
          applicableCrops: formData.eligibility.applicableCrops
            ? formData.eligibility.applicableCrops.split(",").map(c => c.trim()).filter(Boolean)
            : [],
          applicableDistricts: formData.eligibility.applicableDistricts
            ? formData.eligibility.applicableDistricts.split(",").map(d => d.trim()).filter(Boolean)
            : [],
          residencyRequired: formData.eligibility.residencyRequired.trim() || "Maharashtra",
          aadhaarRequired: Boolean(formData.eligibility.aadhaarRequired),
          bankAccountRequired: Boolean(formData.eligibility.bankAccountRequired),
          landDocumentsRequired: Boolean(formData.eligibility.landDocumentsRequired),
          additionalCriteria: formData.eligibility.additionalCriteria
            ? formData.eligibility.additionalCriteria.split("\n").map(s => s.trim()).filter(Boolean)
            : []
        },
        requiredDocuments: formData.requiredDocuments
          ? formData.requiredDocuments.split(",").map(d => d.trim()).filter(Boolean)
          : [],
        requiredDocumentsMr: formData.requiredDocumentsMr
          ? formData.requiredDocumentsMr.split(",").map(d => d.trim()).filter(Boolean)
          : [],
        requiredDocumentsHi: formData.requiredDocumentsHi
          ? formData.requiredDocumentsHi.split(",").map(d => d.trim()).filter(Boolean)
          : [],
        officialLink: formData.officialLink.trim(),
        sourceGrLink: formData.sourceGrLink.trim(),
        helplineNumber: formData.helplineNumber.trim(),
        applicationStatus: formData.applicationStatus,
        verifiedSource: formData.verifiedSource.trim(),
        lastVerifiedDate: formData.lastVerifiedDate,
        isActive: formData.isActive
      };

      if (editingSchemeId) {
        await adminService.updateScheme(editingSchemeId, payload);
        showToast(`Scheme '${payload.name}' updated successfully in MongoDB.`);
      } else {
        await adminService.createScheme(payload);
        showToast(`Scheme '${payload.name}' published successfully.`);
      }

      setFormModalOpen(false);
      fetchSchemes();
    } catch (err) {
      console.error("Save scheme error:", err);
      showToast(err.response?.data?.message || "Failed to save scheme.", "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = (scheme) => {
    const nextStatus = !scheme.isActive;
    setConfirmModal({
      isOpen: true,
      title: `${nextStatus ? "Activate" : "Archive / Deactivate"} Government Scheme?`,
      message: `Are you sure you want to change '${scheme.name}' to ${
        nextStatus ? "ACTIVE? It will become immediately visible to all eligible Maharashtra farmers in the portal." : "INACTIVE? It will be archived and hidden from farmer scheme recommendations."
      }`,
      type: nextStatus ? "info" : "warning",
      onConfirm: async () => {
        try {
          await adminService.toggleSchemeStatus(scheme._id, nextStatus);
          showToast(`Scheme '${scheme.name}' is now ${nextStatus ? "Active" : "Archived"}.`);
          fetchSchemes();
        } catch (err) {
          showToast("Failed to update status.", "error");
        } finally {
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });
        }
      }
    });
  };

  // Quick 1-Click Verification Update
  const handleVerifyToday = (scheme) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirm Official Verification Stamp",
      message: `Stamp scheme '${scheme.name}' as officially verified against the Maharashtra Government / MahaDBT Portal as of today?`,
      type: "info",
      onConfirm: async () => {
        try {
          await adminService.verifySchemeToday(scheme._id, "MahaDBT Portal – mahadbt.maharashtra.gov.in");
          showToast(`Verified stamp updated for '${scheme.name}'.`);
          fetchSchemes();
        } catch (err) {
          showToast("Failed to verify scheme.", "error");
        } finally {
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });
        }
      }
    });
  };

  // Delete Scheme
  const handleDeleteScheme = (scheme) => {
    setConfirmModal({
      isOpen: true,
      title: "Permanently Delete Government Scheme?",
      message: `Are you sure you want to permanently delete '${scheme.name}' (${scheme.schemeId}) from the MongoDB database? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        try {
          await adminService.deleteScheme(scheme._id);
          showToast(`Scheme '${scheme.name}' permanently deleted.`);
          fetchSchemes();
        } catch (err) {
          showToast(err.response?.data?.message || "Failed to delete scheme.", "error");
        } finally {
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });
        }
      }
    });
  };

  // Helper for category checkbox toggle in form
  const handleCategoryPillToggle = (catId) => {
    const current = formData.eligibility.farmerCategories || [];
    if (catId === "all") {
      setFormData(prev => ({
        ...prev,
        eligibility: { ...prev.eligibility, farmerCategories: ["all"] }
      }));
      return;
    }

    let next = current.filter(c => c !== "all");
    if (next.includes(catId)) {
      next = next.filter(c => c !== catId);
      if (next.length === 0) next = ["all"];
    } else {
      next.push(catId);
    }

    setFormData(prev => ({
      ...prev,
      eligibility: { ...prev.eligibility, farmerCategories: next }
    }));
  };

  return (
    <div className="admin-schemes-page">
      {/* Toast Alert */}
      {toast && (
        <div className={`admin-toast-message ${toast.type}`}>
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText="Confirm Action"
        cancelText="Cancel"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null })}
      />

      {/* Header & Primary CTA */}
      <div className="admin-schemes-header">
        <div className="admin-schemes-title-group">
          <h1>
            <FaLandmark style={{ color: "#d97706" }} /> Government Schemes Management
          </h1>
          <p>
            Curate, verify, and manage official Maharashtra & Central Government Agricultural Schemes in MongoDB.
          </p>
        </div>

        <div className="admin-schemes-header-actions">
          <button className="admin-btn-secondary" onClick={fetchSchemes} title="Refresh schemes from MongoDB">
            <FaRedoAlt /> Refresh
          </button>
          <button className="admin-btn-primary" onClick={handleOpenAddModal}>
            <FaPlus /> Add Government Scheme
          </button>
        </div>
      </div>

      {/* Real MongoDB Aggregated Metric Cards */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="admin-metric-info">
            <div className="admin-metric-label">Total Schemes</div>
            <div className="admin-metric-value">{summary.total}</div>
            <div className="admin-metric-sub">MongoDB Database Records</div>
          </div>
          <div className="admin-metric-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
            <FaLandmark />
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-info">
            <div className="admin-metric-label">Active Schemes</div>
            <div className="admin-metric-value" style={{ color: "#15803d" }}>
              {summary.active}
            </div>
            <div className="admin-metric-sub">Live on Farmer Portal</div>
          </div>
          <div className="admin-metric-icon" style={{ background: "#dcfce7", color: "#15803d" }}>
            <FaCheckCircle />
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-info">
            <div className="admin-metric-label">Archived / Inactive</div>
            <div className="admin-metric-value" style={{ color: "#b91c1c" }}>
              {summary.inactive}
            </div>
            <div className="admin-metric-sub">Hidden from Recommendations</div>
          </div>
          <div className="admin-metric-icon" style={{ background: "#fee2e2", color: "#b91c1c" }}>
            <FaTimesCircle />
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-info">
            <div className="admin-metric-label">Verified (Last 30d)</div>
            <div className="admin-metric-value" style={{ color: "#059669" }}>
              {summary.verifiedRecently}
            </div>
            <div className="admin-metric-sub">Official MahaDBT Verified</div>
          </div>
          <div className="admin-metric-icon" style={{ background: "#ccfbf1", color: "#0d9488" }}>
            <FaCalendarCheck />
          </div>
        </div>
      </div>

      {/* Government Data Authenticity Guideline Banner */}
      <div className="admin-govt-rule-banner">
        <div className="admin-govt-rule-content">
          <FaShieldAlt className="admin-govt-rule-icon" />
          <div>
            <div className="admin-govt-rule-title">
              Official Government Data Compliance Rule
            </div>
            <div className="admin-govt-rule-text">
              Administrators must ensure all published scheme information, subsidies, and GR links match official Maharashtra Government notifications (MahaDBT / Krishi Vibhag) before marking as <strong>Active</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="admin-schemes-toolbar">
        <div className="admin-schemes-search-wrap">
          <FaSearch className="admin-search-icon" />
          <input
            type="text"
            className="admin-schemes-search-input"
            placeholder="Search by Scheme Name, Marathi Name, Scheme ID, or Department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="admin-search-clear-btn" onClick={() => setSearch("")}>
              <FaTimes />
            </button>
          )}
        </div>

        <div className="admin-schemes-filter-group">
          <select
            className="admin-filter-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by Category"
          >
            {CATEGORY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            className="admin-filter-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by Active Status"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            className="admin-filter-select"
            value={appStatus}
            onChange={(e) => setAppStatus(e.target.value)}
            aria-label="Filter by Application Status"
          >
            {APPLICATION_STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="admin-loading-spinner">
          <FaRedoAlt className="admin-spin-icon" style={{ fontSize: "32px", animation: "spin 1s linear infinite" }} />
          <p style={{ fontWeight: 700, color: "#15803d" }}>Loading government schemes from database...</p>
        </div>
      ) : error ? (
        <div className="admin-empty-state">
          <div className="admin-empty-title" style={{ color: "#dc2626" }}>Unable to load schemes</div>
          <p>{error}</p>
          <button className="admin-btn-primary" onClick={fetchSchemes} style={{ marginTop: "12px" }}>
            Retry Connection
          </button>
        </div>
      ) : schemes.length === 0 ? (
        <div className="admin-empty-state">
          <FaLandmark className="admin-empty-icon" />
          <div className="admin-empty-title">No Government Schemes Found</div>
          <p>No schemes matched your search query or filter selection.</p>
          <button className="admin-btn-secondary" onClick={() => { setSearch(""); setCategory("all"); setStatus("all"); setAppStatus("all"); }} style={{ marginTop: "12px" }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="admin-table-card">
          {/* Desktop Table View */}
          <div className="admin-table-responsive">
            <table className="admin-schemes-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Scheme Name & ID</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Benefits / Subsidy</th>
                  <th>Official Source & Verification</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schemes.map((scheme) => (
                  <tr key={scheme._id} className={!scheme.isActive ? "inactive-row" : ""}>
                    {/* Status Toggle Column */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <label className="admin-toggle-switch" title={`Click to ${scheme.isActive ? "deactivate" : "activate"}`}>
                          <input
                            type="checkbox"
                            checked={scheme.isActive}
                            onChange={() => handleToggleStatus(scheme)}
                          />
                          <span className="admin-toggle-slider" />
                        </label>
                        <span className={`admin-status-pill ${scheme.isActive ? "active" : "inactive"}`}>
                          <span className={`admin-status-dot ${scheme.isActive ? "active" : "inactive"}`} />
                          {scheme.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>

                    {/* Scheme Name & ID */}
                    <td className="admin-scheme-name-cell">
                      <div className="admin-scheme-title">{scheme.name}</div>
                      {scheme.nameMr && <div className="admin-scheme-title-mr">{scheme.nameMr}</div>}
                      <span className="admin-scheme-id-tag">{scheme.schemeId}</span>
                    </td>

                    {/* Category */}
                    <td>
                      <span className={`admin-badge admin-badge-${scheme.category || "general"}`}>
                        {scheme.category || "General"}
                      </span>
                      <div style={{ marginTop: "4px", fontSize: "11px", color: "#64748b" }}>
                        App: <strong>{scheme.applicationStatus || "year-round"}</strong>
                      </div>
                    </td>

                    {/* Department */}
                    <td style={{ maxWidth: "220px", fontSize: "12px", color: "#475569" }}>
                      {scheme.department}
                    </td>

                    {/* Benefits / Subsidy */}
                    <td style={{ maxWidth: "200px" }}>
                      {scheme.benefits?.subsidyPercentage && (
                        <div style={{ fontWeight: 800, color: "#15803d", fontSize: "13px" }}>
                          {scheme.benefits.subsidyPercentage} Subsidy
                        </div>
                      )}
                      {scheme.benefits?.maxSubsidyAmount && (
                        <div style={{ fontSize: "11.5px", color: "#0f172a", fontWeight: 700 }}>
                          Up to {scheme.benefits.maxSubsidyAmount}
                        </div>
                      )}
                      <div style={{ fontSize: "11px", color: "#64748b", textTransform: "capitalize" }}>
                        Type: {scheme.benefits?.benefitType || "subsidy"}
                      </div>
                    </td>

                    {/* Official Source & Verification */}
                    <td>
                      <div className="admin-verified-box">
                        <div className="admin-verified-date">
                          <FaCheckCircle style={{ color: "#16a34a", fontSize: "12px" }} />
                          {scheme.lastVerifiedDate
                            ? new Date(scheme.lastVerifiedDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })
                            : "Not verified"}
                        </div>
                        <div className="admin-verified-source" title={scheme.verifiedSource}>
                          {scheme.verifiedSource || "MahaDBT Portal"}
                        </div>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td style={{ textAlign: "right" }}>
                      <div className="admin-action-btn-group" style={{ justifyContent: "flex-end" }}>
                        <button
                          className="admin-table-btn view"
                          onClick={() => setSelectedScheme(scheme)}
                          title="View Full Scheme Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="admin-table-btn edit"
                          onClick={() => handleOpenEditModal(scheme)}
                          title="Edit Scheme Information"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="admin-table-btn verify"
                          onClick={() => handleVerifyToday(scheme)}
                          title="Mark Verified as of Today"
                        >
                          <FaShieldAlt />
                        </button>
                        <button
                          className="admin-table-btn delete"
                          onClick={() => handleDeleteScheme(scheme)}
                          title="Delete Scheme from MongoDB"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="admin-mobile-schemes-list">
            {schemes.map((scheme) => (
              <div key={scheme._id} className="admin-mobile-scheme-card">
                <div className="admin-mobile-card-top">
                  <div>
                    <span className="admin-scheme-id-tag">{scheme.schemeId}</span>
                    <h3 className="admin-scheme-title" style={{ marginTop: "4px" }}>{scheme.name}</h3>
                    {scheme.nameMr && <div className="admin-scheme-title-mr">{scheme.nameMr}</div>}
                  </div>
                  <span className={`admin-status-pill ${scheme.isActive ? "active" : "inactive"}`}>
                    {scheme.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "8px", margin: "8px 0", flexWrap: "wrap" }}>
                  <span className={`admin-badge admin-badge-${scheme.category || "general"}`}>
                    {scheme.category || "General"}
                  </span>
                  {scheme.benefits?.subsidyPercentage && (
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#15803d", background: "#dcfce7", padding: "2px 8px", borderRadius: "4px" }}>
                      {scheme.benefits.subsidyPercentage} Subsidy
                    </span>
                  )}
                </div>

                <div style={{ fontSize: "11.5px", color: "#64748b", margin: "6px 0" }}>
                  <strong>Dept:</strong> {scheme.department}
                </div>

                <div style={{ fontSize: "11.5px", color: "#0f172a", display: "flex", alignItems: "center", gap: "4px" }}>
                  <FaShieldAlt style={{ color: "#16a34a" }} />
                  Verified: {scheme.lastVerifiedDate ? new Date(scheme.lastVerifiedDate).toLocaleDateString("en-IN") : "Pending"}
                </div>

                <div className="admin-mobile-card-actions">
                  <label className="admin-toggle-switch">
                    <input
                      type="checkbox"
                      checked={scheme.isActive}
                      onChange={() => handleToggleStatus(scheme)}
                    />
                    <span className="admin-toggle-slider" />
                  </label>

                  <div className="admin-action-btn-group">
                    <button className="admin-table-btn view" onClick={() => setSelectedScheme(scheme)}>
                      <FaEye />
                    </button>
                    <button className="admin-table-btn edit" onClick={() => handleOpenEditModal(scheme)}>
                      <FaEdit />
                    </button>
                    <button className="admin-table-btn verify" onClick={() => handleVerifyToday(scheme)}>
                      <FaShieldAlt />
                    </button>
                    <button className="admin-table-btn delete" onClick={() => handleDeleteScheme(scheme)}>
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. VIEW SCHEME DETAILS MODAL / DRAWER                                     */}
      {/* ========================================================================= */}
      {selectedScheme && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedScheme(null)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>
                <FaLandmark style={{ color: "#d97706" }} /> {selectedScheme.name}
              </h2>
              <button className="admin-modal-close-btn" onClick={() => setSelectedScheme(null)}>
                <FaTimes />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Top Quick Badges */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
                <span className="admin-scheme-id-tag">{selectedScheme.schemeId}</span>
                <span className={`admin-badge admin-badge-${selectedScheme.category || "general"}`}>
                  {selectedScheme.category}
                </span>
                <span className={`admin-status-pill ${selectedScheme.isActive ? "active" : "inactive"}`}>
                  {selectedScheme.isActive ? "Active (Farmer Visible)" : "Inactive / Archived"}
                </span>
                <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "12px", background: "#f1f5f9", color: "#334155" }}>
                  Timeline: {selectedScheme.applicationStatus || "year-round"}
                </span>
              </div>

              {/* Multilingual Titles */}
              <div className="admin-details-grid">
                <div className="admin-detail-block">
                  <div className="admin-detail-block-title">Marathi Name (मराठी नाव)</div>
                  <div className="admin-detail-block-val">{selectedScheme.nameMr || "—"}</div>
                </div>
                <div className="admin-detail-block">
                  <div className="admin-detail-block-title">Hindi Name (हिंदी नाम)</div>
                  <div className="admin-detail-block-val">{selectedScheme.nameHi || "—"}</div>
                </div>
              </div>

              {/* Department & Overview */}
              <div className="admin-detail-block" style={{ marginBottom: "16px" }}>
                <div className="admin-detail-block-title">Government Department</div>
                <div className="admin-detail-block-val">{selectedScheme.department}</div>
                <div className="admin-detail-block-title" style={{ marginTop: "12px" }}>Description</div>
                <p style={{ margin: "4px 0 0", fontSize: "13.5px", lineHeight: "1.5", color: "#334155" }}>
                  {selectedScheme.description}
                </p>
                {selectedScheme.descriptionMr && (
                  <p style={{ margin: "8px 0 0", fontSize: "13px", lineHeight: "1.5", color: "#065f46" }}>
                    <strong>मराठी:</strong> {selectedScheme.descriptionMr}
                  </p>
                )}
              </div>

              {/* Benefits & Subsidies */}
              <div className="admin-detail-block" style={{ marginBottom: "16px" }}>
                <div className="admin-detail-block-title">💰 Benefits & Subsidies</div>
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "8px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Subsidy Percentage: </span>
                    <strong style={{ color: "#15803d" }}>{selectedScheme.benefits?.subsidyPercentage || "—"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Maximum Cap: </span>
                    <strong style={{ color: "#0f172a" }}>{selectedScheme.benefits?.maxSubsidyAmount || "—"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Type: </span>
                    <strong style={{ textTransform: "capitalize" }}>{selectedScheme.benefits?.benefitType || "subsidy"}</strong>
                  </div>
                </div>
                {selectedScheme.benefits?.benefitDescription && (
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#334155" }}>
                    {selectedScheme.benefits.benefitDescription}
                  </p>
                )}
              </div>

              {/* Eligibility Criteria */}
              <div className="admin-detail-block" style={{ marginBottom: "16px" }}>
                <div className="admin-detail-block-title">🌾 Eligibility Criteria</div>
                <div style={{ fontSize: "12.5px", color: "#334155", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                  <div>
                    <strong>Target Farmers: </strong>
                    {selectedScheme.eligibility?.farmerCategories?.join(", ") || "All"}
                  </div>
                  <div>
                    <strong>Land Limits: </strong>
                    {selectedScheme.eligibility?.minLandHectares ? `Min ${selectedScheme.eligibility.minLandHectares} ha` : "No Min"}
                    {" — "}
                    {selectedScheme.eligibility?.maxLandHectares ? `Max ${selectedScheme.eligibility.maxLandHectares} ha` : "No Max"}
                  </div>
                  <div>
                    <strong>Irrigation Required: </strong>
                    {selectedScheme.eligibility?.irrigationRequired ? "Yes (Assured Source)" : "No"}
                  </div>
                  <div>
                    <strong>Residency: </strong>
                    {selectedScheme.eligibility?.residencyRequired || "Maharashtra"}
                  </div>
                </div>

                {selectedScheme.eligibility?.applicableCrops?.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b" }}>Applicable Crops:</div>
                    <div className="admin-tags-wrap">
                      {selectedScheme.eligibility.applicableCrops.map(crop => (
                        <span key={crop} className="admin-tag">{crop}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedScheme.eligibility?.applicableDistricts?.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b" }}>Applicable Districts:</div>
                    <div className="admin-tags-wrap">
                      {selectedScheme.eligibility.applicableDistricts.map(dist => (
                        <span key={dist} className="admin-tag">{dist}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Required Documents */}
              <div className="admin-detail-block" style={{ marginBottom: "16px" }}>
                <div className="admin-detail-block-title">📑 Required Documents</div>
                <div className="admin-tags-wrap">
                  {selectedScheme.requiredDocuments?.length > 0 ? (
                    selectedScheme.requiredDocuments.map(doc => (
                      <span key={doc} className="admin-tag" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                        ✓ {doc}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Standard farmer KYC documents.</span>
                  )}
                </div>
              </div>

              {/* Official Links & Verification Audit */}
              <div className="admin-detail-block">
                <div className="admin-detail-block-title">🔗 Official Links & Government Verification</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                  <div>
                    <strong>MahaDBT Portal URL: </strong>
                    <a href={selectedScheme.officialLink} target="_blank" rel="noopener noreferrer" style={{ color: "#15803d", textDecoration: "underline", wordBreak: "break-all" }}>
                      {selectedScheme.officialLink} <FaExternalLinkAlt style={{ fontSize: "10px" }} />
                    </a>
                  </div>
                  {selectedScheme.sourceGrLink && (
                    <div>
                      <strong>Official Government Resolution (GR) Link: </strong>
                      <a href={selectedScheme.sourceGrLink} target="_blank" rel="noopener noreferrer" style={{ color: "#0284c7", textDecoration: "underline", wordBreak: "break-all" }}>
                        {selectedScheme.sourceGrLink} <FaExternalLinkAlt style={{ fontSize: "10px" }} />
                      </a>
                    </div>
                  )}
                  {selectedScheme.helplineNumber && (
                    <div>
                      <strong>Toll-Free Helpline: </strong>
                      <span style={{ color: "#0f172a", fontWeight: 700 }}>{selectedScheme.helplineNumber}</span>
                    </div>
                  )}
                  <div style={{ marginTop: "6px", padding: "8px 12px", background: "#dcfce7", borderRadius: "8px", border: "1px solid #86efac", color: "#14532d", fontSize: "12px" }}>
                    🛡️ <strong>Verified Source:</strong> {selectedScheme.verifiedSource} <br />
                    📅 <strong>Last Official Audit Date:</strong> {selectedScheme.lastVerifiedDate ? new Date(selectedScheme.lastVerifiedDate).toLocaleDateString("en-IN") : "Not Recorded"}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setSelectedScheme(null)}>
                Close
              </button>
              <button
                className="admin-btn-primary"
                onClick={() => {
                  const s = selectedScheme;
                  setSelectedScheme(null);
                  handleOpenEditModal(s);
                }}
              >
                <FaEdit /> Edit Scheme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ADD / EDIT GOVERNMENT SCHEME MODAL (FULL RICH FORM)                     */}
      {/* ========================================================================= */}
      {formModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setFormModalOpen(false)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>
                <FaLandmark style={{ color: "#d97706" }} />
                {editingSchemeId ? "Edit Government Scheme" : "Add New Official Government Scheme"}
              </h2>
              <button className="admin-modal-close-btn" onClick={() => setFormModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ padding: "0 24px", background: "#f8fafc" }}>
              <div className="admin-form-tabs">
                <button
                  type="button"
                  className={`admin-form-tab-btn ${formTab === "basic" ? "active" : ""}`}
                  onClick={() => setFormTab("basic")}
                >
                  1. Basic Info
                </button>
                <button
                  type="button"
                  className={`admin-form-tab-btn ${formTab === "description" ? "active" : ""}`}
                  onClick={() => setFormTab("description")}
                >
                  2. Description
                </button>
                <button
                  type="button"
                  className={`admin-form-tab-btn ${formTab === "benefits" ? "active" : ""}`}
                  onClick={() => setFormTab("benefits")}
                >
                  3. Benefits & Subsidy
                </button>
                <button
                  type="button"
                  className={`admin-form-tab-btn ${formTab === "eligibility" ? "active" : ""}`}
                  onClick={() => setFormTab("eligibility")}
                >
                  4. Eligibility Rules
                </button>
                <button
                  type="button"
                  className={`admin-form-tab-btn ${formTab === "docs" ? "active" : ""}`}
                  onClick={() => setFormTab("docs")}
                >
                  5. Required Documents
                </button>
                <button
                  type="button"
                  className={`admin-form-tab-btn ${formTab === "links" ? "active" : ""}`}
                  onClick={() => setFormTab("links")}
                >
                  6. Official Links & Verification
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveScheme} className="admin-modal-body">
              {/* TAB 1: BASIC INFO */}
              {formTab === "basic" && (
                <div>
                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        Scheme ID <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="e.g. MAHA-PMKSY-01"
                        value={formData.schemeId}
                        onChange={(e) => setFormData({ ...formData, schemeId: e.target.value })}
                        required
                      />
                      <span className="admin-form-hint">Unique identifier for database indexing.</span>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        Category <span className="required-star">*</span>
                      </label>
                      <select
                        className="admin-form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {CATEGORY_OPTIONS.filter(o => o.value !== "all").map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="admin-form-group full-width">
                    <label className="admin-form-label">
                      Scheme Name (English) <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. Sub-Mission on Agricultural Mechanization (SMAM)"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Scheme Name (Marathi / मराठी)</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="उदा. कृषी यांत्रिकीकरण उप-अभियान (SMAM)"
                        value={formData.nameMr}
                        onChange={(e) => setFormData({ ...formData, nameMr: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Scheme Name (Hindi / हिंदी)</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="उदा. कृषि यंत्रीकरण उप-मिशन"
                        value={formData.nameHi}
                        onChange={(e) => setFormData({ ...formData, nameHi: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        Government Department <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="e.g. Department of Agriculture, Govt. of Maharashtra"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Application Status</label>
                      <select
                        className="admin-form-select"
                        value={formData.applicationStatus}
                        onChange={(e) => setFormData({ ...formData, applicationStatus: e.target.value })}
                      >
                        {APPLICATION_STATUS_OPTIONS.filter(o => o.value !== "all").map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DESCRIPTION */}
              {formTab === "description" && (
                <div>
                  <div className="admin-form-group full-width">
                    <label className="admin-form-label">
                      Official Description (English) <span className="required-star">*</span>
                    </label>
                    <textarea
                      className="admin-form-textarea"
                      placeholder="Comprehensive overview of scheme objectives, scope, and government target..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="admin-form-group full-width">
                    <label className="admin-form-label">Official Description (Marathi / मराठी)</label>
                    <textarea
                      className="admin-form-textarea"
                      placeholder="योजनेची सविस्तर माहिती, उद्दिष्टे व लाभ..."
                      value={formData.descriptionMr}
                      onChange={(e) => setFormData({ ...formData, descriptionMr: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="admin-form-group full-width">
                    <label className="admin-form-label">Official Description (Hindi / हिंदी)</label>
                    <textarea
                      className="admin-form-textarea"
                      placeholder="योजना का विस्तृत विवरण, उद्देश्य और लाभ..."
                      value={formData.descriptionHi}
                      onChange={(e) => setFormData({ ...formData, descriptionHi: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: BENEFITS */}
              {formTab === "benefits" && (
                <div>
                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Benefit Type</label>
                      <select
                        className="admin-form-select"
                        value={formData.benefits.benefitType}
                        onChange={(e) => setFormData({
                          ...formData,
                          benefits: { ...formData.benefits, benefitType: e.target.value }
                        })}
                      >
                        {BENEFIT_TYPE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Subsidy Percentage</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="e.g. 50% or 80%"
                        value={formData.benefits.subsidyPercentage}
                        onChange={(e) => setFormData({
                          ...formData,
                          benefits: { ...formData.benefits, subsidyPercentage: e.target.value }
                        })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Maximum Subsidy Amount (₹)</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="e.g. ₹1,25,000 or ₹2.5 Lakh"
                        value={formData.benefits.maxSubsidyAmount}
                        onChange={(e) => setFormData({
                          ...formData,
                          benefits: { ...formData.benefits, maxSubsidyAmount: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group full-width">
                    <label className="admin-form-label">Benefit Details (English)</label>
                    <textarea
                      className="admin-form-textarea"
                      placeholder="Specific machinery models, subsidy slabs for SC/ST/Small farmers, disbursement process..."
                      value={formData.benefits.benefitDescription}
                      onChange={(e) => setFormData({
                        ...formData,
                        benefits: { ...formData.benefits, benefitDescription: e.target.value }
                      })}
                      rows={3}
                    />
                  </div>

                  <div className="admin-form-group full-width">
                    <label className="admin-form-label">Benefit Details (Marathi / मराठी)</label>
                    <textarea
                      className="admin-form-textarea"
                      placeholder="अनुदान तपशील व लाभाचे स्वरूप..."
                      value={formData.benefits.benefitDescriptionMr}
                      onChange={(e) => setFormData({
                        ...formData,
                        benefits: { ...formData.benefits, benefitDescriptionMr: e.target.value }
                      })}
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: ELIGIBILITY RULES */}
              {formTab === "eligibility" && (
                <div>
                  <div className="admin-form-group full-width">
                    <label className="admin-form-label">Applicable Farmer Categories</label>
                    <div className="admin-checkbox-pills-grid">
                      {FARMER_CATEGORY_LIST.map(cat => {
                        const isSelected = formData.eligibility.farmerCategories.includes(cat.id);
                        return (
                          <div
                            key={cat.id}
                            className={`admin-checkbox-pill ${isSelected ? "selected" : ""}`}
                            onClick={() => handleCategoryPillToggle(cat.id)}
                          >
                            {isSelected && <FaCheck style={{ fontSize: "10px" }} />}
                            {cat.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Minimum Land Area (Hectares)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="admin-form-input"
                        placeholder="e.g. 0.4 (Leave blank if none)"
                        value={formData.eligibility.minLandHectares}
                        onChange={(e) => setFormData({
                          ...formData,
                          eligibility: { ...formData.eligibility, minLandHectares: e.target.value }
                        })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Maximum Land Area (Hectares)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="admin-form-input"
                        placeholder="e.g. 5.0 (Leave blank if none)"
                        value={formData.eligibility.maxLandHectares}
                        onChange={(e) => setFormData({
                          ...formData,
                          eligibility: { ...formData.eligibility, maxLandHectares: e.target.value }
                        })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Residency Requirement</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={formData.eligibility.residencyRequired}
                        onChange={(e) => setFormData({
                          ...formData,
                          eligibility: { ...formData.eligibility, residencyRequired: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group full-width">
                    <label className="admin-form-label">Applicable Crops (Comma-separated)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. Cotton, Soybean, Sugarcane, Wheat, Pomegranate, Onion (Leave empty for All Crops)"
                      value={formData.eligibility.applicableCrops}
                      onChange={(e) => setFormData({
                        ...formData,
                        eligibility: { ...formData.eligibility, applicableCrops: e.target.value }
                      })}
                    />
                    <span className="admin-form-hint">Leave blank to automatically match all crops in Maharashtra.</span>
                  </div>

                  <div className="admin-form-group full-width">
                    <label className="admin-form-label">Applicable Districts (Comma-separated)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. Pune, Nashik, Solapur, Nagpur, Chhatrapati Sambhajinagar (Leave empty for All Maharashtra)"
                      value={formData.eligibility.applicableDistricts}
                      onChange={(e) => setFormData({
                        ...formData,
                        eligibility: { ...formData.eligibility, applicableDistricts: e.target.value }
                      })}
                    />
                    <span className="admin-form-hint">Leave blank if the scheme applies to all 36 Maharashtra districts.</span>
                  </div>

                  <div className="admin-form-group full-width" style={{ marginTop: "10px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: 700, fontSize: "13.5px" }}>
                      <input
                        type="checkbox"
                        checked={formData.eligibility.irrigationRequired}
                        onChange={(e) => setFormData({
                          ...formData,
                          eligibility: { ...formData.eligibility, irrigationRequired: e.target.checked }
                        })}
                        style={{ width: "18px", height: "18px", accentColor: "#15803d" }}
                      />
                      Requires Assured Water / Irrigation Source (Well, Borewell, Farm Pond)
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 5: REQUIRED DOCUMENTS */}
              {formTab === "docs" && (
                <div>
                  <div className="admin-form-group full-width">
                    <label className="admin-form-label">Required Documents (English, Comma-separated)</label>
                    <textarea
                      className="admin-form-textarea"
                      placeholder="e.g. 7/12 Extract, 8-A Extract, Aadhaar Card, Bank Passbook, Caste Certificate (if SC/ST)"
                      value={formData.requiredDocuments}
                      onChange={(e) => setFormData({ ...formData, requiredDocuments: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="admin-form-group full-width">
                    <label className="admin-form-label">Required Documents (Marathi / मराठी, Comma-separated)</label>
                    <textarea
                      className="admin-form-textarea"
                      placeholder="उदा. ७/१२ उतारा, ८-अ उतारा, आधार कार्ड, बँक पासबुक, जात प्रमाणपत्र"
                      value={formData.requiredDocumentsMr}
                      onChange={(e) => setFormData({ ...formData, requiredDocumentsMr: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* TAB 6: OFFICIAL LINKS & VERIFICATION */}
              {formTab === "links" && (
                <div>
                  <div className="admin-form-group full-width">
                    <label className="admin-form-label">
                      Official MahaDBT Application URL <span className="required-star">*</span>
                    </label>
                    <input
                      type="url"
                      className="admin-form-input"
                      placeholder="https://mahadbt.maharashtra.gov.in/Farmer/..."
                      value={formData.officialLink}
                      onChange={(e) => setFormData({ ...formData, officialLink: e.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-form-group full-width">
                    <label className="admin-form-label">Official Government Resolution (GR) / Krishi Portal URL</label>
                    <input
                      type="url"
                      className="admin-form-input"
                      placeholder="https://krishi.maharashtra.gov.in/... or https://gr.maharashtra.gov.in/..."
                      value={formData.sourceGrLink}
                      onChange={(e) => setFormData({ ...formData, sourceGrLink: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Official Government Source Stamp</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="e.g. MahaDBT Portal – mahadbt.maharashtra.gov.in"
                        value={formData.verifiedSource}
                        onChange={(e) => setFormData({ ...formData, verifiedSource: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Official Helpline / Toll-Free Number</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="e.g. 1800-120-8040"
                        value={formData.helplineNumber}
                        onChange={(e) => setFormData({ ...formData, helplineNumber: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Last Verified Date</label>
                      <input
                        type="date"
                        className="admin-form-input"
                        value={formData.lastVerifiedDate}
                        onChange={(e) => setFormData({ ...formData, lastVerifiedDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group full-width" style={{ marginTop: "12px", background: "#f0fdf4", padding: "14px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: 800, fontSize: "14px", color: "#14532d" }}>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        style={{ width: "20px", height: "20px", accentColor: "#15803d" }}
                      />
                      Make Scheme Active and Live on Farmer Portal Immediately
                    </label>
                    <span style={{ fontSize: "12px", color: "#166534", marginLeft: "30px", display: "block", marginTop: "2px" }}>
                      When checked, this scheme will immediately appear in farmer scheme recommendations and search in real-time.
                    </span>
                  </div>
                </div>
              )}

              <div className="admin-modal-footer" style={{ margin: "20px -24px -24px", padding: "16px 24px" }}>
                <button type="button" className="admin-btn-secondary" onClick={() => setFormModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? "Saving to MongoDB..." : editingSchemeId ? "Update Government Scheme" : "Publish Official Scheme"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchemesPage;
