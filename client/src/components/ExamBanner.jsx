import React from 'react';
import { AlertTriangle, AlertOctagon } from 'lucide-react';

const ExamBanner = ({ exam, type }) => {
  const isActive = type === 'active';
  const name = exam?.name || 'Exams';
  const dates = exam ? `${exam.startDate} to ${exam.endDate}` : '';
  
  return (
    <div className={`card exam-banner ${isActive ? 'active' : ''}`}>
      {isActive ? <AlertOctagon size={32} color="var(--accent-red)" /> : <AlertTriangle size={32} color="var(--accent-amber)" />}
      <div>
        <h4 style={{ color: isActive ? 'var(--accent-red)' : 'var(--accent-amber)', marginBottom: '4px' }}>
          {isActive ? `🔴 EXAM MODE: ${name} (${dates})` : `⚠️ Upcoming: ${name} starts soon`}
        </h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isActive ? 'Schedule auto-paused. Focus on your exams!' : 'Prepare for schedule adjustments.'}
        </p>
      </div>
    </div>
  );
};

export default ExamBanner;
