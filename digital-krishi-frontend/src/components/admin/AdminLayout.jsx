import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "../../styles/Admin.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1025 : false
  );
  const location = useLocation();

  // Listen for window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1025) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close drawer on route change when on mobile/tablet
  useEffect(() => {
    if (window.innerWidth < 1025) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Handle ESC key to close sidebar on mobile
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && window.innerWidth < 1025) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (window.innerWidth < 1025 && sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => {
    if (window.innerWidth < 1025) setSidebarOpen(false);
  };

  return (
    <div className="admin-app-layout">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
      />

      {/* Main Admin Console Body */}
      <div className="admin-main-container">
        {/* Top Header */}
        <AdminHeader
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />

        {/* Dynamic Route Content */}
        <main className="admin-content-area ks-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
