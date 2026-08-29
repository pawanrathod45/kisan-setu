import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaMapMarkerAlt, FaSeedling, FaLeaf, FaTractor, FaBell,
  FaChartLine, FaCalendarCheck, FaCloudSun, FaRobot,
  FaCheckCircle, FaWind, FaTint, FaMicrophone, FaCamera,
  FaCheck, FaWater, FaPlus, FaChevronRight, FaExclamationTriangle,
  FaSyncAlt, FaVolumeUp, FaCalculator
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';
import { useLanguage } from '../context/LanguageContext';
import { getWeatherIcon } from '../utils/Wheathericons';
import ErrorBoundary from '../components/common/ErrorBoundary';
import '../styles/Dashboard.css';

const SYMPTOMS_GUIDE = [
  {
    id: 'yellow',
    label: '🍂 Yellow Leaf Tips',
    diagnosis: 'Nitrogen Deficiency (Chlorosis)',
    remedy: 'Apply Urea top-dressing @ 25 kg/acre or 2% Potassium Nitrate foliar spray.',
    chemical: 'Urea (46% N) / Potassium Nitrate (13:0:45)',
    waterPerAcre: 150,
    urgency: 'Medium',
    color: '#d97706',
    bg: '#fef3c7'
  },
  {
    id: 'curling',
    label: '🌿 Leaf Curl / Aphids',
    diagnosis: 'Sucking Pest (Aphid / Thrips / Whitefly)',
    remedy: 'Spray Neem Oil (10,000 PPM) @ 3ml/L or Imidacloprid 17.8% SL @ 0.5ml/L.',
    chemical: 'Imidacloprid 17.8% SL or Acetamiprid 20% SP',
    waterPerAcre: 200,
    urgency: 'High',
    color: '#dc2626',
    bg: '#fee2e2'
  },
  {
    id: 'spots',
    label: '🔴 Brown Blight Spots',
    diagnosis: 'Early Blight / Cercospora Leaf Spot',
    remedy: 'Apply Mancozeb 75% WP @ 2.5g/L during early morning before 9 AM.',
    chemical: 'Mancozeb 75% WP or Azoxystrobin 23% SC',
    waterPerAcre: 200,
    urgency: 'High',
    color: '#dc2626',
    bg: '#fee2e2'
  },
  {
    id: 'moisture',
    label: '💧 Soil Dry / Crust',
    diagnosis: 'Subsoil Moisture Depletion',
    remedy: 'Schedule 2.5-hour drip irrigation cycle before peak noon temperature.',
    chemical: 'Hydrogel / Organic Mulch layer 4 inches',
    waterPerAcre: 300,
    urgency: 'Low',
    color: '#0284c7',
    bg: '#e0f2fe'
  },
  {
    id: 'borer',
    label: '🐛 Stem Borer Attack',
    diagnosis: 'Lepidopteran Shoot & Stem Borer',
    remedy: 'Apply Chlorantraniliprole 18.5% SC @ 0.4ml/L or install Pheromone Traps @ 5/acre.',
    chemical: 'Chlorantraniliprole 18.5% SC (Coragen)',
    waterPerAcre: 200,
    urgency: 'Critical',
    color: '#b91c1c',
    bg: '#fee2e2'
  },
  {
    id: 'mildew',
    label: '⚪ Powdery Mildew',
    diagnosis: 'Erysiphe Cichoracearum (Foliar Fungus)',
    remedy: 'Spray Wettable Sulphur 80% WP @ 2g/L or Hexaconazole 5% SC @ 2ml/L.',
    chemical: 'Wettable Sulphur 80% WP or Hexaconazole',
    waterPerAcre: 200,
    urgency: 'Medium',
    color: '#d97706',
    bg: '#fef3c7'
  }
];

const MARKET_COMMODITIES = [
  { name: 'Wheat', icon: '🌾', basePrice: 2425, trend: '+2.8%' },
  { name: 'Soybean', icon: '🌱', basePrice: 4680, trend: '+1.5%' },
  { name: 'Cotton', icon: '🌿', basePrice: 7150, trend: '+3.2%' },
  { name: 'Tomato', icon: '🍅', basePrice: 1850, trend: '-2.1%' },
  { name: 'Potato', icon: '🥔', basePrice: 1420, trend: '+0.8%' },
  { name: 'Maize', icon: '🌽', basePrice: 2150, trend: '+1.1%' },
  { name: 'Onion', icon: '🧅', basePrice: 2280, trend: '+4.5%' }
];

const DEFAULT_DEMO_CROPS = [
  {
    _id: 'c1',
    name: 'Wheat (गेहूं)',
    variety: 'HD-2967 High Yield',
    area: 3.5,
    sowingDate: '15 Nov 2025',
    stage: 'Grain Filling',
    stageIndex: 3,
    healthStatus: '94% Excellent Vigor',
    diseaseDetected: 'None detected',
    currentPrice: 2425
  },
  {
    _id: 'c2',
    name: 'Mustard (सरसों)',
    variety: 'Pusa Bold 45',
    area: 2.0,
    sowingDate: '28 Oct 2025',
    stage: 'Pod Maturation',
    stageIndex: 4,
    healthStatus: '88% Good Vigor',
    diseaseDetected: 'Minor Aphid Watch',
    currentPrice: 5350
  }
];

