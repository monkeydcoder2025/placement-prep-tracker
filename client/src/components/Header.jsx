import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  return (
    <header className="top-header">
      <button className="header-btn mobile-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
        <Menu size={20} />
      </button>
      <div className="header-actions">
        <a className="header-btn" href="https://github.com/monkeydcoder2025/placement-prep-tracker/discussions" target="_blank" rel="noreferrer">Discussion</a>
      </div>
    </header>
  );
};

export default Header;
