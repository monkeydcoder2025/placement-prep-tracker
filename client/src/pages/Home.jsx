import React, { useEffect, useState } from 'react';
import ProgressBar from '../components/ProgressBar';
import WeekendView from '../components/WeekendView';
import CalendarStrip from '../components/CalendarStrip';
import PanicButton from '../components/PanicButton';
import { fetchSchedule, fetchCompletedTasks, completeTask, uncompleteTask, triggerPanic, fetchSettings } from '../utils/api';

const Home = () => {
  const [data, setData] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);
  const [settings, setSettings] = useState(null);

  const loadData = async () => {
    try {
      const [scheduleRes, completedRes, settingsRes] = await Promise.all([
        fetchSchedule(),
        fetchCompletedTasks(),
        fetchSettings()
      ]);
      setData(scheduleRes);
      setCompletedIds(completedRes);
      setSettings(settingsRes);
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
      const scheduleRes = await fetchSchedule();
      setData(scheduleRes);
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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>{new Date().toDateString()}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 className="section-title">Overall Progress</h3>
        <ProgressBar 
          label="Striver's A2Z DSA Sheet" 
          current={data.stats.completedStriver} 
          total={data.stats.totalStriver} 
        />
        <ProgressBar 
          label="CampX Data Science" 
          current={data.stats.completedCampx} 
          total={data.stats.totalCampx} 
          type="campx"
        />
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <h3>{completedIds.length}</h3>
          <p>Total Tasks Completed</p>
        </div>
        <div className="card stat-card">
          <h3>{panicCount}</h3>
          <p>Panic Pauses Used</p>
        </div>
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
    </div>
  );
};

export default Home;
