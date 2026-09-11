import React from 'react';
import SearchBar from './SearchBar';

const TaskFilters = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  onReset,
}) => {
  const hasActiveFilters = search || status || priority;

  return (
    <div className="toolbar-container">
      <SearchBar
        value={search}
        onChange={onSearchChange}
        placeholder="Search tasks by name..."
        id="task-search-input"
      />

      <div className="filters-group">
        <select
          id="task-filter-status"
          className="filter-select"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          id="task-filter-priority"
          className="filter-select"
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="btn btn-secondary btn-sm"
            title="Reset filters"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskFilters;
