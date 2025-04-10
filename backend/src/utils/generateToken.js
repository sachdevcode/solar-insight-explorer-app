const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for user authentication
 * @param {string} id - User ID to embed in token
 * @param {number} expiresIn - Token expiration time in seconds (default: 1 hour)
 * @returns {string} JWT token
 */
const generateToken = (id, expiresIn = 3600) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: expiresIn,
  });
};

module.exports = generateToken; 