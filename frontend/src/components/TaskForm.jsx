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
  }, [isOpen, initialData, fixedProjectId]);

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
      newErrors.projectId = 'Please select a project';
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
                  <option value="">Select a project...</option>
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
                Task Name *
              </label>
              <input
                type="text"
                id="task-name"
                name="name"
                className="form-control"
                placeholder="e.g. Design Login Wireframe"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
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
                placeholder="Specific instructions or acceptance criteria..."
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="task-priority">
                  Priority
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
                  Status
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
                Due Date
              </label>
              <input
                type="date"
                id="task-dueDate"
                name="dueDate"
                className="form-control"
                value={formData.dueDate}
                onChange={handleChange}
                disabled={loading}
              />
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
              {loading ? (initialData ? 'Updating...' : 'Creating...') : initialData ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
