import React from 'react';
import { AlertCircle } from 'lucide-react';

const PanicButton = ({ onPanic, panicCount }) => {
  const handleClick = () => {
    if (window.confirm("Are you sure you want to trigger a Panic Pause? This will shift all your remaining tasks forward by 1 week.")) {
      onPanic();
    }
  };

  return (
    <button className="panic-button" onClick={handleClick}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AlertCircle size={28} />
        🆘 PANIC — Pause 1 Week
      </div>
      <span>Shifts all deadlines forward by 1 week</span>
      <span style={{ opacity: 0.6 }}>{panicCount} pauses used</span>
    </button>
  );
};

export default PanicButton;
