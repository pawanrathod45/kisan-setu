import React from 'react';
import { Container } from 'react-bootstrap';
import '../styles/Dashboard.css';

const VoiceAssistantPage = () => {
  return (
    <Container fluid className="dashboard-page">
      <div className="info-card">
        <h3>Voice assistant</h3>
        <p>
          Use your voice to ask questions and navigate features while working in the field. This
          section will grow with more smart, hands-free actions over time.
        </p>
      </div>
    </Container>
  );
};

export default VoiceAssistantPage;

