import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaExclamationTriangle, FaCloudRain, FaCheckCircle } from 'react-icons/fa';
import alertService from '../../services/alertService';
import LoadingSkeleton from '../common/LoadingSkeleton';

const SmartAlertsCard = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      const data = await alertService.getAlerts();
      setAlerts(data.slice(0, 3));
      setLoading(false);
    };
    fetchAlerts();
  }, []);

  if (loading) return <LoadingSkeleton height="200px" />;

  const getSeverityVariant = (severity) => {
    switch(severity) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const getIcon = (iconType) => {
    switch(iconType) {
      case 'rain': return <FaCloudRain className="text-primary" />;
      case 'warning': return <FaExclamationTriangle className="text-warning" />;
      default: return <FaBell className="text-info" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="h-100"
    >
      <Card className="dashboard-card alerts-card h-100">
        <Card.Body>
          <h5 className="card-title mb-3">
            <FaBell className="me-2 text-warning" />
            Smart Alerts
            {alerts.length > 0 && (
              <Badge bg="danger" className="ms-2">{alerts.length}</Badge>
            )}
          </h5>

          <ListGroup variant="flush" className="alerts-list">
            <AnimatePresence>
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ListGroup.Item className="bg-transparent border-0 px-0">
                    <div className="d-flex align-items-start">
                      <span className="alert-icon me-3">{getIcon(alert.icon)}</span>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between">
                          <h6 className="mb-1">{alert.title}</h6>
                          <Badge bg={getSeverityVariant(alert.severity)} pill>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="small text-muted mb-0">{alert.message}</p>
                      </div>
                    </div>
                  </ListGroup.Item>
                </motion.div>
              ))}
            </AnimatePresence>
          </ListGroup>

          {alerts.length === 0 && (
            <div className="text-center py-4">
              <FaCheckCircle className="text-success fs-1 mb-2" />
              <p className="text-muted">No new alerts</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default SmartAlertsCard;