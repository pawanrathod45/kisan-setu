import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CARD_THEMES = {
  'Weather Advisory': {
    accent: '#0284c7',
    iconBg: 'linear-gradient(135deg, #38bdf8, #0284c7)',
    btnBg: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    btnHoverBg: 'linear-gradient(135deg, #0284c7, #0369a1)',
    tagBg: '#e0f2fe',
    tagColor: '#0369a1',
    dot: '#0284c7',
    text: 'Live Satellite',
    calloutBg: '#f0f9ff',
    calloutBorder: '#38bdf8',
    cardBorder: '#bae6fd',
    glow: 'rgba(2, 132, 199, 0.25)'
  },
  'Market Intelligence': {
    accent: '#d97706',
    iconBg: 'linear-gradient(135deg, #fbbf24, #d97706)',
    btnBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
    btnHoverBg: 'linear-gradient(135deg, #d97706, #b45309)',
    tagBg: '#fef3c7',
    tagColor: '#b45309',
    dot: '#f59e0b',
    text: 'Mandi Live Pulse',
    calloutBg: '#fffbeb',
    calloutBorder: '#fbbf24',
    cardBorder: '#fde68a',
    glow: 'rgba(217, 119, 6, 0.25)'
  },
  'AI Krishi Officer': {
    accent: '#0d9488',
    iconBg: 'linear-gradient(135deg, #2dd4bf, #0d9488)',
    btnBg: 'linear-gradient(135deg, #14b8a6, #0d9488)',
    btnHoverBg: 'linear-gradient(135deg, #0d9488, #0f766e)',
    tagBg: '#ccfbf1',
    tagColor: '#0f766e',
    dot: '#14b8a6',
    text: '✨ AI Ready 24/7',
    calloutBg: '#f0fdfa',
    calloutBorder: '#2dd4bf',
    cardBorder: '#99f6e4',
    glow: 'rgba(13, 148, 136, 0.25)'
  },
  'Smart Alerts': {
    accent: '#dc2626',
    iconBg: 'linear-gradient(135deg, #f87171, #dc2626)',
    btnBg: 'linear-gradient(135deg, #ef4444, #dc2626)',
    btnHoverBg: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    tagBg: '#fee2e2',
    tagColor: '#b91c1c',
    dot: '#ef4444',
    text: 'Active Monitoring',
    calloutBg: '#fef2f2',
    calloutBorder: '#f87171',
    cardBorder: '#fecaca',
    glow: 'rgba(220, 38, 38, 0.25)'
  },
  'Crop Calendar': {
    accent: '#15803d',
    iconBg: 'linear-gradient(135deg, #4ade80, #15803d)',
    btnBg: 'linear-gradient(135deg, #22c55e, #15803d)',
    btnHoverBg: 'linear-gradient(135deg, #15803d, #166534)',
    tagBg: '#dcfce7',
    tagColor: '#166534',
    dot: '#22c55e',
    text: 'Season on Track',
    calloutBg: '#f0fdf4',
    calloutBorder: '#4ade80',
    cardBorder: '#bbf7d0',
    glow: 'rgba(21, 128, 61, 0.25)'
  },
  'Analytics & Voice': {
    accent: '#7c3aed',
    iconBg: 'linear-gradient(135deg, #c084fc, #7c3aed)',
    btnBg: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    btnHoverBg: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    tagBg: '#f3e8ff',
    tagColor: '#6d28d9',
    dot: '#a855f7',
    text: 'Farm Sync Active',
    calloutBg: '#faf5ff',
    calloutBorder: '#c084fc',
    cardBorder: '#e9d5ff',
    glow: 'rgba(124, 58, 237, 0.25)'
  },
};

const FeaturePreviewCard = ({
  icon: Icon,
  title,
  subtitle,
  primaryText,
  secondaryText,
  ctaLabel,
  to,
  delay = 0,
}) => {
  const navigate = useNavigate();
  const theme = CARD_THEMES[title] || CARD_THEMES['Weather Advisory'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -5 }}
      className="h-100"
    >
      <div 
        className="feature-preview-card h-100"
        style={{ borderColor: theme.cardBorder }}
      >
        {/* Top Status Tag */}
        <div className="feature-status-row">
          <span 
            className="feature-status-pill"
            style={{
              background: theme.tagBg,
              color: theme.tagColor,
              borderColor: theme.cardBorder,
            }}
          >
            <span 
              className="feature-status-dot"
              style={{
                background: theme.dot,
                boxShadow: `0 0 6px ${theme.dot}`,
              }}
            />
            {theme.text}
          </span>
        </div>

        {/* Card Header */}
        <div className="feature-preview-header">
          <div 
            className="feature-preview-icon-wrap"
            style={{
              background: theme.iconBg,
              boxShadow: `0 6px 18px ${theme.glow}`,
            }}
          >
            <Icon className="feature-preview-icon" />
          </div>
          <div className="feature-preview-title-box">
            <h3 className="feature-preview-title">{title}</h3>
            {subtitle && <p className="feature-preview-subtitle">{subtitle}</p>}
          </div>
        </div>

        {/* Card Body Insights */}
        <div className="feature-preview-body">
          {primaryText && (
            <div 
              className="feature-preview-primary"
              style={{
                background: theme.calloutBg,
                borderLeftColor: theme.calloutBorder,
                color: '#1e293b',
              }}
            >
              {primaryText}
            </div>
          )}
          {secondaryText && (
            <p className="feature-preview-secondary">{secondaryText}</p>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          className="feature-preview-cta"
          style={{
            background: theme.btnBg,
            boxShadow: `0 4px 14px ${theme.glow}`,
          }}
          onClick={() => navigate(to)}
        >
          <span>{ctaLabel}</span>
          <span className="feature-cta-arrow">→</span>
        </button>
      </div>
    </motion.div>
  );
};

export default FeaturePreviewCard;
