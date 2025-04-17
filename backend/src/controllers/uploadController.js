const analysisService = require('../services/analysisService');
const { logger } = require('../middleware/errorMiddleware');
const { generateDocumentId } = require('../utils/pdfParser');

/**
 * Upload proposal and utility bill files
 * @route POST /api/upload
 * @access Private
 */
const uploadFiles = async (req, res) => {
  try {
    const processingId = generateDocumentId('upload');
    logger.info(`Starting document upload processing: ${processingId}`);
    
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
    
    // Generate unique document IDs for tracking through processing pipeline
    const proposalDocId = generateDocumentId('proposal');
    const utilityBillDocId = generateDocumentId('utility');
    
    logger.info(`Processing proposal (${proposalDocId}): ${proposalFile[0].originalname}, size: ${(proposalFile[0].size / 1024).toFixed(2)}KB`);
    logger.info(`Processing utility bill (${utilityBillDocId}): ${utilityBillFile[0].originalname}, size: ${(utilityBillFile[0].size / 1024).toFixed(2)}KB`);

    // Process the proposal file with document ID
    const proposalResult = await analysisService.processProposal(
      proposalFile[0], 
      req.user._id,
      proposalDocId
    );

    // Process the utility bill file with document ID
    const utilityBillResult = await analysisService.processUtilityBill(
      utilityBillFile[0], 
      req.user._id,
      utilityBillDocId
    );

    // Check if both processes were successful
    if (!proposalResult.success || !utilityBillResult.success) {
      logger.warn(`Partial processing success: proposal=${proposalResult.success}, utilityBill=${utilityBillResult.success}`);
      // Return partial success with error details
      return res.status(207).json({
        message: 'Files uploaded but processing had errors',
        processingId,
        proposalResult,
        utilityBillResult,
      });
    }

    // Generate analysis results with document IDs
    const analysisId = generateDocumentId('analysis');
    logger.info(`Generating analysis results: ${analysisId}, proposal=${proposalDocId}, utilityBill=${utilityBillDocId}`);
    
    const analysisResult = await analysisService.generateResults(
      proposalResult.proposal._id,
      utilityBillResult.utilityBill._id,
      req.user._id,
      req.body.location, // Optional location data from request
      analysisId
    );

    // Return success response with file IDs
    res.status(200).json({
      message: 'Files uploaded and processed successfully',
      processingId,
      proposalId: proposalResult.proposal._id,
      utilityBillId: utilityBillResult.utilityBill._id,
      resultId: analysisResult.success ? analysisResult.result._id : null,
      analysisStatus: analysisResult.success ? 'completed' : 'pending',
      documentIds: {
        proposal: proposalDocId,
        utilityBill: utilityBillDocId,
        analysis: analysisId
      }
    });
    
    logger.info(`Document upload processing completed: ${processingId}`);
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
    const proposalDocId = generateDocumentId('proposal');
    logger.info(`Processing single proposal upload: ${proposalDocId}`);
    
    // Check if file was uploaded
    if (!req.file) {
      res.status(400);
      throw new Error('No file was uploaded');
    }
    
    logger.info(`Processing proposal (${proposalDocId}): ${req.file.originalname}, size: ${(req.file.size / 1024).toFixed(2)}KB`);

    // Process the proposal file with document ID
    const proposalResult = await analysisService.processProposal(
      req.file, 
      req.user._id,
      proposalDocId
    );

    if (!proposalResult.success) {
      res.status(422);
      throw new Error(`Error processing proposal: ${proposalResult.error}`);
    }

    // Return success response
    res.status(200).json({
      message: 'Proposal uploaded and processed successfully',
      proposalId: proposalResult.proposal._id,
      proposal: proposalResult.proposal,
      documentId: proposalDocId
    });
    
    logger.info(`Proposal upload processing completed: ${proposalDocId}`);
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
    const utilityBillDocId = generateDocumentId('utility');
    logger.info(`Processing single utility bill upload: ${utilityBillDocId}`);
    
    // Check if file was uploaded
    if (!req.file) {
      res.status(400);
      throw new Error('No file was uploaded');
    }
    
    logger.info(`Processing utility bill (${utilityBillDocId}): ${req.file.originalname}, size: ${(req.file.size / 1024).toFixed(2)}KB`);

    // Process the utility bill file with document ID
    const utilityBillResult = await analysisService.processUtilityBill(
      req.file, 
      req.user._id,
      utilityBillDocId
    );

    if (!utilityBillResult.success) {
      res.status(422);
      throw new Error(`Error processing utility bill: ${utilityBillResult.error}`);
    }

    // Return success response
    res.status(200).json({
      message: 'Utility bill uploaded and processed successfully',
      utilityBillId: utilityBillResult.utilityBill._id,
      utilityBill: utilityBillResult.utilityBill,
      documentId: utilityBillDocId
    });
    
    logger.info(`Utility bill upload processing completed: ${utilityBillDocId}`);
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