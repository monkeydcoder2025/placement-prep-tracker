import React, { useEffect, useState, lazy, Suspense, useMemo } from 'react';
import CircularProgress from '../components/CircularProgress';
import ProgressBar from '../components/ProgressBar';
import WeekendView from '../components/WeekendView';
import CalendarStrip from '../components/CalendarStrip';
import PanicButton from '../components/PanicButton';
import ContributionHeatmap from '../components/ContributionHeatmap';
import StreakCounter from '../components/StreakCounter';
import AnimatedCounter from '../components/AnimatedCounter';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fetchSchedule, fetchCompletedTasks, fetchCompletedHistory, fetchAllContent, completeTask, uncompleteTask, triggerPanic, fetchSettings } from '../utils/api';

// Lazy-load 3D components — only downloaded when dashboard renders
const ProgressOrb = lazy(() => import('../components/3d/ProgressOrb'));
const DSASkyline = lazy(() => import('../components/3d/DSASkyline'));
const ContributionGrid3D = lazy(() => import('../components/3d/ContributionGrid3D'));

const ThreeDFallback = () => (
  <div style={{ width: '100%', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
    Loading 3D...
  </div>
);

const Home = () => {
  const [data, setData] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);
  const [completedHistory, setCompletedHistory] = useState([]);
  const [settings, setSettings] = useState(null);
  const [allContent, setAllContent] = useState(null);
  const navigate = useNavigate();

  // Check if reduce-motion is enabled
  const reduceMotion = typeof window !== 'undefined' && (
    localStorage.getItem('reduce-motion') === 'true' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const loadData = async () => {
    try {
      const [scheduleRes, completedRes, historyRes, settingsRes, allContentRes] = await Promise.all([
        fetchSchedule(),
        fetchCompletedTasks(),
        fetchCompletedHistory(),
        fetchSettings(),
        fetchAllContent()
      ]);
      setData(scheduleRes);
      setCompletedIds(completedRes);
      setCompletedHistory(historyRes);
      setSettings(settingsRes);
      setAllContent(allContentRes);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
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
      
      // reload data to update stats
      const [scheduleRes, historyRes] = await Promise.all([
        fetchSchedule(),
        fetchCompletedHistory()
      ]);
      setData(scheduleRes);
      setCompletedHistory(historyRes);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePanic = async () => {
    try {
      await triggerPanic();
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Build step-level data for DSA skyline
  const skylineSteps = useMemo(() => {
    if (!allContent?.striver) return [];
    const stepMap = {};
    allContent.striver.forEach(sub => {
      if (!stepMap[sub.step]) {
        stepMap[sub.step] = { step: sub.step, total: 0, completed: 0 };
      }
      stepMap[sub.step].total++;
      if (completedIds.includes(sub.id)) {
        stepMap[sub.step].completed++;
      }
    });
    return Object.values(stepMap).sort((a, b) => a.step - b.step);
  }, [allContent, completedIds]);

  if (!data) {
    return (
      <div className="skeleton-container">
        <div className="skeleton skeleton-header"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-bar"></div>
        <div className="skeleton skeleton-bar"></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
        </div>
        <div className="skeleton skeleton-card"></div>
        <div className="skeleton skeleton-card"></div>
      </div>
    );
  }

  const currentWeekend = data.saturdays && data.saturdays.length > 0 ? {
    saturday: data.saturdays[0],
    sunday: data.sundays[0]
  } : null;

  const upcomingSchedule = data.saturdays?.map((sat, i) => ({
    saturday: sat,
    sunday: data.sundays[i]
  }));

  const panicCount = settings?.panic_pauses?.length || 0;

  const dsaPercentage = data.stats.totalStriver > 0 
    ? Math.round((data.stats.completedStriver / data.stats.totalStriver) * 100) 
    : 0;
  const campxPercentage = data.stats.totalCampx > 0 
    ? Math.round((data.stats.completedCampx / data.stats.totalCampx) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>{new Date().toDateString()}</p>
        </div>
      </div>

      {/* Hero Progress Rings + 3D Orbs */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 className="section-title">Overall Progress</h3>
        <div className="hero-progress-row">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            {!reduceMotion && (
              <Suspense fallback={null}>
                <ProgressOrb percentage={dsaPercentage} color="#f94118" />
              </Suspense>
            )}
            <CircularProgress
              percentage={dsaPercentage}
              color="var(--accent-orange)"
              label="Striver's A2Z DSA"
              current={data.stats.completedStriver}
              total={data.stats.totalStriver}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            {!reduceMotion && (
              <Suspense fallback={null}>
                <ProgressOrb percentage={campxPercentage} color="#3b82f6" />
              </Suspense>
            )}
            <CircularProgress
              percentage={campxPercentage}
              color="var(--accent-blue)"
              label="CampX Data Science"
              current={data.stats.completedCampx}
              total={data.stats.totalCampx}
            />
          </div>
        </div>
      </div>

      {/* Stats + Streak Row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="card stat-card">
          <h3><AnimatedCounter value={completedIds.length} /></h3>
          <p>Total Tasks Completed</p>
        </div>
        <div className="card stat-card">
          <h3><AnimatedCounter value={panicCount} /></h3>
          <p>Panic Pauses Used</p>
        </div>
      </div>

      {/* Streak Counter */}
      <div style={{ marginBottom: '32px' }}>
        <h3 className="section-title">Consistency Streak</h3>
        <StreakCounter history={completedHistory} />
      </div>

      {/* DSA Skyline (3D) */}
      {!reduceMotion && skylineSteps.length > 0 && (
        <div className="card" style={{ marginBottom: '32px' }}>
          <h3 className="section-title">DSA Progress Skyline</h3>
          <Suspense fallback={<ThreeDFallback />}>
            <DSASkyline steps={skylineSteps} onStepClick={() => navigate('/dsa')} />
          </Suspense>
        </div>
      )}

      {/* Contribution Heatmap (2D) */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 className="section-title">Activity — Last 12 Weeks</h3>
        <ContributionHeatmap history={completedHistory} />
        {/* 3D heatmap below flat one if reduce-motion is off */}
        {!reduceMotion && completedHistory.length > 0 && (
          <Suspense fallback={null}>
            <div style={{ marginTop: '16px' }}>
              <ContributionGrid3D history={completedHistory} />
            </div>
          </Suspense>
        )}
      </div>

      <h3 className="section-title">This Weekend</h3>
      {currentWeekend && (
        <WeekendView 
          saturday={currentWeekend.saturday} 
          sunday={currentWeekend.sunday} 
          completedIds={completedIds} 
          onToggle={handleToggle} 
        />
      )}

      <h3 className="section-title">Upcoming Schedule</h3>
      <CalendarStrip schedule={upcomingSchedule} />

      <div style={{ marginTop: '40px' }}>
        <PanicButton onPanic={handlePanic} panicCount={panicCount} />
      </div>
    </motion.div>
  );
};

export default Home;
