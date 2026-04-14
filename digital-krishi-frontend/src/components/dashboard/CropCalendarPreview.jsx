import React, { useState, useEffect } from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaSeedling, FaTint, FaCut } from 'react-icons/fa';
import cropService from '../../services/cropService';
import LoadingSkeleton from '../common/LoadingSkeleton';

const CropCalendarPreview = () => {
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendar = async () => {
      const data = await cropService.getCalendarPreview();
      setCalendar(data);
      setLoading(false);
    };
    fetchCalendar();
  }, []);

  if (loading) return <LoadingSkeleton height="150px" />;

  const getStageIcon = (stage) => {
    switch(stage?.toLowerCase()) {
      case 'flowering': return <FaSeedling className="text-warning" />;
      case 'irrigation': return <FaTint className="text-primary" />;
      case 'harvest': return <FaCut className="text-success" />;
      default: return <FaCalendarAlt className="text-secondary" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="h-100"
    >
      <Card className="dashboard-card calendar-card h-100">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">
              <FaCalendarAlt className="me-2 text-success" />
              Crop Calendar
            </h5>
            <span className="badge bg-success">Current: {calendar?.currentStage}</span>
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <small>Progress to {calendar?.nextStage}</small>
              <small className="text-success">{calendar?.progress}%</small>
            </div>
            <ProgressBar 
              now={calendar?.progress} 
              variant="success" 
              style={{ height: '8px' }}
              animated
            />
          </div>

          <div className="next-activity p-3 bg-light rounded-3">
            <div className="d-flex align-items-center">
              {getStageIcon(calendar?.nextStage)}
              <div className="ms-3">
                <small className="text-muted d-block">Next Activity</small>
                <span className="fw-medium">{calendar?.nextActivity}</span>
                <small className="text-success d-block">
                  in {calendar?.daysRemaining} days
                </small>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default CropCalendarPreview;