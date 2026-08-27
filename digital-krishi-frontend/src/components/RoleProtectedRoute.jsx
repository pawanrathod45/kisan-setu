import React from "react";
import { Navigate, Link } from "react-router-dom";
import { FaShieldAlt, FaHome, FaSignOutAlt } from "react-icons/fa";

const RoleProtectedRoute = ({ children, role, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const validRoles = allowedRoles || (role ? [role] : []);

  if (validRoles.length > 0 && !validRoles.includes(user.role)) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #072e15 0%, #0d4a23 50%, #155e2d 100%)",
        padding: "20px"
      }}>
        <div style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "36px 30px",
          maxWidth: "460px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
        }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "18px",
            background: "#fee2e2",
            color: "#dc2626",
            fontSize: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px"
          }}>
            <FaShieldAlt />
          </div>

          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>
            Access Restricted
          </h2>

          <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.5, margin: "0 0 20px" }}>
            You are logged in as <strong>{user.name || "Farmer"}</strong> (Role: <span style={{ textTransform: "capitalize", fontWeight: 700 }}>{user.role}</span>). This portal requires Administrator privileges.
          </p>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <Link
              to={user.role === "admin" ? "/admin/dashboard" : "/farmer/dashboard"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
                background: "#15803d",
                color: "#ffffff",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "13.5px",
                textDecoration: "none"
              }}
            >
              <FaHome /> Go to My Dashboard
            </Link>

            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
                background: "#f1f5f9",
                color: "#475569",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "13.5px",
                cursor: "pointer"
              }}
            >
              <FaSignOutAlt /> Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleProtectedRoute;