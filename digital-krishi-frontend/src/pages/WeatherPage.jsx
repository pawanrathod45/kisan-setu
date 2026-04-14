import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import WeatherAdvisoryCard from '../components/dashboard/WeatherAdvisoryCard';
import '../styles/Dashboard.css';

const WeatherPage = () => {
  return (
    <Container fluid className="dashboard-page">
      <Row className="g-4">
        <Col xs={12} lg={8}>
          <WeatherAdvisoryCard />
        </Col>
        <Col xs={12} lg={4}>
          <div className="info-card">
            <h3>Weather guidance</h3>
            <p>
              Use this advisory to plan field work, spraying and irrigation with more confidence.
              Conditions are tailored to your location and season.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default WeatherPage;

