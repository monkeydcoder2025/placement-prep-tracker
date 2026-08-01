import React, { useEffect, useState } from 'react';
import ProgressBar from '../components/ProgressBar';
import TaskCard from '../components/TaskCard';
import { fetchSchedule, fetchCompletedTasks, completeTask, uncompleteTask } from '../utils/api';
import { ChevronDown, ChevronRight } from 'lucide-react';

const DSAPage = () => {
  const [schedule, setSchedule] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);
  const [expandedSteps, setExpandedSteps] = useState({});

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

  const toggleStep = (step) => {
    setExpandedSteps(prev => ({ ...prev, [step]: !prev[step] }));
  };

  if (!schedule) return <div className="empty-state">Loading DSA...</div>;

  // Group by step using saturday subsections
  const groupedTasks = {};
  schedule.saturdays.forEach(sat => {
    if (sat.subsections) {
      sat.subsections.forEach(sub => {
        if (!groupedTasks[sub.step]) groupedTasks[sub.step] = [];
        groupedTasks[sub.step].push({ ...sub, date: sat.date });
      });
    }
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Striver's A2Z DSA Sheet</h1>
          <p>Master Data Structures and Algorithms</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <ProgressBar 
          label="Total Progress" 
          current={schedule.stats.completedStriver} 
          total={schedule.stats.totalStriver} 
        />
      </div>

      {Object.keys(groupedTasks).sort((a,b)=>Number(a)-Number(b)).map(step => {
        const tasks = groupedTasks[step];
        const stepTitle = tasks[0]?.stepTitle || `Step ${step}`;
        const isExpanded = expandedSteps[step];
        
        return (
          <div key={step} className="accordion">
            <div className="accordion-header" onClick={() => toggleStep(step)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                <h3 style={{ margin: 0 }}>Step {step}: {stepTitle}</h3>
              </div>
              <span className="badge badge-dsa">{tasks.filter(t => completedIds.includes(t.id)).length}/{tasks.length}</span>
            </div>
            {isExpanded && (
              <div className="accordion-content">
                {tasks.map(task => (
                  <div key={task.id} style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Scheduled: {task.date}</div>
                    <TaskCard 
                      task={task} 
                      source="dsa" 
                      isCompleted={completedIds.includes(task.id)} 
                      onToggle={handleToggle} 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DSAPage;
