import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Verify and hydrate authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);

          // Verify token validity with backend
          const res = await authService.getCurrentUser();
          if (res.data && res.data.data) {
            setUser(res.data.data);
            localStorage.setItem('user', JSON.stringify(res.data.data));
          }
        } catch (error) {
          console.warn('[Auth] Session check failed, clearing state.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const getErrorMessage = (error, fallback) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.code === 'ERR_NETWORK' || !error.response) {
      const isLocalhost = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      if (isLocalhost) {
        return 'Cannot connect to server. Please ensure the backend API is running on port 5000.';
      }
      return 'Cannot connect to backend server. Please check your network connection or verify the backend API server is online.';
    }
    return fallback;
  };

  const login = useCallback(async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const { user: loggedInUser, token: authToken } = response.data.data;

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      setUser(loggedInUser);
      setToken(authToken);

      return { success: true, data: loggedInUser };
    } catch (error) {
      const message = getErrorMessage(error, 'Login failed. Please check your credentials.');
      return { success: false, message };
    }
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    try {
      const response = await authService.register({ fullName, email, password });
      const { user: registeredUser } = response.data.data;

      // Account created successfully - do not auto-login so user explicitly signs in
      return {
        success: true,
        data: registeredUser,
        message: 'Account created successfully! Please sign in with your credentials.',
      };
    } catch (error) {
      const message = getErrorMessage(error, 'Registration failed. Please try again.');
      return { success: false, message };
    }
  }, []);

  const resetPassword = useCallback(async (email, newPassword) => {
    try {
      const response = await authService.resetPassword({ email, newPassword });
      return {
        success: true,
        message: response.data?.message || 'Password reset successfully! Please sign in with your new password.',
      };
    } catch (error) {
      const message = getErrorMessage(error, 'Password reset failed. Please try again.');
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    resetPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

