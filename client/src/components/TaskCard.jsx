import React, { useRef, useCallback } from 'react';
import { ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const checkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

const TaskCard = ({ task, source, isCompleted, onToggle }) => {
  const isDSA = source === 'dsa';
  const resourceLink = task.link || task.url || null;
  const checkboxRef = useRef(null);
  
  const handleToggle = useCallback(() => {
    if (!isCompleted && checkboxRef.current) {
      const rect = checkboxRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      confetti({
        particleCount: 18,
        spread: 50,
        startVelocity: 15,
        gravity: 0.8,
        scalar: 0.7,
        origin: { x, y },
        colors: ['#f94118', '#22c55e', '#3b82f6', '#f59e0b'],
        ticks: 60,
        disableForReducedMotion: true,
      });
    }
    onToggle(task.id);
  }, [isCompleted, onToggle, task.id]);

  return (
    <motion.div
      className={`card task-card ${isCompleted ? 'completed' : ''}`}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      layout
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className={`badge ${isDSA ? 'badge-dsa' : 'badge-campx'}`} style={{ marginBottom: '8px', display: 'inline-block' }}>
            {isDSA ? 'DSA' : 'CampX'}
          </span>
          <h4>{isDSA ? `Step ${task.step}: ${task.stepTitle} — ${task.title}` : `Week ${task.weekNumber || ''}: ${task.title}`}</h4>
        </div>
        {resourceLink && (
          <a href={resourceLink} target="_blank" rel="noreferrer" className="task-link" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', 
            color: 'var(--accent-blue)', fontSize: '0.85rem', fontWeight: 600,
            textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: '12px',
            padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(59,130,246,0.3)',
            transition: 'all 0.2s'
          }}>
            <ExternalLink size={14} /> Open resource →
          </a>
        )}
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
        <motion.div
          ref={checkboxRef}
          className="checkbox-custom"
          whileTap={{ scale: 0.85 }}
          animate={isCompleted ? { 
            backgroundColor: 'var(--accent-green)', 
            borderColor: 'var(--accent-green)' 
          } : { 
            backgroundColor: 'transparent', 
            borderColor: 'var(--border-card)' 
          }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence>
            {isCompleted && (
              <svg
                className="checkbox-check-svg"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <motion.path
                  d="M2.5 7.5L5.5 10.5L11.5 3.5"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  variants={checkVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                />
              </svg>
            )}
          </AnimatePresence>
        </motion.div>
        <span>{isCompleted ? 'Completed' : 'Mark as completed'}</span>
      </label>
    </motion.div>
  );
};

export default TaskCard;
