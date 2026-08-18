import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import {
  FaMapMarkerAlt,
  FaSeedling,
  FaLeaf,
  FaTractor,
  FaBell,
  FaChartLine,
  FaCalendarCheck,
  FaCloudSun,
  FaRobot,
  FaCalendarAlt,
  FaChartBar,
  FaCheckCircle,
  FaWind,
  FaTint,
} from 'react-icons/fa';
import SummaryMetricCard from '../components/dashboard/SummaryMetricCard';
import FeaturePreviewCard from '../components/dashboard/FeaturePreviewCard';
import { useDashboardData } from '../hooks/useDashboardData';
import { getWeatherIcon } from '../utils/Wheathericons';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { weather, data, loading } = useDashboardData(user);
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good Morning'
      : currentHour < 18
      ? 'Good Afternoon'
      : 'Good Evening';

  const farmerName = user.name?.split(' ')[0] || 'Farmer';

  return (
    <Container fluid className="dashboard-page">
      {/* Hero Welcome Section */}
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
              <span>Smart Krishi Engine · Active</span>
            </div>
            <h1 className="hero-greeting">
              {greeting}, {farmerName}! 🌾
            </h1>
            <p className="hero-subtitle">
              Your comprehensive real-time overview of crops, mandi rates, and precision weather intelligence.
            </p>
            <div className="hero-meta">
              <span className="meta-item meta-item--location">
                <FaMapMarkerAlt className="meta-icon meta-icon--orange" />
                <span>{user.location || 'India'}</span>
              </span>
              <span className="meta-item meta-item--crop">
                <FaSeedling className="meta-icon meta-icon--green" />
                <span>{user.crop || 'Multi-Crop'}</span>
              </span>
              <span className="meta-item meta-item--status">
                <FaCheckCircle className="meta-icon meta-icon--blue" />
                <span>Fields Healthy</span>
              </span>
            </div>
          </div>

          <div className="hero-right">
            <div className="premium-weather">
              <div className="weather-header-pill">
                <span className="weather-live-dot" />
                <span>Live Weather</span>
              </div>
              <div className="weather-icon-float">
                {getWeatherIcon(weather?.condition)}
              </div>
              <div className="weather-temp">
                {weather ? `${weather.temperature}°C` : "--°C"}
              </div>
              <div className="weather-condition">
                {weather?.description || "Pleasant & Clear"}
              </div>
              <div className="weather-extra">
                <span className="weather-stat-chip weather-stat-chip--blue">
                  <FaTint /> {weather?.humidity ?? "--"}%
                </span>
                <span className="weather-stat-chip weather-stat-chip--teal">
                  <FaWind /> {weather?.windSpeed ?? "--"} km/h
                </span>
              </div>
              {weather?.updatedAt && (
                <div className="weather-updated">
                  Updated {weather.updatedAt}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hero-insight">
          <div className="insight-icon-wrap">
            <FaLeaf className="insight-icon" />
          </div>
          <div className="insight-text-wrap">
            <span className="insight-title">Advisory Note: </span>
            <span>Optimal morning window to inspect crop rows for moisture and check irrigation canals.</span>
          </div>
        </div>
      </motion.div>

      {/* Summary Metrics Row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <div className="section-title-row">
          <h2 className="section-heading">Key Farm Metrics</h2>
          <span className="section-subheading">Updated in real-time</span>
        </div>

        <Row className="g-3 summary-metrics-row">
          <Col xs={6} lg={3}>
            <SummaryMetricCard
              icon={FaTractor}
              label="Active Crops"
              value={data?.crops || 0}
              tone="primary"
              to="/farmer/crops"
            />
          </Col>
          <Col xs={6} lg={3}>
            <SummaryMetricCard
              icon={FaBell}
              label="Pending Alerts"
              value={data?.alerts || 0}
              tone="alert"
              to="/farmer/alerts"
            />
          </Col>
          <Col xs={6} lg={3}>
            <SummaryMetricCard
              icon={FaChartLine}
              label="Market Opportunity"
              value={data?.marketPrice ? `₹${data.marketPrice}` : '₹2,450'}
              tone="market"
              to="/farmer/market"
            />
          </Col>
          <Col xs={6} lg={3}>
            <SummaryMetricCard
              icon={FaCalendarCheck}
              label="Upcoming Tasks"
              value={data?.tasks || 0}
              tone="calendar"
              to="/farmer/tasks"
            />
          </Col>
        </Row>
      </motion.div>

      {/* Feature Preview Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="section-title-row" style={{ marginTop: '12px' }}>
          <h2 className="section-heading">Smart Agricultural Tools</h2>
          <span className="section-subheading">Access tailored intelligent services</span>
        </div>

        <Row className="g-4 feature-preview-grid">
          <Col xs={12} md={6} lg={4}>
            <FeaturePreviewCard
              icon={FaCloudSun}
              title="Weather Advisory"
              subtitle="Next 24h field forecast"
              primaryText={
                weather
                  ? `${weather.temperature}°C • ${weather.condition || 'Favorable conditions'}`
                  : 'Optimal weather window for spraying and field cultivation.'
              }
              secondaryText="Get accurate hourly rain chances, wind direction, and soil humidity alerts."
              ctaLabel="Open Weather Advisory"
              to="/farmer/weather"
              delay={0.05}
            />
          </Col>
          <Col xs={12} md={6} lg={4}>
            <FeaturePreviewCard
              icon={FaChartLine}
              title="Market Intelligence"
              subtitle="Mandi price trends & signals"
              primaryText={
                data?.marketPrice
                  ? `Modal mandi price ~ ₹${data.marketPrice}/qtl`
                  : 'Cotton & Wheat rates surging +4.8% in district mandis.'
              }
              secondaryText="Compare 10+ nearby markets and pinpoint the peak selling window."
              ctaLabel="Explore Mandi Prices"
              to="/farmer/market"
              delay={0.1}
            />
          </Col>
          <Col xs={12} md={6} lg={4}>
            <FeaturePreviewCard
              icon={FaRobot}
              title="AI Krishi Officer"
              subtitle="24/7 Precision Agronomist"
              primaryText="Ask crop doubts, fertilizer ratios, or pest diagnosis in your native language."
              secondaryText="Trained on ICAR agricultural data to deliver instant actionable farming tips."
              ctaLabel="Chat with Krishi Officer"
              to="/farmer/ai-assistant"
              delay={0.15}
            />
          </Col>
          <Col xs={12} md={6} lg={4}>
            <FeaturePreviewCard
              icon={FaBell}
              title="Smart Alerts"
              subtitle="Priority risk warnings"
              primaryText={
                data && data.alerts > 0
                  ? `${data.alerts} critical alert${data.alerts > 1 ? 's' : ''} require your review.`
                  : 'All farm sectors clear. No active pest or flood risks.'
              }
              secondaryText="Early warning system tailored specifically to your sown crops."
              ctaLabel="Review Farm Alerts"
              to="/farmer/alerts"
              delay={0.2}
            />
          </Col>
          <Col xs={12} md={6} lg={4}>
            <FeaturePreviewCard
              icon={FaCalendarAlt}
              title="Crop Calendar"
              subtitle="Season milestone tracker"
              primaryText="Track sowing, top-dressing, flowering, and harvest windows seamlessly."
              secondaryText="Step-by-step guidance aligned with your crop's current phenological stage."
              ctaLabel="View Crop Calendar"
              to="/farmer/calendar"
              delay={0.25}
            />
          </Col>
          <Col xs={12} md={6} lg={4}>
            <FeaturePreviewCard
              icon={FaChartBar}
              title="Analytics & Voice"
              subtitle="Insights & voice command"
              primaryText="Yield potential score at 84% with optimal resource utilization."
              secondaryText="Review farm revenue graphs or trigger hands-free voice operations instantly."
              ctaLabel="Open Farm Analytics"
              to="/farmer/analytics"
              delay={0.3}
            />
          </Col>
        </Row>
      </motion.div>
    </Container>
  );
};

export default Dashboard;
