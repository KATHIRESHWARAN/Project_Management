const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Authentication middleware verifying Bearer JWT tokens
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
      throw new Error('[Security Error] JWT_SECRET must be configured in production.');
    }
    const jwtSecret = secret || 'fallback_secret_key_change_in_production';

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please log in again.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid or malformed authentication token.',
      });
    }

    // Verify user still exists in database
    const [rows] = await pool.query(
      'SELECT id, full_name, email, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User associated with this token no longer exists.',
      });
    }

    // Attach authenticated user information to request
    req.user = {
      id: rows[0].id,
      fullName: rows[0].full_name,
      email: rows[0].email,
      createdAt: rows[0].created_at,
    };

    next();
  } catch (error) {
    console.error('[AuthMiddleware Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication check.',
    });
  }
};

module.exports = authenticateToken;
