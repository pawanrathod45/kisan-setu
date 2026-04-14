import React from 'react';
import { Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaChartLine, FaArrowUp } from 'react-icons/fa';

const AnalyticsPreview = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      whileHover={{ scale: 1.02 }}
      className="h-100"
    >
      <Card className="dashboard-card h-100">
        <Card.Body>
          <h5 className="card-title mb-3">
            <FaChartLine className="me-2 text-info" />
            Analytics Preview
          </h5>
          <div className="text-center py-4">
            <div className="mb-3">
              <small className="text-muted d-block mb-2">Price Trend</small>
              <h3 className="text-success mb-0">
                <FaArrowUp className="me-2" />
                +5.2%
              </h3>
              <small className="text-muted">Last 7 days</small>
            </div>
            <div className="mt-4">
              <small className="text-muted d-block mb-2">Yield Forecast</small>
              <h3 className="text-warning mb-0">+12%</h3>
              <small className="text-muted">Next season</small>
            </div>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default AnalyticsPreview;