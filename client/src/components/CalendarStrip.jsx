import React from 'react';

const CalendarStrip = ({ schedule }) => {
  if (!schedule || schedule.length === 0) return null;

  return (
    <div className="calendar-strip">
      {schedule.slice(0, 10).map((weekend, idx) => {
        const isCurrent = idx === 0;
        const isPause = weekend.saturday.isExamPause || weekend.sunday.isExamPause;
        
        return (
          <div key={idx} className={`card calendar-item ${isCurrent ? 'current' : ''}`} style={isCurrent ? { borderColor: 'var(--accent-blue)', boxShadow: 'var(--shadow-glow)' } : {}}>
            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
              <span className={`status-dot ${isPause ? 'amber' : (isCurrent ? 'green' : 'gray')}`}></span>
            </div>
            <h5>{weekend.saturday.date.slice(0, 5)}</h5>
            <p>{isPause ? 'Exam Pause' : `Wk ${idx + 1}`}</p>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarStrip;
