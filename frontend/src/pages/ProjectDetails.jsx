import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

  // SWR Instant Cache: Load from sessionStorage immediately (0ms) if available
  const [project, setProject] = useState(() => {
    try {
      const cached = sessionStorage.getItem(`taskforge_project_${id}_cache`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [rawTasks, setRawTasks] = useState(() => {
    try {
      const cached = sessionStorage.getItem(`taskforge_project_${id}_tasks_cache`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(`taskforge_project_${id}_cache`);
    } catch {
      return true;
    }
  });
  const [error, setError] = useState('');

  // Task View Mode: 'board' | 'table' | 'cards'
  const [viewMode, setViewMode] = useState('board');

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
      const data = response.data.data;
      setProject(data);
      try {
        sessionStorage.setItem(`taskforge_project_${id}_cache`, JSON.stringify(data));
      } catch (e) {}
    } catch (err) {
      console.error('Failed to load project details:', err);
      setError((prev) => {
        try {
          const cached = sessionStorage.getItem(`taskforge_project_${id}_cache`);
          if (cached) return '';
        } catch {}
        return err.response?.data?.message || 'Failed to fetch project details. It may not exist or access is restricted.';
      });
    }
  }, [id]);

  // Load tasks belonging to project (all tasks for this project)
  const fetchTasks = useCallback(async () => {
    try {
      const response = await taskService.getAll({ projectId: id });
      const data = response.data.data || [];
      setRawTasks(data);
      try {
        sessionStorage.setItem(`taskforge_project_${id}_tasks_cache`, JSON.stringify(data));
      } catch (e) {}
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  }, [id]);

  // Initial load
  useEffect(() => {
    const initData = async () => {
      const hasCache = !!sessionStorage.getItem(`taskforge_project_${id}_cache`);
      if (!hasCache) setLoading(true);
      await fetchProjectDetails();
      await fetchTasks();
      setLoading(false);
    };
    initData();
  }, [id, fetchProjectDetails, fetchTasks]);

  // Instant in-memory filtering for project tasks (0ms latency, zero screen flicker)
  const tasks = useMemo(() => {
    return rawTasks.filter((t) => {
      if (taskStatusFilter && t.status !== taskStatusFilter) return false;
      if (taskPriorityFilter && t.priority !== taskPriorityFilter) return false;
      if (taskSearch.trim()) {
        const q = taskSearch.trim().toLowerCase();
        const matchesName = t.name?.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [rawTasks, taskStatusFilter, taskPriorityFilter, taskSearch]);

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
    // Optimistic instant UI update
    setRawTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );
    try {
      await taskService.update(task.id, { status: newStatus });
      setToast({
        message: newStatus === 'COMPLETED' ? `Task "${task.name}" completed!` : `Task moved to ${newStatus.toLowerCase().replace('_', ' ')}`,
        type: newStatus === 'COMPLETED' ? 'success' : 'info',
      });
      fetchProjectDetails();
    } catch (err) {
      setRawTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
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
          setRawTasks((prev) => prev.filter((t) => t.id !== task.id));
          await taskService.delete(task.id);
          setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }));
          setToast({ message: 'Task deleted successfully', type: 'success' });
          fetchProjectDetails();
        } catch (err) {
          setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }));
          setToast({ message: err.response?.data?.message || 'Failed to delete task', type: 'error' });
          fetchTasks();
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

  // Kanban column buckets
  const pendingTasks = tasks.filter((t) => t.status === 'PENDING');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/projects" className="btn btn-secondary btn-sm" id="back-to-projects-btn">
          ← Back to All Projects
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
          marginBottom: '2rem',
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
              className="btn btn-secondary btn-sm"
              id="edit-project-btn"
            >
              Edit Project
            </button>
            <button
              type="button"
              onClick={handleDeleteProject}
              className="btn btn-danger btn-sm"
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
            <strong>Start Date:</strong> {project.startDate || 'Not set'}
          </div>
          <div>
            <strong>End Date:</strong> {project.endDate || 'Not set'}
          </div>
          <div>
            <strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}
          </div>
          <div>
            <strong>Completed Tasks:</strong> {project.completedTaskCount || 0} / {project.taskCount || 0}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '1.25rem' }}>
          <div className="progress-header">
            <span>Overall Delivery Progress</span>
            <span style={{ color: progress === 100 ? '#10b981' : '#4f46e5' }}>{progress}%</span>
          </div>
          <div className="progress-bar-bg" style={{ height: '9px' }}>
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Tasks Section Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Project Tasks ({tasks.length})
          </h2>
          <p className="page-subtitle">Track and prioritize deliverables across the delivery pipeline.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* View Switcher */}
          <div className="view-switcher-group">
            <button
              type="button"
              className={`view-btn ${viewMode === 'board' ? 'active' : ''}`}
              onClick={() => setViewMode('board')}
              title="Kanban Board View"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="18"></rect>
                <rect x="14" y="3" width="7" height="10"></rect>
              </svg>
              Kanban
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
            <button
              type="button"
              className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Cards Grid View"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Cards
            </button>
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

      {/* Task Views */}
      {tasks.length > 0 ? (
        viewMode === 'board' ? (
          /* Kanban Board View */
          <div className="kanban-board">
            {/* Pending Column */}
            <div className="kanban-column kanban-column-pending">
              <div className="kanban-column-header">
                <span className="kanban-column-title">
                  ⏳ Pending
                </span>
                <span className="kanban-column-badge">{pendingTasks.length}</span>
              </div>
              <div className="kanban-card-list">
                {pendingTasks.map((t) => (
                  <div key={t.id} className="kanban-card">
                    <div className="kanban-card-header">
                      <h4 className="kanban-card-title">{t.name}</h4>
                      <span className={`badge badge-priority-${t.priority}`}>{t.priority}</span>
                    </div>
                    {t.description && <p className="kanban-card-desc">{t.description}</p>}
                    <div className="kanban-card-meta">
                      <span>📅 {t.dueDate || 'No date'}</span>
                    </div>
                    <div className="kanban-card-actions">
                      <div className="kanban-move-btns">
                        <button
                          type="button"
                          className="kanban-move-btn"
                          onClick={() => handleStatusChange(t, 'IN_PROGRESS')}
                          title="Move to In Progress"
                        >
                          → In Progress
                        </button>
                        <button
                          type="button"
                          className="kanban-move-btn"
                          onClick={() => handleStatusChange(t, 'COMPLETED')}
                          title="Mark Completed"
                        >
                          ✓ Complete
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => {
                            setSelectedTask(t);
                            setIsTaskModalOpen(true);
                          }}
                          title="Edit Task"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleDeleteTask(t)}
                          title="Delete Task"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="kanban-column kanban-column-inprogress">
              <div className="kanban-column-header">
                <span className="kanban-column-title">
                  ⚡ In Progress
                </span>
                <span className="kanban-column-badge">
                  {inProgressTasks.length}
                </span>
              </div>
              <div className="kanban-card-list">
                {inProgressTasks.map((t) => (
                  <div key={t.id} className="kanban-card" style={{ borderLeft: '3px solid #f59e0b' }}>
                    <div className="kanban-card-header">
                      <h4 className="kanban-card-title">{t.name}</h4>
                      <span className={`badge badge-priority-${t.priority}`}>{t.priority}</span>
                    </div>
                    {t.description && <p className="kanban-card-desc">{t.description}</p>}
                    <div className="kanban-card-meta">
                      <span>📅 {t.dueDate || 'No date'}</span>
                    </div>
                    <div className="kanban-card-actions">
                      <div className="kanban-move-btns">
                        <button
                          type="button"
                          className="kanban-move-btn"
                          onClick={() => handleStatusChange(t, 'PENDING')}
                          title="Move to Pending"
                        >
                          ← Pending
                        </button>
                        <button
                          type="button"
                          className="kanban-move-btn"
                          onClick={() => handleStatusChange(t, 'COMPLETED')}
                          title="Mark Completed"
                        >
                          ✓ Complete
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => {
                            setSelectedTask(t);
                            setIsTaskModalOpen(true);
                          }}
                          title="Edit Task"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleDeleteTask(t)}
                          title="Delete Task"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Column */}
            <div className="kanban-column kanban-column-completed">
              <div className="kanban-column-header">
                <span className="kanban-column-title">
                  ✓ Completed
                </span>
                <span className="kanban-column-badge">
                  {completedTasks.length}
                </span>
              </div>
              <div className="kanban-card-list">
                {completedTasks.map((t) => (
                  <div key={t.id} className="kanban-card" style={{ opacity: 0.9, borderLeft: '3px solid #10b981' }}>
                    <div className="kanban-card-header">
                      <h4 className="kanban-card-title" style={{ textDecoration: 'line-through', color: '#64748b' }}>
                        {t.name}
                      </h4>
                      <span className={`badge badge-priority-${t.priority}`}>{t.priority}</span>
                    </div>
                    {t.description && <p className="kanban-card-desc">{t.description}</p>}
                    <div className="kanban-card-meta">
                      <span>📅 {t.dueDate || 'No date'}</span>
                    </div>
                    <div className="kanban-card-actions">
                      <div className="kanban-move-btns">
                        <button
                          type="button"
                          className="kanban-move-btn"
                          onClick={() => handleStatusChange(t, 'IN_PROGRESS')}
                          title="Reopen to In Progress"
                        >
                          ↩ Reopen
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => {
                            setSelectedTask(t);
                            setIsTaskModalOpen(true);
                          }}
                          title="Edit Task"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleDeleteTask(t)}
                          title="Delete Task"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Target Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div className="checkbox-container">
                        <input
                          type="checkbox"
                          id={`proj-task-check-${task.id}`}
                          className="task-checkbox"
                          checked={task.status === 'COMPLETED'}
                          onChange={() => handleStatusChange(task, task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED')}
                        />
                        <label
                          htmlFor={`proj-task-check-${task.id}`}
                          className="checkbox-label"
                          style={{ padding: 0 }}
                          title={task.status === 'COMPLETED' ? 'Mark as Pending' : 'Mark as Completed'}
                        >
                          <div className="checkbox-box">
                            <div className="checkbox-fill"></div>
                            <div className="checkmark">
                              <svg viewBox="0 0 24 24" className="check-icon">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path>
                              </svg>
                            </div>
                            <div className="success-ripple"></div>
                          </div>
                          <div>
                            <span className="checkbox-text" style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                              {task.name}
                            </span>
                            {task.description && (
                              <div style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {task.description}
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-priority-${task.priority}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-status-${task.status}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.825rem', color: '#64748b' }}>
                      {task.dueDate || 'Not set'}
                    </td>
                    <td>
                      <div className="table-action-cell">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(task, task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED')}
                          className="btn btn-secondary btn-sm"
                        >
                          {task.status === 'COMPLETED' ? 'Reopen' : 'Done'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTask(task);
                            setIsTaskModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards Grid View */
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
        )
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
