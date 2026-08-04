import React from 'react';
import { motion } from 'framer-motion';

const CircularProgress = ({ percentage = 0, color = 'var(--accent-orange)', label, current, total }) => {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-progress">
      <div className="circular-progress-ring">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle className="ring-bg" cx="70" cy="70" r={radius} />
          <motion.circle
            className="ring-fill"
            cx="70"
            cy="70"
            r={radius}
            stroke={color}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ type: 'spring', stiffness: 40, damping: 15, delay: 0.2 }}
          />
        </svg>
        <div className="circular-progress-center">
          <span className="percent-value">{percentage}</span>
          <span className="percent-symbol">%</span>
        </div>
      </div>
      {label && <div className="circular-progress-label">{label}</div>}
      {current !== undefined && total !== undefined && (
        <div className="circular-progress-count">{current} / {total}</div>
      )}
    </div>
  );
};

export default CircularProgress;
