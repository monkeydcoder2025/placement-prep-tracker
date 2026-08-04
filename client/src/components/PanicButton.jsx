import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from './ConfirmModal';

const PanicButton = ({ onPanic, panicCount }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    setConfirmed(true);
    onPanic();
    // Reset breathing animation after it plays
    setTimeout(() => setConfirmed(false), 2000);
  };

  return (
    <>
      <motion.button
        className="panic-button"
        onClick={handleClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
        animate={confirmed ? {
          scale: [1, 1.02, 1, 1.01, 1],
          transition: { duration: 2, ease: 'easeInOut' }
        } : {}}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={28} />
          🆘 PANIC — Pause 1 Week
        </div>
        <span>Shifts all deadlines forward by 1 week</span>
        <span style={{ opacity: 0.6 }}>{panicCount} pauses used</span>
      </motion.button>

      <ConfirmModal 
        isOpen={showConfirm}
        title="Trigger Panic Pause?"
        message="This will shift all your remaining tasks forward by 1 week. Use this when you need a break or are overwhelmed."
        confirmText="Pause 1 Week"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};

export default PanicButton;
