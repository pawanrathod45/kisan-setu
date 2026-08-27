import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaShieldAlt, FaArrowRight, FaRedoAlt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { GiWheat } from "react-icons/gi";
import API from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import "../styles/Login.css";

const FARMER_WELCOME_VIDEO_URL =
  "https://assets.mixkit.co/videos/preview/mixkit-farmer-walking-in-a-field-of-wheat-42617-large.mp4";
const FARMER_POSTER_IMAGE =
  "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=1200&auto=format&fit=crop";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailParam = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailParam);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);

  const { language, setLanguage, languages } = useLanguage();

  // Mask email for privacy: e.g. "paw***@gmail.com"
  const getMaskedEmail = (raw) => {
    if (!raw || !raw.includes("@")) return raw || "your email";
    const [name, domain] = raw.split("@");
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name.substring(0, 2)}***${name.slice(-1)}@${domain}`;
  };

  // 60-second cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Handle single digit input
  const handleDigitChange = (index, value) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const lastChar = clean.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = lastChar;
    setOtp(newOtp);

    // Auto-advance focus
    if (index < 5 && lastChar) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace & Arrow Navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Paste (Pasting complete 6-digit code)
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = [...otp];
      pasted.split("").forEach((char, idx) => {
        if (idx < 6) newOtp[idx] = char;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  // Submit OTP for verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setError(
        language === "mr"
          ? "कृपया संपूर्ण 6-अंकी पडताळणी कोड टाका."
          : language === "hi"
          ? "कृपया पूरा 6-अंकीय सत्यापन कोड दर्ज करें।"
          : "Please enter the complete 6-digit verification code."
      );
      return;
    }

    if (!email) {
      setError("Email address is missing. Please register again.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/verify-email-otp", {
        email: email.trim(),
        otp: fullOtp,
      });

      if (res.data?.accessToken) {
        localStorage.setItem("token", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        setSuccess(
          language === "mr"
            ? "ईमेल पडताळणी यशस्वी! डॅशबोर्ड सुरू होत आहे..."
            : language === "hi"
            ? "ईमेल सत्यापन सफल! डैशबोर्ड लोड हो रहा है..."
            : "Email verified successfully! Launching portal..."
        );

        setTimeout(() => {
          if (res.data.user?.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/farmer/dashboard");
          }
        }, 800);
      } else {
        setSuccess(res.data?.message || "Email verified! You can now sign in.");
        setTimeout(() => navigate("/login"), 1200);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.response?.data?.message || "Invalid or expired verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Code
  const handleResend = async () => {
    if (resendCooldown > 0 || resending || !email) return;

    try {
      setResending(true);
      setError("");
      const res = await API.post("/auth/resend-email-otp", { email: email.trim() });
      setSuccess(res.data?.message || "Fresh 6-digit verification code sent to your email.");
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error("Resend error:", err);
      setError(err.response?.data?.message || "Failed to resend verification code. Please wait.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="ks-login-viewport">
      {/* Background Video */}
      <video
        className="ks-video-bg"
        autoPlay
        muted
        loop
        playsInline
        poster={FARMER_POSTER_IMAGE}
      >
        <source src={FARMER_WELCOME_VIDEO_URL} type="video/mp4" />
      </video>

      <div className="ks-video-overlay" />

      {/* Language Switcher Bar */}
      <div className="ks-lang-bar">
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            className={`ks-lang-btn ${language === lang.code ? "active" : ""}`}
            onClick={() => setLanguage(lang.code)}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Central Floating Card */}
      <motion.div
        className="ks-floating-card-container"
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ maxWidth: "480px" }}
      >
        <div className="ks-card-form-panel" style={{ width: "100%", padding: "28px 24px" }}>
          
          {/* Header */}
          <div className="ks-form-header" style={{ textAlign: "center", marginBottom: "18px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "#dcfce7",
                color: "#15803d",
                fontSize: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                boxShadow: "0 4px 12px rgba(21, 128, 61, 0.2)"
              }}
            >
              <FaEnvelope />
            </div>

            <h2 className="ks-form-title" style={{ fontSize: "20px" }}>
              {language === "mr"
                ? "आपला ईमेल पडताळणी करा"
                : language === "hi"
                ? "अपना ईमेल सत्यापित करें"
                : "Verify Your Email Address"}
            </h2>

            <p className="ks-form-sub" style={{ marginTop: "4px" }}>
              {language === "mr"
                ? "आम्ही खालील ईमेलवर 6-अंकी सुरक्षा कोड पाठवला आहे:"
                : language === "hi"
                ? "हमने निम्नलिखित ईमेल पर 6-अंकीय सुरक्षा कोड भेजा है:"
                : "We sent a 6-digit verification code to:"}
            </p>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 750,
                color: "#0f172a",
                marginTop: "6px"
              }}
            >
              <span>📬 {getMaskedEmail(email)}</span>
            </div>
          </div>

          {/* Feedback Alerts */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: "#fee2e2",
                  border: "1.5px solid #fca5a5",
                  color: "#dc2626",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 650,
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <FaExclamationTriangle style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: "#dcfce7",
                  border: "1.5px solid #86efac",
                  color: "#15803d",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 750,
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <FaCheckCircle style={{ flexShrink: 0 }} />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 6-Digit OTP Form */}
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                margin: "18px 0 24px"
              }}
              onPaste={handlePaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  style={{
                    width: "48px",
                    height: "54px",
                    textAlign: "center",
                    fontSize: "22px",
                    fontWeight: 800,
                    color: "#0f172a",
                    background: "#f8fafc",
                    border: digit ? "2px solid #16a34a" : "1.5px solid #cbd5e1",
                    borderRadius: "12px",
                    outline: "none",
                    transition: "all 0.15s ease",
                    boxShadow: digit ? "0 0 0 3px rgba(22, 163, 74, 0.15)" : "none"
                  }}
                  autoFocus={index === 0}
                  required
                />
              ))}
            </div>

            <button
              type="submit"
              className="ks-submit-btn"
              disabled={loading || otp.join("").length !== 6}
            >
              {loading ? (
                <span>Verifying code...</span>
              ) : (
                <>
                  <span>
                    {language === "mr"
                      ? "कोड पडताळणी करा"
                      : language === "hi"
                      ? "कोड सत्यापित करें"
                      : "Verify & Enter Portal"}
                  </span>
                  <FaArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Resend Cooldown Section */}
          <div
            style={{
              marginTop: "20px",
              textAlign: "center",
              fontSize: "13px",
              color: "#475569"
            }}
          >
            <span>Didn't receive the email code? </span>
            {resendCooldown > 0 ? (
              <span style={{ fontWeight: 750, color: "#15803d" }}>
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#15803d",
                  fontWeight: 800,
                  cursor: "pointer",
                  padding: "2px 4px",
                  textDecoration: "underline"
                }}
              >
                {resending ? "Sending..." : "Resend OTP Code"}
              </button>
            )}
          </div>

          <div className="ks-auth-footer-prompt" style={{ marginTop: "16px" }}>
            <span>Wrong email address? </span>
            <Link to="/register" className="ks-footer-link">
              Register Again
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
