const express = require('express');
const { getSolarPotential } = require('../controllers/solarPotentialController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Get solar potential for a location
router.get('/', getSolarPotential);

module.exports = router; 