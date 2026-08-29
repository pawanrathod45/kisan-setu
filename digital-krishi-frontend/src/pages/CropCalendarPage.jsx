import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCalendarAlt, FaCheckCircle, FaSeedling, FaWater, FaLeaf,
  FaTractor, FaChevronLeft, FaChevronRight, FaPlus, FaCalendarPlus,
  FaCheck, FaSun, FaCloudRain, FaClock, FaShieldAlt, FaMapMarkerAlt
} from 'react-icons/fa';
import { GiWheat, GiPlantRoots, GiWateringCan, GiScythe } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

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

const MILESTONES = [
  { step: '01', label: 'Sowing & Germination', state: 'done', icon: <FaCheck />, date: 'Nov 05', desc: 'Completed 100%' },
  { step: '02', label: 'Crown Root (CRI)', state: 'done', icon: <FaCheck />, date: 'Nov 26', desc: 'First Irrigation Done' },
  { step: '03', label: 'Tillering & Vegetative', state: 'active', icon: <FaSun />, date: 'Dec 18', desc: 'Current Stage (Day 42)' },
  { step: '04', label: 'Flowering & Heading', state: 'upcoming', icon: <FaClock />, date: 'Jan 15', desc: 'Est. 28 Days Away' },
  { step: '05', label: 'Maturity & Harvest', state: 'upcoming', icon: <GiScythe />, date: 'Feb 20', desc: 'Target Yield 22 Qtl/Ac' }
];

