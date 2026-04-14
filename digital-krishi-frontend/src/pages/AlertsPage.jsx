import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import SmartAlertsCard from '../components/dashboard/SmartAlertsCard';
import '../styles/Dashboard.css';

const AlertsPage = () => {
  return (
    <Container fluid className="dashboard-page">
      <Row className="g-4">
        <Col xs={12} lg={7}>
          <SmartAlertsCard />
        </Col>
        <Col xs={12} lg={5}>
          <div className="info-card">
            <h3>Smart alerts center</h3>
            <p>
              See weather, disease and market alerts that matter for your crops first, so you can
              take timely action without feeling overloaded.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AlertsPage;

