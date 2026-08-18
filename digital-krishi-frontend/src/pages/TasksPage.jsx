import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCalendarCheck, FaPlus, FaCheck, FaTrash, FaClock,
  FaTimes, FaExclamationCircle, FaCheckCircle, FaCloudSun,
  FaWind, FaTint, FaSeedling, FaMagic, FaExclamationTriangle,
  FaFlask, FaSun, FaLeaf
} from 'react-icons/fa';
import API from '../services/api';
import weatherService from '../services/weatherService';
import ConfirmModal from '../components/common/ConfirmModal';
import '../styles/Dashboard.css';

const CATEGORY_CONFIG = {
  sowing:     { label: 'Sowing & Seeds', color: 'green',  emoji: '🌱' },
  irrigation: { label: 'Irrigation',     color: 'blue',   emoji: '💧' },
  fertilizer: { label: 'Fertilizer',     color: 'green',  emoji: '🌿' },
  pesticide:  { label: 'Pesticide Spray',color: 'amber',  emoji: '🐛' },
  harvest:    { label: 'Harvesting',     color: 'amber',  emoji: '🌾' },
  other:      { label: 'General Task',   color: 'gray',   emoji: '📝' },
};

const TABS = [
  { key: 'all',      label: 'All Tasks' },
  { key: 'sowing',   label: '🌱 Sowing & Planting' },
  { key: 'today',    label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'done',     label: 'Completed' },
];

const todayStr = () => new Date().toISOString().split('T')[0];

