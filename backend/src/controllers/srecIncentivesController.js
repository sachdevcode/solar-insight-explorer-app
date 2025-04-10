const srecTradeService = require('../services/srecTradeService');
const { logger } = require('../middleware/errorMiddleware');

/**
 * Get SREC incentives for a location
 * @route GET /api/srec-incentives
 * @access Private
 */
const getSrecIncentives = async (req, res) => {
  try {
    const { state, systemCapacity, annualProduction } = req.query;

    // Validate required parameters
    if (!state) {
      res.status(400);
      throw new Error('State is required');
    }

    // Prepare parameters
    const params = {
      state: state.toUpperCase(), // Ensure state is in uppercase for consistency
    };

    // Add optional parameters if they exist
    if (systemCapacity) params.systemCapacity = parseFloat(systemCapacity);
    if (annualProduction) params.annualProduction = parseFloat(annualProduction);

    // Get SREC incentives from SREC Trade API
    const srecIncentivesResponse = await srecTradeService.getSrecIncentives(params);

    if (!srecIncentivesResponse.success) {
      res.status(500);
      throw new Error(srecIncentivesResponse.error || 'Failed to fetch SREC incentives data');
    }

    res.json(srecIncentivesResponse.data);
  } catch (error) {
    logger.error(`SREC incentives error: ${error.message}`);
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

module.exports = {
  getSrecIncentives,
}; 