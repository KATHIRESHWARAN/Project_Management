import React, { useState, useEffect } from 'react';

const EMPTY_PROJECTS = [];

const TaskForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  fixedProjectId = null,
  projects = EMPTY_PROJECTS,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    projectId: fixedProjectId || '',
    name: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: '',
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        projectId: initialData.projectId || fixedProjectId || '',
        name: initialData.name || '',
        description: initialData.description || '',
        priority: initialData.priority || 'MEDIUM',
        status: initialData.status || 'PENDING',
        dueDate: initialData.dueDate || '',
      });
    } else {
      setFormData({
        projectId: fixedProjectId || (projects.length > 0 ? projects[0].id : ''),
        name: '',
        description: '',
        priority: 'MEDIUM',
        status: 'PENDING',
        dueDate: '',
      });
    }
    setErrors({});
    setFormError('');
  }, [isOpen, initialData, fixedProjectId, projects]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (formError) setFormError('');
  };

  const validate = () => {
    const newErrors = {};
    const effectiveProjectId = fixedProjectId || formData.projectId;

    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }
    if (!effectiveProjectId) {
      newErrors.projectId = 'Please select an assigned project';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setFormError('');

    const effectiveProjectId = fixedProjectId || formData.projectId;

    try {
      await onSubmit({
        ...formData,
        projectId: Number(effectiveProjectId),
      });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save task. Please try again.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {initialData ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {formError && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem', padding: '0.75rem 1rem' }}>
                <span>{formError}</span>
              </div>
            )}

            {!fixedProjectId && projects.length > 0 && !initialData && (
              <div className="form-group">
                <label className="form-label" htmlFor="task-projectId">
                  Assign to Project *
                </label>
                <select
                  id="task-projectId"
                  name="projectId"
                  className="form-control"
                  value={formData.projectId}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select an initiative...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.projectId && (
                  <span className="form-error-text">{errors.projectId}</span>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="task-name">
                Task Title *
              </label>
              <input
                type="text"
                id="task-name"
                name="name"
                className="form-control"
                placeholder="e.g. Implement OAuth Flow"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                autoFocus
              />
              {errors.name && <span className="form-error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-description">
                Description
              </label>
              <textarea
                id="task-description"
                name="description"
                className="form-control"
                rows="3"
                placeholder="Clear instructions, acceptance criteria, or notes..."
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="task-priority">
                  Urgency / Priority
                </label>
                <select
                  id="task-priority"
                  name="priority"
                  className="form-control"
                  value={formData.priority}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-status">
                  Lifecycle Status
                </label>
                <select
                  id="task-status"
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-dueDate">
                Target Due Date
              </label>
              <div className="date-input-wrapper">
                <input
                  type="date"
                  id="task-dueDate"
                  name="dueDate"
                  className="form-control date-picker-input"
                  value={formData.dueDate}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="calendar-icon-btn"
                  tabIndex={-1}
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling;
                    if (input && typeof input.showPicker === 'function') {
                      try { input.showPicker(); } catch (err) { input.focus(); }
                    } else if (input) {
                      input.focus();
                    }
                  }}
                  title="Open calendar"
                  aria-label="Open due date calendar"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="18" y2="10"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="submit-task-btn"
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#ffffff' }}></span>
                  <span>{initialData ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                initialData ? 'Save Changes' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
