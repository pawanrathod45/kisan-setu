import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const THEMES = {
  primary: {
    label: '🌱 Active',
    badgeColor: '#15803d',
    badgeBg: '#dcfce7',
    iconBg: 'linear-gradient(135deg, #22c55e, #15803d)',
    iconColor: '#ffffff',
    borderColor: '#bbf7d0',
    topBar: 'linear-gradient(90deg, #22c55e, #15803d)',
    cardBg: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
    valueColor: '#14532d',
    glow: 'rgba(34, 197, 94, 0.25)'
  },
  alert: {
    label: '⚡ Needs Action',
    badgeColor: '#b45309',
    badgeBg: '#fef3c7',
    iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
    iconColor: '#ffffff',
    borderColor: '#fde68a',
    topBar: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
    cardBg: 'linear-gradient(180deg, #ffffff 0%, #fffbeb 100%)',
    valueColor: '#78350f',
    glow: 'rgba(245, 158, 11, 0.25)'
  },
  market: {
    label: '📈 Profitable',
    badgeColor: '#0369a1',
    badgeBg: '#e0f2fe',
    iconBg: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    iconColor: '#ffffff',
    borderColor: '#bae6fd',
    topBar: 'linear-gradient(90deg, #38bdf8, #0284c7)',
    cardBg: 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%)',
    valueColor: '#0c4a6e',
    glow: 'rgba(14, 165, 233, 0.25)'
  },
  calendar: {
    label: '📅 Scheduled',
    badgeColor: '#6d28d9',
    badgeBg: '#f3e8ff',
    iconBg: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    iconColor: '#ffffff',
    borderColor: '#e9d5ff',
    topBar: 'linear-gradient(90deg, #c084fc, #7c3aed)',
    cardBg: 'linear-gradient(180deg, #ffffff 0%, #faf5ff 100%)',
    valueColor: '#4c1d95',
    glow: 'rgba(168, 85, 247, 0.25)'
  },
};

const SummaryMetricCard = ({ icon: Icon, label, value, tone = 'primary', onClick, to }) => {
  const navigate = useNavigate();
  const theme = THEMES[tone] || THEMES.primary;

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      className={`summary-metric-card summary-metric-${tone}`}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 280, damping: 20 }}
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        background: theme.cardBg,
        borderColor: theme.borderColor,
      }}
    >
      <div 
        className="summary-metric-top-bar" 
        style={{ background: theme.topBar }} 
      />

      <div 
        className="summary-metric-icon"
        style={{
          background: theme.iconBg,
          color: theme.iconColor,
          boxShadow: `0 6px 16px ${theme.glow}`,
        }}
      >
        <Icon />
      </div>

      <div className="summary-metric-content">
        <div className="summary-metric-value" style={{ color: theme.valueColor }}>
          {value}
        </div>
        <div className="summary-metric-label">{label}</div>
        <span 
          className="summary-metric-badge"
          style={{
            color: theme.badgeColor,
            background: theme.badgeBg,
            borderColor: theme.borderColor,
          }}
        >
          {theme.label}
        </span>
      </div>
    </motion.div>
  );
};

export default SummaryMetricCard;
