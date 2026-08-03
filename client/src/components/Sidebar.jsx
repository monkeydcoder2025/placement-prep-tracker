import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Code, Brain, Settings, X, Laptop, Coffee } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div 
          className="sidebar-logo" 
          onClick={() => { onClose(); if (window.openGoalModal) window.openGoalModal(); }}
          title="View Goal"
        >
          <Laptop size={16} />
          <span className="logo-operator">+</span>
          <Coffee size={16} />
          <span className="logo-operator">=</span>
          <Code size={16} />
        </div>
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
