import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  // SWR Instant Cache: Load from sessionStorage immediately (0ms) if available
  const [tasks, setTasks] = useState(() => {
    try {
      const cached = sessionStorage.getItem('taskforge_tasks_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
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
      const cached = sessionStorage.getItem('taskforge_tasks_cache');
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });
  const [error, setError] = useState('');

  // View Mode: 'board' | 'table' | 'cards'
  const [viewMode, setViewMode] = useState('board');

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [sortBy, setSortBy] = useState('priority');

  // Task Modal State
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
      const freshProjects = response.data.data || [];
      setProjects(freshProjects);
      try {
        sessionStorage.setItem('taskforge_projects_cache', JSON.stringify(freshProjects));
      } catch (e) {}
    } catch (err) {
      console.error('Failed to load projects for task filter:', err);
    }
  }, []);

  // Fetch all tasks without disruptive loading flicker
  const fetchTasks = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        const hasCache = !!sessionStorage.getItem('taskforge_tasks_cache');
        if (!hasCache) setLoading(true);
      }
      setError('');
      const response = await taskService.getAll();
      const freshTasks = response.data.data || [];
      setTasks(freshTasks);
      try {
        sessionStorage.setItem('taskforge_tasks_cache', JSON.stringify(freshTasks));
      } catch (e) {}
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError((prev) => {
        try {
          const cached = sessionStorage.getItem('taskforge_tasks_cache');
          if (cached && JSON.parse(cached).length > 0) return '';
        } catch {}
        return err.response?.data?.message || 'Failed to load tasks. Please try again.';
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchTasks(false);
  }, [fetchProjects, fetchTasks]);

  const handleCreateTask = async (taskData) => {
    try {
      setActionLoading(true);
      await taskService.create(taskData);
      setIsTaskModalOpen(false);
      setToast({ message: 'Task created successfully!', type: 'success' });
      fetchTasks(false);
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
      fetchTasks(false);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update task', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    // Optimistic instant UI update (0ms delay)
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );
    try {
      await taskService.update(task.id, { status: newStatus });
      setToast({
        message: newStatus === 'COMPLETED' ? `Task "${task.name}" completed!` : `Task moved to ${newStatus.toLowerCase().replace('_', ' ')}`,
        type: newStatus === 'COMPLETED' ? 'success' : 'info',
      });
    } catch (err) {
      // Revert on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
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
          // Optimistically remove from state
          setTasks((prev) => prev.filter((t) => t.id !== task.id));
          await taskService.delete(task.id);
          setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }));
          setToast({ message: 'Task deleted successfully', type: 'success' });
        } catch (err) {
          setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }));
          setToast({ message: err.response?.data?.message || 'Failed to delete task', type: 'error' });
          fetchTasks(false);
        }
      },
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setProjectFilter('');
    setSortBy('priority');
  };

  const hasActiveFilters = search || statusFilter || priorityFilter || projectFilter;

  // Instant in-memory filtering (0ms latency, zero screen flashing)
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (projectFilter && String(t.projectId) !== String(projectFilter)) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesName = t.name?.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        const matchesProject = t.projectName?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesProject) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, projectFilter, search]);

  // Instant in-memory sorting
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
        return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
      }
      if (sortBy === 'deadline') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      return 0;
    });
  }, [filteredTasks, sortBy]);

  // Kanban column buckets
  const pendingTasks = useMemo(() => sortedTasks.filter((t) => t.status === 'PENDING'), [sortedTasks]);
  const inProgressTasks = useMemo(() => sortedTasks.filter((t) => t.status === 'IN_PROGRESS'), [sortedTasks]);
  const completedTasks = useMemo(() => sortedTasks.filter((t) => t.status === 'COMPLETED'), [sortedTasks]);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks Management ({tasks.length})</h1>
          <p className="page-subtitle">
            Plan, triage, and organize deliverables across projects with unified board and list perspectives.
          </p>
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
              title="Detailed Cards View"
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
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      {/* Filter & Search Toolbar */}
      <div className="toolbar-container">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search tasks by title..."
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

          {/* Sort Selector */}
          <select
            id="filter-sort"
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="priority">Sort: Priority</option>
            <option value="deadline">Sort: Due Date</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="newest">Sort: Newest</option>
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

      {/* Tasks Content Views */}
      {loading && tasks.length === 0 ? (
        <Loading message="Loading workspace..." />
      ) : sortedTasks.length > 0 ? (
        viewMode === 'board' ? (
          /* Kanban Board View */
          <div className="kanban-board">
            {/* Column 1: Pending */}
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
                      {t.projectName && (
                        <Link to={`/projects/${t.projectId}`} style={{ color: '#4f46e5', fontWeight: 600 }}>
                          📁 {t.projectName}
                        </Link>
                      )}
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
                          ✓ Done
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleEditTask(t)}
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

            {/* Column 2: In Progress */}
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
                      {t.projectName && (
                        <Link to={`/projects/${t.projectId}`} style={{ color: '#4f46e5', fontWeight: 600 }}>
                          📁 {t.projectName}
                        </Link>
                      )}
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
                          ✓ Done
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleEditTask(t)}
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

            {/* Column 3: Completed */}
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
                      {t.projectName && (
                        <Link to={`/projects/${t.projectId}`} style={{ color: '#4f46e5', fontWeight: 600 }}>
                          📁 {t.projectName}
                        </Link>
                      )}
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
                          onClick={() => handleEditTask(t)}
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
                  <th>Project</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Target Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedTasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div className="checkbox-container">
                        <input
                          type="checkbox"
                          id={`table-task-check-${task.id}`}
                          className="task-checkbox"
                          checked={task.status === 'COMPLETED'}
                          onChange={() => handleStatusChange(task, task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED')}
                        />
                        <label
                          htmlFor={`table-task-check-${task.id}`}
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
                              <div style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {task.description}
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    </td>
                    <td>
                      {task.projectName ? (
                        <Link to={`/projects/${task.projectId}`} style={{ color: '#4f46e5', fontWeight: 600 }}>
                          {task.projectName}
                        </Link>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Unassigned</span>
                      )}
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
                      {task.dueDate || 'Open'}
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
                          onClick={() => handleEditTask(task)}
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
          /* Detailed Cards View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {sortedTasks.map((task) => (
              <div key={task.id}>
                <TaskCard
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))}
          </div>
        )
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
              ? 'Create your first project to start adding and organizing deliverables.'
              : 'Add your first task to start tracking work across the board.'}
          </p>
          {hasActiveFilters ? (
            <button type="button" onClick={handleResetFilters} className="btn btn-secondary">
              Clear All Filters
            </button>
          ) : projects.length === 0 ? (
            <Link to="/projects" className="btn btn-primary">
              Create a Project First
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
