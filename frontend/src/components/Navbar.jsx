import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import ToggleButton from './ToggleButton';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { isCosmic, toggleTheme } = useTheme();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          id="menu-toggle-btn"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div style={{ display: 'none', md: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }} className="desktop-date-pill">
          <span>📅 {todayFormatted}</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Website Theme Toggle Button */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ToggleButton
            id="navbar-theme-toggle"
            checked={isCosmic}
            onChange={toggleTheme}
            title={isCosmic ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            ariaLabel="Toggle theme"
          />
        </div>

        {user && (
          <Link to="/profile" className="user-profile-badge" title="View Profile & Settings" id="navbar-profile-badge">
            <div className="avatar-circle">
              {getInitials(user.fullName)}
            </div>
            <div className="user-details">
              <span className="user-name">{user.fullName}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </Link>
        )}

        <button
          type="button"
          onClick={logout}
          className="btn btn-secondary btn-sm"
          id="logout-btn"
          title="Sign out of your account"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
