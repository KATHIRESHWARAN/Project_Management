import React from 'react';

const Loading = ({ message = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          gap: '1rem',
        }}
      >
        <div className="spinner" style={{ width: '44px', height: '44px', borderWidth: '4px' }}></div>
        <p style={{ color: '#64748b', fontWeight: 500 }}>{message}</p>
      </div>
    );
  }

  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};

export default Loading;
