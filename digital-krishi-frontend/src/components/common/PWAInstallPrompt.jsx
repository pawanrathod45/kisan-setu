import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaTimes, FaWifi, FaMobileAlt } from 'react-icons/fa';
import { GiSprout } from 'react-icons/gi';
import { usePWA } from '../../context/PWAContext';
import { useLanguage } from '../../context/LanguageContext';

const PWAInstallPrompt = () => {
  const { isInstallable, installPWA, dismissInstallPrompt, isOnline } = usePWA();
  const { language } = useLanguage();

  return (
    <>
      {/* 1. Offline Mode Banner */}
      {!isOnline && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
          color: '#ffffff',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '12.5px',
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)',
          letterSpacing: '0.2px'
        }}>
          <FaWifi style={{ opacity: 0.7 }} />
          <span>
            {language === 'hi'
              ? 'आप ऑफ़लाइन हैं। सहेजा गया डेटा प्रदर्शित किया जा रहा है।'
              : language === 'mr'
              ? 'तुम्ही ऑफलाइन आहात. सेव्ह केलेला डेटा दाखवला जात आहे.'
              : 'You are offline. Showing cached farm data.'}
          </span>
        </div>
      )}

      {/* 2. Floating PWA Install Prompt Banner */}
      <AnimatePresence>
        {isInstallable && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              bottom: '82px',
              left: '16px',
              right: '16px',
              maxWidth: '480px',
              margin: '0 auto',
              zIndex: 9000,
              background: 'linear-gradient(135deg, #072712 0%, #0d421f 40%, #155e2d 100%)',
              border: '1.5px solid rgba(134, 239, 172, 0.4)',
              borderRadius: '16px',
              padding: '12px 16px',
              color: '#ffffff',
              boxShadow: '0 12px 36px rgba(7, 39, 18, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(134, 239, 172, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: '#86efac',
                flexShrink: 0
              }}>
                <GiSprout />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {language === 'hi' ? '📲 किसान सेतु ऐप इंस्टॉल करें' : language === 'mr' ? '📲 किसान सेतू ॲप इन्स्टॉल करा' : '📲 Install Kisan Setu App'}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {language === 'hi' ? 'तेज़ गति और ऑफ़लाइन सुविधा' : language === 'mr' ? 'जलद गती आणि ऑफलाइन सुविधा' : 'Faster speed & offline access'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={installPWA}
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.35)'
                }}
              >
                <FaDownload style={{ fontSize: '11px' }} />
                <span>{language === 'hi' ? 'इंस्टॉल' : language === 'mr' ? 'इन्स्टॉल' : 'Install'}</span>
              </button>

              <button
                onClick={dismissInstallPrompt}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Dismiss"
              >
                <FaTimes />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PWAInstallPrompt;
