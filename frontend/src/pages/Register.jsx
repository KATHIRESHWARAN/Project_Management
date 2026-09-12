import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import ToggleButton from '../components/ToggleButton';
import ErrorMessage from '../components/ErrorMessage';

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const { isCosmic, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
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

    const res = await register(formData.fullName, formData.email, formData.password);
    setLoading(false);

    if (res.success) {
      navigate('/login', {
        state: {
          successMessage: 'Account created successfully! Please sign in with your email and password.',
          registeredEmail: formData.email,
        },
      });
    } else {
      setApiError(res.message);
    }
  };

  return (
    <div className="auth-pill-page">
      {/* Top Right Corner Theme Toggle */}
      <div className="auth-top-corner-toggle">
        <ToggleButton
          id="register-top-theme-toggle"
          checked={isCosmic}
          onChange={toggleTheme}
          title={isCosmic ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        />
      </div>

      <div className="auth-pill-container" style={{ maxWidth: '430px' }}>
        {/* Brand Logo Icon */}
        <div className="auth-pill-logo">
          <Link to="/" title="TaskForge Home">
            <div className="sidebar-logo-icon" style={{ width: '42px', height: '42px', borderRadius: '14px', fontSize: '1.2rem' }}>
              TF
            </div>
          </Link>
        </div>

        <div className="auth-pill-heading">Create Account</div>

        <div className="auth-pill-subtitle">
          Start organizing your projects and workflows today
        </div>

        {apiError && <ErrorMessage message={apiError} onDismiss={() => setApiError('')} />}

        <form onSubmit={handleSubmit} className="auth-pill-form" noValidate>
          <label className="auth-pill-label" htmlFor="register-fullName">
            Full Name
          </label>
          <input
            required
            className="auth-pill-input"
            type="text"
            name="fullName"
            id="register-fullName"
            placeholder="e.g. Alex Morgan"
            value={formData.fullName}
            onChange={handleChange}
            disabled={loading}
            autoComplete="name"
            autoFocus
          />
          {errors.fullName && <span className="auth-pill-error">{errors.fullName}</span>}

          <label className="auth-pill-label" htmlFor="register-email">
            Email Address
          </label>
          <input
            required
            className="auth-pill-input"
            type="email"
            name="email"
            id="register-email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            autoComplete="email"
          />
          {errors.email && <span className="auth-pill-error">{errors.email}</span>}

          <label className="auth-pill-label" htmlFor="register-password">
            Password (min 6 characters)
          </label>
          <div className="auth-pill-input-wrapper">
            <input
              required
              className="auth-pill-input"
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="register-password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-pill-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
          {errors.password && <span className="auth-pill-error">{errors.password}</span>}

          <label className="auth-pill-label" htmlFor="register-confirmPassword">
            Confirm Password
          </label>
          <div className="auth-pill-input-wrapper">
            <input
              required
              className="auth-pill-input"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              id="register-confirmPassword"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-pill-toggle-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="auth-pill-error">{errors.confirmPassword}</span>
          )}

          <button
            className="auth-pill-button"
            type="submit"
            disabled={loading}
            id="register-submit-btn"
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#ffffff' }}></span>
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-pill-footer-text">
          Already have an account?
          <Link to="/login" id="link-to-login">
            Sign In
          </Link>
        </div>

        <span className="auth-pill-agreement">
          <a href="#">Learn user licence agreement</a>
        </span>

        <div className="auth-pill-home-link">
          <Link to="/">
            ← Return to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
