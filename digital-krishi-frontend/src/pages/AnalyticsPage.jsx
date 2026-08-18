import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaChartBar, FaArrowUp, FaArrowDown, FaLeaf,
  FaRupeeSign, FaExclamationTriangle, FaBolt, FaTint,
  FaTractor, FaCalendarAlt, FaShieldAlt, FaLightbulb, FaChartPie
} from 'react-icons/fa';
import { GiWheat, GiTomato, GiCottonFlower, GiPlantRoots } from 'react-icons/gi';
import API from '../services/api';
import '../styles/Dashboard.css';

const CROP_ANALYTICS = [
  {
    crop: 'Wheat (HD-2967)',
    area: '4.5 Acres',
    yieldEst: '98 Quintals',
    costPerAcre: '₹14,200',
    currentPrice: '₹2,450 / qtl',
    projectedRevenue: '₹2,40,100',
    profitMargin: '+32.4%',
    healthIndex: '92%',
    waterEfficiency: '94%'
  },
  {
    crop: 'Cotton (Bt RCH-2)',
    area: '3.0 Acres',
    yieldEst: '24 Quintals',
    costPerAcre: '₹22,500',
    currentPrice: '₹7,150 / qtl',
    projectedRevenue: '₹1,71,600',
    profitMargin: '+24.8%',
    healthIndex: '84%',
    waterEfficiency: '89%'
  },
  {
    crop: 'Tomato (Hybrid-01)',
    area: '1.5 Acres',
    yieldEst: '120 Crates',
    costPerAcre: '₹18,000',
    currentPrice: '₹1,850 / qtl',
    projectedRevenue: '₹1,11,000',
    profitMargin: '+18.2%',
    healthIndex: '78%',
    waterEfficiency: '91%'
  }
];

const PRICE_TREND_DATA = {
  Wheat:  [2380, 2400, 2410, 2425, 2430, 2445, 2450],
  Cotton: [6900, 6950, 7020, 7080, 7100, 7120, 7150],
  Tomato: [1650, 1700, 1720, 1780, 1800, 1820, 1850],
  Rice:   [2200, 2220, 2240, 2250, 2260, 2270, 2280],
  Onion:  [1800, 1850, 1880, 1900, 1920, 1940, 1950]
};

const DAYS_LABEL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

