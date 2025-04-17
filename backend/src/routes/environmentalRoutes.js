const express = require('express');
const { 
  getEnvironmentalImpact,
  getResultEnvironmentalImpact 
} = require('../controllers/environmentalController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route for environmental impact calculations
router.get('/', getEnvironmentalImpact);

// Protected route for result-specific environmental impact data
router.get('/results/:resultId', protect, getResultEnvironmentalImpact);

module.exports = router; 