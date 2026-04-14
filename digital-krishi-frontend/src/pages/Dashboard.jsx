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
  FaMicrophone,
} from 'react-icons/fa';
import SummaryMetricCard from '../components/dashboard/SummaryMetricCard';
import FeaturePreviewCard from '../components/dashboard/FeaturePreviewCard';
import { useDashboardData } from '../hooks/useDashboardData';
import { getWeatherIcon } from '../utils/Wheathericons';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { weather, market, alerts } = useDashboardData(user);
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
        className="hero-welcome-card hero-welcome-compact"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="hero-content">
          <div className="hero-left">
            <h1 className="hero-greeting">
              {greeting}, {farmerName}! 🌾
            </h1>
            <p className="hero-subtitle">
              Your calm overview of today&apos;s farming intelligence.
            </p>
            <div className="hero-meta">
              <span className="meta-item">
                <FaMapMarkerAlt className="me-1" />
                {user.location || 'India'}
              </span>
              <span className="meta-divider">•</span>
              <span className="meta-item">
                <FaSeedling className="me-1" />
                {user.crop || 'Multi-crop'}
              </span>
            </div>
          </div>
          <div className="hero-right">
            <div className="premium-weather">
              <div className="weather-icon-float">
                {getWeatherIcon(weather?.condition)}
              </div>
              <div className="weather-temp">
                {weather ? `${weather.temperature}°C` : "--"}
              </div>
              <div className="weather-condition">
                {weather?.description || "Loading..."}
              </div>
              <div className="weather-extra">
                <span>💧 {weather?.humidity ?? "--"}%</span>
                <span>🌬 {weather?.windSpeed ?? "--"} km/h</span>
              </div>
              <div className="weather-updated">
                {weather?.updatedAt ? `Updated at ${weather.updatedAt}` : ""}
              </div>
            </div>
          </div>
        </div>
        <div className="hero-insight">
          <FaLeaf className="insight-icon" />
          <span>Perfect window to walk your fields and observe crop health.</span>
        </div>
      </motion.div>

      {/* Summary Metrics Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Row className="g-3 summary-metrics-row">
          <Col xs={6} lg={3}>
            <SummaryMetricCard
              icon={FaTractor}
              label="Active Crops"
              value="3"
              tone="primary"
            />
          </Col>
          <Col xs={6} lg={3}>
            <SummaryMetricCard
              icon={FaBell}
              label="Pending Alerts"
              value={alerts?.length ?? 0}
              tone="alert"
            />
          </Col>
          <Col xs={6} lg={3}>
            <SummaryMetricCard
              icon={FaChartLine}
              label="Market Opportunity"
              value={market?.modalPrice ? `₹${market.modalPrice}` : '—'}
              tone="market"
            />
          </Col>
          <Col xs={6} lg={3}>
            <SummaryMetricCard
              icon={FaCalendarCheck}
              label="Upcoming Tasks"
              value="Today"
              tone="calendar"
            />
          </Col>
        </Row>
      </motion.div>

      {/* Feature Preview Grid (Summary only) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Row className="g-4 feature-preview-grid">
          <Col xs={12} md={6} lg={4}>
            <FeaturePreviewCard
              icon={FaCloudSun}
              title="Weather Advisory"
              subtitle="Next 24 hours for your fields"
              primaryText={
                weather
                  ? `${weather.temperature}°C • ${weather.condition}`
                  : 'Stay prepared for any weather change today.'
              }
              secondaryText="Get simple, clear guidance for spraying, irrigation, and field work."
              ctaLabel="Open weather"
              to="/farmer/weather"
              delay={0.05}
            />
          </Col>
          <Col xs={12} md={6} lg={4}>
            <FeaturePreviewCard
              icon={FaChartLine}
              title="Market Intelligence"
              subtitle="Today’s price pulse"
              primaryText={
                market
                  ? `Modal price ~ ₹${market.modalPrice} • ${market.trend} trend`
                  : 'Track prices for your key crops.'
              }
              secondaryText="See top markets and price trends for smarter selling."
              ctaLabel="View markets"
              to="/farmer/market"
              delay={0.1}
            />
          </Col>
          <Col xs={12} md={6} lg={4}>
            <FeaturePreviewCard
              icon={FaRobot}
              title="AI Krishi Officer"
              subtitle="Ask anything to your farming expert"
              primaryText="Ask doubts on crops, pests, inputs, or best practices anytime."
              secondaryText="Type or speak in your language; the assistant answers in simple words."
              ctaLabel="Ask a question"
              to="/farmer/ai-assistant"
              delay={0.15}
            />
          </Col>

          <Col xs={12} md={6} lg={4}>
            <FeaturePreviewCard
              icon={FaBell}
              title="Smart Alerts"
              subtitle="Priority signals"
              primaryText={
                alerts && alerts.length > 0
                  ? `${alerts.length} important alert${alerts.length > 1 ? 's' : ''} waiting.`
                  : 'You are all caught up. No critical alerts.'
              }
              secondaryText="Weather, disease, and market alerts tailored to your crops."
              ctaLabel="Review alerts"
              to="/farmer/alerts"
              delay={0.2}
            />
          </Col>
          <Col xs={12} md={6} lg={4}>
            <FeaturePreviewCard
              icon={FaCalendarAlt}
              title="Crop Calendar"
              subtitle="Season at a glance"
              primaryText="See upcoming sowing, irrigation, and harvest windows in one place."
              secondaryText="Stay ahead with a simple, stage-wise view of your crops."
              ctaLabel="Open calendar"
              to="/farmer/calendar"
              delay={0.25}
            />
          </Col>
          <Col xs={12} md={6} lg={4}>
            <FeaturePreviewCard
              icon={FaChartBar}
              title="Analytics & Voice"
              subtitle="Insights + hands-free control"
              primaryText="Understand yield potential, risk, and opportunity at a glance."
              secondaryText="Use rich analytics or the voice assistant for quick, hands-free actions."
              ctaLabel="View analytics"
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
