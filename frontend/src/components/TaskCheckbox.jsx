import React, { useState, useEffect, useRef } from 'react';

/**
 * TaskCheckbox - Animated Completion Checkbox
 * Style & Animation adapted from Uiverse.io by MattiaCode-IT
 *
 * Staged Animation Flow:
 * 1. User ticks checkbox -> Green box pops and ripple expands
 * 2. Strikethrough line animates across the task text
 * 3. After full animation plays (~650ms), task status updates to Completed
 */
const TaskCheckbox = ({
  id,
  checked = false,
  onChange,
  label,
  subtext,
  title,
  disabled = false,
  className = '',
  style,
  textStyle,
  delayCompletionMs = 650,
}) => {
  const [localChecked, setLocalChecked] = useState(checked);
  const [isCompleting, setIsCompleting] = useState(false);
  const timerRef = useRef(null);

  // Synchronize when external checked prop changes (when not actively animating)
  useEffect(() => {
    if (!isCompleting) {
      setLocalChecked(checked);
    }
  }, [checked, isCompleting]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleChange = () => {
    if (disabled || isCompleting) return;

    if (!localChecked) {
      // 1. Tick immediately in local state to trigger checkPop & strike-out animation
      setLocalChecked(true);
      setIsCompleting(true);

      // 2. Allow staged animation to finish before updating task status:
      //    - 0-220ms: Tick pops + ripple radiates
      //    - 220-600ms: Strikethrough line sweeps across task title
      //    - 650ms: Task officially completes & moves
      timerRef.current = setTimeout(() => {
        setIsCompleting(false);
        if (onChange) {
          onChange();
        }
      }, delayCompletionMs);
    } else {
      // Unticking a completed task -> immediately revert without delay
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setLocalChecked(false);
      setIsCompleting(false);
      if (onChange) {
        onChange();
      }
    }
  };

  const tooltip = title || (localChecked ? 'Mark as Pending' : 'Mark as Completed');

  return (
    <div
      className={`checkbox-container ${isCompleting ? 'checkbox-animating-complete' : ''} ${className}`.trim()}
      style={style}
    >
      <input
        type="checkbox"
        id={id}
        className="task-checkbox"
        checked={localChecked}
        onChange={handleChange}
        disabled={disabled || isCompleting}
      />
      <label htmlFor={id} className="checkbox-label" title={tooltip}>
        <div className="checkbox-box">
          <div className="checkbox-fill"></div>
          <div className="checkmark">
            <svg viewBox="0 0 24 24" className="check-icon">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path>
            </svg>
          </div>
          <div className="success-ripple"></div>
        </div>
        {(label || subtext) && (
          <div style={{ display: 'inline-flex', flexDirection: 'column', minWidth: 0 }}>
            {label && (
              <span className="checkbox-text" style={textStyle}>
                {label}
              </span>
            )}
            {subtext && (
              <div
                className="checkbox-subtext"
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted, #64748b)',
                  maxWidth: '320px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '2px',
                  transition: 'opacity 0.3s ease 0.25s, text-decoration 0.3s ease 0.25s',
                  opacity: localChecked ? 0.6 : 1,
                  textDecoration: localChecked ? 'line-through' : 'none',
                }}
              >
                {subtext}
              </div>
            )}
          </div>
        )}
      </label>
    </div>
  );
};

export default TaskCheckbox;
