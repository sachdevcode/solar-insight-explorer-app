const express = require('express');
const { getSolarProduction } = require('../controllers/solarProductionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route - Solar production calculation doesn't require authentication
router.get('/', getSolarProduction);

// If we add more routes in the future that require authentication, we can add them like this:
// router.use(protect);
// router.get('/user-specific-calculations', someProtectedController);

module.exports = router; 