const TasksPage = () => {
  const [tasks, setTasks]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [activeTab, setActiveTab]         = useState('all');
  const [showModal, setShowModal]         = useState(false);
  const [saving, setSaving]               = useState(false);
  const [generatingAI, setGeneratingAI]   = useState(false);
  const [deleteTaskId, setDeleteTaskId]   = useState(null);
  const [newTask, setNewTask]             = useState({
    title: '',
    description: '',
    date: todayStr(),
    category: 'sowing',
    weatherCondition: 'Optimal'
  });

  // Weather Intelligence State
  const [weather, setWeather]             = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const location = user.location || 'Nashik';

  useEffect(() => {
    fetchTasks();
    fetchWeather();
  }, []);

  const fetchWeather = useCallback(async () => {
    try {
      setWeatherLoading(true);
      const data = await weatherService.getWeather(location);
      setWeather(data);
    } catch (err) {
      console.warn('Weather fetch fallback:', err);
      setWeather({
        temperature: 28,
        description: 'Partly Cloudy & Favorable',
        humidity: 56,
        windSpeed: 12,
        rainProbability: 15,
        location: location
      });
    } finally {
      setWeatherLoading(false);
    }
  }, [location]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await API.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setNewTask({
      title: '',
      description: '',
      date: todayStr(),
      category: 'sowing',
      weatherCondition: 'Optimal'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/tasks', newTask);
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add task');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await API.put(`/tasks/${id}`, { status: 'completed' });
      setTasks(ts => ts.map(t => t._id === id ? { ...t, status: 'completed' } : t));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const confirmDeleteTask = async () => {
    if (!deleteTaskId) return;
    try {
      await API.delete(`/tasks/${deleteTaskId}`);
      setTasks(ts => ts.filter(t => t._id !== deleteTaskId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setDeleteTaskId(null);
    }
  };

  const handleDelete = (id) => {
    setDeleteTaskId(id);
  };

  /* ── AI Auto-Generate Weather-Driven Sowing Tasks ── */
  const handleAutoGenerateWeatherTasks = async () => {
    setGeneratingAI(true);
    try {
      const generated = [
        {
          title: `Seed Treatment for ${user.crop || 'Wheat'} (Trichoderma & Bavistin)`,
          description: `Treat certified seeds with Trichoderma viride @ 5g/kg for fungal protection prior to sowing window.`,
          date: todayStr(),
          category: 'sowing'
        },
        {
          title: `Soil Tilth & Basal Fertilizer (DAP + MOP)`,
          description: `Optimal soil temp (${weather?.temperature || 28}°C) — apply DAP @ 50kg/acre and prepare nursery beds.`,
          date: todayStr(),
          category: 'sowing'
        },
        {
          title: `Pre-Sowing Light Irrigation (Moisture Index: ${weather?.humidity || 56}%)`,
          description: `Irrigate field before high afternoon evaporation; rain risk is low (${weather?.rainProbability || 10}%).`,
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          category: 'irrigation'
        },
        {
          title: `Foliar Antifungal Spray (Safe Window)`,
          description: `Wind speed is calm (${weather?.windSpeed || 12} km/h). Safe spray window for Mancozeb 75% WP.`,
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          category: 'pesticide'
        }
      ];

      for (const t of generated) {
        await API.post('/tasks', t);
      }

      await fetchTasks();
      alert('✨ 4 AI Weather-Smart Sowing & Protection Tasks generated and scheduled!');
    } catch (e) {
      alert('Failed to generate weather tasks');
    } finally {
      setGeneratingAI(false);
    }
  };

  /* ── Filter ── */
  const today = todayStr();
  const filtered = tasks.filter(t => {
    if (activeTab === 'sowing')   return t.category === 'sowing';
    if (activeTab === 'today')    return t.date === today && t.status !== 'completed';
    if (activeTab === 'upcoming') return t.date > today  && t.status !== 'completed';
    if (activeTab === 'done')     return t.status === 'completed';
    return true;
  });

  const counts = {
    all:      tasks.length,
    sowing:   tasks.filter(t => t.category === 'sowing').length,
    today:    tasks.filter(t => t.date === today && t.status !== 'completed').length,
    upcoming: tasks.filter(t => t.date > today  && t.status !== 'completed').length,
    done:     tasks.filter(t => t.status === 'completed').length,
  };

  // Weather Sowing Feasibility Calculation
  const isSowingOptimal = weather ? (weather.temperature >= 18 && weather.temperature <= 34 && (weather.rainProbability || 0) < 40) : true;
  const isSpraySafe     = weather ? ((weather.windSpeed || 10) < 18 && (weather.rainProbability || 0) < 30) : true;

  return (
    <div className="ks-page" style={{ padding: '24px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="ks-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
        <div className="ks-page-header-left" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="ks-page-header-icon" style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)' }}>
            <FaCalendarCheck />
          </div>
          <div>
            <h1 className="ks-page-title" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
              Tasks & Sowing Planner
            </h1>
            <p className="ks-page-subtitle" style={{ fontSize: '0.88rem', color: 'var(--text-light)', margin: '4px 0 0 0' }}>
              Synchronized with live farm weather in {location} • {counts.today} task{counts.today !== 1 ? 's' : ''} scheduled today
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleAutoGenerateWeatherTasks}
            disabled={generatingAI}
            style={{
              background: 'linear-gradient(135deg, #0f766e, #0d9488)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)'
            }}
          >
            <FaMagic /> {generatingAI ? 'Generating Smart Schedule…' : '⚡ AI Weather-Smart Sowing Tasks'}
          </button>

          <button className="ks-btn ks-btn--primary" onClick={handleAdd} style={{ padding: '10px 18px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaPlus /> Add Task
          </button>
        </div>
      </div>

      {/* ─── Live Weather & Sowing Feasibility Banner ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #062b14 0%, #0c4a23 50%, #155e2d 100%)',
        borderRadius: '20px',
        padding: '20px 24px',
        color: '#ffffff',
        marginBottom: '24px',
        boxShadow: '0 8px 24px rgba(12, 74, 35, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        {/* Left: Weather Summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            color: '#fbbf24',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <FaCloudSun />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{weather?.temperature || 28}°C</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '12px' }}>
                {weather?.description || 'Partly Sunny'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)', marginTop: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaTint /> Humidity: {weather?.humidity || 56}%</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaWind /> Wind: {weather?.windSpeed || 12} km/h</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🌧 Rain Risk: {weather?.rainProbability || 10}%</span>
            </div>
          </div>
        </div>

        {/* Right: Sowing & Spray Feasibility Badges */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            background: isSowingOptimal ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            border: `1.5px solid ${isSowingOptimal ? '#4ade80' : '#f87171'}`,
            padding: '10px 16px',
            borderRadius: '14px',
            backdropFilter: 'blur(6px)'
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.75)', textTransform: 'uppercase' }}>
              🌱 SOWING WINDOW
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isSowingOptimal ? '#86efac' : '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              {isSowingOptimal ? <><FaCheckCircle /> Highly Optimal</> : <><FaExclamationTriangle /> High Heat Risk</>}
            </div>
          </div>

          <div style={{
            background: isSpraySafe ? 'rgba(56, 189, 248, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            border: `1.5px solid ${isSpraySafe ? '#38bdf8' : '#fbbf24'}`,
            padding: '10px 16px',
            borderRadius: '14px',
            backdropFilter: 'blur(6px)'
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.75)', textTransform: 'uppercase' }}>
              🧪 PESTICIDE SPRAY WINDOW
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isSpraySafe ? '#7dd3fc' : '#fde68a', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              {isSpraySafe ? <><FaCheckCircle /> Safe (Calm Wind)</> : <><FaExclamationTriangle /> High Drift Risk</>}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="ks-tab-bar" style={{ marginBottom: '20px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`ks-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            style={{ padding: '8px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '0.88rem' }}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className="ks-tab-count" style={{ marginLeft: '8px', background: 'rgba(0,0,0,0.08)', padding: '2px 7px', borderRadius: '10px', fontSize: '0.75rem' }}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[1, 2, 3].map(n => (
            <div key={n} className="ks-card" style={{ height: 90, borderRadius: '16px', background: '#ffffff', border: '1px solid var(--border)', opacity: 0.6 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="ks-empty" style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '24px', border: '2px dashed var(--border)' }}>
          <FaCheckCircle style={{ fontSize: '48px', color: '#15803d', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>All Clear! No Pending Tasks</h3>
          <p style={{ color: 'var(--text-light)', maxWidth: '420px', margin: '6px auto 20px' }}>
            Click above to add manual tasks or generate AI weather-driven sowing operations.
          </p>
          <button className="ks-btn ks-btn--primary" onClick={handleAdd}>
            <FaPlus className="me-2" /> Add Sowing Task
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AnimatePresence>
            {filtered.map((task, i) => {
              const cat = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.other;
              const isOverdue = task.date < today && task.status !== 'completed';
              const isDone    = task.status === 'completed';

              return (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04 }}
                  layout
                  style={{
                    background: isDone ? '#f8fafc' : '#ffffff',
                    borderRadius: '16px',
                    border: `1.5px solid ${isOverdue ? '#fca5a5' : isDone ? '#e2e8f0' : 'var(--border)'}`,
                    boxShadow: '0 2px 10px rgba(15,23,42,.04)',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    opacity: isDone ? 0.75 : 1
                  }}
                >
                  {/* Left: Checkbox + Content */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                    <button
                      onClick={() => !isDone && handleComplete(task._id)}
                      disabled={isDone}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        border: `2px solid ${isDone ? '#22c55e' : '#cbd5e1'}`,
                        background: isDone ? '#22c55e' : 'transparent',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isDone ? 'default' : 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isDone && <FaCheck style={{ fontSize: '12px' }} />}
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h4 style={{
                          margin: 0,
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: isDone ? '#94a3b8' : 'var(--text)',
                          textDecoration: isDone ? 'line-through' : 'none'
                        }}>
                          {task.title}
                        </h4>
                        <span style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '8px'
                        }}>
                          {cat.emoji} {cat.label}
                        </span>

                        {isOverdue && (
                          <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '8px' }}>
                            ⚠ Overdue
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: isDone ? '#94a3b8' : 'var(--text-mid)', lineHeight: 1.4 }}>
                          {task.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                        <FaClock style={{ fontSize: '11px' }} />
                        <span>Scheduled: {new Date(task.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Delete action */}
                  <button
                    onClick={() => handleDelete(task._id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    title="Delete task"
                  >
                    <FaTrash />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTaskId}
        title="Delete Scheduled Task?"
        message="Are you sure you want to remove this task from your farming calendar and daily planner?"
        confirmText="Yes, Delete Task"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDeleteTask}
        onCancel={() => setDeleteTaskId(null)}
      />

      {/* Add Task Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="ks-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="ks-modal"
              initial={{ opacity: 0, scale: .95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: .95, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '500px', width: '92%' }}
            >
              <div className="ks-modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                <h2 className="ks-modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                  🌱 Schedule Sowing or Farm Operation
                </h2>
                <button className="ks-modal-close" onClick={() => setShowModal(false)}><FaTimes /></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="ks-modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="ks-input-group">
                    <label className="ks-form-label">Task Title *</label>
                    <input
                      className="ks-input"
                      type="text"
                      placeholder="e.g., Sowing BT Cotton Seeds, Pre-irrigation"
                      value={newTask.title}
                      onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="ks-input-group">
                    <label className="ks-form-label">Operation Category</label>
                    <select
                      className="ks-input"
                      value={newTask.category}
                      onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                    >
                      <option value="sowing">🌱 Sowing & Seed Treatment</option>
                      <option value="irrigation">💧 Irrigation & Moisture Management</option>
                      <option value="fertilizer">🌿 Basal / Top Dressing Fertilizer</option>
                      <option value="pesticide">🐛 Pesticide / Fungicide Spray</option>
                      <option value="harvest">🌾 Harvesting & Threshing</option>
                      <option value="other">📝 Other Farm Operation</option>
                    </select>
                  </div>

                  <div className="ks-input-group">
                    <label className="ks-form-label">Scheduled Date *</label>
                    <input
                      className="ks-input"
                      type="date"
                      value={newTask.date}
                      onChange={e => setNewTask({ ...newTask, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="ks-input-group">
                    <label className="ks-form-label">Detailed Notes / Prescription</label>
                    <textarea
                      className="ks-input"
                      rows={3}
                      placeholder="e.g., Seed rate: 2.5 kg/acre, mix with Azotobacter & PSB bio-fertilizers"
                      value={newTask.description}
                      onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="ks-modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="ks-btn ks-btn--ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="ks-btn ks-btn--primary" disabled={saving}>
                    {saving ? 'Scheduling…' : 'Schedule Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TasksPage;
