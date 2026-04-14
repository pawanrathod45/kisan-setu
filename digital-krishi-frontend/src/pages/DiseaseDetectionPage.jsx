import React from 'react';
import { Container } from 'react-bootstrap';
import '../styles/Dashboard.css';

const DiseaseDetectionPage = () => {
  return (
    <Container fluid className="dashboard-page">
      <div className="info-card">
        <h3>Disease Detection</h3>
        <p>
          Capture or upload clear photos of leaves and stems from the field. The upcoming AI
          model will help you spot early signs of disease and suggest next steps.
        </p>
      </div>
    </Container>
  );
};

export default DiseaseDetectionPage;

