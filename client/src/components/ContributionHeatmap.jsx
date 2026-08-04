import React, { useMemo, useState, useCallback } from 'react';

const ContributionHeatmap = ({ history = [] }) => {
  const [tooltip, setTooltip] = useState(null);

  const { grid, maxCount } = useMemo(() => {
    // Build a map of date -> count
    const dateCounts = {};
    history.forEach(({ completed_at }) => {
      if (!completed_at) return;
      const date = new Date(completed_at).toISOString().split('T')[0];
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    // Generate last 12 weeks of dates (84 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];
    
    // Find the start: go back to the most recent Sunday that's 12 weeks ago
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 83); // 84 days total including today
    // Align to the start of the week (Sunday)
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const endDate = new Date(today);
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        count: dateCounts[dateStr] || 0,
        isToday: dateStr === today.toISOString().split('T')[0],
        isFuture: current > today,
      });
      current.setDate(current.getDate() + 1);
    }

    let max = 0;
    days.forEach(d => { if (d.count > max) max = d.count; });

    return { grid: days, maxCount: max };
  }, [history]);

  const getLevel = useCallback((count) => {
    if (count === 0) return '';
    if (count === 1) return 'level-1';
    if (count === 2) return 'level-2';
    if (count === 3) return 'level-3';
    return 'level-4';
  }, []);

  const handleMouseEnter = useCallback((e, day) => {
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      text: `${day.count} task${day.count !== 1 ? 's' : ''} on ${new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const dayLabels = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];

  return (
    <div className="heatmap-container">
      <div className="heatmap-wrapper">
        <div className="heatmap-day-labels">
          {dayLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
        <div className="heatmap-grid">
          {grid.map((day, i) => (
            <div
              key={day.date}
              className={`heatmap-cell ${getLevel(day.count)} ${day.isToday ? 'today' : ''}`}
              style={day.isFuture ? { opacity: 0.3 } : day.isToday ? { outline: '1px solid var(--accent-orange)', outlineOffset: '1px' } : {}}
              onMouseEnter={(e) => handleMouseEnter(e, day)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </div>
      </div>

      {tooltip && (
        <div
          className="heatmap-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {tooltip.text}
        </div>
      )}

      <div className="heatmap-legend">
        <span>Less</span>
        <div className="heatmap-legend-cell" style={{ background: 'var(--bg-tertiary)' }} />
        <div className="heatmap-legend-cell" style={{ background: 'rgba(249, 65, 24, 0.25)' }} />
        <div className="heatmap-legend-cell" style={{ background: 'rgba(249, 65, 24, 0.50)' }} />
        <div className="heatmap-legend-cell" style={{ background: 'rgba(249, 65, 24, 0.75)' }} />
        <div className="heatmap-legend-cell" style={{ background: 'var(--accent-orange)' }} />
        <span>More</span>
      </div>
    </div>
  );
};

export default ContributionHeatmap;
