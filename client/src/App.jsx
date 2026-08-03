import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './pages/Home';
import DSAPage from './pages/DSAPage';
import CampXPage from './pages/CampXPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.openGoalModal = () => setGoalModalOpen(true);
    return () => { delete window.openGoalModal; };
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Header onMenuClick={() => setSidebarOpen(v => !v)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dsa" element={<DSAPage />} />
            <Route path="/campx" element={<CampXPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>

      {isGoalModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={() => setGoalModalOpen(false)}
        >
          <img 
            src="/goal.jpg" 
            alt="My Goal" 
            style={{ 
              maxWidth: '95vw', 
              maxHeight: '95vh', 
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 0 40px rgba(255,255,255,0.1)'
            }} 
          />
          <div style={{ position: 'absolute', top: '20px', right: '30px', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
            ✕ Close
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
