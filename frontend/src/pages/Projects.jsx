import React, { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';
import SearchBar from '../components/SearchBar';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Project Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // In-App Confirm & Toast State
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;

      const response = await projectService.getAll(params);
      setProjects(response.data.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.message || 'Failed to fetch projects. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  // Debounced search / refetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  const handleCreateProject = async (formData) => {
    try {
      setActionLoading(true);
      await projectService.create(formData);
      setIsModalOpen(false);
      setToast({ message: 'Project created successfully!', type: 'success' });
      fetchProjects();
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
      fetchProjects();
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
      fetchProjects();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error deleting project', type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage, track, and monitor all your projects in one place.</p>
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

      {/* Toolbar: Search and Filter */}
      <div className="toolbar-container">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search projects by name..."
          id="project-search-bar"
        />

        <div className="filters-group">
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
      {loading ? (
        <Loading message="Fetching projects..." />
      ) : projects.length > 0 ? (
        <div className="cards-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">
            {search || statusFilter ? 'No Matching Projects' : 'No Projects Found'}
          </h3>
          <p className="empty-text">
            {search || statusFilter
              ? 'Try adjusting your search criteria or resetting the filters.'
              : 'Create your first project to get started.'}
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
              Create Project
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

export default Projects;
