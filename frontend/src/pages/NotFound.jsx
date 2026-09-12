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
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
          fontWeight: 800,
          marginBottom: '1.5rem',
          boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)',
        }}
      >
        TF
      </div>

      <div style={{ fontSize: '5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.04em' }}>
        404
      </div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: '#0f172a' }}>
        Page Not Found
      </h1>
      <p style={{ color: '#64748b', maxWidth: '440px', marginTop: '0.5rem', marginBottom: '2rem', lineHeight: 1.6 }}>
        Sorry, the page or resource you are searching for does not exist, was renamed, or you may not have access permissions.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/dashboard" className="btn btn-primary" id="not-found-home-btn">
          Go to Dashboard
        </Link>
        <Link to="/" className="btn btn-secondary">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
