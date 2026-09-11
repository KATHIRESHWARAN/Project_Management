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
        <h3 className="card-title">
          <Link to={`/projects/${project.id}`}>{project.name}</Link>
        </h3>
        <span className={`badge badge-status-${project.status}`}>
          {formatStatus(project.status)}
        </span>
      </div>

      <p className="card-description">
        {project.description || 'No description provided.'}
      </p>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-header">
          <span>Progress</span>
          <span>
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
            {project.endDate ? project.endDate : 'No deadline'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <Link
            to={`/projects/${project.id}`}
            className="btn btn-secondary btn-sm"
            title="View project tasks and details"
          >
            View
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
