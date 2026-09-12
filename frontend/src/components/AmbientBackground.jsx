import React from 'react';

/**
 * AmbientBackground - Lightweight subtle background pattern
 * Zero GPU overhead to ensure 60fps interaction and instant responsiveness.
 */
const AmbientBackground = () => {
  return (
    <div className="ambient-canvas" aria-hidden="true">
      <div className="ambient-grid-overlay" />
    </div>
  );
};

export default AmbientBackground;
