import React, { useEffect, useState } from 'react';
import ProgressBar from '../components/ProgressBar';
import TaskCard from '../components/TaskCard';
import { fetchSchedule, fetchAllContent, fetchCompletedTasks, completeTask, uncompleteTask } from '../utils/api';
import { ChevronDown, ChevronRight, Eye, Calendar } from 'lucide-react';

const CampXPage = () => {
  const [schedule, setSchedule] = useState(null);
  const [allContent, setAllContent] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [viewMode, setViewMode] = useState('scheduled'); // 'scheduled' or 'all'

  useEffect(() => {
    const load = async () => {
      try {
        const [sch, comp, all] = await Promise.all([fetchSchedule(), fetchCompletedTasks(), fetchAllContent()]);
        setSchedule(sch);
        setCompletedIds(comp);
        setAllContent(all);
      } catch(e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const handleToggle = async (id) => {
    try {
      if (completedIds.includes(id)) {
        await uncompleteTask(id);
        setCompletedIds(prev => prev.filter(taskId => taskId !== id));
      } else {
        await completeTask(id);
        setCompletedIds(prev => [...prev, id]);
      }
      
      const [sch, all] = await Promise.all([fetchSchedule(), fetchAllContent()]);
      setSchedule(sch);
      setAllContent(all);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleWeek = (weekNo) => {
    setExpandedWeeks(prev => ({ ...prev, [weekNo]: !prev[weekNo] }));
  };

  if (!schedule) return (
    <div className="skeleton-container">
      <div className="skeleton skeleton-header"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-bar"></div>
      <div className="skeleton skeleton-card"></div>
      <div className="skeleton skeleton-card"></div>
      <div className="skeleton skeleton-card"></div>
    </div>
  );

  // Build scheduled date lookup from sundays
  const scheduledDates = {};
  schedule.sundays.forEach(sun => {
    if (sun.week) {
      scheduledDates[sun.week.weekNumber] = sun.date;
    }
  });

  // Group by phase based on view mode
  let phases = {};
  if (viewMode === 'all' && allContent) {
    allContent.campx.forEach(week => {
      const phase = week.phase || 'General';
      if (!phases[phase]) phases[phase] = [];
      phases[phase].push({ ...week, date: scheduledDates[week.weekNumber] || null });
    });
  } else {
    schedule.sundays.forEach(sun => {
      if (sun.week) {
        const phase = sun.week.phase || 'General';
        if (!phases[phase]) phases[phase] = [];
        phases[phase].push({ ...sun.week, date: sun.date });
      }
    });
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>CampX Data Science</h1>
          <p>DSMP Mentorship Program Tasks</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn ${viewMode === 'scheduled' ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => setViewMode('scheduled')}
          >
            <Calendar size={16} /> Scheduled
          </button>
          <button 
            className={`btn ${viewMode === 'all' ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => setViewMode('all')}
          >
            <Eye size={16} /> All Tasks
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <ProgressBar 
          label="Total Progress" 
          current={schedule.stats.completedCampx} 
          total={schedule.stats.totalCampx} 
          type="campx"
        />
      </div>

      {Object.keys(phases).map(phase => (
        <div key={phase} style={{ marginBottom: '32px' }}>
          <h2 className="section-title" style={{ marginBottom: '16px', color: 'var(--accent-blue)' }}>Phase: {phase}</h2>
          
          {phases[phase].map(week => {
            const isExpanded = expandedWeeks[week.weekNumber];
            return (
              <div key={week.weekNumber} className="accordion">
                <div className="accordion-header" onClick={() => toggleWeek(week.weekNumber)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    <h3 style={{ margin: 0 }}>Week {week.weekNumber}: {week.title}</h3>
                  </div>
                  <span className="badge badge-campx">
                    {week.sessions ? week.sessions.filter(s => completedIds.includes(s.id)).length : 0}/{week.sessions ? week.sessions.length : 0}
                  </span>
                </div>
                {isExpanded && (
                  <div className="accordion-content">
                    {week.date ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', paddingLeft: '16px' }}>
                        Scheduled: {week.date}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '16px', fontStyle: 'italic' }}>
                        Not yet scheduled
                      </div>
                    )}
                    {week.sessions && week.sessions.map(session => (
                      <TaskCard 
                        key={session.id}
                        task={{...session, weekNumber: week.weekNumber}} 
                        source="campx" 
                        isCompleted={completedIds.includes(session.id)} 
                        onToggle={handleToggle} 
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default CampXPage;
