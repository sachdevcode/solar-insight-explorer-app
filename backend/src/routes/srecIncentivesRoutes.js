const express = require('express');
const { getSrecIncentives } = require('../controllers/srecIncentivesController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route - SREC incentives check doesn't require authentication
router.get('/', getSrecIncentives);

// If we add more routes in the future that require authentication, we can add them like this:
// router.use(protect);
// router.get('/user-specific-incentives', someProtectedController);

module.exports = router; 