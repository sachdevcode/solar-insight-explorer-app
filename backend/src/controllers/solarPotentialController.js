const googleSunroofService = require('../services/googleSunroofService');
const { logger } = require('../middleware/errorMiddleware');

/**
 * Get solar potential for a location
 * @route GET /api/solar-potential
 * @access Private
 */
const getSolarPotential = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    // Validate required parameters
    if (!latitude || !longitude) {
      res.status(400);
      throw new Error('Latitude and longitude are required');
    }

    // Parse latitude and longitude to numbers
    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);

    // Validate latitude and longitude values
    if (isNaN(parsedLatitude) || isNaN(parsedLongitude)) {
      res.status(400);
      throw new Error('Invalid latitude or longitude values');
    }

    // Get solar potential from Google Sunroof API
    const solarPotentialResponse = await googleSunroofService.getSolarPotential(parsedLatitude, parsedLongitude);

    // Always return a 200 response with the data, even if the service used mock data
    res.json(solarPotentialResponse.data);
  } catch (error) {
    logger.error(`Solar potential error: ${error.message}`);
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

module.exports = {
  getSolarPotential,
}; 