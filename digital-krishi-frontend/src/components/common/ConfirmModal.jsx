import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSignOutAlt, FaTrash, FaExclamationTriangle, FaTimes, FaCheck } from 'react-icons/fa';
import '../../styles/Dashboard.css';

const ConfirmModal = ({
  isOpen,
  title = 'Are you sure?',
  message = 'Please confirm this action.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'primary'
  icon: CustomIcon,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const isDanger = type === 'danger';
  const isWarning = type === 'warning';

  const iconBg = isDanger ? '#fee2e2' : isWarning ? '#fef3c7' : '#dcfce7';
  const iconColor = isDanger ? '#dc2626' : isWarning ? '#d97706' : '#15803d';
  const btnGradient = isDanger
    ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
    : isWarning
    ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
    : 'linear-gradient(135deg, #155e2d 0%, #16a34a 100%)';

  const defaultIcon = isDanger ? <FaSignOutAlt /> : isWarning ? <FaTrash /> : <FaCheck />;

  return (
    <AnimatePresence>
      <div
        className="ks-modal-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            maxWidth: '440px',
            width: '100%',
            padding: '28px 24px 24px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
            border: '1.5px solid #e2ece3',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            position: 'relative'
          }}
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            <FaTimes />
          </button>

          {/* Icon squircle */}
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '20px',
              background: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: `0 8px 20px ${iconBg}`
            }}
          >
            {CustomIcon ? <CustomIcon /> : defaultIcon}
          </div>

          {/* Title and Message */}
          <div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              {title}
            </h3>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b', lineHeight: 1.5 }}>
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '10px' }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                color: '#475569',
                padding: '12px 18px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                background: btnGradient,
                border: 'none',
                color: '#ffffff',
                padding: '12px 18px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: isDanger ? '0 4px 14px rgba(220, 38, 38, 0.35)' : '0 4px 14px rgba(21, 94, 45, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
