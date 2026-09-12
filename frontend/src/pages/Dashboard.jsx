import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, projectService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

const Dashboard = () => {
  const { user } = useAuth();
  // SWR Instant Cache: Load from sessionStorage immediately (0ms) if available
  const [stats, setStats] = useState(() => {
    try {
      const cached = sessionStorage.getItem('taskforge_dashboard_stats');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  // Only show blocking spinner if there is no cached data to display
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('taskforge_dashboard_stats');
    } catch {
      return true;
    }
  });
  const [error, setError] = useState('');

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // In-App Confirm & Toast State
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchStats = useCallback(async (showSpinner = false) => {
    try {
      if (showSpinner) setLoading(true);
      setError('');
      const response = await dashboardService.getStats();
      const freshData = response.data.data;
      setStats(freshData);
      try {
        sessionStorage.setItem('taskforge_dashboard_stats', JSON.stringify(freshData));
      } catch (e) {
        // Ignore storage quota
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
      // Only set UI error if there are no cached stats to display
      setError((prev) => {
        try {
          const cached = sessionStorage.getItem('taskforge_dashboard_stats');
          if (cached) return '';
        } catch {}
        return err.response?.data?.message || 'Failed to fetch dashboard metrics. Please check connection.';
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Revalidate quietly in the background without blocking the dashboard
    fetchStats(false);
  }, [fetchStats]);

  const handleCreateProject = async (formData) => {
    try {
      setActionLoading(true);
      await projectService.create(formData);
      setIsProjectModalOpen(false);
      setToast({ message: 'Project created successfully!', type: 'success' });
      fetchStats();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error creating project', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  const handleUpdateProject = async (formData) => {
    try {
      setActionLoading(true);
      await projectService.update(selectedProject.id, formData);
      setIsProjectModalOpen(false);
      setSelectedProject(null);
      setToast({ message: 'Project updated successfully!', type: 'success' });
      fetchStats();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error updating project', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = (project) => {
    setProjectToDelete(project);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      setDeleteLoading(true);
      await projectService.delete(projectToDelete.id);
      setProjectToDelete(null);
      setToast({ message: 'Project deleted successfully', type: 'success' });
      fetchStats();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error deleting project', type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading && !stats) {
    return <Loading message="Loading executive dashboard..." />;
  }

  // Calculate Visual Analytics
  const totalTasks = stats?.totalTasks || 0;
  const completedTasks = stats?.completedTasks || 0;
  const pendingTasks = stats?.pendingTasks || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // SVG Gauge calculations (radius = 45, circumference = 2 * PI * 45 ≈ 282.74)
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  const totalProjects = stats?.totalProjects || 0;
  const projectsInProgress = stats?.projectsInProgress || 0;
  const otherProjects = Math.max(0, totalProjects - projectsInProgress);
  const inProgressPercent = totalProjects > 0 ? Math.round((projectsInProgress / totalProjects) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Workspace Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {user?.fullName || 'User'}! Here is your project delivery velocity and status overview.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/tasks" className="btn btn-secondary" id="dashboard-view-tasks-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            Task Board
          </Link>
          <button
            type="button"
            onClick={() => {
              setSelectedProject(null);
              setIsProjectModalOpen(true);
            }}
            className="btn btn-primary"
            id="dashboard-new-project-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Project
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      {/* 5 KPI Metric Cards */}
      <div className="stats-grid">
        {/* Total Projects */}
        <div className="stat-card stat-primary" id="stat-total-projects">
          <div className="stat-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalProjects ?? 0}</span>
            <span className="stat-label">Total Projects</span>
          </div>
        </div>

        {/* In Progress Projects */}
        <div className="stat-card stat-danger" id="stat-projects-in-progress">
          <div className="stat-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.projectsInProgress ?? 0}</span>
            <span className="stat-label">In Progress Projects</span>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="stat-card stat-info-card" id="stat-total-tasks">
          <div className="stat-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalTasks ?? 0}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="stat-card stat-success" id="stat-completed-tasks">
          <div className="stat-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.completedTasks ?? 0}</span>
            <span className="stat-label">Completed Tasks</span>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="stat-card stat-warning" id="stat-pending-tasks">
          <div className="stat-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.pendingTasks ?? 0}</span>
            <span className="stat-label">Pending Tasks</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Charts Section (Derived Strictly from Data) */}
      <div className="analytics-grid">
        {/* Task Completion Circular Gauge */}
        <div className="analytics-card">
          <h3 className="analytics-card-title">Task Completion Efficiency</h3>
          <p className="analytics-card-subtitle">
            Overall percentage of tasks finished across all active projects
          </p>

          <div className="completion-gauge-container">
            <div className="gauge-circle">
              <svg width="120" height="120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="#e2e8f0"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="#10b981"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div className="gauge-percent">{completionRate}%</div>
            </div>

            <div className="gauge-legend">
              <div className="legend-item">
                <span>
                  <span className="legend-color-dot" style={{ backgroundColor: '#10b981' }}></span>
                  Completed Tasks
                </span>
                <strong style={{ color: 'var(--text-main)' }}>{completedTasks}</strong>
              </div>
              <div className="legend-item">
                <span>
                  <span className="legend-color-dot" style={{ backgroundColor: '#f59e0b' }}></span>
                  Pending / Backlog
                </span>
                <strong style={{ color: 'var(--text-main)' }}>{pendingTasks}</strong>
              </div>
              <div className="legend-item" style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                <span>Total Scope</span>
                <strong style={{ color: '#4f46e5' }}>{totalTasks} tasks</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Project Pipeline Health & Distribution */}
        <div className="analytics-card">
          <h3 className="analytics-card-title">Project Pipeline Distribution</h3>
          <p className="analytics-card-subtitle">
            Allocation of initiatives by active execution phase
          </p>

          <div className="distribution-bar-wrapper">
            <div className="distribution-bar-header">
              <span>Execution State</span>
              <span>{projectsInProgress} Active / {totalProjects} Total</span>
            </div>
            <div className="distribution-bar-track">
              <div
                className="distribution-segment"
                style={{ width: `${inProgressPercent}%`, backgroundColor: '#b45309' }}
                title={`In Progress: ${projectsInProgress}`}
              ></div>
              <div
                className="distribution-segment"
                style={{ width: `${100 - inProgressPercent}%`, backgroundColor: '#e2e8f0' }}
                title={`Other: ${otherProjects}`}
              ></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>In Progress Initiatives:</span>
              <strong style={{ color: '#b45309' }}>{projectsInProgress} ({inProgressPercent}%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Not Started / Other:</span>
              <strong style={{ color: '#64748b' }}>{otherProjects} ({100 - inProgressPercent}%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              <span>Avg Tasks Per Project:</span>
              <strong style={{ color: '#4f46e5' }}>
                {totalProjects > 0 ? (totalTasks / totalProjects).toFixed(1) : 0}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Recent Projects
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Your most recently created initiatives and delivery roadmaps.
            </p>
          </div>
          <Link to="/projects" className="btn btn-secondary btn-sm" id="view-all-projects-link">
            View All Projects →
          </Link>
        </div>

        {stats?.recentProjects && stats.recentProjects.length > 0 ? (
          <div className="cards-grid">
            {stats.recentProjects.map((proj) => (
              <ProjectCard
                key={proj.id}
                project={proj}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3 className="empty-title">No Projects Created Yet</h3>
            <p className="empty-text">
              Create your first project to start adding tasks, tracking progress, and hitting delivery milestones.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedProject(null);
                setIsProjectModalOpen(true);
              }}
              className="btn btn-primary"
            >
              Create First Project
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Project Modal */}
      <ProjectForm
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={selectedProject ? handleUpdateProject : handleCreateProject}
        initialData={selectedProject}
        loading={actionLoading}
      />

      {/* In-App Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!projectToDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.name}"? All associated tasks will be permanently removed.`}
        confirmText="Yes, Delete Project"
        onConfirm={handleConfirmDelete}
        onCancel={() => setProjectToDelete(null)}
        loading={deleteLoading}
      />

      {/* In-App Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
    </div>
  );
};

export default Dashboard;
