import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import AIQuickAccessCard from '../components/dashboard/AIQuickAccessCard';
import '../styles/Dashboard.css';

const AIAssistantPage = () => {
  return (
    <Container fluid className="dashboard-page">
      <Row className="g-4">
        <Col xs={12} md={5} lg={4}>
          <AIQuickAccessCard />
        </Col>
        <Col xs={12} md={7} lg={8}>
          <div className="info-card">
            <h3>AI Krishi Officer</h3>
            <p>
              Ask your questions in simple language. The AI officer helps with crop practices,
              pest and disease management, water and nutrient planning, and more.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AIAssistantPage;

