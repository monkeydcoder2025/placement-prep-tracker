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
  const location = useLocation();

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
    </div>
  );
}

export default App;
