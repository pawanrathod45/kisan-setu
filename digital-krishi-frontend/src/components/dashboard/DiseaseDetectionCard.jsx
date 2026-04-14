import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaCamera, FaLeaf, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DiseaseDetectionCard = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className="h-100"
    >
      <Card className="dashboard-card disease-card h-100">
        <Card.Body>
          <div className="text-center mb-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <FaLeaf className="fs-1 text-success mb-2" />
            </motion.div>
            <h5 className="card-title">Crop Disease Detection</h5>
            <p className="text-muted small">Upload photo to detect diseases</p>
          </div>

          <div className="d-flex gap-2 justify-content-center">
            <Button
              variant="outline-success"
              className="rounded-4 py-3"
              onClick={() => navigate('/farmer/disease/upload')}
            >
              <FaCamera className="me-2" />
              Take Photo
            </Button>
            <Button
              variant="success"
              className="rounded-4 py-3"
              onClick={() => navigate('/farmer/disease/gallery')}
            >
              <FaSearch className="me-2" />
              Gallery
            </Button>
          </div>

          <div className="mt-3 p-2 bg-light rounded-3">
            <small className="text-muted d-block text-center">
              ⚡ AI detects 50+ crop diseases with 95% accuracy
            </small>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default DiseaseDetectionCard;