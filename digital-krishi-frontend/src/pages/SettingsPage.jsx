import React from 'react';
import { Container } from 'react-bootstrap';
import '../styles/Dashboard.css';

const SettingsPage = () => {
  const language = localStorage.getItem('language') || 'en';

  return (
    <Container fluid className="dashboard-page">
      <div className="info-card">
        <h3>Settings</h3>
        <p className="mb-3">
          Manage basic preferences for your Kisan Setu experience. Advanced configuration can be
          added here later without changing the main layout.
        </p>
        <div className="detail-item">
          <div className="detail-icon">🌐</div>
          <div>
            <span className="detail-label">Language</span>
            <span className="detail-value">{language.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default SettingsPage;

