import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ label, current, total, color = 'var(--accent-blue)', type = 'default' }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const barClass = type === 'campx' ? 'progress-bar campx' : 'progress-bar';

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{current} / {total} ({percentage}%)</span>
      </div>
      <div className="progress-container">
        <motion.div
          className={barClass}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
