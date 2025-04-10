const analysisService = require('../services/analysisService');
const { logger } = require('../middleware/errorMiddleware');

/**
 * Get analysis results for a user
 * @route GET /api/results/:userId
 * @access Private
 */
const getUserResults = async (req, res) => {
  try {
    // If userId is provided as a parameter, use it (for admins), otherwise use the authenticated user's ID
    const userId = req.params.userId || req.user._id;

    // Check if the current user is requesting another user's results
    if (req.params.userId && req.params.userId !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Not authorized to access other users\' results');
    }

    // Get results for the user
    const resultsResponse = await analysisService.getUserResults(userId);

    if (!resultsResponse.success) {
      res.status(500);
      throw new Error(resultsResponse.error);
    }

    res.json(resultsResponse.results);
  } catch (error) {
    logger.error(`Get user results error: ${error.message}`);
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

/**
 * Get a specific result by ID
 * @route GET /api/results/detail/:resultId
 * @access Private
 */
const getResultById = async (req, res) => {
  try {
    const { resultId } = req.params;

    if (!resultId) {
      res.status(400);
      throw new Error('Result ID is required');
    }

    // Import the Result model directly to avoid circular dependencies
    const Result = require('../models/resultModel');

    // Find the result with populated references
    const result = await Result.findById(resultId)
      .populate('proposal')
      .populate('utilityBill')
      .populate('user', '-password');

    if (!result) {
      res.status(404);
      throw new Error('Result not found');
    }

    // Check if the user is authorized to view this result
    if (result.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Not authorized to access this result');
    }

    res.json(result);
  } catch (error) {
    logger.error(`Get result by ID error: ${error.message}`);
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

/**
 * Generate results from existing proposal and utility bill
 * @route POST /api/results/generate
 * @access Private
 */
const generateResults = async (req, res) => {
  try {
    const { proposalId, utilityBillId, location } = req.body;

    if (!proposalId || !utilityBillId) {
      res.status(400);
      throw new Error('Proposal ID and Utility Bill ID are required');
    }

    // Generate results
    const resultsResponse = await analysisService.generateResults(
      proposalId,
      utilityBillId,
      req.user._id,
      location
    );

    if (!resultsResponse.success) {
      res.status(500);
      throw new Error(resultsResponse.error);
    }

    res.status(201).json({
      message: 'Results generated successfully',
      resultId: resultsResponse.result._id,
      result: resultsResponse.result,
    });
  } catch (error) {
    logger.error(`Generate results error: ${error.message}`);
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

/**
 * Delete a result by ID
 * @route DELETE /api/results/:resultId
 * @access Private
 */
const deleteResult = async (req, res) => {
  try {
    const { resultId } = req.params;

    if (!resultId) {
      res.status(400);
      throw new Error('Result ID is required');
    }

    // Import the Result model
    const Result = require('../models/resultModel');

    // Find the result
    const result = await Result.findById(resultId);

    if (!result) {
      res.status(404);
      throw new Error('Result not found');
    }

    // Check if the user is authorized to delete this result
    if (result.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Not authorized to delete this result');
    }

    // Delete the result
    await result.remove();

    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    logger.error(`Delete result error: ${error.message}`);
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

module.exports = {
  getUserResults,
  getResultById,
  generateResults,
  deleteResult,
}; 