import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCalendarAlt, FaCheckCircle, FaSeedling, FaWater, FaLeaf,
  FaTractor, FaChevronLeft, FaChevronRight, FaPlus, FaCalendarPlus,
  FaCheck, FaSun, FaCloudRain, FaClock, FaShieldAlt
} from 'react-icons/fa';
import { GiWheat, GiPlantRoots, GiWateringCan, GiScythe } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const STAGE_CONFIG = {
  sowing:     { label: 'Sowing & Germination', color: '#15803d', bg: '#dcfce7', icon: <FaSeedling /> },
  irrigation: { label: 'Scheduled Irrigation', color: '#0284c7', bg: '#e0f2fe', icon: <FaWater /> },
  fertilizer: { label: 'Nutrient / DAP / NPK', color: '#d97706', bg: '#fef3c7', icon: <FaLeaf /> },
  pesticide:  { label: 'Protective Foliar Spray', color: '#dc2626', bg: '#fee2e2', icon: <FaShieldAlt /> },
  harvest:    { label: 'Harvesting & Threshing', color: '#7e22ce', bg: '#f3e8ff', icon: <GiScythe /> },
};

const INITIAL_EVENTS = [
  { id: 1, day: 3,  stage: 'sowing',     crop: 'Wheat (HD-2967)', title: 'Certified Seed Sowing & Trichoderma Treatment', time: '07:00 AM', plot: 'North Field 4.5 Ac' },
  { id: 2, day: 8,  stage: 'irrigation', crop: 'Rice / Paddy',    title: 'First Crown Root Initiation (CRI) Drip Cycle', time: '06:30 AM', plot: 'Block-A 2.5 Ac' },
  { id: 3, day: 14, stage: 'fertilizer', crop: 'Cotton',         title: 'Basal DAP & Urea Top-Dressing Application', time: '08:00 AM', plot: 'East Farm 3.0 Ac' },
  { id: 4, day: 19, stage: 'pesticide',  crop: 'Tomato',         title: 'Mancozeb 75% WP Foliar Blight Preventive Spray', time: '05:30 PM', plot: 'Greenhouse-1' },
  { id: 5, day: 24, stage: 'irrigation', crop: 'Wheat',          title: 'Tillering Stage Light Sprinkler Cycle', time: '06:00 AM', plot: 'North Field 4.5 Ac' },
  { id: 6, day: 28, stage: 'harvest',    crop: 'Onion',          title: 'Bulb Harvesting & Field Curing Inspection', time: '09:00 AM', plot: 'South Plot 1.5 Ac' },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CropCalendarPage = () => {
  const navigate = useNavigate();
  const todayDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth());
  const [currentYear, setCurrentYear]   = useState(todayDate.getFullYear());
  const [selectedDay, setSelectedDay]   = useState(todayDate.getDate());
  const [events, setEvents]             = useState(INITIAL_EVENTS);
  const [syncedTaskId, setSyncedTaskId] = useState(null);

  /* Calendar calculation */
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleSyncToTasks = (event) => {
    setSyncedTaskId(event.id);
    setTimeout(() => setSyncedTaskId(null), 2500);
  };

  const dayEvents = events.filter(e => e.day === selectedDay);

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
            fontSize: '26px', color: '#86efac', border: '1.5px solid rgba(255, 255, 255, 0.25)'
          }}>
            <FaCalendarAlt />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
              Crop Stage Calendar & Operations Timeline
            </h1>
            <p style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.85)', margin: 0, fontWeight: 500 }}>
              Synchronized agronomy lifecycle planner: Sowing, irrigation schedules, fertilizer top-dressing, and harvest forecasting.
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
            RABI SEASON 2025–26 (42 DAYS TO HARVEST)
          </div>
        </div>
      </motion.div>

      {/* ─── Seasonal Stage Progression Roadmap ─── */}
      <div className="calendar-milestone-card" style={{
        background: '#ffffff', border: '1.5px solid #e2ece3', borderRadius: '18px',
        padding: '18px 20px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>🌱 Wheat (Primary Crop) Lifecycle Phase</span>
            <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '8px' }}>
              Stage 3 of 5
            </span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>68% Stage Completion</span>
        </div>

        {/* Milestone Steps with horizontal scroll container on mobile */}
        <div className="calendar-milestone-scroll">
          <div className="calendar-milestone-grid">
            {[
              { label: 'Sowing & Germination', state: 'done', icon: <FaCheck /> },
              { label: 'Crown Root (CRI)', state: 'done', icon: <FaCheck /> },
              { label: 'Tillering & Vegetative', state: 'active', icon: <FaSun /> },
              { label: 'Flowering & Heading', state: 'upcoming', icon: <FaClock /> },
              { label: 'Maturity & Harvest', state: 'upcoming', icon: <GiScythe /> }
            ].map((st, i) => (
              <div key={i} className="calendar-milestone-step">
                <div className={`calendar-milestone-icon-wrap ${st.state}`}>
                  {st.icon}
                </div>
                <span className={`calendar-milestone-label ${st.state}`}>
                  {st.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 2-Column Grid: Calendar Matrix & Day Activity Inspector ─── */}
      <div className="crop-calendar-layout-grid">
        
        {/* Left: Interactive Month Calendar */}
        <div className="calendar-matrix-card">
          {/* Calendar Header Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handlePrevMonth}
                aria-label="Previous Month"
                style={{
                  background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#334155',
                  width: '34px', height: '34px', borderRadius: '10px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={handleNextMonth}
                aria-label="Next Month"
                style={{
                  background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#334155',
                  width: '34px', height: '34px', borderRadius: '10px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="calendar-weekday-headers">
            {DAY_LABELS.map(d => (
              <div key={d} className="calendar-weekday-header">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="calendar-days-grid">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day-empty" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected = selectedDay === dayNum;
              const isToday = todayDate.getDate() === dayNum && todayDate.getMonth() === currentMonth;
              const dayEvts = events.filter(e => e.day === dayNum);

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`calendar-day-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span className="calendar-day-num">
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="calendar-today-dot" />
                    )}
                  </div>

                  {/* Event indicator dots */}
                  {dayEvts.length > 0 && (
                    <div className="calendar-events-dots-row">
                      {dayEvts.map(ev => {
                        const conf = STAGE_CONFIG[ev.stage] || STAGE_CONFIG.sowing;
                        return (
                          <div
                            key={ev.id}
                            style={{
                              width: '6px', height: '6px', borderRadius: '50%',
                              background: conf.color, flexShrink: 0
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', fontSize: '11.5px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#15803d', fontWeight: 700 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#15803d' }} /> Sowing
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0284c7', fontWeight: 700 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }} /> Irrigation
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#d97706', fontWeight: 700 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706' }} /> Fertilizer
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#dc2626', fontWeight: 700 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }} /> Spray
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#7e22ce', fontWeight: 700 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7e22ce' }} /> Harvest
            </span>
          </div>
        </div>

        {/* Right: Selected Day Activity Drawer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ background: '#ffffff', border: '1.5px solid #e2ece3', borderRadius: '20px', padding: '22px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>Day Inspector</span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {MONTH_NAMES[currentMonth]} {selectedDay}, {currentYear}
                </h3>
              </div>
              <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', border: '1px solid #86efac' }}>
                {dayEvents.length} Activities
              </span>
            </div>

            {dayEvents.length === 0 ? (
              <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '14px', padding: '36px 16px', textAlign: 'center' }}>
                <FaCalendarAlt style={{ fontSize: '32px', color: '#94a3b8', marginBottom: '8px' }} />
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#475569' }}>No scheduled operations</h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>Rest day or routine field monitoring.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dayEvents.map(ev => {
                  const conf = STAGE_CONFIG[ev.stage] || STAGE_CONFIG.sowing;
                  const isSynced = syncedTaskId === ev.id;

                  return (
                    <div
                      key={ev.id}
                      style={{
                        background: '#ffffff', border: '1.5px solid #e2ece3', borderLeft: `4px solid ${conf.color}`,
                        borderRadius: '14px', padding: '14px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ background: conf.bg, color: conf.color, fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {conf.icon} {conf.label}
                        </span>
                        <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>{ev.time}</span>
                      </div>

                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                        {ev.title}
                      </div>

                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                        🌱 {ev.crop} • 📍 {ev.plot}
                      </div>

                      <button
                        onClick={() => handleSyncToTasks(ev)}
                        style={{
                          background: isSynced ? '#15803d' : '#f0fdf4',
                          color: isSynced ? '#ffffff' : '#15803d',
                          border: '1px solid #86efac',
                          padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                      >
                        <FaCalendarPlus /> {isSynced ? '✓ Added to Daily Tasks!' : 'Sync to My Tasks Planner'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick 1-Click Operations */}
          <button
            onClick={() => navigate('/farmer/tasks')}
            style={{
              background: 'linear-gradient(135deg, #155e2d 0%, #16a34a 100%)',
              color: '#ffffff', border: 'none', padding: '14px 20px', borderRadius: '14px',
              fontSize: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 4px 14px rgba(21, 94, 45, 0.3)'
            }}
          >
            <FaCalendarPlus /> Open Daily Tasks & Weather Sowing Planner
          </button>

        </div>

      </div>

    </div>
  );
};

export default CropCalendarPage;
