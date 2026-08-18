import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaSeedling, FaCalendarCheck, FaChartLine, FaRobot } from 'react-icons/fa';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

const BOTTOM_NAV = [
  { path: '/farmer/dashboard',  icon: FaHome,          label: 'Home' },
  { path: '/farmer/crops',      icon: FaSeedling,      label: 'Crops' },
  { path: '/farmer/tasks',      icon: FaCalendarCheck, label: 'Tasks' },
  { path: '/farmer/market',     icon: FaChartLine,     label: 'Market' },
  { path: '/farmer/ai-assistant', icon: FaRobot,       label: 'AI' },
];

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1025);
  const location = useLocation();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1025) setSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <DashboardHeader toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="ks-mobile-nav">
        {BOTTOM_NAV.map(item => {
          const isActive = location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`ks-mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon style={{ fontSize: '1.2rem' }} />
              <span>{item.label}</span>
              {isActive && <span className="ks-mobile-nav-dot" />}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardLayout;
