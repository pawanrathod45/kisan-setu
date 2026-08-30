import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaExternalLinkAlt,
  FaBookmark,
  FaRegBookmark,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaFileAlt,
  FaMoneyBillWave,
  FaBuilding,
  FaCalendarCheck,
  FaShieldAlt,
  FaPhoneAlt,
  FaSeedling,
  FaMapMarkerAlt,
  FaWater,
  FaUserCheck,
  FaArrowLeft
} from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";

const SchemeDetailModal = ({ scheme, isOpen, onClose, onToggleBookmark, isBookmarked }) => {
  const { language } = useLanguage();

  // Prevent background body scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !scheme) return null;

  // Language-specific texts
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
  const displayBenefit =
    language === "mr" && scheme.benefits?.benefitDescriptionMr
      ? scheme.benefits.benefitDescriptionMr
      : language === "hi" && scheme.benefits?.benefitDescriptionHi
      ? scheme.benefits.benefitDescriptionHi
      : scheme.benefits?.benefitDescription;

  const evalData = scheme.evaluation;
  const evalStatus = evalData?.status || "partial";

  const getEvaluationHeader = () => {
    if (evalStatus === "eligible") {
      return {
        icon: <FaCheckCircle size={22} />,
        title: language === "mr" ? "पात्र शेतकरी (Eligible)" : language === "hi" ? "पात्र किसान (Eligible)" : "Eligible for Scheme Benefits",
        colorClass: "eval-eligible"
      };
    }
    if (evalStatus === "ineligible") {
      return {
        icon: <FaTimesCircle size={22} />,
        title: language === "mr" ? "सध्या अपात्र (Not Eligible)" : language === "hi" ? "वर्तमान में अपात्र (Not Eligible)" : "Not Currently Eligible",
        colorClass: "eval-ineligible"
      };
    }
    return {
      icon: <FaExclamationTriangle size={22} />,
      title: language === "mr" ? "शर्ती पडताळा (Verify Requirements)" : language === "hi" ? "शर्तें जांचें (Verify Requirements)" : "May Be Eligible – Verify Requirements",
      colorClass: "eval-partial"
    };
  };

  const evalHeaderInfo = getEvaluationHeader();

  const verifiedDateFormatted = scheme.lastVerifiedDate
    ? new Date(scheme.lastVerifiedDate).toLocaleDateString(language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : "January 2025";

  return (
    <AnimatePresence>
      <div className="ks-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
        <motion.div
          className="ks-modal-card"
          initial={{ opacity: 0, scale: 0.96, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 25 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="ks-modal-header">
            <div className="ks-modal-header-info">
              <div className="ks-modal-category-row">
                <span className="ks-scheme-cat-pill">
                  🏛️ {scheme.category?.toUpperCase() || "AGRICULTURE"}
                </span>
                <span className={`ks-status-pill status-${scheme.applicationStatus || "open"}`}>
                  ● {scheme.applicationStatus === "open" ? (language === "mr" ? "अर्ज सुरू" : language === "hi" ? "आवेदन जारी" : "Applications Open") : scheme.applicationStatus}
                </span>
              </div>
              <h2 className="ks-modal-title">{displayName}</h2>
              {displayName !== officialEnName && (
                <p className="ks-modal-sub-en">{officialEnName}</p>
              )}
              <div className="ks-modal-dept">
                <FaBuilding className="ks-modal-dept-icon" />
                <span>{scheme.department || "Department of Agriculture, Government of Maharashtra"}</span>
              </div>
            </div>

            <div className="ks-modal-header-actions">
              <button
                type="button"
                className={`ks-bookmark-btn ${isBookmarked ? "active" : ""}`}
                onClick={() => onToggleBookmark && onToggleBookmark(scheme._id)}
                title={isBookmarked ? "Saved" : "Save Scheme"}
                aria-label="Bookmark scheme"
              >
                {isBookmarked ? <FaBookmark color="#15803d" /> : <FaRegBookmark color="#64748b" />}
              </button>
              <button
                type="button"
                className="ks-modal-close-btn"
                onClick={onClose}
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Modal Body (Scrollable with zero horizontal overflow) */}
          <div className="ks-modal-body ks-modal-scroll">
            
            {/* 1. 🎯 Real Eligibility Evaluation Card */}
            {evalData && (
              <div className={`ks-eval-card ${evalHeaderInfo.colorClass}`}>
                <div className="ks-eval-header">
                  <div className="ks-eval-icon">
                    {evalHeaderInfo.icon}
                  </div>
                  <div className="ks-eval-title-wrap">
                    <h4 className="ks-eval-status">
                      {evalHeaderInfo.title}
                    </h4>
                    <p className="ks-eval-sub">
                      {language === "mr"
                        ? "आपल्या शेतकरी प्रोफाइल आणि पिकाच्या नोंदीनुसार तपासणी"
                        : language === "hi"
                        ? "आपके किसान प्रोफाइल और फसलों के आधार पर सत्यापन"
                        : "Evaluated against your current farmer profile & crop records"}
                    </p>
                  </div>
                </div>

                {evalData.reasons && evalData.reasons.length > 0 && (
                  <ul className="ks-eval-reasons">
                    {evalData.reasons.map((r, idx) => (
                      <li key={idx}>
                        <span className="ks-eval-bullet">•</span> {r}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* 2. Scheme Overview & Objectives */}
            <div className="ks-modal-section">
              <h3 className="ks-section-heading">
                📝 {language === "mr" ? "योजनेचे स्वरूप व उद्दिष्टे" : language === "hi" ? "योजना का विवरण एवं उद्देश्य" : "Scheme Overview & Objectives"}
              </h3>
              <p className="ks-section-text">{displayDesc}</p>
            </div>

            {/* 3. Benefits & Subsidy Breakdown */}
            <div className="ks-modal-section">
              <h3 className="ks-section-heading">
                💰 {language === "mr" ? "अनुदान व आर्थिक लाभ" : language === "hi" ? "सब्सिडी एवं वित्तीय लाभ" : "Subsidy & Financial Benefits"}
              </h3>
              <div className="ks-benefits-grid">
                {scheme.benefits?.subsidyPercentage && (
                  <div className="ks-benefit-box">
                    <span className="ks-b-label">{language === "mr" ? "अनुदानाची टक्केवारी" : language === "hi" ? "सब्सिडी प्रतिशत" : "Subsidy Rate"}</span>
                    <span className="ks-b-val">{scheme.benefits.subsidyPercentage}</span>
                  </div>
                )}
                {scheme.benefits?.maxSubsidyAmount && (
                  <div className="ks-benefit-box">
                    <span className="ks-b-label">{language === "mr" ? "कमाल मर्यादा / रक्कम" : language === "hi" ? "अधिकतम अनुदान राशि" : "Max Subsidy / Unit Norm"}</span>
                    <span className="ks-b-val">{scheme.benefits.maxSubsidyAmount}</span>
                  </div>
                )}
              </div>
              {displayBenefit && (
                <p className="ks-section-text ks-benefit-extra-text">{displayBenefit}</p>
              )}
            </div>

            {/* 4. Eligibility Criteria Detailed */}
            <div className="ks-modal-section">
              <h3 className="ks-section-heading">
                📋 {language === "mr" ? "पात्रता व निकष" : language === "hi" ? "पात्रता एवं शर्तें" : "Eligibility Criteria"}
              </h3>
              <div className="ks-criteria-list">
                <div className="ks-crit-item">
                  <FaUserCheck className="ks-crit-icon green" />
                  <span>
                    <strong>{language === "mr" ? "शेतकरी प्रवर्ग: " : language === "hi" ? "किसान श्रेणी: " : "Eligible Categories: "}</strong>
                    {scheme.eligibility?.farmerCategories?.map(c => c.toUpperCase()).join(", ") || "All Farmers"}
                  </span>
                </div>
                {scheme.eligibility?.maxLandHectares && (
                  <div className="ks-crit-item">
                    <FaSeedling className="ks-crit-icon green" />
                    <span>
                      <strong>{language === "mr" ? "जमीन मर्यादा: " : language === "hi" ? "भूमि सीमा: " : "Land Holding Limit: "}</strong>
                      {scheme.eligibility.minLandHectares ? `${scheme.eligibility.minLandHectares} ha to ` : "Up to "}
                      {scheme.eligibility.maxLandHectares} Hectares
                    </span>
                  </div>
                )}
                {scheme.eligibility?.irrigationRequired && (
                  <div className="ks-crit-item">
                    <FaWater className="ks-crit-icon blue" />
                    <span>
                      <strong>{language === "mr" ? "पाण्याची सोय: " : language === "hi" ? "सिंचाई सुविधा: " : "Irrigation Requirement: "}</strong>
                      {language === "mr" ? "शेतावर बारमाही पाण्याचा शाश्वत स्त्रोत आवश्यक" : language === "hi" ? "खेत पर सुनिश्चित सिंचाई स्त्रोत आवश्यक" : "Assured source of irrigation required"}
                    </span>
                  </div>
                )}
                <div className="ks-crit-item">
                  <FaMapMarkerAlt className="ks-crit-icon red" />
                  <span>
                    <strong>{language === "mr" ? "कार्यक्षेत्र: " : language === "hi" ? "लागू क्षेत्र: " : "Jurisdiction: "}</strong>
                    {scheme.eligibility?.applicableDistricts?.length > 0
                      ? scheme.eligibility.applicableDistricts.join(", ")
                      : language === "mr" ? "संपूर्ण महाराष्ट्र राज्य" : language === "hi" ? "संपूर्ण महाराष्ट्र राज्य" : "All Districts of Maharashtra"}
                  </span>
                </div>
              </div>

              {/* Additional specific criteria list */}
              {scheme.eligibility?.additionalCriteria && scheme.eligibility.additionalCriteria.length > 0 && (
                <div className="ks-add-criteria-box">
                  <h4 className="ks-add-crit-title">
                    {language === "mr" ? "महत्वाच्या अटी व नियम:" : language === "hi" ? "महत्वपूर्ण शर्तें व नियम:" : "Key Guidelines & Rules:"}
                  </h4>
                  <ul className="ks-bullet-list">
                    {(language === "mr" && scheme.eligibility.additionalCriteriaMr
                      ? scheme.eligibility.additionalCriteriaMr
                      : language === "hi" && scheme.eligibility.additionalCriteriaHi
                      ? scheme.eligibility.additionalCriteriaHi
                      : scheme.eligibility.additionalCriteria
                    ).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 5. Required Documents Checklist */}
            {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 && (
              <div className="ks-modal-section">
                <h3 className="ks-section-heading">
                  📄 {language === "mr" ? "आवश्यक कागदपत्रे" : language === "hi" ? "आवश्यक दस्तावेज" : "Required Documents Checklist"}
                </h3>
                <div className="ks-docs-grid">
                  {(language === "mr" && scheme.requiredDocumentsMr
                    ? scheme.requiredDocumentsMr
                    : language === "hi" && scheme.requiredDocumentsHi
                    ? scheme.requiredDocumentsHi
                    : scheme.requiredDocuments
                  ).map((doc, idx) => (
                    <div key={idx} className="ks-doc-chip">
                      <FaFileAlt className="ks-doc-icon" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Verification Source & Helpline */}
            <div className="ks-verification-box">
              <div className="ks-v-left">
                <FaShieldAlt className="ks-v-shield" />
                <div className="ks-v-text">
                  <p className="ks-v-title">
                    {language === "mr" ? "शासकीय अधिकृत स्त्रोतावरून पडताळणी" : language === "hi" ? "शासकीय आधिकारिक स्त्रोत से सत्यापित" : "Information Verified from Official Source"}
                  </p>
                  <p className="ks-v-desc">
                    {scheme.verifiedSource || "MahaDBT Portal – mahadbt.maharashtra.gov.in"} • {language === "mr" ? "अद्यतन:" : language === "hi" ? "अपडेट:" : "Verified:"} {verifiedDateFormatted}
                  </p>
                </div>
              </div>
              {scheme.helplineNumber && (
                <div className="ks-v-helpline">
                  <FaPhoneAlt /> <span>{scheme.helplineNumber}</span>
                </div>
              )}
            </div>

          </div>

          {/* Modal Footer CTA */}
          <div className="ks-modal-footer">
            <div className="ks-disclaimer-note">
              ℹ️ {language === "mr"
                ? "अर्ज थेट महाराष्ट्र शासनाच्या अधिकृत महाडीबीटी पोर्टलवर सादर होतो."
                : language === "hi"
                ? "आवेदन सीधे महाराष्ट्र शासन के आधिकारिक महाडीबीटी पोर्टल पर प्रस्तुत होता है।"
                : "Applications are submitted directly on the official Government of Maharashtra MahaDBT portal."}
            </div>

            <div className="ks-modal-btn-row">
              {scheme.sourceGrLink && (
                <a
                  href={scheme.sourceGrLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ks-gr-btn"
                >
                  <FaFileAlt />
                  <span>{language === "mr" ? "शासन निर्णय (GR)" : language === "hi" ? "शासनादेश (GR)" : "Official GR / Details"}</span>
                </a>
              )}

              <a
                href={scheme.officialLink || "https://mahadbt.maharashtra.gov.in"}
                target="_blank"
                rel="noopener noreferrer"
                className="ks-apply-official-btn"
              >
                <span>{language === "mr" ? "महाडीबीटी पोर्टलवर अर्ज करा" : language === "hi" ? "महाडीबीटी पोर्टल पर आवेदन करें" : "Apply on Official MahaDBT Portal"}</span>
                <FaExternalLinkAlt size={13} />
              </a>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SchemeDetailModal;
