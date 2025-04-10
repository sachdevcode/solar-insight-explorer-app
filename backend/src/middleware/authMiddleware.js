const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { logger } = require('./errorMiddleware');

/**
 * Middleware to protect routes that require authentication
 */
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the authorization header and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by id and exclude password
      req.user = await User.findById(decoded.id).select('-password');

      // If user not found
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      logger.error(`Authentication error: ${error.message}`);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
};

/**
 * Check if user is an admin
 */
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

module.exports = { protect, admin }; 