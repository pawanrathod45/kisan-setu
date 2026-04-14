import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { 
  FaCloudSun, 
  FaTint, 
  FaWind, 
  FaExclamationTriangle,
  FaLeaf 
} from 'react-icons/fa';
import weatherService from '../../services/weatherService';
import LoadingSkeleton from '../common/LoadingSkeleton';

const WeatherAdvisoryCard = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      const data = await weatherService.getWeather();
      setWeather(data);
      setLoading(false);
    };
    fetchWeather();
  }, []);

  if (loading) return <LoadingSkeleton height="200px" />;

  const getWeatherIcon = (condition) => {
    switch(condition?.toLowerCase()) {
      case 'sunny': return '☀️';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      case 'partly cloudy': return '⛅';
      default: return '🌤️';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="h-100"
    >
      <Card className="dashboard-card weather-card h-100">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title">
              <FaCloudSun className="me-2 text-warning" />
              Weather Advisory
            </h5>
            <span className="weather-icon-large">{getWeatherIcon(weather?.condition)}</span>
          </div>

          <Row className="g-3">
            <Col xs={6}>
              <div className="weather-stat">
                <span className="stat-label">Temperature</span>
                <span className="stat-value">{weather?.temperature}°C</span>
              </div>
            </Col>
            <Col xs={6}>
              <div className="weather-stat">
                <span className="stat-label">Humidity</span>
                <span className="stat-value">{weather?.humidity}%</span>
              </div>
            </Col>
            <Col xs={6}>
              <div className="weather-stat">
                <span className="stat-label">Wind Speed</span>
                <span className="stat-value">{weather?.windSpeed} km/h</span>
              </div>
            </Col>
            <Col xs={6}>
              <div className="weather-stat">
                <span className="stat-label">Condition</span>
                <span className="stat-value">{weather?.condition}</span>
              </div>
            </Col>
          </Row>

          <div className="farming-recommendation mt-3 p-3 bg-light rounded-3">
            <div className="d-flex align-items-center">
              <FaLeaf className="me-2 text-success" />
              <span className="fw-medium">Good time for irrigation</span>
            </div>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default WeatherAdvisoryCard;