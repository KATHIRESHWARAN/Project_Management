import React from 'react';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const isCompleted = task.status === 'COMPLETED';

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
    onStatusChange(task, nextStatus);
  };

  return (
    <div
      className="task-card"
      id={`task-card-${task.id}`}
      style={{
        opacity: isCompleted ? 0.85 : 1,
        borderLeft: `4px solid ${
          task.priority === 'HIGH'
            ? '#ef4444'
            : task.priority === 'MEDIUM'
            ? '#f59e0b'
            : '#38bdf8'
        }`,
      }}
    >
      <div className="card-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={toggleStatus}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              border: `2px solid ${isCompleted ? '#10b981' : '#cbd5e1'}`,
              backgroundColor: isCompleted ? '#10b981' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              flexShrink: 0,
            }}
            title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
            aria-label="Toggle task completion"
          >
            {isCompleted && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </button>
          <h4
            className="card-title"
            style={{
              textDecoration: isCompleted ? 'line-through' : 'none',
              color: isCompleted ? '#64748b' : 'inherit',
              fontSize: '1.05rem',
            }}
          >
            {task.name}
          </h4>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className={`badge badge-priority-${task.priority}`}>
            {formatPriority(task.priority)}
          </span>
          <span className={`badge badge-status-${task.status}`}>
            {formatStatus(task.status)}
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
            <span style={{ color: '#6366f1', fontWeight: 500 }}>
              📁 {task.projectName}
            </span>
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
