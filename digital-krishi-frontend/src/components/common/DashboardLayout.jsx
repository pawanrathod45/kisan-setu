import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaSeedling, FaCalendarCheck, FaChartLine, FaRobot } from 'react-icons/fa';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

const BOTTOM_NAV = [
  { path: '/farmer/dashboard',    icon: FaHome,          label: 'Home' },
  { path: '/farmer/crops',        icon: FaSeedling,      label: 'Crops' },
  { path: '/farmer/tasks',        icon: FaCalendarCheck, label: 'Tasks' },
  { path: '/farmer/market',       icon: FaChartLine,     label: 'Market' },
  { path: '/farmer/ai-assistant', icon: FaRobot,         label: 'AI' },
];

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1025 : true
  );
  const location = useLocation();

  // Listen for window resize to intelligently adjust sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1025) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close drawer on route change when on mobile or tablet
  useEffect(() => {
    if (window.innerWidth < 1025) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Handle ESC key to close sidebar on mobile
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && window.innerWidth < 1025) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (window.innerWidth < 1025 && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => {
    if (window.innerWidth < 1025) setSidebarOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />

      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <DashboardHeader toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>

      {/* Mobile bottom navigation bar */}
      <nav className="ks-mobile-nav" aria-label="Mobile Navigation">
        {BOTTOM_NAV.map(item => {
          const isActive = location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`ks-mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="ks-mobile-nav-icon" />
              <span className="ks-mobile-nav-label">{item.label}</span>
              {isActive && <span className="ks-mobile-nav-dot" />}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardLayout;
