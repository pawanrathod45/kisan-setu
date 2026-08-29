import React from 'react';
import { Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaChartLine, FaArrowUp, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AnalyticsPreview = () => {
  const navigate = useNavigate();
  const sparklineData = [2100, 2180, 2150, 2240, 2290, 2380, 2450];
  const weeklyYields = [
    { day: "M", val: 65 },
    { day: "T", val: 80 },
    { day: "W", val: 72 },
    { day: "T", val: 90 },
    { day: "F", val: 85 },
    { day: "S", val: 95 },
    { day: "S", val: 100 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="h-100"
    >
      <Card className="dashboard-card h-100" style={{ borderRadius: '18px', border: '1.5px solid #e2ece3', overflow: 'hidden' }}>
        <Card.Body style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h5 className="card-title mb-0" style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              <FaChartLine className="me-2 text-success" />
              Yield & Price Analytics
            </h5>
            <button
              onClick={() => navigate('/analytics')}
              style={{ background: 'transparent', border: 'none', color: '#15803d', fontSize: '12px', fontWeight: 750, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Full Report <FaArrowRight style={{ fontSize: '10px' }} />
            </button>
          </div>

          {/* Mini Sparkline Chart */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px 14px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Wheat Mandi Price</span>
              <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 800 }}>
                <FaArrowUp /> +5.2% (₹2,450/qtl)
              </span>
            </div>
            
            <svg viewBox="0 0 200 45" style={{ width: '100%', height: '42px', overflow: 'visible' }}>
              <defs>
                <linearGradient id="previewGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 38 Q 30 32, 60 28 T 120 18 T 160 10 L 200 5 L 200 45 L 0 45 Z"
                fill="url(#previewGrad)"
              />
              <path
                d="M 0 38 Q 30 32, 60 28 T 120 18 T 160 10 L 200 5"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="200" cy="5" r="3.5" fill="#15803d" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Weekly Growth Bars */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11.5px', color: '#475569', fontWeight: 700 }}>Weekly Biomass & Health</span>
              <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 750, background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
                94% Optimal
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '48px' }}>
              {weeklyYields.map((w, idx) => (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '3px' }}>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '18px',
                      height: `${w.val}%`,
                      background: idx === 6 ? '#15803d' : '#86efac',
                      borderRadius: '3px 3px 1px 1px',
                      transition: 'height 0.3s ease'
                    }}
                    title={`${w.day}: ${w.val}% index`}
                  />
                  <span style={{ fontSize: '9.5px', color: '#64748b', fontWeight: 700 }}>{w.day}</span>
                </div>
              ))}
            </div>
          </div>

        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default AnalyticsPreview;