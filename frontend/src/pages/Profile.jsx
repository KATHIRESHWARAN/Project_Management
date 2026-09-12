import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/api';
import Loading from '../components/Loading';

const Profile = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const res = await dashboardService.getStats();
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load profile metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserStats();
  }, []);

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
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">User Profile</h1>
          <p className="page-subtitle">Manage your account information, security, and workspace metrics.</p>
        </div>

        <Link to="/dashboard" className="btn btn-secondary btn-sm" id="profile-back-btn">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="profile-grid">
        {/* Left Column: Avatar & Identity Card */}
        <div className="profile-card" style={{ textAlign: 'center' }}>
          <div className="profile-avatar-large">
            {getInitials(user?.fullName)}
          </div>

          <h2 className="profile-name">{user?.fullName || 'Authenticated User'}</h2>
          <p className="profile-email">{user?.email || 'No email registered'}</p>

          <div className="profile-badge-row">
            <span className="badge badge-status-COMPLETED" style={{ padding: '4px 10px' }}>
              ● Verified Account
            </span>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'left', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: '#64748b' }}>Account ID:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>USR-{user?.id || '01'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: '#64748b' }}>Session Status:</span>
              <span style={{ fontWeight: 600, color: '#10b981' }}>Active (JWT)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Role:</span>
              <span style={{ fontWeight: 600, color: '#4f46e5' }}>Project Owner</span>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button
              type="button"
              onClick={logout}
              className="btn btn-danger"
              style={{ width: '100%' }}
              id="profile-logout-btn"
            >
              Sign Out of Session
            </button>
          </div>
        </div>

        {/* Right Column: Account Stats & Security Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Workspace Activity Summary */}
          <div className="profile-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
              Workspace Summary
            </h3>

            {loading ? (
              <Loading message="Fetching metrics..." />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-surface-secondary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Total Projects
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4f46e5' }}>
                    {stats?.totalProjects ?? 0}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-secondary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>
                    In Progress Projects
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706' }}>
                    {stats?.projectsInProgress ?? 0}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-secondary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Total Tasks
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {stats?.totalTasks ?? 0}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-secondary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Completed Tasks
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>
                    {stats?.completedTasks ?? 0}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Account Security Section */}
          <div className="profile-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Security & Credentials
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Your account is secured with bcrypt hash rounds and Bearer token transmission.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-surface-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Password Management</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Change or reset your password via verified reset flow.</div>
              </div>

              <Link to="/forgot-password" className="btn btn-secondary btn-sm" id="profile-reset-password-btn">
                Reset Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
