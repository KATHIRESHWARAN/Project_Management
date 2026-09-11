import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ fontSize: '5rem', fontWeight: 900, color: '#4f46e5', lineHeight: 1 }}>
        404
      </div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '1rem', color: '#0f172a' }}>
        Page Not Found
      </h1>
      <p style={{ color: '#64748b', maxWidth: '420px', marginTop: '0.5rem', marginBottom: '2rem' }}>
        Sorry, the page or resource you are searching for does not exist or has been moved.
      </p>
      <Link to="/dashboard" className="btn btn-primary" id="not-found-home-btn">
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
