import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaFilter,
  FaBookmark,
  FaRegBookmark,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaShieldAlt,
  FaLandmark,
  FaSyncAlt,
  FaWater,
  FaTractor,
  FaAppleAlt,
  FaUsers,
  FaCloudSunRain,
  FaWarehouse,
  FaArrowRight,
  FaInfoCircle
} from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import schemeService from "../services/schemeService";
import SchemeDetailModal from "../components/common/SchemeDetailModal";
import "./SchemesPage.css";

const CATEGORIES = [
  { id: "all", labelEn: "All Schemes", labelHi: "सभी योजनाएं", labelMr: "सर्व योजना", icon: FaLandmark },
  { id: "irrigation", labelEn: "Irrigation & Ponds", labelHi: "सिंचाई एवं शेततले", labelMr: "सिंचन व शेततळे", icon: FaWater },
  { id: "mechanization", labelEn: "Farm Machinery", labelHi: "कृषि यंत्रीकरण", labelMr: "कृषी यांत्रिकीकरण", icon: FaTractor },
  { id: "horticulture", labelEn: "Horticulture & Fruits", labelHi: "बागवानी एवं फलबाग", labelMr: "फलोत्पादन व फळबाग", icon: FaAppleAlt },
  { id: "sc-welfare", labelEn: "SC Welfare", labelHi: "अनुसूचित जाति कल्याण", labelMr: "अनुसूचित जाती कल्याण", icon: FaUsers },
  { id: "tribal-welfare", labelEn: "ST Tribal Welfare", labelHi: "जनजाति कल्याण (ST)", labelMr: "अनुसूचित जमाती (ST)", icon: FaUsers },
  { id: "food-security", labelEn: "Food Security (NFSM)", labelHi: "खाद्य सुरक्षा (NFSM)", labelMr: "अन्न सुरक्षा (NFSM)", icon: FaLandmark },
  { id: "rainfed", labelEn: "Rainfed (RAD)", labelHi: "वर्षा सिंचित (RAD)", labelMr: "कोरडवाहू विकास (RAD)", icon: FaCloudSunRain },
  { id: "infrastructure", labelEn: "Infrastructure (RKVY)", labelHi: "अधोसंरचना (RKVY)", labelMr: "पायाभूत सुविधा (RKVY)", icon: FaWarehouse },
];

