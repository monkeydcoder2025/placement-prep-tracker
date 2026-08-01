import React, { useEffect, useState } from 'react';
import ProgressBar from '../components/ProgressBar';
import TaskCard from '../components/TaskCard';
import { fetchSchedule, fetchCompletedTasks, completeTask, uncompleteTask } from '../utils/api';
import { ChevronDown, ChevronRight } from 'lucide-react';

const CampXPage = () => {
  const [schedule, setSchedule] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);
  const [expandedWeeks, setExpandedWeeks] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const [sch, comp] = await Promise.all([fetchSchedule(), fetchCompletedTasks()]);
        setSchedule(sch);
        setCompletedIds(comp);
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
      
      const sch = await fetchSchedule();
      setSchedule(sch);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleWeek = (weekNo) => {
    setExpandedWeeks(prev => ({ ...prev, [weekNo]: !prev[weekNo] }));
  };

  if (!schedule) return <div className="empty-state">Loading CampX...</div>;

  // Group by phase using sunday weeks
  const phases = {};
  schedule.sundays.forEach(sun => {
    if (sun.week) {
      const phase = sun.week.phase || 'General';
      if (!phases[phase]) phases[phase] = [];
      phases[phase].push({ ...sun.week, date: sun.date });
    }
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>CampX Data Science</h1>
          <p>DSMP Mentorship Program Tasks</p>
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
          <h2 className="phase-header" style={{ marginBottom: '16px', color: 'var(--accent-purple)' }}>Phase: {phase}</h2>
          
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
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', paddingLeft: '16px' }}>
                      Scheduled: {week.date}
                    </div>
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
