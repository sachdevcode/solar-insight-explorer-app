const express = require('express');
const {
  getUserResults,
  getResultById,
  generateResults,
  deleteResult,
} = require('../controllers/resultsController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes - all results routes require authentication
router.use(protect);

// Get user's own results
router.get('/', getUserResults);

// Get results for a specific user (admin only)
router.get('/user/:userId', admin, getUserResults);

// Get a specific result by ID
router.get('/detail/:resultId', getResultById);

// Generate results from existing proposal and utility bill
router.post('/generate', generateResults);

// Delete a result
router.delete('/:resultId', deleteResult);

module.exports = router; 