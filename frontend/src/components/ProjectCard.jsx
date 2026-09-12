import React from 'react';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project, onEdit, onDelete }) => {
  const formatStatus = (status) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'Not Started';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  const calculateProgress = () => {
    if (!project.taskCount || project.taskCount === 0) return 0;
    return Math.round(((project.completedTaskCount || 0) / project.taskCount) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="project-card" id={`project-card-${project.id}`}>
      <div className="card-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            className="project-icon-badge"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(99, 102, 241, 0.2))',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.15)',
              transform: 'translateZ(20px)',
              flexShrink: 0,
            }}
          >
            📁
          </div>
          <h3 className="card-title">
            <Link to={`/projects/${project.id}`}>{project.name}</Link>
          </h3>
        </div>

        <span className={`badge badge-status-${project.status}`}>
          {formatStatus(project.status)}
        </span>
      </div>

      <p className="card-description">
        {project.description || 'No detailed scope provided for this project.'}
      </p>

      {/* Progress Bar with Percentage */}
      <div className="progress-container">
        <div className="progress-header">
          <span>Delivery Progress</span>
          <span style={{ color: progress === 100 ? '#10b981' : '#4f46e5' }}>
            {project.completedTaskCount || 0} / {project.taskCount || 0} Tasks ({progress}%)
          </span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="card-meta-row">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span>
            🗓️ {project.startDate ? project.startDate : 'No start'} →{' '}
            {project.endDate ? project.endDate : 'Open deadline'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <Link
            to={`/projects/${project.id}`}
            className="btn btn-secondary btn-sm"
            title="Open project workspace"
          >
            Open
          </Link>
          <button
            type="button"
            onClick={() => onEdit(project)}
            className="btn btn-secondary btn-sm"
            title="Edit project"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(project)}
            className="btn btn-danger btn-sm"
            title="Delete project"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
