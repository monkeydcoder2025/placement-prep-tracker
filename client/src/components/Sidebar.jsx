import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Code, Brain, Settings } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">F&gt;</div>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/dsa" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Code size={20} />
          <span>DSA</span>
        </NavLink>
        <NavLink to="/campx" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Brain size={20} />
          <span>CampX</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
