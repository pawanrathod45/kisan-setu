import React from 'react';
import {
  FaUserEdit, FaSignOutAlt, FaMapMarkerAlt,
  FaSeedling, FaGlobe, FaLightbulb, FaCloudSun, FaChartLine,
  FaLayerGroup, FaCamera, FaShieldAlt, FaPhone, FaCheckCircle,
  FaTractor, FaUserCheck
} from 'react-icons/fa';
import { GiPlantRoots, GiWheat, GiFarmer } from 'react-icons/gi';
import { useLanguage } from '../../context/LanguageContext';
import './profile.css';

const ProfileCard = ({ user, tip, weather, market, onEdit, onLogout }) => {
  const { t, language } = useLanguage();
  if (!user) return null;

  const fields = [
    user.name,
    user.phone,
    user.location,
    user.crop,
    user.profileImage,
    user.landArea,
    user.farmingType,
    user.language
  ];
  const filledFields = fields.filter(f => f).length;
  const completion = Math.round((filledFields / fields.length) * 100);

  const getRoleDisplay = (role) => {
    const roles = {
      farmer: `🌾 ${t('kisanMitra', 'Verified Kisan Member')}`,
      officer: `🏛 ${t('krishiOfficer', 'Krishi Officer')}`,
      agent: '🤝 Agri Agent'
    };
    return roles[role] || `🌾 ${t('kisanMitra', 'Verified Kisan Member')}`;
  };

  const getInitials = (name) => {
    if (!name) return 'KI';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="profile-container">
      
      {/* ── Executive Hero Card ── */}
      <div className="profile-executive-hero">
        <div className="profile-hero-left">
          <div className="profile-avatar-box">
            {user.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={user.name || 'Farmer'} 
                className="profile-avatar-img" 
              />
            ) : (
              <div className="profile-avatar-img">
                {getInitials(user.name)}
              </div>
            )}
            <button className="profile-avatar-edit-badge" onClick={onEdit} title={t('edit', 'Change Profile Photo')} aria-label="Change photo">
              <FaCamera />
            </button>
          </div>

          <div className="profile-identity-info">
            <div className="profile-identity-name">
              <span>{user.name || 'Farmer User'}</span>
              <span className="profile-verified-badge">
                <FaCheckCircle style={{ fontSize: '11px' }} /> {t('healthy', 'Verified')}
              </span>
            </div>

            <div className="profile-meta-pills">
              <span className="profile-meta-pill-item">
                <FaPhone />
                {user.phone || '+91 98765 43210'}
              </span>

              <span className="profile-meta-pill-item">
                <FaMapMarkerAlt />
                {user.location || 'Pune, Maharashtra'}
              </span>

              <span className="profile-meta-pill-item">
                <FaSeedling />
                {user.crop ? `${user.crop.charAt(0).toUpperCase() + user.crop.slice(1)}` : t('all', 'Multi-Crop')}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-hero-actions">
          <button className="profile-btn-edit" onClick={onEdit}>
            <FaUserEdit /> {t('edit', 'Edit Farm Details')}
          </button>
          <button className="profile-btn-logout" onClick={onLogout}>
            <FaSignOutAlt /> {t('logout', 'Logout')}
          </button>
        </div>
      </div>

      {/* ── Profile Completion Meter ── */}
      <div className="profile-completion-card">
        <div className="completion-header">
          <div>
            <h3 className="completion-title">🌾 {t('farmerDossier', 'Farm Dossier Registration Health')}</h3>
            <p className="completion-subtitle">{t('dashboardSubtitle', 'A completed farm profile enables hyper-local AI disease scans and tailored Mandi arbitrage')}</p>
          </div>
          <div className="completion-percentage">{completion}%</div>
        </div>
        <div className="completion-bar">
          <div className="completion-fill" style={{ width: `${completion}%` }} />
        </div>
      </div>

      {/* ── 6-Tile Farm Dossier Grid ── */}
      <div className="profile-details-grid">
        
        <div className="detail-card">
          <div className="detail-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <FaMapMarkerAlt />
          </div>
          <div className="detail-content">
            <div className="detail-label">{t('location', 'FARM LOCATION & DISTRICT')}</div>
            <div className="detail-value">{user.location || 'Haveli, Pune'}</div>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <FaSeedling />
          </div>
          <div className="detail-content">
            <div className="detail-label">{t('cropName', 'PRIMARY CROP')}</div>
            <div className="detail-value">{user.crop ? `${user.crop.charAt(0).toUpperCase() + user.crop.slice(1)}` : 'Rice (Basmati)'}</div>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <FaLayerGroup />
          </div>
          <div className="detail-content">
            <div className="detail-label">{t('landArea', 'LAND HOLDING')}</div>
            <div className="detail-value">{user.landArea ? `${user.landArea} ${t('acres', 'Acres')}` : `4.5 ${t('acres', 'Acres')}`}</div>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
            <GiPlantRoots />
          </div>
          <div className="detail-content">
            <div className="detail-label">{t('farmingType', 'FARMING METHOD')}</div>
            <div className="detail-value">{user.farmingType ? user.farmingType.charAt(0).toUpperCase() + user.farmingType.slice(1) : t('farmingType', 'Sustainable Commercial')}</div>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon" style={{ background: '#ffedd5', color: '#ea580c' }}>
            <FaGlobe />
          </div>
          <div className="detail-content">
            <div className="detail-label">{t('language', 'PREFERRED DIALECT')}</div>
            <div className="detail-value">
              {language === 'hi' || user.language === 'hi' ? 'हिन्दी (Hindi)' : language === 'mr' || user.language === 'mr' ? 'मराठी (Marathi)' : 'English (India)'}
            </div>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <FaShieldAlt />
          </div>
          <div className="detail-content">
            <div className="detail-label">{t('soilHealthIndex', 'SOIL HEALTH CARD')}</div>
            <div className="detail-value">{t('healthy', 'Grade-A Loamy Soil (Verified)')}</div>
          </div>
        </div>

      </div>

      {/* ── Live Micro-Widgets Grid (Weather / Mandi / AI Tip) ── */}
      <div className="profile-widgets-grid">
        
        {/* Weather Widget */}
        <div className="profile-widget-card">
          <div className="widget-head">
            <div className="widget-icon-pill" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <FaCloudSun />
            </div>
            <h4>Atmospheric Conditions</h4>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
                {Math.round(weather?.main?.temp || weather?.temperature || 28)}°C
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                {weather?.weather?.[0]?.description || weather?.description || 'Clear Skies & Optimal Humidity'}
              </div>
            </div>
            <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px' }}>
              {user.location || 'Haveli'}
            </span>
          </div>
        </div>

        {/* Mandi Rate Widget */}
        <div className="profile-widget-card">
          <div className="widget-head">
            <div className="widget-icon-pill" style={{ background: '#dcfce7', color: '#15803d' }}>
              <FaChartLine />
            </div>
            <h4>Primary Crop Mandi Rate</h4>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
                ₹{market?.price || market?.modalPrice || '2,450'}/qtl
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                {user.crop ? user.crop.charAt(0).toUpperCase() + user.crop.slice(1) : 'Rice'} • Modal APMC Rate
              </div>
            </div>
            <span style={{ background: '#22c55e', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px' }}>
              +2.8% ▲ Trend
            </span>
          </div>
        </div>

        {/* AI Tip Widget */}
        <div className="profile-widget-card">
          <div className="widget-head">
            <div className="widget-icon-pill" style={{ background: '#fef3c7', color: '#d97706' }}>
              <FaLightbulb />
            </div>
            <h4>Daily AI Agronomist Tip</h4>
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
            {tip?.tip || 'Apply Trichoderma viride bio-fertilizer during soil preparation to fortify root immunity against fungal damping-off.'}
          </p>
        </div>

      </div>

    </div>
  );
};

export default ProfileCard;