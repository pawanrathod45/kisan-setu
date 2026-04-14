import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBars, 
  FaSignOutAlt, 
  FaUser, 
  FaChevronDown, 
  FaCog, 
  FaBell, 
  FaMapMarkerAlt, 
  FaSeedling, 
  FaMobile, 
  FaEdit, 
  FaLanguage, 
  FaLock 
} from 'react-icons/fa';

const DashboardHeader = ({ toggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-top-header">
      <button className="hamburger-btn" onClick={toggleSidebar}>
        <FaBars />
      </button>

      <div className="header-right">
        <div className="profile-section">
          <button 
            className="profile-btn" 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-avatar">
              <FaUser />
            </div>
            <span className="profile-name">{user.name || 'Farmer'}</span>
            <FaChevronDown className={`chevron ${showProfileMenu ? 'rotate' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <>
                <motion.div
                  className="profile-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowProfileMenu(false)}
                />
                <motion.div
                  className="profile-dropdown"
                  initial={{ opacity: 0, scale: 0.95, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="profile-header">
                    <div className="profile-avatar-large">
                      <FaUser />
                    </div>
                    <div className="profile-info">
                      <h4>{user.name}</h4>
                      <p>{user.phone}</p>
                    </div>
                  </div>

                  <div className="profile-details">
                    <div className="detail-item">
                      <FaMapMarkerAlt className="detail-icon" />
                      <div>
                        <span className="detail-label">Location</span>
                        <span className="detail-value">{user.location || 'Not set'}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <FaSeedling className="detail-icon" />
                      <div>
                        <span className="detail-label">Main Crop</span>
                        <span className="detail-value">{user.crop || 'Not set'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="profile-divider"></div>

                  <div className="profile-menu">
                    <button className="menu-item">
                      <FaEdit /> Edit Profile
                    </button>
                    <button className="menu-item">
                      <FaCog /> Settings
                    </button>
                    <button className="menu-item">
                      <FaLanguage /> Language
                    </button>
                    <button className="menu-item">
                      <FaBell /> Notifications
                    </button>
                  </div>

                  <div className="profile-divider"></div>

                  <button className="logout-menu-btn" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
