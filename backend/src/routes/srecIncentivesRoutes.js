const express = require('express');
const { getSrecIncentives } = require('../controllers/srecIncentivesController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Get SREC incentives for a location
router.get('/', getSrecIncentives);

module.exports = router; 