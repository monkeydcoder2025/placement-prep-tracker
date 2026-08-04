import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Code, Brain, Settings, X, Laptop, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dsa', icon: Code, label: 'DSA' },
  { to: '/campx', icon: Brain, label: 'CampX' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

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
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
            end={to === '/'}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="active-pill"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon size={20} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
