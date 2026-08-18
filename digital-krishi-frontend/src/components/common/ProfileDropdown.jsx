import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCog, FaGlobe, FaBell, FaSignOutAlt, FaChevronDown, FaMapMarkerAlt, FaSeedling } from 'react-icons/fa';
import ConfirmModal from './ConfirmModal';
import './ProfileDropdown.css';

const ProfileDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen]                       = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef                               = useRef(null);
  const navigate                                  = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    onLogout();
  };

  const getAvatarUrl = () => {
    if (user?.profileImage) return user.profileImage;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Farmer')}&background=15803d&color=fff&size=200&bold=true`;
  };

  const farmerName = user?.name || 'Farmer User';
  const farmerCrop = user?.crop || 'Multi-Crop';
  const farmerLocation = user?.location || 'India';

  return (
    <>
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Sign Out of Kisan Setu?"
        message="Are you sure you want to logout? You can securely sign back in at any time."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
      <div className="profile-dropdown-wrapper" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button 
        className={`profile-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Profile menu"
        aria-expanded={isOpen}
      >
        <div className="profile-trigger-avatar-wrap">
          <img 
            src={getAvatarUrl()} 
            alt={farmerName} 
            className="profile-trigger-avatar"
          />
          <span className="profile-online-badge" />
        </div>

        <div className="profile-trigger-info">
          <span className="profile-trigger-name">{farmerName}</span>
          <span className="profile-trigger-sub">🌾 {farmerCrop}</span>
        </div>

        <FaChevronDown className={`profile-trigger-arrow ${isOpen ? 'rotate' : ''}`} />
      </button>

      {/* Dropdown Card */}
      <div className={`profile-dropdown-card ${isOpen ? 'show' : ''}`}>
        {/* Profile Header */}
        <div className="profile-dropdown-header">
          <div className="profile-header-avatar-wrap">
            <img 
              src={getAvatarUrl()} 
              alt={farmerName} 
              className="profile-dropdown-avatar"
            />
            <span className="profile-header-status-dot" />
          </div>
          <div className="profile-dropdown-info">
            <h3 className="profile-dropdown-name">{farmerName}</h3>
            <p className="profile-dropdown-phone">{user?.phone || user?.email || 'Verified Account'}</p>
            <span className="profile-badge-pill">🚜 Active Farmer</span>
          </div>
        </div>

        {/* Information Cards */}
        <div className="profile-info-cards">
          <div className="profile-info-card">
            <div className="profile-info-icon profile-info-icon--amber">
              <FaMapMarkerAlt />
            </div>
            <div className="profile-info-content">
              <span className="profile-info-label">LOCATION</span>
              <span className="profile-info-value">{farmerLocation}</span>
            </div>
          </div>

          <div className="profile-info-card">
            <div className="profile-info-icon profile-info-icon--green">
              <FaSeedling />
            </div>
            <div className="profile-info-content">
              <span className="profile-info-label">MAIN CROP</span>
              <span className="profile-info-value">{farmerCrop}</span>
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="profile-menu-options">
          <button 
            className="profile-menu-item" 
            onClick={() => { setIsOpen(false); navigate('/farmer/profile'); }}
          >
            <div className="profile-menu-icon-box profile-menu-icon-box--green">
              <FaUser />
            </div>
            <div className="profile-menu-text">
              <span className="profile-menu-title">Edit Profile</span>
              <span className="profile-menu-desc">Personal details & farm size</span>
            </div>
          </button>

          <button 
            className="profile-menu-item" 
            onClick={() => { setIsOpen(false); navigate('/farmer/settings'); }}
          >
            <div className="profile-menu-icon-box profile-menu-icon-box--blue">
              <FaCog />
            </div>
            <div className="profile-menu-text">
              <span className="profile-menu-title">Settings</span>
              <span className="profile-menu-desc">App preferences & alerts</span>
            </div>
          </button>

          <button 
            className="profile-menu-item" 
            onClick={() => { setIsOpen(false); navigate('/farmer/settings'); }}
          >
            <div className="profile-menu-icon-box profile-menu-icon-box--amber">
              <FaGlobe />
            </div>
            <div className="profile-menu-text">
              <span className="profile-menu-title">Language</span>
              <span className="profile-menu-desc">English / हिंदी / मराठी</span>
            </div>
          </button>

          <button 
            className="profile-menu-item" 
            onClick={() => { setIsOpen(false); navigate('/farmer/alerts'); }}
          >
            <div className="profile-menu-icon-box profile-menu-icon-box--purple">
              <FaBell />
            </div>
            <div className="profile-menu-text">
              <span className="profile-menu-title">Notifications</span>
              <span className="profile-menu-desc">Manage farm alerts</span>
            </div>
          </button>
        </div>

        {/* Logout Button */}
        <div className="profile-footer">
          <button className="profile-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProfileDropdown;
