const express = require('express');
const { getSolarPotential } = require('../controllers/solarPotentialController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route - Solar potential check doesn't require authentication
router.get('/', getSolarPotential);

// If we add more routes in the future that require authentication, we can add them like this:
// router.use(protect);
// router.get('/user-specific-data', someProtectedController);

module.exports = router; 