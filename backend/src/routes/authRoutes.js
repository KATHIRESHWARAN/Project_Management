const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, logout, getMe, resetPassword } = require('../controllers/authController');
const { registerValidator, loginValidator, resetPasswordValidator } = require('../validators/authValidator');
const validate = require('../middleware/validateMiddleware');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Strict rate limiter for authentication routes (prevents brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

// POST /api/auth/register
router.post('/register', authLimiter, registerValidator, validate, register);

// POST /api/auth/login
router.post('/login', authLimiter, loginValidator, validate, login);

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, resetPasswordValidator, validate, resetPassword);

// POST /api/auth/logout (Protected)
router.post('/logout', authenticateToken, logout);

// GET /api/auth/me (Protected)
router.get('/me', authenticateToken, getMe);

module.exports = router;
