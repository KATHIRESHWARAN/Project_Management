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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // In-App Confirm & Toast State
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await dashboardService.getStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard metrics. Please check connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
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
    return <Loading message="Loading dashboard statistics..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">
            Welcome back, {user?.fullName || 'User'}! Here's what is happening with your projects.
          </p>
        </div>

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

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      {/* 5 Stats Cards */}
      <div className="stats-grid">
        {/* Total Projects */}
        <div className="stat-card stat-primary" id="stat-total-projects">
          <div className="stat-icon-wrapper">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalProjects ?? 0}</span>
            <span className="stat-label">Total Projects</span>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="stat-card stat-info-card" id="stat-total-tasks">
          <div className="stat-icon-wrapper">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.pendingTasks ?? 0}</span>
            <span className="stat-label">Pending Tasks</span>
          </div>
        </div>

        {/* Projects In Progress */}
        <div className="stat-card stat-danger" id="stat-projects-in-progress">
          <div className="stat-icon-wrapper">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.projectsInProgress ?? 0}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>
            Recent Projects
          </h2>
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
              Create your first project to start adding tasks, tracking progress, and hitting deadlines.
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
        message={`Are you sure you want to delete "${projectToDelete?.name}"? All associated tasks will be permanently deleted.`}
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
