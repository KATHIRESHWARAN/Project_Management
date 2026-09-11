import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService, taskService } from '../services/api';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import TaskFilters from '../components/TaskFilters';
import ProjectForm from '../components/ProjectForm';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Task Filters
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('');

  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskActionLoading, setTaskActionLoading] = useState(false);

  // Edit Project Modal state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectActionLoading, setProjectActionLoading] = useState(false);

  // In-App Confirm & Toast State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    onConfirm: null,
    loading: false,
  });
  const [toast, setToast] = useState({ message: '', type: 'info' });

  // Load project details
  const fetchProjectDetails = useCallback(async () => {
    try {
      const response = await projectService.getById(id);
      setProject(response.data.data);
    } catch (err) {
      console.error('Failed to load project details:', err);
      setError(
        err.response?.data?.message || 'Failed to fetch project details. It may not exist or access is restricted.'
      );
    }
  }, [id]);

  // Load tasks belonging to project
  const fetchTasks = useCallback(async () => {
    try {
      const params = { projectId: id };
      if (taskSearch.trim()) params.search = taskSearch.trim();
      if (taskStatusFilter) params.status = taskStatusFilter;
      if (taskPriorityFilter) params.priority = taskPriorityFilter;

      const response = await taskService.getAll(params);
      setTasks(response.data.data || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  }, [id, taskSearch, taskStatusFilter, taskPriorityFilter]);

  // Initial load on project ID change
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchProjectDetails();
      await fetchTasks();
      setLoading(false);
    };
    initData();
  }, [id]);

  // Debounced task refetch on search / filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  // Handle Edit Project
  const handleUpdateProject = async (formData) => {
    try {
      setProjectActionLoading(true);
      const res = await projectService.update(id, formData);
      setProject(res.data.data);
      setIsProjectModalOpen(false);
      setToast({ message: 'Project updated successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update project', type: 'error' });
    } finally {
      setProjectActionLoading(false);
    }
  };

  // Handle Delete Project
  const handleDeleteProject = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Project',
      message: `Are you sure you want to delete "${project.name}"? This will permanently delete the project and all its tasks.`,
      confirmText: 'Yes, Delete Project',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, loading: true }));
          await projectService.delete(id);
          navigate('/projects');
        } catch (err) {
          setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }));
          setToast({ message: err.response?.data?.message || 'Failed to delete project', type: 'error' });
        }
      },
    });
  };

  // Handle Create Task
  const handleCreateTask = async (taskData) => {
    try {
      setTaskActionLoading(true);
      await taskService.create({ ...taskData, projectId: Number(id) });
      setIsTaskModalOpen(false);
      setToast({ message: 'Task created successfully!', type: 'success' });
      await fetchTasks();
      await fetchProjectDetails();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create task';
      setToast({ message: errMsg, type: 'error' });
      throw err;
    } finally {
      setTaskActionLoading(false);
    }
  };

  // Handle Edit Task
  const handleUpdateTask = async (taskData) => {
    try {
      setTaskActionLoading(true);
      await taskService.update(selectedTask.id, { ...taskData, projectId: Number(id) });
      setIsTaskModalOpen(false);
      setSelectedTask(null);
      setToast({ message: 'Task updated successfully!', type: 'success' });
      await fetchTasks();
      await fetchProjectDetails();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update task';
      setToast({ message: errMsg, type: 'error' });
      throw err;
    } finally {
      setTaskActionLoading(false);
    }
  };

  // Handle Task Completion / Status Toggle
  const handleStatusChange = async (task, newStatus) => {
    try {
      await taskService.update(task.id, { status: newStatus });
      setToast({
        message: newStatus === 'COMPLETED' ? `Task "${task.name}" completed!` : `Task marked as ${newStatus.toLowerCase()}`,
        type: newStatus === 'COMPLETED' ? 'success' : 'info',
      });
      await fetchTasks();
      await fetchProjectDetails();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update task status', type: 'error' });
    }
  };

  // Handle Delete Task
  const handleDeleteTask = (task) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Task',
      message: `Are you sure you want to delete task "${task.name}"?`,
      confirmText: 'Yes, Delete Task',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, loading: true }));
          await taskService.delete(task.id);
          setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }));
          setToast({ message: 'Task deleted successfully', type: 'success' });
          await fetchTasks();
          await fetchProjectDetails();
        } catch (err) {
          setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }));
          setToast({ message: err.response?.data?.message || 'Failed to delete task', type: 'error' });
        }
      },
    });
  };

  const calculateProgress = () => {
    if (!project?.taskCount || project.taskCount === 0) return 0;
    return Math.round(((project.completedTaskCount || 0) / project.taskCount) * 100);
  };

  if (loading && !project) {
    return <Loading message="Loading project workspace..." />;
  }

  if (error || !project) {
    return (
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/projects" className="btn btn-secondary btn-sm">
            ← Back to Projects
          </Link>
        </div>
        <ErrorMessage message={error || 'Project not found.'} />
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/projects" className="btn btn-secondary btn-sm" id="back-to-projects-btn">
          ← Back to Projects
        </Link>
      </div>

      {/* Project Overview Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          marginBottom: '2.5rem',
        }}
      >
        <div className="page-header" style={{ marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 className="page-title">{project.name}</h1>
              <span className={`badge badge-status-${project.status}`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
            <p className="page-subtitle" style={{ marginTop: '0.5rem', maxWidth: '800px' }}>
              {project.description || 'No detailed project description available.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => setIsProjectModalOpen(true)}
              className="btn btn-secondary"
              id="edit-project-btn"
            >
              Edit Project
            </button>
            <button
              type="button"
              onClick={handleDeleteProject}
              className="btn btn-danger"
              id="delete-project-btn"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Project Meta Information */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9',
            fontSize: '0.875rem',
            color: '#64748b',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <strong>Start Date:</strong> {project.startDate || 'Not scheduled'}
          </div>
          <div>
            <strong>End Date:</strong> {project.endDate || 'Not scheduled'}
          </div>
          <div>
            <strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}
          </div>
          <div>
            <strong>Tasks:</strong> {project.completedTaskCount || 0} / {project.taskCount || 0}{' '}
            completed
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '1.25rem' }}>
          <div className="progress-header">
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar-bg" style={{ height: '9px' }}>
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Tasks Section Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            Tasks ({tasks.length})
          </h2>
          <p className="page-subtitle">Track, filter, and organize tasks for this project.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedTask(null);
            setIsTaskModalOpen(true);
          }}
          className="btn btn-primary"
          id="add-task-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Task
        </button>
      </div>

      {/* Task Filters */}
      <TaskFilters
        search={taskSearch}
        onSearchChange={setTaskSearch}
        status={taskStatusFilter}
        onStatusChange={setTaskStatusFilter}
        priority={taskPriorityFilter}
        onPriorityChange={setTaskPriorityFilter}
        onReset={() => {
          setTaskSearch('');
          setTaskStatusFilter('');
          setTaskPriorityFilter('');
        }}
      />

      {/* Task List / Grid */}
      {tasks.length > 0 ? (
        <div className="cards-grid">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(t) => {
                setSelectedTask(t);
                setIsTaskModalOpen(true);
              }}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3 className="empty-title">
            {taskSearch || taskStatusFilter || taskPriorityFilter
              ? 'No Matching Tasks'
              : 'No Tasks in this Project'}
          </h3>
          <p className="empty-text">
            {taskSearch || taskStatusFilter || taskPriorityFilter
              ? 'Try changing or clearing your search and filter criteria.'
              : 'Add your first task to start organizing work and tracking progress.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedTask(null);
              setIsTaskModalOpen(true);
            }}
            className="btn btn-primary"
          >
            Add First Task
          </button>
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
        initialData={selectedTask}
        fixedProjectId={id}
        loading={taskActionLoading}
      />

      {/* Edit Project Modal */}
      <ProjectForm
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleUpdateProject}
        initialData={project}
        loading={projectActionLoading}
      />

      {/* In-App Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        loading={confirmModal.loading}
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

export default ProjectDetails;
