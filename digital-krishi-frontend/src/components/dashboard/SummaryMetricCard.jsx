import React from 'react';
import { motion } from 'framer-motion';

const badges = {
  primary: { label: 'Active', color: '#1B5E20', bg: 'rgba(27,94,32,.1)' },
  alert:   { label: 'Check', color: '#D97706', bg: 'rgba(245,158,11,.1)' },
  market:  { label: '↑ Rising', color: '#2563EB', bg: 'rgba(37,99,235,.1)' },
  calendar:{ label: 'Today', color: '#7C3AED', bg: 'rgba(124,58,237,.1)' },
};

const SummaryMetricCard = ({ icon: Icon, label, value, tone = 'default' }) => {
  const badge = badges[tone];

  return (
    <motion.div
      className={`summary-metric-card summary-metric-${tone}`}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <div className="summary-metric-icon">
        <Icon />
      </div>
      <div className="summary-metric-content">
        <div className="summary-metric-value">{value}</div>
        <div className="summary-metric-label">{label}</div>
        {badge && (
          <span style={{
            display:'inline-block',
            marginTop:'8px',
            fontSize:'11px',
            fontWeight:600,
            color:badge.color,
            background:badge.bg,
            padding:'3px 10px',
            borderRadius:'20px'
          }}>
            {badge.label}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default SummaryMetricCard;
