import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import MarketIntelligenceCard from '../components/dashboard/MarketIntelligenceCard';
import '../styles/Dashboard.css';

const MarketPage = () => {
  return (
    <Container fluid className="dashboard-page">
      <Row className="g-4">
        <Col xs={12} lg={8}>
          <MarketIntelligenceCard />
        </Col>
        <Col xs={12} lg={4}>
          <div className="info-card">
            <h3>Market insights</h3>
            <p>
              Compare prices across markets and trends so you can decide where and when to sell
              your produce for better returns.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default MarketPage;

