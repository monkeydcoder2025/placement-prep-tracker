import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Code, Brain, Settings, X, Image as ImageIcon } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <img 
          src="/goal.jpg" 
          alt="Goal Photo" 
          className="sidebar-logo" 
          style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '50%', cursor: 'pointer', border: '2px solid var(--accent-orange)' }} 
          onClick={() => { onClose(); if (window.openGoalModal) window.openGoalModal(); }}
          title="View Goal"
        />
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
          <X size={20} />
        </button>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/dsa" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Code size={20} />
          <span>DSA</span>
        </NavLink>
        <NavLink to="/campx" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Brain size={20} />
          <span>CampX</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
