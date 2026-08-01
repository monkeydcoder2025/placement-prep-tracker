import React from 'react';
import TaskCard from './TaskCard';
import ExamBanner from './ExamBanner';

const WeekendView = ({ saturday, sunday, completedIds, onToggle }) => {
  return (
    <div className="weekend-grid">
      <div>
        <h3 className="section-title">📅 Saturday — {saturday?.date || 'No Date'}</h3>
        {saturday?.isExamPause ? (
          <ExamBanner type="active" name="Exams" dates="Pause Active" />
        ) : (
          saturday?.subsections?.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              source="dsa" 
              isCompleted={completedIds.includes(task.id)} 
              onToggle={onToggle} 
            />
          ))
        )}
        {!saturday?.isExamPause && (!saturday?.subsections || saturday.subsections.length === 0) && (
          <div className="empty-state">No tasks scheduled</div>
        )}
      </div>

      <div>
        <h3 className="section-title">📅 Sunday — {sunday?.date || 'No Date'}</h3>
        {sunday?.isExamPause ? (
          <ExamBanner type="active" name="Exams" dates="Pause Active" />
        ) : (
          sunday?.week?.sessions?.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              source="campx" 
              isCompleted={completedIds.includes(task.id)} 
              onToggle={onToggle} 
            />
          ))
        )}
        {!sunday?.isExamPause && (!sunday?.week?.sessions || sunday.week.sessions.length === 0) && (
          <div className="empty-state">No tasks scheduled</div>
        )}
      </div>
    </div>
  );
};

export default WeekendView;
