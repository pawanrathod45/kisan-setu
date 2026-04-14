import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const statusMap = {
  'Weather Advisory':    { dot: '#2196F3', text: 'Live' },
  'Market Intelligence': { dot: '#FF9800', text: 'Updated 2m ago' },
  'AI Krishi Officer':   { dot: '#9C27B0', text: 'Ready' },
  'Smart Alerts':        { dot: '#F44336', text: 'Monitoring' },
  'Crop Calendar':       { dot: '#1B5E20', text: 'On track' },
  'Analytics & Voice':   { dot: '#6D4C41', text: 'Synced' },
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
  const status = statusMap[title];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      className="h-100"
    >
      <div className="feature-preview-card h-100">

        {/* Status badge */}
        {status && (
          <div style={{
            display:'flex',
            alignItems:'center',
            gap:'6px',
            marginBottom:'14px'
          }}>
            <span style={{
              width:'7px',height:'7px',
              borderRadius:'50%',
              background:status.dot,
              display:'inline-block',
              boxShadow:`0 0 6px ${status.dot}`
            }}/>
            <span style={{fontSize:'11px',fontWeight:600,color:'#6B7280'}}>
              {status.text}
            </span>
          </div>
        )}

        <div className="feature-preview-header">
          <div className="feature-preview-icon-wrap">
            <Icon className="feature-preview-icon" />
          </div>
          <div>
            <h3 className="feature-preview-title">{title}</h3>
            {subtitle && <p className="feature-preview-subtitle">{subtitle}</p>}
          </div>
        </div>

        <div className="feature-preview-body">
          {primaryText && <p className="feature-preview-primary">{primaryText}</p>}
          {secondaryText && <p className="feature-preview-secondary">{secondaryText}</p>}
        </div>

        <button
          type="button"
          className="feature-preview-cta"
          onClick={() => navigate(to)}
        >
          {ctaLabel} →
        </button>

      </div>
    </motion.div>
  );
};

export default FeaturePreviewCard;
