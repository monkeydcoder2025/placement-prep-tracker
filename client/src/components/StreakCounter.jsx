import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const StreakCounter = ({ history = [] }) => {
  const { currentStreak, bestStreak } = useMemo(() => {
    if (!history.length) return { currentStreak: 0, bestStreak: 0 };

    // Build a Set of unique dates when tasks were completed
    const dateSet = new Set();
    history.forEach(({ completed_at }) => {
      if (!completed_at) return;
      const date = new Date(completed_at).toISOString().split('T')[0];
      dateSet.add(date);
    });

    // Calculate current streak (consecutive days ending today or yesterday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let current = 0;
    // Start from today, or yesterday if today hasn't been completed yet
    let checkDate = new Date(today);
    if (!dateSet.has(todayStr) && dateSet.has(yesterdayStr)) {
      checkDate = new Date(yesterday);
    } else if (!dateSet.has(todayStr)) {
      // No tasks today or yesterday — streak is 0
      // Still calculate best streak
    }

    if (dateSet.has(checkDate.toISOString().split('T')[0])) {
      while (dateSet.has(checkDate.toISOString().split('T')[0])) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // Calculate best streak across all dates
    const sortedDates = [...dateSet].sort();
    let best = 0;
    let streak = 0;
    let prevDate = null;

    for (const dateStr of sortedDates) {
      const d = new Date(dateStr + 'T12:00:00');
      if (prevDate) {
        const diff = Math.round((d - prevDate) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          streak++;
        } else {
          best = Math.max(best, streak);
          streak = 1;
        }
      } else {
        streak = 1;
      }
      prevDate = d;
    }
    best = Math.max(best, streak);

    return { currentStreak: current, bestStreak: best };
  }, [history]);

  const getFlameClass = () => {
    if (currentStreak >= 30) return 'epic';
    if (currentStreak >= 7) return 'large';
    if (currentStreak >= 3) return 'medium';
    return 'small';
  };

  const getFlameEmoji = () => {
    if (currentStreak >= 30) return '🔥🔥🔥';
    if (currentStreak >= 7) return '🔥🔥';
    if (currentStreak >= 3) return '🔥';
    if (currentStreak >= 1) return '🔥';
    return '💤';
  };

  return (
    <div className="card streak-card">
      <motion.div
        className={`streak-flame ${getFlameClass()}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
      >
        {getFlameEmoji()}
      </motion.div>
      <div className="streak-info">
        <h3>{currentStreak} day{currentStreak !== 1 ? 's' : ''}</h3>
        <p>{currentStreak > 0 ? 'Current streak' : 'No active streak'}</p>
      </div>
      <div className="streak-best">
        <strong>{bestStreak}</strong>
        Best streak
      </div>
    </div>
  );
};

export default StreakCounter;
