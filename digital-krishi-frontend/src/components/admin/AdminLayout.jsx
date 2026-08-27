import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "../../styles/Admin.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

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
