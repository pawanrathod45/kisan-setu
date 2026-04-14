import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaRobot, FaMicrophone, FaComments } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AIQuickAccessCard = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ scale: 1.02 }}
      className="h-100"
    >
      <Card className="dashboard-card ai-assistant-card h-100">
        <Card.Body className="d-flex flex-column">
          <div className="ai-glow-wrapper">
            <motion.div
              className="ai-icon-container"
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(16, 185, 129, 0.3)',
                  '0 0 40px rgba(16, 185, 129, 0.6)',
                  '0 0 20px rgba(16, 185, 129, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaRobot className="ai-icon" />
            </motion.div>
          </div>

          <h5 className="card-title text-center mt-3 mb-2">AI Krishi Officer</h5>
          <p className="text-muted text-center small mb-4">Your 24/7 farming expert assistant</p>

          <div className="ai-features mb-4">
            <div className="feature-chip">🌾 Crop Guidance</div>
            <div className="feature-chip">🐛 Pest Solutions</div>
            <div className="feature-chip">💧 Water Management</div>
          </div>

          <div className="mt-auto d-flex gap-2">
            <motion.button
              className="btn btn-success flex-fill py-2 rounded-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/farmer/ask-ai')}
            >
              <FaComments className="me-2" />
              Chat
            </motion.button>
            <motion.button
              className="btn btn-outline-success flex-fill py-2 rounded-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaMicrophone className="me-2" />
              Voice
            </motion.button>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default AIQuickAccessCard;