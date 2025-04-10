const express = require('express');
const { getSolarProduction } = require('../controllers/solarProductionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Get solar production estimates
router.get('/', getSolarProduction);

module.exports = router; 