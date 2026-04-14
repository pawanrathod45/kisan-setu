import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import CropCalendarPreview from '../components/dashboard/CropCalendarPreview';
import '../styles/Dashboard.css';

const CropCalendarPage = () => {
  return (
    <Container fluid className="dashboard-page">
      <Row className="g-4">
        <Col xs={12} lg={7}>
          <CropCalendarPreview />
        </Col>
        <Col xs={12} lg={5}>
          <div className="info-card">
            <h3>Crop calendar overview</h3>
            <p>
              Track key activities like sowing, irrigation and harvest in a simple stage-wise
              timeline so you always know what is coming next.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CropCalendarPage;

