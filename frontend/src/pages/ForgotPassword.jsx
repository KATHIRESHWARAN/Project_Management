import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ErrorMessage from '../components/ErrorMessage';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    const res = await resetPassword(formData.email, formData.newPassword);
    setLoading(false);

    if (res.success) {
      navigate('/login', {
        state: {
          successMessage: res.message || 'Password reset successfully! Please sign in with your new password.',
          registeredEmail: formData.email,
        },
      });
    } else {
      setApiError(res.message);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="sidebar-logo-icon" style={{ width: '42px', height: '42px', fontSize: '1.25rem' }}>
              TF
            </div>
            <span className="sidebar-logo-text" style={{ color: '#0f172a', fontSize: '1.5rem' }}>
              TaskForge
            </span>
          </div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter your registered email and choose a new password</p>
        </div>

        {apiError && <ErrorMessage message={apiError} onDismiss={() => setApiError('')} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reset-email">
              Email Address *
            </label>
            <input
              type="email"
              id="reset-email"
              name="email"
              className="form-control"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && <span className="form-error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reset-newPassword">
              New Password (min 6 characters) *
            </label>
            <input
              type="password"
              id="reset-newPassword"
              name="newPassword"
              className="form-control"
              placeholder="••••••••"
              value={formData.newPassword}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.newPassword && <span className="form-error-text">{errors.newPassword}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reset-confirmPassword">
              Confirm New Password *
            </label>
            <input
              type="password"
              id="reset-confirmPassword"
              name="confirmPassword"
              className="form-control"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <span className="form-error-text">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            disabled={loading}
            id="reset-password-submit-btn"
          >
            {loading ? 'Resetting password...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          Remembered your password?{' '}
          <Link to="/login" style={{ fontWeight: 600 }} id="link-back-to-login">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