const AnalyticsPage = () => {
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading]           = useState(false);

  useEffect(() => {
    API.get('/analytics')
      .then(r => setAnalyticsData(r.data))
      .catch(() => {});
  }, []);

  const activePrices = PRICE_TREND_DATA[selectedCrop] || PRICE_TREND_DATA.Wheat;
  const maxPrice = Math.max(...activePrices);
  const minPrice = Math.min(...activePrices);

  return (
    <div style={{ padding: '24px 20px', maxWidth: '1440px', margin: '0 auto', background: '#f4f8f4', minHeight: '100vh', color: '#0f172a' }}>
      
      {/* ─── Forest Hero Banner ─── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #072712 0%, #0d421f 40%, #155e2d 100%)',
          borderRadius: '20px',
          padding: '24px 28px',
          marginBottom: '24px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 30px rgba(13, 66, 31, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          flexWrap: 'wrap',
          gap: '18px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', color: '#4ade80', border: '1.5px solid rgba(255, 255, 255, 0.25)'
          }}>
            <FaChartBar />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
              Farm Intelligence & Yield Economics
            </h1>
            <p style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.85)', margin: 0, fontWeight: 500 }}>
              AI-driven farm operational efficiency, multi-crop revenue projections, input cost optimization, and Mandi price momentum.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'rgba(34, 197, 94, 0.22)', color: '#86efac',
            border: '1px solid rgba(34, 197, 94, 0.45)',
            padding: '6px 14px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 800,
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80',
              boxShadow: '0 0 8px #4ade80'
            }} />
            FARM HEALTH INDEX: 88/100
          </div>
        </div>
      </motion.div>

      {/* ─── 4 Primary KPI Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        <div style={{ background: '#ffffff', border: '1.5px solid #e2ece3', borderRadius: '18px', padding: '20px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>Est. Gross Revenue</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              <FaRupeeSign />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>₹5,22,700</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px', color: '#15803d', fontWeight: 700 }}>
            <FaArrowUp /> +14.2% projected vs last season
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1.5px solid #e2ece3', borderRadius: '18px', padding: '20px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>Yield Efficiency</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              <FaLeaf />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>91.4%</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px', color: '#0284c7', fontWeight: 700 }}>
            <FaArrowUp /> +6.8% biomass accumulation
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1.5px solid #e2ece3', borderRadius: '18px', padding: '20px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#7e22ce', textTransform: 'uppercase' }}>Resource Optimization</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              <FaTint />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>94.0%</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px', color: '#7e22ce', fontWeight: 700 }}>
            <FaBolt /> 18% water & fertilizer savings
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1.5px solid #e2ece3', borderRadius: '18px', padding: '20px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>Risk Vulnerability</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              <FaShieldAlt />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>Low (14%)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px', color: '#15803d', fontWeight: 700 }}>
            <FaShieldAlt /> Optimal weather & low pest pressure
          </div>
        </div>

      </div>

      {/* ─── 2-Column Grid: Multi-Crop Portfolio & Price Momentum Chart ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '22px', marginBottom: '24px' }}>
        
        {/* Left: Multi-Crop Performance Matrix */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2ece3', borderRadius: '20px', padding: '22px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaChartPie style={{ color: '#15803d' }} /> Crop Portfolio Revenue & Yield Matrix
            </h3>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>3 Active Holdings (9.0 Acres)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {CROP_ANALYTICS.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px',
                  padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{item.crop}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {item.area} • Est. Yield: <strong style={{ color: '#1e293b' }}>{item.yieldEst}</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#15803d' }}>{item.projectedRevenue}</div>
                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' }}>
                      {item.profitMargin} Net
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '11.5px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Input Cost: </span>
                    <strong style={{ color: '#334155' }}>{item.costPerAcre}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Mandi Price: </span>
                    <strong style={{ color: '#334155' }}>{item.currentPrice}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Vigor Score: </span>
                    <strong style={{ color: '#15803d' }}>{item.healthIndex}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 7-Day APMC Price Momentum Bar Visualizer */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2ece3', borderRadius: '20px', padding: '22px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaChartBar style={{ color: '#0284c7' }} /> Mandi Price Momentum
            </h3>
            <span style={{ fontSize: '11.5px', background: '#e0f2fe', color: '#0284c7', padding: '3px 10px', borderRadius: '12px', fontWeight: 800 }}>
              7-Day Trend (₹/Qtl)
            </span>
          </div>

          {/* Crop Selector Tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
            {['Wheat', 'Cotton', 'Tomato', 'Rice', 'Onion'].map(c => (
              <button
                key={c}
                onClick={() => setSelectedCrop(c)}
                style={{
                  background: selectedCrop === c ? '#15803d' : '#f8fafc',
                  color: selectedCrop === c ? '#ffffff' : '#64748b',
                  border: `1.5px solid ${selectedCrop === c ? '#15803d' : '#e2e8f0'}`,
                  padding: '5px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Bar Chart Bars */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '10px', minHeight: '180px', padding: '16px 8px 0 8px', borderBottom: '2px solid #e2e8f0' }}>
            {activePrices.map((val, idx) => {
              const heightPct = Math.round(((val - minPrice * 0.9) / (maxPrice - minPrice * 0.9)) * 100);
              const isToday = idx === activePrices.length - 1;

              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: isToday ? '#15803d' : '#64748b' }}>
                    ₹{val}
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(25, heightPct)}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    style={{
                      width: '100%', maxWidth: '38px',
                      background: isToday ? 'linear-gradient(180deg, #22c55e, #15803d)' : 'linear-gradient(180deg, #93c5fd, #3b82f6)',
                      borderRadius: '8px 8px 0 0',
                      boxShadow: isToday ? '0 4px 12px rgba(34, 197, 94, 0.3)' : 'none'
                    }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: isToday ? '#0f172a' : '#94a3b8' }}>
                    {DAYS_LABEL[idx]}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '14px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
            Current {selectedCrop} rate is up <strong style={{ color: '#15803d' }}>+4.2%</strong> over the 7-day rolling window.
          </div>
        </div>

      </div>

      {/* ─── AI Agribusiness Strategy Banner ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
        border: '1.5px solid #86efac', borderRadius: '18px', padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        boxShadow: '0 2px 10px rgba(34, 197, 94, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            <FaLightbulb />
          </div>
          <div>
            <h4 style={{ margin: '0 0 3px 0', fontSize: '15px', fontWeight: 800, color: '#14532d' }}>
              ✨ Google AI Yield & Mandi Strategy Recommendation
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#166534', lineHeight: 1.45 }}>
              Market arrivals for Wheat in nearby APMC are tightening. Target holding harvest produce until early next week to gain estimated +₹80–120/qtl price premium.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsPage;
