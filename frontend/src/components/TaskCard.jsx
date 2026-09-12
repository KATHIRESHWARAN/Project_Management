import React from 'react';
import { Link } from 'react-router-dom';
import TaskCheckbox from './TaskCheckbox';

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
        opacity: isCompleted ? 0.78 : 1,
        transition: 'all 0.35s ease',
        borderLeft: `5px solid ${
          isCompleted
            ? '#10b981'
            : task.priority === 'HIGH'
            ? '#ef4444'
            : task.priority === 'MEDIUM'
            ? '#f59e0b'
            : '#0284c7'
        }`,
        boxShadow: `inset 4px 0 14px -3px ${
          isCompleted
            ? 'rgba(16, 185, 129, 0.3)'
            : task.priority === 'HIGH'
            ? 'rgba(239, 68, 68, 0.35)'
            : task.priority === 'MEDIUM'
            ? 'rgba(245, 158, 11, 0.35)'
            : 'rgba(2, 132, 199, 0.35)'
        }`,
      }}
    >
      <div className="card-header-row">
        <TaskCheckbox
          id={`task-check-${task.id}`}
          checked={isCompleted}
          onChange={toggleStatus}
          label={task.name}
          textStyle={{ fontSize: '1.05rem', fontWeight: 700 }}
        />

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
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
