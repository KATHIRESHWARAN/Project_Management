import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="navbar-right">
        {user && (
          <div className="user-profile-badge">
            <div className="avatar-circle" title={user.fullName}>
              {getInitials(user.fullName)}
            </div>
            <div className="user-details">
              <span className="user-name">{user.fullName}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
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
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
