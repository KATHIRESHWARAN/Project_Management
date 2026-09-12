import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import ToggleButton from '../components/ToggleButton';
import ErrorMessage from '../components/ErrorMessage';
import Logo from '../components/Logo';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { isCosmic, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    email: location.state?.registeredEmail || '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    const res = await login(formData.email, formData.password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setApiError(res.message);
    }
  };

  return (
    <div className="auth-pill-page">
      {/* Top Right Corner Theme Toggle */}
      <div className="auth-top-corner-toggle">
        <ToggleButton
          id="login-top-theme-toggle"
          checked={isCosmic}
          onChange={toggleTheme}
          title={isCosmic ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        />
      </div>

      <div className="auth-pill-container">
        {/* Brand Logo Icon */}
        <div className="auth-pill-logo">
          <Link to="/" title="TaskForge Home" style={{ display: 'inline-block' }}>
            <Logo size={46} showText={false} />
          </Link>
        </div>

        <div className="auth-pill-heading">Welcome Back</div>

        <div className="auth-pill-subtitle">
          Sign in with your credentials to access your workspace
        </div>

        {successMessage && (
          <div className="alert alert-success" role="status" style={{ borderRadius: '16px', padding: '10px 16px', fontSize: '0.85rem' }}>
            <span>{successMessage}</span>
          </div>
        )}

        {apiError && <ErrorMessage message={apiError} onDismiss={() => setApiError('')} />}

        <form onSubmit={handleSubmit} className="auth-pill-form" noValidate>
          <label className="auth-pill-label" htmlFor="login-email">
            Email Address
          </label>
          <input
            required
            className="auth-pill-input"
            type="email"
            name="email"
            id="login-email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            autoComplete="email"
            autoFocus
          />
          {errors.email && <span className="auth-pill-error">{errors.email}</span>}

          <label className="auth-pill-label" htmlFor="login-password">
            Password
          </label>
          <div className="auth-pill-input-wrapper">
            <input
              required
              className="auth-pill-input"
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="login-password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="current-password"
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

          <span className="auth-pill-forgot">
            <Link to="/forgot-password" id="link-forgot-password">
              Forgot password?
            </Link>
          </span>

          <button
            className="auth-pill-button"
            type="submit"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#ffffff' }}></span>
                <span>Signing In...</span>
              </>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        <div className="auth-pill-footer-text">
          Don't have an account yet?
          <Link to="/register" id="link-to-register">
            Create an account
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

export default Login;