const CropCalendarPage = () => {
  const { t, language } = useLanguage();
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
  const blanks = Array.from({ length: firstDayIndex }, (_, i) => i);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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
    <div style={{ padding: '0', width: '100%', maxWidth: '100%', margin: '0 auto', color: '#0f172a' }}>
      
      {/* ─── Forest Hero Banner ─── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #072712 0%, #0d421f 40%, #155e2d 100%)',
          borderRadius: '20px',
          padding: '22px 26px',
          marginBottom: '20px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 30px rgba(13, 66, 31, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', color: '#86efac', border: '1.5px solid rgba(255, 255, 255, 0.25)',
            flexShrink: 0
          }}>
            <FaCalendarAlt />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 3px 0', letterSpacing: '-0.5px' }}>
              {t('cropCalendarTitle', 'Crop Stage Calendar & Operations Timeline')}
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)', margin: 0, fontWeight: 500 }}>
              {t('seasonOverview', 'Synchronized agronomy lifecycle planner: Sowing, irrigation schedules, fertilizer top-dressing, and harvest forecasting.')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ─── Seasonal Stage Progression Roadmap ─── */}
      <div style={{
        background: '#ffffff', border: '1.5px solid #e2ece3', borderRadius: '18px',
        padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>🌱 {t('cropGrowthStages', 'Crop Growth Stage')}</span>
            <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11.5px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', border: '1px solid #86efac' }}>
              Stage 3 of 5 · {t('growing', 'Tillering')}
            </span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803d', background: '#f0fdf4', padding: '4px 10px', borderRadius: '8px' }}>
            68% {t('completed', 'Completion')}
          </span>
        </div>

        {/* Milestone Steps Bar */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '6px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '12px',
            minWidth: '600px',
            position: 'relative'
          }}>
            {MILESTONES.map((st, i) => {
              const isDone = st.state === 'done';
              const isActive = st.state === 'active';

              return (
                <div
                  key={i}
                  style={{
                    background: isActive ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' : isDone ? '#ffffff' : '#f8fafc',
                    border: `1.5px solid ${isActive ? '#22c55e' : isDone ? '#bbf7d0' : '#e2e8f0'}`,
                    borderRadius: '14px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: isActive ? '0 4px 14px rgba(34, 197, 94, 0.15)' : 'none',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: isDone ? '#15803d' : isActive ? '#22c55e' : '#e2e8f0',
                      color: isDone || isActive ? '#ffffff' : '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 800
                    }}>
                      {st.icon}
                    </div>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: isActive ? '#15803d' : '#94a3b8' }}>
                      {st.date}
                    </span>
                  </div>
                  <span style={{ fontSize: '12.5px', fontWeight: 800, color: isActive ? '#14532d' : isDone ? '#0f172a' : '#64748b' }}>
                    {st.label}
                  </span>
                  <span style={{ fontSize: '11px', color: isActive ? '#166534' : '#94a3b8', fontWeight: 600 }}>
                    {st.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Interactive Calendar Layout (7-Day Matrix + Day Event Drawer) ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        
        {/* Left: 7-Column Calendar Card */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #e2ece3',
          borderRadius: '20px',
          padding: '22px',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
        }}>
          {/* Month Navigator Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCalendarAlt style={{ color: '#15803d' }} /> {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handlePrevMonth}
                style={{
                  width: '34px', height: '34px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                  background: '#ffffff', color: '#334155', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer'
                }}
                aria-label="Previous Month"
              >
                <FaChevronLeft style={{ fontSize: '12px' }} />
              </button>
              <button
                onClick={handleNextMonth}
                style={{
                  width: '34px', height: '34px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                  background: '#ffffff', color: '#334155', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer'
                }}
                aria-label="Next Month"
              >
                <FaChevronRight style={{ fontSize: '12px' }} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '6px',
            textAlign: 'center',
            marginBottom: '10px'
          }}>
            {DAY_LABELS.map(d => (
              <div key={d} style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', padding: '6px 0', textTransform: 'uppercase' }}>
                {d}
              </div>
            ))}
          </div>

          {/* 7-Column Days Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '6px'
          }}>
            {blanks.map(b => (
              <div key={`blank-${b}`} style={{ height: '48px', opacity: 0 }} />
            ))}

            {monthDays.map(day => {
              const hasEvent = events.some(e => e.day === day);
              const isSelected = selectedDay === day;
              const isToday = day === todayDate.getDate() && currentMonth === todayDate.getMonth();

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    height: '52px',
                    borderRadius: '12px',
                    border: `1.5px solid ${isSelected ? '#15803d' : isToday ? '#86efac' : hasEvent ? '#bbf7d0' : '#f1f5f9'}`,
                    background: isSelected ? '#15803d' : isToday ? '#f0fdf4' : hasEvent ? '#fcfdfc' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#0f172a',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(21, 94, 45, 0.25)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: isSelected || isToday ? 800 : 600 }}>
                    {day}
                  </span>
                  {hasEvent && (
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: isSelected ? '#86efac' : '#15803d'
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Day Events Card */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #e2ece3',
          borderRadius: '20px',
          padding: '22px',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                SCHEDULED OPERATIONS
              </span>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                {MONTH_NAMES[currentMonth]} {selectedDay}, {currentYear}
              </h3>
            </div>
            <span style={{ fontSize: '12px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '10px', fontWeight: 700 }}>
              {dayEvents.length} {dayEvents.length === 1 ? 'Task' : 'Tasks'}
            </span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dayEvents.length === 0 ? (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '30px 20px', background: '#f8fafc', borderRadius: '14px', border: '1.5px dashed #cbd5e1',
                textAlign: 'center', gap: '8px'
              }}>
                <FaCalendarAlt style={{ fontSize: '28px', color: '#94a3b8' }} />
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#334155' }}>No Agri-Operations Scheduled</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Select days with green dots (e.g. Day 3, 8, 14, 19, 24, 28) to view detailed plot tasks.</span>
              </div>
            ) : (
              dayEvents.map(e => {
                const conf = STAGE_CONFIG[e.stage] || STAGE_CONFIG.sowing;
                const isSynced = syncedTaskId === e.id;

                return (
                  <div
                    key={e.id}
                    style={{
                      background: '#f8fafc',
                      border: `1.5px solid ${conf.color}40`,
                      borderRadius: '16px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: conf.bg, color: conf.color, width: '28px', height: '28px',
                          borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px'
                        }}>
                          {conf.icon}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: conf.color }}>
                          {conf.label}
                        </span>
                      </div>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b' }}>
                        🕒 {e.time}
                      </span>
                    </div>

                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                        {e.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#475569' }}>
                        <span>🌾 <strong>Crop:</strong> {e.crop}</span>
                        <span>📍 <strong>Plot:</strong> {e.plot}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                      <button
                        onClick={() => handleSyncToTasks(e)}
                        style={{
                          background: isSynced ? '#dcfce7' : '#ffffff',
                          color: isSynced ? '#15803d' : '#0f172a',
                          border: '1px solid #cbd5e1',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        {isSynced ? <FaCheck /> : <FaClock />} {isSynced ? 'Synced to Daily Tasks' : 'Sync to Daily Tasks'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button
            onClick={() => navigate('/farmer/tasks')}
            style={{
              marginTop: '16px',
              background: 'linear-gradient(135deg, #155e2d 0%, #16a34a 100%)',
              color: '#ffffff', border: 'none', padding: '12px 18px', borderRadius: '12px',
              fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 4px 14px rgba(21, 94, 45, 0.25)'
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
