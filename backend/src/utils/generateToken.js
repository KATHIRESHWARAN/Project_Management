const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token for an authenticated user
 * @param {Object} user - Object containing id and email
 * @returns {string} Signed JWT token
 */
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('[Security Error] JWT_SECRET must be configured in production.');
  }
  const jwtSecret = secret || 'fallback_secret_key_change_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    jwtSecret,
    { expiresIn }
  );
};

module.exports = generateToken;
