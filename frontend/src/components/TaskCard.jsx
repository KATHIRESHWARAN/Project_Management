import React from 'react';
import { Link } from 'react-router-dom';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const [localStatus, setLocalStatus] = React.useState(task.status);

  React.useEffect(() => {
    setLocalStatus(task.status);
  }, [task.status]);

  const isCompleted = localStatus === 'COMPLETED';

  const formatPriority = (p) => {
    switch (p) {
      case 'LOW':
        return 'Low Priority';
      case 'MEDIUM':
        return 'Medium Priority';
      case 'HIGH':
        return 'High Priority';
      default:
        return p;
    }
  };

  const formatStatus = (s) => {
    switch (s) {
      case 'PENDING':
        return 'Pending';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      default:
        return s;
    }
  };

  const toggleStatus = () => {
    const nextStatus = isCompleted ? 'PENDING' : 'COMPLETED';
    setLocalStatus(nextStatus);
    onStatusChange(task, nextStatus);
  };

  return (
    <div
      className="task-card"
      id={`task-card-${task.id}`}
      style={{
        opacity: isCompleted ? 0.8 : 1,
        borderLeft: `5px solid ${
          task.priority === 'HIGH'
            ? '#ef4444'
            : task.priority === 'MEDIUM'
            ? '#f59e0b'
            : '#0284c7'
        }`,
        boxShadow: `inset 4px 0 14px -3px ${
          task.priority === 'HIGH'
            ? 'rgba(239, 68, 68, 0.35)'
            : task.priority === 'MEDIUM'
            ? 'rgba(245, 158, 11, 0.35)'
            : 'rgba(2, 132, 199, 0.35)'
        }`,
      }}
    >
      <div className="card-header-row">
        <div className="checkbox-container">
          <input
            type="checkbox"
            id={`task-check-${task.id}`}
            className="task-checkbox"
            checked={isCompleted}
            onChange={toggleStatus}
          />
          <label
            htmlFor={`task-check-${task.id}`}
            className="checkbox-label"
            title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
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
            <span className="checkbox-text" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              {task.name}
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className={`badge badge-priority-${task.priority}`}>
            {formatPriority(task.priority)}
          </span>
          <span className={`badge badge-status-${localStatus}`}>
            {formatStatus(localStatus)}
          </span>
        </div>
      </div>

      <p
        className="card-description"
        style={{
          textDecoration: isCompleted ? 'line-through' : 'none',
          color: isCompleted ? '#94a3b8' : 'inherit',
        }}
      >
        {task.description || 'No detailed instructions provided.'}
      </p>

      <div className="card-meta-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span>📅 Due: {task.dueDate || 'No due date'}</span>
          {task.projectName && (
            <Link
              to={`/projects/${task.projectId}`}
              style={{ color: '#4f46e5', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              📁 {task.projectName}
            </Link>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="btn btn-secondary btn-sm"
            title="Edit task"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="btn btn-danger btn-sm"
            title="Delete task"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
