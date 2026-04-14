import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import AnalyticsPreview from '../components/dashboard/AnalyticsPreview';
import '../styles/Dashboard.css';

const AnalyticsPage = () => {
  return (
    <Container fluid className="dashboard-page">
      <Row className="g-4">
        <Col xs={12} lg={6}>
          <AnalyticsPreview />
        </Col>
        <Col xs={12} lg={6}>
          <div className="info-card">
            <h3>Analytics insights</h3>
            <p>
              Explore price trends, yield forecasts and risk signals in one place to make more
              confident season and investment decisions.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AnalyticsPage;

