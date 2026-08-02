import React, { useEffect, useState } from 'react';
import ProgressBar from '../components/ProgressBar';
import TaskCard from '../components/TaskCard';
import { fetchSchedule, fetchAllContent, fetchCompletedTasks, completeTask, uncompleteTask } from '../utils/api';
import { ChevronDown, ChevronRight, Eye, Calendar } from 'lucide-react';

const DSAPage = () => {
  const [schedule, setSchedule] = useState(null);
  const [allContent, setAllContent] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);
  const [expandedSteps, setExpandedSteps] = useState({});
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

  const toggleStep = (step) => {
    setExpandedSteps(prev => ({ ...prev, [step]: !prev[step] }));
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

  // Build scheduled date lookup
  const scheduledDates = {};
  schedule.saturdays.forEach(sat => {
    if (sat.subsections) {
      sat.subsections.forEach(sub => {
        scheduledDates[sub.id] = sat.date;
      });
    }
  });

  // Group tasks based on view mode
  let groupedTasks = {};
  if (viewMode === 'all' && allContent) {
    allContent.striver.forEach(sub => {
      if (!groupedTasks[sub.step]) groupedTasks[sub.step] = [];
      groupedTasks[sub.step].push({ ...sub, date: scheduledDates[sub.id] || null });
    });
  } else {
    schedule.saturdays.forEach(sat => {
      if (sat.subsections) {
        sat.subsections.forEach(sub => {
          if (!groupedTasks[sub.step]) groupedTasks[sub.step] = [];
          groupedTasks[sub.step].push({ ...sub, date: sat.date });
        });
      }
    });
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Striver's A2Z DSA Sheet</h1>
          <p>Master Data Structures and Algorithms</p>
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
                    {task.date && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Scheduled: {task.date}</div>
                    )}
                    {!task.date && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontStyle: 'italic' }}>Not yet scheduled</div>
                    )}
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
