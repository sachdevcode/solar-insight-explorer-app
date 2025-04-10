const pvWattsService = require('../services/pvWattsService');
const { logger } = require('../middleware/errorMiddleware');

/**
 * Get solar production estimates from PVWatts API
 * @route GET /api/solar-production
 * @access Private
 */
const getSolarProduction = async (req, res) => {
  try {
    const {
      systemCapacity,
      latitude,
      longitude,
      azimuth,
      tilt,
      arrayType,
      moduleType,
      losses,
    } = req.query;

    // Validate required parameters
    if (!systemCapacity || !latitude || !longitude) {
      res.status(400);
      throw new Error('System capacity, latitude, and longitude are required');
    }

    // Parse parameters
    const params = {
      systemCapacity: parseFloat(systemCapacity),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    // Add optional parameters if they exist
    if (azimuth) params.azimuth = parseFloat(azimuth);
    if (tilt) params.tilt = parseFloat(tilt);
    if (arrayType) params.arrayType = parseInt(arrayType, 10);
    if (moduleType) params.moduleType = parseInt(moduleType, 10);
    if (losses) params.losses = parseFloat(losses);

    // Get solar production from PVWatts API
    const solarProductionResponse = await pvWattsService.getSolarProduction(params);

    if (!solarProductionResponse.success) {
      res.status(500);
      throw new Error(solarProductionResponse.error || 'Failed to fetch solar production data');
    }

    // Format the API response
    const formattedResponse = pvWattsService.formatSolarProduction(solarProductionResponse.data);

    res.json(formattedResponse || solarProductionResponse.data);
  } catch (error) {
    logger.error(`Solar production error: ${error.message}`);
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

module.exports = {
  getSolarProduction,
}; 