const SchemesPage = () => {
  const { language, t } = useLanguage();

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [eligibilityFilter, setEligibilityFilter] = useState("all"); // 'all' | 'eligible' | 'partial' | 'ineligible' | 'saved'
  const [selectedCrop, setSelectedCrop] = useState("all");

  // Detail Modal
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Bookmark Set for fast UI toggles
  const [bookmarkedSet, setBookmarkedSet] = useState(new Set());

  // Fetch schemes on mount
  const fetchSchemes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await schemeService.getSchemes();
      if (data && data.schemes) {
        setSchemes(data.schemes);
        const bms = new Set(data.schemes.filter(s => s.isBookmarked).map(s => s._id));
        setBookmarkedSet(bms);
      }
    } catch (err) {
      console.error("Error loading schemes:", err);
      setError(
        language === "mr"
          ? "शासकीय योजनांची माहिती लोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा."
          : language === "hi"
          ? "सरकारी योजनाओं की जानकारी लोड करने में त्रुटि। कृपया पुनः प्रयास करें।"
          : "Unable to load government schemes from the server. Please refresh."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  // Handle Bookmark Toggle
  const handleToggleBookmark = async (schemeId) => {
    try {
      const updated = new Set(bookmarkedSet);
      if (updated.has(schemeId)) {
        updated.delete(schemeId);
      } else {
        updated.add(schemeId);
      }
      setBookmarkedSet(updated);

      // Also update currently open modal object if applicable
      if (selectedScheme && selectedScheme._id === schemeId) {
        setSelectedScheme(prev => ({ ...prev, isBookmarked: !prev.isBookmarked }));
      }

      await schemeService.toggleBookmark(schemeId);
    } catch (err) {
      console.error("Bookmark toggle error:", err);
    }
  };

  // Open Details Modal
  const handleOpenDetail = (scheme) => {
    setSelectedScheme(scheme);
    setIsModalOpen(true);
  };

  // Extract all unique crops from schemes
  const availableCrops = useMemo(() => {
    const crops = new Set();
    schemes.forEach(s => {
      if (s.eligibility?.applicableCrops) {
        s.eligibility.applicableCrops.forEach(c => {
          if (c !== "all") crops.add(c);
        });
      }
    });
    return Array.from(crops);
  }, [schemes]);

  // Filtered schemes
  const filteredSchemes = useMemo(() => {
    return schemes.filter(scheme => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (scheme.name || "").toLowerCase().includes(q);
        const nameHiMatch = (scheme.nameHi || "").toLowerCase().includes(q);
        const nameMrMatch = (scheme.nameMr || "").toLowerCase().includes(q);
        const descMatch = (scheme.description || "").toLowerCase().includes(q);
        const deptMatch = (scheme.department || "").toLowerCase().includes(q);
        if (!nameMatch && !nameHiMatch && !nameMrMatch && !descMatch && !deptMatch) {
          return false;
        }
      }

      // 2. Category filter
      if (selectedCategory !== "all" && scheme.category !== selectedCategory) {
        return false;
      }

      // 3. Eligibility & Saved filter
      if (eligibilityFilter === "saved") {
        if (!bookmarkedSet.has(scheme._id)) return false;
      } else if (eligibilityFilter !== "all") {
        const evalStatus = scheme.evaluation?.status || "partial";
        if (evalStatus !== eligibilityFilter) return false;
      }

      // 4. Crop filter
      if (selectedCrop !== "all") {
        const crops = scheme.eligibility?.applicableCrops || [];
        const matchesCrop = crops.includes("all") || crops.some(c => c.toLowerCase().includes(selectedCrop.toLowerCase()));
        if (!matchesCrop) return false;
      }

      return true;
    });
  }, [schemes, searchQuery, selectedCategory, eligibilityFilter, selectedCrop, bookmarkedSet]);

  // Statistics
  const stats = useMemo(() => {
    const eligibleCount = schemes.filter(s => s.evaluation?.status === "eligible").length;
    const partialCount = schemes.filter(s => s.evaluation?.status === "partial").length;
    const bookmarkedCount = bookmarkedSet.size;
    return {
      total: schemes.length,
      eligible: eligibleCount,
      partial: partialCount,
      saved: bookmarkedCount
    };
  }, [schemes, bookmarkedSet]);

  return (
    <div className="ks-schemes-page">
      
      {/* ── Official Source Banner ── */}
      <div className="ks-official-header-banner">
        <div className="ks-banner-left">
          <div className="ks-emblem-badge">
            <FaLandmark />
          </div>
          <div>
            <div className="ks-banner-tags">
              <span className="ks-gov-tag">🏛️ MahaDBT Agriculture</span>
              <span className="ks-verified-tag">
                <FaShieldAlt /> {language === "mr" ? "अधिकृत माहिती" : language === "hi" ? "आधिकारिक डेटा" : "Verified Official Info"}
              </span>
            </div>
            <h1 className="ks-schemes-main-title">
              {language === "mr"
                ? "महाराष्ट्र शासन कृषी व शेतकरी योजना"
                : language === "hi"
                ? "महाराष्ट्र शासन कृषि एवं किसान योजनाएं"
                : "Maharashtra Government Farmer Schemes"}
            </h1>
            <p className="ks-schemes-subtitle">
              {language === "mr"
                ? "महाडीबीटी पोर्टलवरील सर्व थेट शासकीय योजना, अनुदान तपशील आणि आपल्या प्रोफाइलनुसार पात्रता पडताळणी."
                : language === "hi"
                ? "महाडीबीटी पोर्टल की सभी प्रत्यक्ष सरकारी योजनाएं, सब्सिडी विवरण और आपके प्रोफाइल आधारित पात्रता जांच।"
                : "Real-time schemes listed under MahaDBT, official subsidy norms, and automated profile eligibility evaluation."}
            </p>
          </div>
        </div>

        <div className="ks-banner-right">
          <a
            href="https://mahadbt.maharashtra.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="ks-mahadbt-link-btn"
          >
            <span>{language === "mr" ? "महाडीबीटी पोर्टल उघडा" : language === "hi" ? "महाडीबीटी पोर्टल खोलें" : "Open Official MahaDBT Portal"}</span>
            <FaExternalLinkAlt size={12} />
          </a>
        </div>
      </div>

      {/* ── Summary Stats Cards ── */}
      <div className="ks-schemes-stats-grid">
        <div
          className={`ks-stat-card ${eligibilityFilter === "all" ? "selected" : ""}`}
          onClick={() => setEligibilityFilter("all")}
        >
          <div className="ks-stat-icon-wrap" style={{ background: "rgba(21, 128, 61, 0.12)", color: "#15803d" }}>
            <FaLandmark />
          </div>
          <div>
            <span className="ks-stat-count">{stats.total}</span>
            <span className="ks-stat-label">{language === "mr" ? "एकूण योजना" : language === "hi" ? "कुल योजनाएं" : "Total Schemes"}</span>
          </div>
        </div>

        <div
          className={`ks-stat-card ${eligibilityFilter === "eligible" ? "selected" : ""}`}
          onClick={() => setEligibilityFilter("eligible")}
        >
          <div className="ks-stat-icon-wrap" style={{ background: "rgba(22, 163, 74, 0.15)", color: "#16a34a" }}>
            <FaCheckCircle />
          </div>
          <div>
            <span className="ks-stat-count" style={{ color: "#15803d" }}>{stats.eligible}</span>
            <span className="ks-stat-label">{language === "mr" ? "थेट पात्र योजना" : language === "hi" ? "प्रत्यक्ष पात्र" : "Eligible Schemes"}</span>
          </div>
        </div>

        <div
          className={`ks-stat-card ${eligibilityFilter === "partial" ? "selected" : ""}`}
          onClick={() => setEligibilityFilter("partial")}
        >
          <div className="ks-stat-icon-wrap" style={{ background: "rgba(217, 119, 6, 0.15)", color: "#d97706" }}>
            <FaExclamationTriangle />
          </div>
          <div>
            <span className="ks-stat-count" style={{ color: "#d97706" }}>{stats.partial}</span>
            <span className="ks-stat-label">{language === "mr" ? "शर्ती पडताळा" : language === "hi" ? "शर्तें जांचें" : "Verify Requirements"}</span>
          </div>
        </div>

        <div
          className={`ks-stat-card ${eligibilityFilter === "saved" ? "selected" : ""}`}
          onClick={() => setEligibilityFilter("saved")}
        >
          <div className="ks-stat-icon-wrap" style={{ background: "rgba(147, 51, 234, 0.12)", color: "#9333ea" }}>
            <FaBookmark />
          </div>
          <div>
            <span className="ks-stat-count" style={{ color: "#9333ea" }}>{stats.saved}</span>
            <span className="ks-stat-label">{language === "mr" ? "जतन केलेल्या" : language === "hi" ? "सहेजी गई" : "Saved Bookmarks"}</span>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="ks-schemes-toolbar">
        
        {/* Search Bar */}
        <div className="ks-schemes-search-box">
          <FaSearch className="ks-search-icon" />
          <input
            type="text"
            className="ks-schemes-search-input"
            placeholder={
              language === "mr"
                ? "योजनेचे नाव, विभाग किंवा कीवर्ड शोधा..."
                : language === "hi"
                ? "योजना का नाम, विभाग या कीवर्ड खोजें..."
                : "Search schemes by name, department, or keyword..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="ks-clear-search-btn"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>

        {/* Crop Filter Dropdown */}
        <div className="ks-filter-select-wrap">
          <select
            className="ks-filter-select"
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
          >
            <option value="all">{language === "mr" ? "🌱 सर्व पिके" : language === "hi" ? "🌱 सभी फसलें" : "🌱 All Crops"}</option>
            {availableCrops.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          className="ks-refresh-btn"
          onClick={fetchSchemes}
          title="Refresh scheme data"
          aria-label="Refresh"
        >
          <FaSyncAlt className={loading ? "spinning" : ""} />
        </button>

      </div>

      {/* ── Category Chips Bar ── */}
      <div className="ks-category-chips-scroll">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const label = language === "mr" ? cat.labelMr : language === "hi" ? cat.labelHi : cat.labelEn;
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              className={`ks-cat-chip ${isActive ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Schemes Results Section ── */}
      {loading ? (
        <div className="ks-schemes-loading">
          <div className="ks-spinner" />
          <p>
            {language === "mr"
              ? "शासकीय योजनांची माहिती व पात्रता लोड होत आहे..."
              : language === "hi"
              ? "सरकारी योजनाएं और पात्रता लोड हो रही है..."
              : "Loading verified government schemes & evaluating eligibility..."}
          </p>
        </div>
      ) : error ? (
        <div className="ks-schemes-error-box">
          <FaExclamationTriangle size={32} color="#dc2626" />
          <h3>{error}</h3>
          <button type="button" className="ks-retry-btn" onClick={fetchSchemes}>
            {language === "mr" ? "पुन्हा प्रयत्न करा" : language === "hi" ? "पुनः प्रयास करें" : "Retry"}
          </button>
        </div>
      ) : filteredSchemes.length === 0 ? (
        <div className="ks-schemes-empty-box">
          <FaLandmark size={44} color="#94a3b8" />
          <h3>
            {language === "mr"
              ? "कोणतीही शासकीय योजना आढळली नाही"
              : language === "hi"
              ? "कोई सरकारी योजना नहीं मिली"
              : "No schemes match your filters"}
          </h3>
          <p>
            {language === "mr"
              ? "कृपया आपले शोध शब्द किंवा फिल्टर बदलून पहा."
              : language === "hi"
              ? "कृपया अपने खोज शब्द या फ़िल्टर बदल कर देखें।"
              : "Try adjusting your search query, crop filter, or category selection."}
          </p>
          <button
            type="button"
            className="ks-reset-filters-btn"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setEligibilityFilter("all");
              setSelectedCrop("all");
            }}
          >
            {language === "mr" ? "सर्व फिल्टर रीसेट करा" : language === "hi" ? "सभी फ़िल्टर रीसेट करें" : "Reset All Filters"}
          </button>
        </div>
      ) : (
        <div className="ks-schemes-grid">
          {filteredSchemes.map((scheme, index) => {
            const displayName =
              language === "mr" && scheme.nameMr
                ? scheme.nameMr
                : language === "hi" && scheme.nameHi
                ? scheme.nameHi
                : scheme.name;
            const officialEnName = scheme.name;
            const displayDesc =
              language === "mr" && scheme.descriptionMr
                ? scheme.descriptionMr
                : language === "hi" && scheme.descriptionHi
                ? scheme.descriptionHi
                : scheme.description;
            const isBookmarked = bookmarkedSet.has(scheme._id);
            const evalData = scheme.evaluation;
            const evalBadge = evalData
              ? language === "mr"
                ? evalData.statusBadgeMr
                : language === "hi"
                ? evalData.statusBadgeHi
                : evalData.statusBadge
              : null;

            return (
              <motion.div
                key={scheme._id}
                className="ks-scheme-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.25 }}
              >
                {/* Card Top: Category + Bookmark */}
                <div className="ks-card-top-row">
                  <span className="ks-scheme-card-cat">
                    {scheme.category?.toUpperCase() || "AGRICULTURE"}
                  </span>
                  <button
                    type="button"
                    className={`ks-card-bookmark-btn ${isBookmarked ? "active" : ""}`}
                    onClick={() => handleToggleBookmark(scheme._id)}
                    title={isBookmarked ? "Saved" : "Save Scheme"}
                    aria-label="Bookmark scheme"
                  >
                    {isBookmarked ? <FaBookmark color="#15803d" /> : <FaRegBookmark color="#94a3b8" />}
                  </button>
                </div>

                {/* Scheme Title */}
                <h3 className="ks-scheme-card-title">{displayName}</h3>
                {displayName !== officialEnName && (
                  <p className="ks-scheme-card-en-ref">{officialEnName}</p>
                )}

                {/* Short Description */}
                <p className="ks-scheme-card-desc">{displayDesc}</p>

                {/* Benefit Highlight Pill */}
                {scheme.benefits?.subsidyPercentage && (
                  <div className="ks-card-benefit-pill">
                    <span className="ks-b-icon">💰</span>
                    <span className="ks-b-text">{scheme.benefits.subsidyPercentage}</span>
                  </div>
                )}

                {/* 🎯 Real Profile Eligibility Badge */}
                {evalData && (
                  <div
                    className="ks-card-eligibility-badge"
                    style={{
                      background: evalData.bg || "#f1f5f9",
                      borderColor: `${evalData.color || "#cbd5e1"}55`,
                      color: evalData.color || "#334155"
                    }}
                  >
                    <div className="ks-badge-icon">
                      {evalData.status === "eligible" && <FaCheckCircle />}
                      {evalData.status === "partial" && <FaExclamationTriangle />}
                      {evalData.status === "ineligible" && <FaTimesCircle />}
                    </div>
                    <span className="ks-badge-text">{evalBadge}</span>
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="ks-card-actions-footer">
                  <button
                    type="button"
                    className="ks-card-details-btn"
                    onClick={() => handleOpenDetail(scheme)}
                  >
                    <span>{language === "mr" ? "सविस्तर माहिती" : language === "hi" ? "विस्तृत विवरण" : "View Details"}</span>
                    <FaArrowRight size={11} />
                  </button>

                  <a
                    href={scheme.officialLink || "https://mahadbt.maharashtra.gov.in"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ks-card-apply-btn"
                    title="Open MahaDBT Portal"
                  >
                    <span>{language === "mr" ? "महाडीबीटी" : language === "hi" ? "महाडीबीटी" : "MahaDBT"}</span>
                    <FaExternalLinkAlt size={11} />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Official Disclaimer Footer ── */}
      <div className="ks-schemes-disclaimer-card">
        <FaInfoCircle className="ks-disc-icon" />
        <div>
          <h4>
            {language === "mr"
              ? "शासकीय योजना व महाडीबीटी मार्गदर्शक सूचना"
              : language === "hi"
              ? "शासकीय योजनाएं एवं महाडीबीटी दिशानिर्देश"
              : "Official Government Source & Disclaimer"}
          </h4>
          <p>
            {language === "mr"
              ? "किसान सेतु वरील सर्व माहिती महाराष्ट्र शासनाच्या कृषी विभाग व महाडीबीटी (MahaDBT) पोर्टलच्या अधिकृत शासन निर्णयांवर आधारित आहे. शासकीय योजनेचा प्रत्यक्ष अर्ज फक्त अधिकृत महाडीबीटी पोर्टल (mahadbt.maharashtra.gov.in) वरच सादर होतो."
              : language === "hi"
              ? "किसान सेतु पर प्रदर्शित सभी जानकारी महाराष्ट्र शासन के कृषि विभाग व महाडीबीटी पोर्टल के आधिकारिक शासनादेशों पर आधारित है। योजना का वास्तविक आवेदन केवल आधिकारिक महाडीबीटी पोर्टल (mahadbt.maharashtra.gov.in) पर ही प्रस्तुत होता है।"
              : "All information displayed is verified against official Government Resolutions (GRs) and notifications from the Department of Agriculture, Maharashtra. Official scheme applications are processed exclusively on the MahaDBT Portal (mahadbt.maharashtra.gov.in)."}
          </p>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      <SchemeDetailModal
        scheme={selectedScheme}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onToggleBookmark={handleToggleBookmark}
        isBookmarked={selectedScheme ? bookmarkedSet.has(selectedScheme._id) : false}
      />

    </div>
  );
};

export default SchemesPage;
