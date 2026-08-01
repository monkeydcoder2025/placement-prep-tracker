import React from 'react';
import { Check } from 'lucide-react';

const TaskCard = ({ task, source, isCompleted, onToggle }) => {
  const isDSA = source === 'dsa';
  
  const handleToggle = () => {
    onToggle(task.id);
  };

  return (
    <div className={`card task-card ${isCompleted ? 'completed' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className={`badge ${isDSA ? 'badge-dsa' : 'badge-campx'}`} style={{ marginBottom: '8px', display: 'inline-block' }}>
            {isDSA ? 'DSA' : 'CampX'}
          </span>
          <h4>{isDSA ? `Step ${task.step}: ${task.stepTitle} — ${task.title}` : `Week ${task.weekNumber || ''}: ${task.title}`}</h4>
        </div>
      </div>
      
      <div style={{ marginTop: '12px' }}>
        {isDSA && task.topics && task.topics.map((topic, i) => (
          <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            • {topic}
          </div>
        ))}
        {!isDSA && task.subtopics && task.subtopics.map((sub, i) => (
          <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            • {sub}
          </div>
        ))}
      </div>

      <label className="task-checkbox">
        <input type="checkbox" checked={isCompleted} onChange={handleToggle} />
        <div className="checkbox-custom">
          {isCompleted && <Check size={14} color="#000" />}
        </div>
        <span>{isCompleted ? 'Completed' : 'Mark as completed'}</span>
      </label>
    </div>
  );
};

export default TaskCard;
