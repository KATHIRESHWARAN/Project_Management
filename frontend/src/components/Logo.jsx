import React from 'react';

/**
 * TaskForge Brand Logo component
 * High-resolution, vector SVG brand mark with optional gradient typography
 */
const Logo = ({
  size = 38,
  showText = true,
  textStyle = {},
  className = '',
}) => {
  return (
    <div
      className={`taskforge-logo-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        userSelect: 'none',
      }}
    >
      <div
        className="taskforge-logo-mark"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: `${Math.round(size * 0.3)}px`,
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #06b6d4 100%)',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.45)',
          flexShrink: 0,
          transition: 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        <svg
          width={Math.round(size * 0.58)}
          height={Math.round(size * 0.58)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Futuristic Hexagonal Layers / Forge mark */}
          <polygon points="12 2 2 7 12 12 22 7 12 2" fill="rgba(255, 255, 255, 0.25)" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      </div>

      {showText && (
        <span
          className="taskforge-logo-title"
          style={{
            fontWeight: 800,
            fontSize: `${Math.max(1.2, size * 0.038)}rem`,
            letterSpacing: '-0.025em',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            lineHeight: 1.1,
            ...textStyle,
          }}
        >
          <span style={{ color: 'var(--text-main, #ffffff)' }}>Task</span>
          <span
            style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Forge
          </span>
        </span>
      )}
    </div>
  );
};

export default Logo;
