import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';
import SearchBar from '../components/SearchBar';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

const Projects = () => {
  // SWR Instant Cache: Load from sessionStorage immediately (0ms) if available
  const [projects, setProjects] = useState(() => {
    try {
      const cached = sessionStorage.getItem('taskforge_projects_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  // Only show blocking spinner if there is no cached data to display
  const [loading, setLoading] = useState(() => {
    try {
      const cached = sessionStorage.getItem('taskforge_projects_cache');
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });
  const [error, setError] = useState('');

  // View Mode: 'cards' | 'table'
  const [viewMode, setViewMode] = useState('cards');

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Project Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // In-App Confirm & Toast State
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchProjects = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        const hasCache = !!sessionStorage.getItem('taskforge_projects_cache');
        if (!hasCache) setLoading(true);
      }
      setError('');
      const response = await projectService.getAll();
      const freshData = response.data.data || [];
      setProjects(freshData);
      try {
        sessionStorage.setItem('taskforge_projects_cache', JSON.stringify(freshData));
      } catch (e) {}
    } catch (err) {
      console.error('Error fetching projects:', err);
      // Only set visible error if there are no cached projects
      setError((prev) => {
        try {
          const cached = sessionStorage.getItem('taskforge_projects_cache');
          if (cached && JSON.parse(cached).length > 0) return '';
        } catch {}
        return err.response?.data?.message || 'Failed to fetch projects. Please try again.';
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Revalidate quietly in the background without blocking the UI
    fetchProjects(false);
  }, [fetchProjects]);

  const handleCreateProject = async (formData) => {
    try {
      setActionLoading(true);
      await projectService.create(formData);
      setIsModalOpen(false);
      setToast({ message: 'Project created successfully!', type: 'success' });
      fetchProjects(false);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error creating project', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleUpdateProject = async (formData) => {
    try {
      setActionLoading(true);
      await projectService.update(selectedProject.id, formData);
      setIsModalOpen(false);
      setSelectedProject(null);
      setToast({ message: 'Project updated successfully!', type: 'success' });
      fetchProjects(false);
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
      const targetId = projectToDelete.id;
      // Optimistically remove project
      setProjects((prev) => prev.filter((p) => p.id !== targetId));
      await projectService.delete(targetId);
      setProjectToDelete(null);
      setToast({ message: 'Project deleted successfully', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error deleting project', type: 'error' });
      fetchProjects(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Instant in-memory filtering (0ms latency, zero screen blanking)
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter && p.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [projects, statusFilter, search]);

  // Instant in-memory sorting
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === 'deadline') {
        if (!a.endDate) return 1;
        if (!b.endDate) return -1;
        return new Date(a.endDate) - new Date(b.endDate);
      }
      return 0;
    });
  }, [filteredProjects, sortBy]);

  const formatStatus = (s) => {
    switch (s) {
      case 'NOT_STARTED':
        return 'Not Started';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      default:
        return s;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects ({projects.length})</h1>
          <p className="page-subtitle">Manage, monitor, and deliver all your initiatives in one unified hub.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedProject(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
          id="create-project-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Project
        </button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      {/* Toolbar: Search, Filters, Sorting & View Mode */}
      <div className="toolbar-container">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search projects by name..."
          id="project-search-bar"
        />

        <div className="filters-group">
          {/* Status Filter */}
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            id="project-status-filter"
          >
            <option value="">All Statuses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Sort Selector */}
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            id="project-sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="deadline">Target Deadline</option>
          </select>

          {/* View Switcher (Cards vs Table) */}
          <div className="view-switcher-group">
            <button
              type="button"
              className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card Grid View"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Cards
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Data Table View"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              Table
            </button>
          </div>

          {(search || statusFilter) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading && projects.length === 0 ? (
        <Loading message="Loading projects workspace..." />
      ) : sortedProjects.length > 0 ? (
        viewMode === 'cards' ? (
          <div className="cards-grid">
            {sortedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Status</th>
                  <th>Delivery Progress</th>
                  <th>Timeline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedProjects.map((project) => {
                  const progress = project.taskCount > 0
                    ? Math.round(((project.completedTaskCount || 0) / project.taskCount) * 100)
                    : 0;

                  return (
                    <tr key={project.id}>
                      <td>
                        <Link
                          to={`/projects/${project.id}`}
                          style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}
                        >
                          {project.name}
                        </Link>
                        {project.description && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '340px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {project.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-status-${project.status}`}>
                          {formatStatus(project.status)}
                        </span>
                      </td>
                      <td>
                        <div style={{ width: '140px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '3px' }}>
                            <span>{project.completedTaskCount || 0}/{project.taskCount || 0}</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="progress-bar-bg" style={{ height: '6px' }}>
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.825rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {project.startDate || 'No start'} → {project.endDate || 'Open'}
                      </td>
                      <td>
                        <div className="table-action-cell">
                          <Link
                            to={`/projects/${project.id}`}
                            className="btn btn-secondary btn-sm"
                            title="Open project workspace"
                          >
                            Open
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleEditProject(project)}
                            className="btn btn-secondary btn-sm"
                            title="Edit project"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(project)}
                            className="btn btn-danger btn-sm"
                            title="Delete project"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">
            {search || statusFilter ? 'No Matching Projects' : 'No Projects in Workspace'}
          </h3>
          <p className="empty-text">
            {search || statusFilter
              ? 'Try adjusting your search criteria or resetting the filters.'
              : 'Create your first project to start organizing tasks and tracking progress.'}
          </p>
          {search || statusFilter ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
              }}
            >
              Clear Filters
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setSelectedProject(null);
                setIsModalOpen(true);
              }}
            >
              Create First Project
            </button>
          )}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <ProjectForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
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

export default Projects;
