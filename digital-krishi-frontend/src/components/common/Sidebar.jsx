import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaHome, 
  FaCloudSun, 
  FaChartLine, 
  FaRobot, 
  FaCamera,
  FaBell,
  FaCalendarAlt,
  FaChartBar,
  FaMicrophone,
  FaUser,
  FaCog
} from 'react-icons/fa';
import { GiWheat } from 'react-icons/gi';
import { translations } from '../../utils/translations';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const language = localStorage.getItem('language') || 'en';
  const t = translations[language];

  const menuItems = [
    { path: '/farmer/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/farmer/weather', icon: FaCloudSun, label: 'Weather Advisory' },
    { path: '/farmer/market', icon: FaChartLine, label: 'Market Intelligence' },
    { path: '/farmer/ai-assistant', icon: FaRobot, label: 'AI Krishi Officer' },
    { path: '/farmer/disease-detection', icon: FaCamera, label: 'Disease Detection' },
    { path: '/farmer/alerts', icon: FaBell, label: 'Smart Alerts' },
    { path: '/farmer/calendar', icon: FaCalendarAlt, label: 'Crop Calendar' },
    { path: '/farmer/analytics', icon: FaChartBar, label: 'Analytics' },
    { path: '/farmer/voice', icon: FaMicrophone, label: 'Voice Assistant' },
    { path: '/farmer/profile', icon: FaUser, label: 'Profile' },
    { path: '/farmer/settings', icon: FaCog, label: 'Settings' }
  ];

  return (
    <>
      <motion.div
        className={`sidebar ${isOpen ? 'open' : ''}`}
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
      >
        <div className="sidebar-header">
          <GiWheat className="sidebar-logo" />
          <h2 className="sidebar-title">{t.title}</h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => window.innerWidth < 992 && toggleSidebar()}
              >
                <item.icon className="sidebar-icon" />
                <span className="sidebar-label">{item.label}</span>
              </NavLink>
            </motion.div>
          ))}
        </nav>
      </motion.div>

      {isOpen && window.innerWidth < 992 && (
        <motion.div
          className="sidebar-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
