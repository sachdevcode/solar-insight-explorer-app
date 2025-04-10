const analysisService = require('../services/analysisService');
const { logger } = require('../middleware/errorMiddleware');

/**
 * Upload proposal and utility bill files
 * @route POST /api/upload
 * @access Private
 */
const uploadFiles = async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      res.status(400);
      throw new Error('No files were uploaded');
    }

    const { proposalFile, utilityBillFile } = req.files;

    // Validate required files
    if (!proposalFile) {
      res.status(400);
      throw new Error('Sales proposal file is required');
    }

    if (!utilityBillFile) {
      res.status(400);
      throw new Error('Utility bill file is required');
    }

    // Process the proposal file
    const proposalResult = await analysisService.processProposal(proposalFile, req.user._id);

    // Process the utility bill file
    const utilityBillResult = await analysisService.processUtilityBill(utilityBillFile, req.user._id);

    // Check if both processes were successful
    if (!proposalResult.success || !utilityBillResult.success) {
      // Return partial success with error details
      return res.status(207).json({
        message: 'Files uploaded but processing had errors',
        proposalResult,
        utilityBillResult,
      });
    }

    // Generate analysis results
    const analysisResult = await analysisService.generateResults(
      proposalResult.proposal._id,
      utilityBillResult.utilityBill._id,
      req.user._id,
      req.body.location // Optional location data from request
    );

    // Return success response with file IDs
    res.status(200).json({
      message: 'Files uploaded and processed successfully',
      proposalId: proposalResult.proposal._id,
      utilityBillId: utilityBillResult.utilityBill._id,
      resultId: analysisResult.success ? analysisResult.result._id : null,
      analysisStatus: analysisResult.success ? 'completed' : 'pending',
    });
  } catch (error) {
    logger.error(`File upload error: ${error.message}`);
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

/**
 * Upload only a proposal file
 * @route POST /api/upload/proposal
 * @access Private
 */
const uploadProposal = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      res.status(400);
      throw new Error('No file was uploaded');
    }

    // Process the proposal file
    const proposalResult = await analysisService.processProposal(req.file, req.user._id);

    if (!proposalResult.success) {
      res.status(422);
      throw new Error(`Error processing proposal: ${proposalResult.error}`);
    }

    // Return success response
    res.status(200).json({
      message: 'Proposal uploaded and processed successfully',
      proposalId: proposalResult.proposal._id,
      proposal: proposalResult.proposal,
    });
  } catch (error) {
    logger.error(`Proposal upload error: ${error.message}`);
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

/**
 * Upload only a utility bill file
 * @route POST /api/upload/utility-bill
 * @access Private
 */
const uploadUtilityBill = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      res.status(400);
      throw new Error('No file was uploaded');
    }

    // Process the utility bill file
    const utilityBillResult = await analysisService.processUtilityBill(req.file, req.user._id);

    if (!utilityBillResult.success) {
      res.status(422);
      throw new Error(`Error processing utility bill: ${utilityBillResult.error}`);
    }

    // Return success response
    res.status(200).json({
      message: 'Utility bill uploaded and processed successfully',
      utilityBillId: utilityBillResult.utilityBill._id,
      utilityBill: utilityBillResult.utilityBill,
    });
  } catch (error) {
    logger.error(`Utility bill upload error: ${error.message}`);
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

module.exports = {
  uploadFiles,
  uploadProposal,
  uploadUtilityBill,
}; 