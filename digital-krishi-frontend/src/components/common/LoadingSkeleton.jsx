import React from 'react';
import { Placeholder } from 'react-bootstrap';

const LoadingSkeleton = ({ height = '200px', count = 3 }) => {
  return (
    <div className="skeleton-wrapper" style={{ height }}>
      <Placeholder animation="glow" className="w-100 h-100">
        {[...Array(count)].map((_, i) => (
          <Placeholder key={i} xs={12} className="mb-2" style={{ height: '40px' }} />
        ))}
      </Placeholder>
    </div>
  );
};

export default LoadingSkeleton;