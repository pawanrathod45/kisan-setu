import React, { useState, useEffect } from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChartLine, 
  FaArrowUp, 
  FaArrowDown, 
  FaMinus,
  FaBrain 
} from 'react-icons/fa';
import marketService from '../../services/marketService';
import LoadingSkeleton from '../common/LoadingSkeleton';

const MarketIntelligenceCard = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      const data = await marketService.getSummary();
      setMarketData(data);
      setLoading(false);
    };
    fetchMarketData();
  }, []);

  if (loading) return <LoadingSkeleton height="250px" />;

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <FaArrowUp className="text-success" />;
      case 'down': return <FaArrowDown className="text-danger" />;
      default: return <FaMinus className="text-secondary" />;
    }
  };

  const getTrendBadge = (trend) => {
    switch(trend) {
      case 'up': return 'success';
      case 'down': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="h-100"
    >
      <Card className="dashboard-card market-card h-100">
        <Card.Body>
          <h5 className="card-title mb-3">
            <FaChartLine className="me-2 text-primary" />
            Market Intelligence
          </h5>

          <Table borderless size="sm" className="market-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Price</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {marketData?.topCrops?.map((crop, index) => (
                <motion.tr
                  key={crop.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <td className="fw-medium">{crop.name}</td>
                  <td>{crop.price}</td>
                  <td>
                    <Badge bg={getTrendBadge(crop.trend)} className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                      {getTrendIcon(crop.trend)}
                      <span>{crop.change}</span>
                    </Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </Table>

          {/* ML Prediction */}
          <AnimatePresence>
            {marketData?.prediction && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-primary bg-opacity-10 rounded-3"
              >
                <div className="d-flex align-items-center">
                  <FaBrain className="me-2 text-primary" />
                  <div>
                    <small className="text-primary d-block">AI Prediction</small>
                    <span className="fw-medium">{marketData.prediction}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default MarketIntelligenceCard;