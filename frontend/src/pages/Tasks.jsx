import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { taskService, projectService } from '../services/api';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import SearchBar from '../components/SearchBar';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Confirm Modal & Toast
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    onConfirm: null,
    loading: false,
  });
  const [toast, setToast] = useState({ message: '', type: 'info' });

  // Fetch projects list for filtering & task creation
  const fetchProjects = useCallback(async () => {
    try {
      const response = await projectService.getAll();
      setProjects(response.data.data || []);
    } catch (err) {
      console.error('Failed to load projects for task filter:', err);
    }
  }, []);

  // Fetch all tasks with active filters
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (projectFilter) params.projectId = projectFilter;

      const response = await taskService.getAll(params);
      setTasks(response.data.data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.message || 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, projectFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const handleCreateTask = async (taskData) => {
    try {
      setActionLoading(true);
      await taskService.create(taskData);
      setIsTaskModalOpen(false);
      setToast({ message: 'Task created successfully!', type: 'success' });
      fetchTasks();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to create task', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleUpdateTask = async (taskData) => {
    try {
      setActionLoading(true);
      await taskService.update(selectedTask.id, taskData);
      setIsTaskModalOpen(false);
      setSelectedTask(null);
      setToast({ message: 'Task updated successfully!', type: 'success' });
      fetchTasks();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update task', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await taskService.update(task.id, { status: newStatus });
      setToast({
        message: newStatus === 'COMPLETED' ? `Task "${task.name}" completed!` : `Task marked as ${newStatus.toLowerCase()}`,
        type: newStatus === 'COMPLETED' ? 'success' : 'info',
      });
      fetchTasks();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update task status', type: 'error' });
    }
  };

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
          fetchTasks();
        } catch (err) {
          setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }));
          setToast({ message: err.response?.data?.message || 'Failed to delete task', type: 'error' });
        }
      },
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setProjectFilter('');
  };

  const hasActiveFilters = search || statusFilter || priorityFilter || projectFilter;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">All Tasks</h1>
          <p className="page-subtitle">
            Manage, filter, and track all tasks across all your projects in one unified workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedTask(null);
            setIsTaskModalOpen(true);
          }}
          className="btn btn-primary"
          id="new-task-btn"
          disabled={projects.length === 0}
          title={projects.length === 0 ? 'Create a project first before adding tasks' : 'Add new task'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Task
        </button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      {/* Filter & Search Toolbar */}
      <div className="toolbar-container">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search tasks by name..."
          id="tasks-search-input"
        />

        <div className="filters-group">
          {/* Project Filter */}
          <select
            id="filter-project"
            className="filter-select"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            id="filter-status"
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            id="filter-priority"
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-secondary btn-sm"
              id="reset-filters-btn"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <Loading message="Loading tasks..." />
      ) : tasks.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {tasks.map((task) => (
            <div key={task.id}>
              {task.projectName && (
                <div style={{ marginBottom: '0.25rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  Project: <Link to={`/projects/${task.projectId}`} style={{ color: '#4f46e5' }}>{task.projectName}</Link>
                </div>
              )}
              <TaskCard
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <h3 className="empty-title">
            {hasActiveFilters ? 'No Tasks Match Your Filters' : 'No Tasks Found'}
          </h3>
          <p className="empty-text">
            {hasActiveFilters
              ? 'Try adjusting or resetting your search and filter criteria.'
              : projects.length === 0
              ? 'Create your first project to start adding and organizing tasks.'
              : 'Add your first task to start tracking progress.'}
          </p>
          {hasActiveFilters ? (
            <button type="button" onClick={handleResetFilters} className="btn btn-secondary">
              Clear All Filters
            </button>
          ) : projects.length === 0 ? (
            <Link to="/projects" className="btn btn-primary">
              Go to Projects
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSelectedTask(null);
                setIsTaskModalOpen(true);
              }}
              className="btn btn-primary"
            >
              Create First Task
            </button>
          )}
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
        projects={projects}
        loading={actionLoading}
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

export default Tasks;