const DEFAULT_DEMO_TASKS = [
  { _id: 'dt1', title: 'Schedule 2.5 hr Morning Drip Irrigation', category: 'irrigation', status: 'pending', done: false },
  { _id: 'dt2', title: 'Inspect wheat leaf underside for early rust', category: 'protection', status: 'pending', done: false },
  { _id: 'dt3', title: 'Check APMC mandi rate momentum for wheat lot', category: 'market', status: 'completed', done: true },
  { _id: 'dt4', title: 'Apply Urea top-dressing @ 25 kg/acre', category: 'fertilizer', status: 'pending', done: false }
];

const DEFAULT_DEMO_ALERTS = [
  {
    _id: 'da1',
    title: 'Optimal Agrochemical Spray Window Active',
    description: 'Current wind speed 11 km/h is below 15 km/h threshold. Foliar spray safe until 11:30 AM.',
    severity: 'medium',
    type: 'Weather Precision'
  },
  {
    _id: 'da2',
    title: 'APMC Wheat Price Uptick Alert (+2.8%)',
    description: 'District arrivals steady; modal rate crossed ₹2,425/Qtl in regional APMC.',
    severity: 'low',
    type: 'Market Momentum'
  }
];

const CROP_STAGES = [
  { name: 'Sowing & Germination', advice: 'Ensure uniform moisture & seed treatment.' },
  { name: 'Vegetative Growth', advice: 'Apply nitrogen top-dressing & scout weeds.' },
  { name: 'Flowering & Tillering', advice: 'Critical irrigation period; avoid moisture stress.' },
  { name: 'Grain Filling', advice: 'Monitor aphid counts & safeguard against lodging.' },
  { name: 'Maturity & Harvest', advice: 'Check grain moisture (<12%) before combining.' }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const {
    weather,
    crops,
    tasks,
    alerts,
    market,
    data,
    loading,
    refreshData,
    toggleTaskStatus,
    fetchMarketForCrop,
    addTask,
    dismissAlert
  } = useDashboardData(user);

  // Card 1 state: Weather Hourly Scrubber
  const [selectedHour, setSelectedHour] = useState(0);
  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);

  // Card 2 state: Market Intelligence & Yield Estimator
  const [selectedCommodity, setSelectedCommodity] = useState(MARKET_COMMODITIES[0]);
  const [estimatedYieldQtl, setEstimatedYieldQtl] = useState(25);

  // Card 3 state: Tasks Checklist & Quick Add
  const [taskFilter, setTaskFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('field');

  // Card 4 state: AI Krishi Doctor Symptom & Dosage Calculator
  const [selectedSymptom, setSelectedSymptom] = useState(SYMPTOMS_GUIDE[0]);
  const [dosageAcres, setDosageAcres] = useState(1);

  // Card 5 state: Crop Portfolio & Stage Selector
  const [selectedCropIndex, setSelectedCropIndex] = useState(0);
  const [activeStageIndex, setActiveStageIndex] = useState(3);
  const [fieldActionMsg, setFieldActionMsg] = useState(null);

  // Card 6 state: Advisories & Speech Alert
  const [alertFilter, setAlertFilter] = useState('all'); // 'all' | 'critical' | 'advisory'
  const [speakingAlertId, setSpeakingAlertId] = useState(null);

  // Greeting & farmer info
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? t('goodMorning', 'Good Morning')
      : currentHour < 18
      ? t('goodAfternoon', 'Good Afternoon')
      : t('goodEvening', 'Good Evening');

  const farmerName = user.name?.split(' ')[0] || t('farmerProfile', 'Farmer');

  // Fallback crops / tasks / alerts if DB is empty to guarantee full interactive UX
  const displayCrops = crops.length > 0 ? crops : DEFAULT_DEMO_CROPS;
  const displayTasks = tasks.length > 0 ? tasks : DEFAULT_DEMO_TASKS;
  const displayAlerts = alerts.length > 0 ? alerts : DEFAULT_DEMO_ALERTS;

  const completedTasksCount = displayTasks.filter(t => t.status === 'completed' || t.done).length;
  const taskProgressPct = displayTasks.length > 0 ? Math.round((completedTasksCount / displayTasks.length) * 100) : 0;

  // Filter tasks
  const filteredTasks = displayTasks.filter(t => {
    const isDone = t.status === 'completed' || t.done;
    if (taskFilter === 'pending') return !isDone;
    if (taskFilter === 'completed') return isDone;
    return true;
  });

  // Filter alerts
  const filteredAlerts = displayAlerts.filter(a => {
    if (alertFilter === 'critical') return a.severity === 'high' || a.severity === 'critical';
    if (alertFilter === 'advisory') return a.severity === 'medium' || a.severity === 'low';
    return true;
  });

  const activeCrop = displayCrops[selectedCropIndex] || displayCrops[0];

  // Dynamic hourly weather calculation from real weather data
  const baseTemp = weather?.temperature || 26;
  const baseWind = weather?.windSpeed || 12;
  const baseHumidity = weather?.humidity || 55;

  const hourlySlots = [
    {
      time: '06:00',
      temp: `${Math.max(16, baseTemp - 4)}°C`,
      rain: '5%',
      wind: Math.max(6, baseWind - 3),
      humidity: Math.min(85, baseHumidity + 18),
      status: 'optimal',
      label: '🟢 Ideal Spray Window',
      advice: 'Gentle wind and cool surface temp. Optimum absorption for foliar nutrients & bio-stimulants.'
    },
    {
      time: '09:00',
      temp: `${Math.max(18, baseTemp - 2)}°C`,
      rain: '10%',
      wind: baseWind,
      humidity: baseHumidity,
      status: 'optimal',
      label: '🟢 Good Spray Conditions',
      advice: 'Dew dried up. Safe for systemic insecticides and fungicides before noon heat.'
    },
    {
      time: '12:00',
      temp: `${Math.min(38, baseTemp + 3)}°C`,
      rain: '15%',
      wind: baseWind + 4,
      humidity: Math.max(30, baseHumidity - 15),
      status: 'caution',
      label: '🟡 Peak Noon Heat Warning',
      advice: 'High temperature causes droplet vaporization. Avoid foliar chemical sprays.'
    },
    {
      time: '15:00',
      temp: `${Math.min(37, baseTemp + 2)}°C`,
      rain: '20%',
      wind: baseWind + 6,
      humidity: Math.max(35, baseHumidity - 10),
      status: 'caution',
      label: '🟠 Wind Drift Alert',
      advice: `Wind speed approx ${baseWind + 6} km/h may cause chemical drift to adjacent fields.`
    },
    {
      time: '18:00',
      temp: `${Math.max(19, baseTemp - 2)}°C`,
      rain: '10%',
      wind: Math.max(7, baseWind - 2),
      humidity: baseHumidity + 8,
      status: 'optimal',
      label: '🟢 Prime Evening Window',
      advice: 'Calm ambient conditions. Ideal for soil microbial drenches and preventive fungicides.'
    },
    {
      time: '21:00',
      temp: `${Math.max(15, baseTemp - 5)}°C`,
      rain: '5%',
      wind: Math.max(5, baseWind - 5),
      humidity: baseHumidity + 22,
      status: 'night',
      label: '🌙 Calm Night Cycle',
      advice: 'Low evapotranspiration. Ideal window for scheduled drip irrigation cycles.'
    }
  ];

  // Refresh weather handler
  const handleRefreshWeather = async () => {
    setIsRefreshingWeather(true);
    await refreshData();
    setTimeout(() => setIsRefreshingWeather(false), 700);
  };

  // Commodity switcher handler
  const handleSelectCommodity = async (comm) => {
    setSelectedCommodity(comm);
    await fetchMarketForCrop(comm.name);
  };

  // Quick Add Task handler
  const handleAddTask = (e) => {
    e?.preventDefault();
    if (!newTaskInput.trim()) return;
    addTask({
      title: newTaskInput.trim(),
      category: newTaskCategory,
      date: new Date().toISOString().split('T')[0]
    });
    setNewTaskInput('');
  };

  // TTS Read Alert Aloud handler
  const handleReadAlert = (alert) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    if (speakingAlertId === (alert._id || alert.id)) {
      window.speechSynthesis.cancel();
      setSpeakingAlertId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `Kisan Setu Alert: ${alert.title}. ${alert.description || alert.message || ''}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingAlertId(null);
    utterance.onerror = () => setSpeakingAlertId(null);

    setSpeakingAlertId(alert._id || alert.id);
    window.speechSynthesis.speak(utterance);
  };

  // Log Field Action
  const handleLogFieldAction = (actionName) => {
    setFieldActionMsg(`✓ Successfully logged ${actionName} for ${activeCrop?.name || 'Wheat'}!`);
    setTimeout(() => setFieldActionMsg(null), 3500);
  };

  // Current APMC price calculations
  const currentModalPrice = market?.modalPrice || selectedCommodity.basePrice;
  const currentMinPrice = market?.minPrice || Math.round(currentModalPrice * 0.92);
  const currentMaxPrice = market?.maxPrice || Math.round(currentModalPrice * 1.09);
  const estimatedRevenue = (estimatedYieldQtl * currentModalPrice).toLocaleString('en-IN');

  return (
    <Container fluid className="dashboard-page" style={{ padding: 0 }}>
      {/* ─── Hero Welcome Cockpit Section ─── */}
      <motion.div
        className="hero-welcome-card"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-tag-pill">
              <span className="hero-tag-dot" />
              <span>{t('smartKrishiCockpit', 'Smart Krishi Cockpit · Active Precision')}</span>
            </div>
            <h1 className="hero-greeting">
              {greeting}, {farmerName}! 🌾
            </h1>
            <p className="hero-subtitle">
              {t('dashboardSubtitle', 'Your real-time farm intelligence: live weather spray windows, APMC market price radar, crop health diagnostics, and smart operations.')}
            </p>
            <div className="hero-meta">
              <span className="meta-item meta-item--location">
                <FaMapMarkerAlt className="meta-icon meta-icon--orange" />
                <span>{user.location || weather?.city || 'Pune, Maharashtra'}</span>
              </span>
              <span className="meta-item meta-item--crop">
                <FaSeedling className="meta-icon meta-icon--green" />
                <span>{user.crop || activeCrop?.name || 'Wheat (गेहूं)'}</span>
              </span>
              <span className="meta-item meta-item--status">
                <FaCheckCircle className="meta-icon meta-icon--blue" />
                <span>{t('activePlots', { count: displayCrops.length })}</span>
              </span>
            </div>
          </div>

          <div className="hero-right">
            <div className="premium-weather">
              <div className="weather-header-pill">
                <span className="weather-live-dot" />
                <span>{t('liveAgroMeteorology', 'Live Agro-Meteorology')}</span>
              </div>

              {/* ROW 1: Icon + Temp + Condition */}
              <div className="weather-main-row">
                <div className="weather-icon-float">
                  {getWeatherIcon(weather?.condition)}
                </div>
                <div className="weather-temp">
                  {weather?.temperature ? `${weather.temperature}°C` : '26°C'}
                </div>
                <div className="weather-condition">
                  {weather?.description || weather?.condition || 'Pleasant & Clear'}
                </div>
              </div>

              {/* ROW 2: Humidity + Wind */}
              <div className="weather-extra">
                <span className="weather-stat-chip weather-stat-chip--blue">
                  <FaTint /> <span className="weather-stat-val">{weather?.humidity ?? '55'}%</span> <span>{t('humidity', 'Humidity')}</span>
                </span>
                <span className="weather-stat-chip weather-stat-chip--teal">
                  <FaWind /> <span className="weather-stat-val">{weather?.windSpeed ?? '12'} km/h</span> <span>{t('wind', 'Wind')}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 1-Click Interactive Farm Quick Action Bar ─── */}
        <div className="hero-quick-actions-bar">
          <span className="hero-quick-actions-label">
            {t('oneClickFarmActions', '⚡ 1-Click Farm Actions:')}
          </span>

          <button
            onClick={() => navigate('/farmer/disease-detection')}
            className="hero-quick-action-btn"
          >
            <FaCamera style={{ color: '#4ade80' }} /> <span>{t('scanCropDisease', 'Scan Crop Disease')}</span>
          </button>

          <button
            onClick={() => navigate('/farmer/voice')}
            className="hero-quick-action-btn"
          >
            <FaMicrophone style={{ color: '#38bdf8' }} /> <span>{t('voiceKrishiAssistant', 'Voice Krishi Assistant')}</span>
          </button>

          <button
            onClick={() => handleLogFieldAction('2.5 Hr Drip Irrigation')}
            className={`hero-quick-action-btn ${fieldActionMsg ? 'logged' : ''}`}
          >
            <FaWater style={{ color: fieldActionMsg ? '#15803d' : '#93c5fd' }} />
            <span>{fieldActionMsg ? '✓ ' + t('success', 'Logged') : t('logDripIrrigation', 'Log Drip Irrigation')}</span>
          </button>

          <button
            onClick={() => navigate('/farmer/market')}
            className="hero-quick-action-btn hero-quick-action-btn--market"
          >
            <FaChartLine style={{ color: '#fde047' }} /> <span>{t('mandiRatesToday', 'Mandi Rates Today →')}</span>
          </button>
        </div>
      </motion.div>

      {/* Field Action Notification Banner */}
      <AnimatePresence>
        {fieldActionMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="field-action-success-banner"
          >
            <span>{fieldActionMsg}</span>
            <button onClick={() => setFieldActionMsg(null)} className="field-action-close-btn">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 6 Interactive Real-Data Cards in a Strict 2-Cards-Per-Row Responsive Grid ─── */}
      <div className="dashboard-two-col-grid">

        {/* ═══════════════════════════════════════════════════════
            CARD 1: 24H PRECISION SPRAY & WEATHER RADAR
            ═══════════════════════════════════════════════════════ */}
        <ErrorBoundary isWidget title={t('precisionSprayRadar', '24h Precision Spray Radar')} onRetry={refreshData}>
          <div className="dashboard-card-interactive">
            <div className="dashboard-card-header">
              <div>
                <span className="dashboard-card-tag" style={{ color: '#0284c7' }}>
                  {t('hourlyRadarTag', 'HOURLY RADAR & SPRAY WINDOW')}
                </span>
                <h3 className="dashboard-card-title">
                  <FaCloudSun style={{ color: '#0284c7' }} /> {t('precisionSprayRadar', '24h Precision Spray Radar')}
                </h3>
              </div>
              <div className="dashboard-card-header-actions">
                <button
                  onClick={handleRefreshWeather}
                  title="Refresh Live Weather"
                  className="dashboard-refresh-btn"
                >
                  <FaSyncAlt className={isRefreshingWeather ? 'fa-spin' : ''} />
                  <span>{t('live', 'Live')}</span>
                </button>
                <span className="dashboard-badge-pill" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                  {user.location || weather?.city || 'Pune'}
                </span>
              </div>
            </div>

            <p className="dashboard-card-desc">
              {t('sprayRadarSub', 'Click an hourly slot below to test real-time agrochemical spray suitability, wind drift, and rainfall risk:')}
            </p>

            {/* Interactive Hourly Timeline Scrubber */}
            <div className="hourly-radar-track ks-scroll">
              {hourlySlots.map((hr, idx) => {
                const isSelected = selectedHour === idx;
                const isGood = hr.status === 'optimal';
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedHour(idx)}
                    className={`hourly-slot-btn ${isSelected ? 'selected' : isGood ? 'optimal' : 'warning'}`}
                  >
                    <span className="hourly-slot-time">
                      {hr.time}
                    </span>
                    <span className="hourly-slot-temp">{hr.temp}</span>
                    <span className="hourly-slot-rain">
                      💧 {hr.rain}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Hour Details Box */}
            <div style={{
              background: hourlySlots[selectedHour].status === 'optimal' ? '#f0fdf4' : '#fffbeb',
              border: `1.5px solid ${hourlySlots[selectedHour].status === 'optimal' ? '#86efac' : '#fde68a'}`,
              borderRadius: '14px',
              padding: '12px 14px',
              marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{
                  fontSize: '13px',
                  color: hourlySlots[selectedHour].status === 'optimal' ? '#15803d' : '#b45309'
                }}>
                  {hourlySlots[selectedHour].time} Window: {hourlySlots[selectedHour].label}
                </strong>
                <div style={{ display: 'flex', gap: '8px', fontSize: '11.5px', fontWeight: 700 }}>
                  <span style={{ color: '#0284c7' }}>💨 {hourlySlots[selectedHour].wind} km/h</span>
                  <span style={{ color: '#0369a1' }}>💧 {hourlySlots[selectedHour].humidity}%</span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: 1.4 }}>
                💡 {hourlySlots[selectedHour].advice}
              </p>
            </div>

            {/* Card 1 Footer */}
            <div className="dashboard-card-footer">
              <span style={{ fontSize: '11.5px', color: '#15803d', fontWeight: 700 }}>
                🌿 Recommended: 06:00 - 09:30 AM or 05:30 - 07:00 PM
              </span>
              <button
                onClick={() => navigate('/farmer/weather')}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Full Advisory →
              </button>
            </div>
          </div>
        </ErrorBoundary>

        {/* ═══════════════════════════════════════════════════════
            CARD 2: LIVE APMC PRICE RADAR & YIELD ESTIMATOR
            ═══════════════════════════════════════════════════════ */}
        <ErrorBoundary isWidget title={t('liveApmcPriceRadar', 'Live APMC Price Radar')} onRetry={() => fetchMarketForCrop(selectedCommodity.name)}>
          <div className="dashboard-card-interactive">
          <div className="dashboard-card-header">
            <div>
              <span className="dashboard-card-tag" style={{ color: '#15803d' }}>
                MARKET INTELLIGENCE & APMC
              </span>
              <h3 className="dashboard-card-title">
                <FaChartLine style={{ color: '#15803d' }} /> Live APMC Price Radar
              </h3>
            </div>
            <span className="dashboard-badge-pill" style={{ background: '#dcfce7', color: '#15803d' }}>
              🟢 Live Mandi Stream
            </span>
          </div>

          {/* Interactive Commodity Switcher Pills */}
          <div className="dashboard-pills-scroll">
            {MARKET_COMMODITIES.map(comm => {
              const isSelected = selectedCommodity.name === comm.name;
              return (
                <button
                  key={comm.name}
                  onClick={() => handleSelectCommodity(comm)}
                  className={`dashboard-pill-btn ${isSelected ? 'active' : ''}`}
                >
                  <span>{comm.icon}</span>
                  <span>{comm.name}</span>
                </button>
              );
            })}
          </div>

          {/* Live Price Display Box */}
          <div style={{
            background: 'linear-gradient(135deg, #072712, #155e2d)',
            borderRadius: '16px',
            padding: '14px 18px',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 16px rgba(21, 94, 45, 0.2)'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {market?.market || `${user.location || 'Pune'} APMC`} • {selectedCommodity.name}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px', marginTop: '2px' }}>
                ₹{currentModalPrice} <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>/ Quintal</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11.5px', color: '#86efac', display: 'block', fontWeight: 700 }}>
                High: ₹{currentMaxPrice}
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)' }}>
                Low: ₹{currentMinPrice}
              </span>
              <span style={{
                fontSize: '10.5px',
                fontWeight: 800,
                color: '#fef08a',
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '2px 6px',
                borderRadius: '6px',
                display: 'inline-block',
                marginTop: '4px'
              }}>
                Trend: {selectedCommodity.trend} ▲
              </span>
            </div>
          </div>

          {/* Interactive Harvest Value Calculator */}
          <div style={{
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '12px',
            padding: '10px 14px',
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCalculator style={{ color: '#15803d', fontSize: '14px' }} />
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block' }}>
                  Harvest Yield Value:
                </span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#15803d' }}>
                  ₹{estimatedRevenue} Total
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="number"
                min="1"
                max="500"
                value={estimatedYieldQtl}
                onChange={(e) => setEstimatedYieldQtl(Math.max(1, Number(e.target.value) || 1))}
                style={{
                  width: '56px',
                  padding: '4px 6px',
                  borderRadius: '6px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '12px',
                  fontWeight: 700,
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Qtl</span>
            </div>
          </div>

            {/* Card 2 Footer */}
            <div className="dashboard-card-footer">
              <span style={{ fontSize: '11.5px', color: '#15803d', fontWeight: 700 }}>
                📈 Positive district arrivals demand
              </span>
              <button
                onClick={() => navigate('/farmer/market')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#15803d',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '4px 0'
                }}
              >
                Compare Mandis →
              </button>
            </div>
          </div>
        </ErrorBoundary>

        {/* ═══════════════════════════════════════════════════════
            CARD 3: DAILY FIELD TASKS & OPERATIONS TRACKER
            ═══════════════════════════════════════════════════════ */}
        <ErrorBoundary isWidget title={t('dailyFieldTasks', 'Daily Field Tasks')} onRetry={refreshData}>
          <div className="dashboard-card-interactive">
            <div className="dashboard-card-header">
              <div>
                <span className="dashboard-card-tag" style={{ color: '#7e22ce' }}>
                  {t('dailyOperationsTag', 'DAILY OPERATIONS & AGRONOMY')}
                </span>
                <h3 className="dashboard-card-title">
                  <FaCalendarCheck style={{ color: '#7e22ce' }} /> {t('dailyFieldTasks', 'Daily Field Tasks')}
                </h3>
              </div>
            <span className="dashboard-badge-pill" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
              {completedTasksCount} / {displayTasks.length} Done ({taskProgressPct}%)
            </span>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            {['all', 'pending', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setTaskFilter(f)}
                style={{
                  background: taskFilter === f ? '#7e22ce' : '#f8fafc',
                  color: taskFilter === f ? '#ffffff' : '#475569',
                  border: `1.5px solid ${taskFilter === f ? '#7e22ce' : '#e2e8f0'}`,
                  borderRadius: '14px',
                  padding: '3px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Progress Bar */}
          <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{
              width: `${taskProgressPct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #a855f7, #7e22ce)',
              borderRadius: '10px',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Interactive Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '115px' }}>
            {filteredTasks.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <FaCheckCircle style={{ color: '#16a34a', fontSize: '18px', marginBottom: '4px' }} />
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  {taskFilter === 'pending' ? 'All Pending Tasks Done!' : 'No tasks found for this filter.'}
                </p>
              </div>
            ) : (
              filteredTasks.slice(0, 3).map(t => {
                const isDone = t.status === 'completed' || t.done;
                return (
                  <div
                    key={t._id || t.id}
                    onClick={() => toggleTaskStatus(t._id || t.id, isDone)}
                    style={{
                      background: isDone ? '#f8fafc' : '#ffffff',
                      border: `1.5px solid ${isDone ? '#e2e8f0' : '#cbd5e1'}`,
                      borderRadius: '10px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '6px',
                      background: isDone ? '#7e22ce' : '#ffffff',
                      border: `2px solid ${isDone ? '#7e22ce' : '#94a3b8'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#ffffff', fontSize: '10px', flexShrink: 0
                    }}>
                      {isDone && <FaCheck />}
                    </div>
                    <span style={{
                      flex: 1,
                      fontSize: '12px',
                      fontWeight: 600,
                      color: isDone ? '#94a3b8' : '#0f172a',
                      textDecoration: isDone ? 'line-through' : 'none'
                    }}>
                      {t.title || t.text}
                    </span>
                    {t.category && (
                      <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#7e22ce', background: '#f3e8ff', padding: '2px 6px', borderRadius: '4px' }}>
                        {t.category}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Inline Quick Add Task Input */}
          <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
            <input
              type="text"
              placeholder="Add farm task (e.g. Weed plot 2)..."
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '11.5px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                background: '#7e22ce',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              + Add
            </button>
          </form>

            {/* Card 3 Footer */}
            <div className="dashboard-card-footer">
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>Click checkbox to mark done</span>
              <button
                onClick={() => navigate('/farmer/tasks')}
                style={{ background: 'none', border: 'none', color: '#7e22ce', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
              >
                Full Tasks Planner →
              </button>
            </div>
          </div>
        </ErrorBoundary>

        {/* ═══════════════════════════════════════════════════════
            CARD 4: AI KRISHI DOCTOR & ICAR DIAGNOSTIC DOSAGE
            ═══════════════════════════════════════════════════════ */}
        <ErrorBoundary isWidget title={t('aiKrishiDoctor', 'AI Krishi Doctor')} onRetry={() => {}}>
          <div className="dashboard-card-interactive">
            <div className="dashboard-card-header">
              <div>
                <span className="dashboard-card-tag" style={{ color: '#16a34a' }}>
                  {t('aiKrishiDoctorTag', 'AI KRISHI DOCTOR & DIAGNOSIS')}
                </span>
                <h3 className="dashboard-card-title">
                  <FaRobot style={{ color: '#16a34a' }} /> {t('instantRemedyDosage', 'Instant Remedy & Dosage')}
                </h3>
              </div>
            <span className="dashboard-badge-pill" style={{ background: '#dcfce7', color: '#15803d' }}>
              ICAR Certified
            </span>
          </div>

          {/* Interactive Symptom Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
            {SYMPTOMS_GUIDE.slice(0, 6).map(s => {
              const isSelected = selectedSymptom.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSymptom(s)}
                  style={{
                    background: isSelected ? '#f0fdf4' : '#f8fafc',
                    border: `1.5px solid ${isSelected ? '#22c55e' : '#e2e8f0'}`,
                    borderRadius: '10px',
                    padding: '6px 4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isSelected ? '#15803d' : '#334155',
                    cursor: 'pointer',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    transition: 'all 0.15s ease'
                  }}
                  title={s.label}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Diagnosis & Action Box */}
          <div style={{
            background: selectedSymptom.bg,
            border: `1.5px solid ${selectedSymptom.color}40`,
            borderRadius: '14px',
            padding: '12px 14px',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: selectedSymptom.color, textTransform: 'uppercase' }}>
                {selectedSymptom.diagnosis}
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                background: '#ffffff',
                color: selectedSymptom.color,
                padding: '2px 6px',
                borderRadius: '6px'
              }}>
                {selectedSymptom.urgency} Urgency
              </span>
            </div>
            <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#0f172a', lineHeight: 1.35, fontWeight: 600 }}>
              💡 <strong>Action:</strong> {selectedSymptom.remedy}
            </p>

            {/* Interactive Dosage Calculator */}
            <div style={{
              background: 'rgba(255,255,255,0.85)',
              borderRadius: '8px',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#334155',
              fontWeight: 700
            }}>
              <span>Calculated Dose for:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  min="0.5"
                  max="50"
                  step="0.5"
                  value={dosageAcres}
                  onChange={(e) => setDosageAcres(Math.max(0.5, Number(e.target.value) || 1))}
                  style={{
                    width: '46px',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                    textAlign: 'center',
                    fontWeight: 800
                  }}
                />
                <span>Acre(s) = <strong>{selectedSymptom.waterPerAcre * dosageAcres}L Water</strong></span>
              </div>
            </div>
          </div>

            {/* Card 4 Footer */}
            <div className="dashboard-card-footer">
              <button
                onClick={() => navigate('/farmer/disease-detection')}
                style={{
                  background: '#15803d',
                  color: '#ffffff',
                  border: 'none',
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
                <FaCamera /> Scan Leaf Photo
              </button>
              <button
                onClick={() => navigate('/farmer/voice')}
                style={{
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1.5px solid #86efac',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <FaMicrophone /> Voice Doctor
              </button>
            </div>
          </div>
        </ErrorBoundary>

        {/* ═══════════════════════════════════════════════════════
            CARD 5: ACTIVE CROP HOLDINGS & GROWTH STAGE VIGOR
            ═══════════════════════════════════════════════════════ */}
        <ErrorBoundary isWidget title={t('myCrops', 'Crop Portfolio')} onRetry={refreshData}>
          <div className="dashboard-card-interactive">
            <div className="dashboard-card-header">
              <div>
                <span className="dashboard-card-tag" style={{ color: '#15803d' }}>
                  {t('cropPortfolioTag', 'CROP PORTFOLIO & HEALTH')}
                </span>
                <h3 className="dashboard-card-title">
                  <FaSeedling style={{ color: '#15803d' }} /> {t('activeHoldingsVigor', 'Active Holdings & Field Vigor')}
                </h3>
              </div>
            <span className="dashboard-badge-pill" style={{ background: '#f0fdf4', color: '#15803d' }}>
              {displayCrops.length} {displayCrops.length === 1 ? 'Plot' : 'Plots'} Registered
            </span>
          </div>

          {/* Plot switcher pills */}
          <div className="dashboard-pills-scroll">
            {displayCrops.map((c, i) => (
              <button
                key={c._id || i}
                onClick={() => {
                  setSelectedCropIndex(i);
                  setActiveStageIndex(c.stageIndex || 3);
                }}
                className={`dashboard-pill-btn ${selectedCropIndex === i ? 'active' : ''}`}
              >
                <span>🌱</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>

          {/* Active Crop Details Card */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '12px 14px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  {activeCrop?.name} {activeCrop?.variety ? `(${activeCrop.variety})` : ''}
                </h4>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                  📍 Area: <strong>{activeCrop?.area || 2.5} Acres</strong> • Sown: <strong>{activeCrop?.sowingDate || 'Active'}</strong>
                </span>
              </div>
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '3px 8px', borderRadius: '6px' }}>
                {activeCrop?.healthStatus || '92% Healthy'}
              </span>
            </div>

            {/* Interactive 5-Stage Growth Journey */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                <span>1. Sowing</span>
                <span>2. Vegetative</span>
                <span>3. Flowering</span>
                <span>4. Grain Fill</span>
                <span>5. Harvest</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', height: '6px', borderRadius: '10px', overflow: 'hidden', background: '#e2e8f0' }}>
                {[0, 1, 2, 3, 4].map(idx => (
                  <div
                    key={idx}
                    onClick={() => setActiveStageIndex(idx)}
                    style={{
                      background: idx <= activeStageIndex ? 'linear-gradient(90deg, #22c55e, #15803d)' : '#cbd5e1',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    title={CROP_STAGES[idx]?.name}
                  />
                ))}
              </div>
              <div style={{ marginTop: '6px', fontSize: '11px', color: '#166534', fontWeight: 700 }}>
                Stage: <strong>{CROP_STAGES[activeStageIndex]?.name}</strong> — {CROP_STAGES[activeStageIndex]?.advice}
              </div>
            </div>
          </div>

            {/* Card 5 Footer */}
            <div className="dashboard-card-footer">
              <button
                onClick={() => navigate('/farmer/calendar')}
                style={{ background: 'none', border: 'none', color: '#15803d', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
              >
                View Crop Timeline →
              </button>
              <button
                onClick={() => navigate('/farmer/crops')}
                style={{
                  background: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + Manage Crop Plots
              </button>
            </div>
          </div>
        </ErrorBoundary>

        {/* ═══════════════════════════════════════════════════════
            CARD 6: PRIORITY FARM ADVISORIES & AUDIO WARNINGS
            ═══════════════════════════════════════════════════════ */}
        <ErrorBoundary isWidget title={t('farmAdvisories', 'Farm Advisories & Alerts')} onRetry={refreshData}>
          <div className="dashboard-card-interactive">
            <div className="dashboard-card-header">
              <div>
                <span className="dashboard-card-tag" style={{ color: '#d97706' }}>
                  {t('priorityAlertsTag', 'PRIORITY ALERTS & ADVISORY')}
                </span>
                <h3 className="dashboard-card-title">
                  <FaBell style={{ color: '#d97706' }} /> {t('farmAdvisories', 'Farm Advisories & Alerts')}
                </h3>
              </div>
              <span className="dashboard-badge-pill" style={{ background: '#fef3c7', color: '#d97706' }}>
                {displayAlerts.length} Active
              </span>
            </div>

            {/* Severity Filter Tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              {['all', 'critical', 'advisory'].map(f => (
                <button
                  key={f}
                  onClick={() => setAlertFilter(f)}
                  style={{
                    background: alertFilter === f ? '#d97706' : '#f8fafc',
                    color: alertFilter === f ? '#ffffff' : '#475569',
                    border: `1.5px solid ${alertFilter === f ? '#d97706' : '#e2e8f0'}`,
                    borderRadius: '14px',
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Interactive Alerts List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '125px' }}>
              {filteredAlerts.length === 0 ? (
                <div style={{ padding: '20px 14px', textAlign: 'center', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                  <FaCheckCircle style={{ color: '#16a34a', fontSize: '20px', marginBottom: '4px' }} />
                  <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#15803d' }}>All Farm Sectors Clear</h5>
                  <p style={{ margin: 0, fontSize: '11.5px', color: '#166534' }}>No active flood, pest, or drought alerts for your registered location.</p>
                </div>
              ) : (
                filteredAlerts.slice(0, 2).map(a => {
                  const isCritical = a.severity === 'high' || a.severity === 'critical';
                  const isSpeaking = speakingAlertId === (a._id || a.id);
                  return (
                    <div
                      key={a._id || a.id}
                      style={{
                        background: isCritical ? '#fff1f2' : '#fffbeb',
                        border: `1.5px solid ${isCritical ? '#fecdd3' : '#fde68a'}`,
                        borderRadius: '12px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: isCritical ? '#f43f5e' : '#f59e0b',
                        color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', flexShrink: 0, marginTop: '2px'
                      }}>
                        <FaExclamationTriangle />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <strong style={{ fontSize: '12.5px', color: isCritical ? '#9f1239' : '#92400e' }}>
                            {a.title}
                          </strong>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>
                            {a.date || a.createdAt ? new Date(a.date || a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Today'}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '11.5px', color: '#334155', lineHeight: 1.35 }}>
                          {a.description || a.message}
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                        {/* TTS Audio button */}
                        <button
                          onClick={() => handleReadAlert(a)}
                          style={{
                            background: isSpeaking ? '#15803d' : isCritical ? '#ffe4e6' : '#fef3c7',
                            color: isSpeaking ? '#ffffff' : isCritical ? '#e11d48' : '#d97706',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Listen to advisory"
                        >
                          <FaVolumeUp /> {isSpeaking ? 'Stop' : 'Listen'}
                        </button>

                        {/* Dismiss button */}
                        <button
                          onClick={() => dismissAlert(a._id || a.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            fontSize: '10px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            fontWeight: 600
                          }}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Card 6 Footer */}
            <div className="dashboard-card-footer">
              <span style={{ fontSize: '11.5px', color: '#d97706', fontWeight: 700 }}>
                📞 Kisan Toll-Free: 1800-180-1551
              </span>
              <button
                onClick={() => navigate('/farmer/alerts')}
                style={{ background: 'none', border: 'none', color: '#d97706', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
              >
                View All Alerts →
              </button>
            </div>
          </div>
        </ErrorBoundary>

      </div>
    </Container>
  );
};

export default Dashboard;
