const { parseProposalPdf } = require('../utils/pdfParser');
const { parseUtilityBillPdf } = require('../utils/utilityBillParser');
const { parseUtilityBillImage } = require('../utils/imageProcessor');
const { 
  estimateMonthlyEnergyUsage,
  calculateUtilityBill,
  calculateUtilityBillWithSolar,
  calculateSavings
} = require('../utils/utilityBillParser');
const googleSunroofService = require('./googleSunroofService');
const pvWattsService = require('./pvWattsService');
const srecTradeService = require('./srecTradeService');
const { logger } = require('../middleware/errorMiddleware');

// Models
const Proposal = require('../models/proposalModel');
const UtilityBill = require('../models/utilityBillModel');
const Result = require('../models/resultModel');

/**
 * Service for analyzing solar proposal and utility bill data
 */
class AnalysisService {
  /**
   * Process a sales proposal file
   * @param {Object} proposalFile - File object from multer
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Processed proposal data
   */
  async processProposal(proposalFile, userId) {
    try {
      // Parse the proposal PDF
      const extractedData = await parseProposalPdf(proposalFile.path);
      
      // Create proposal record in database
      const proposal = await Proposal.create({
        user: userId,
        filePath: proposalFile.path,
        originalFilename: proposalFile.originalname,
        fileSize: proposalFile.size,
        mimeType: proposalFile.mimetype,
        extractedData,
        status: 'processed',
      });

      return {
        success: true,
        proposal,
      };
    } catch (error) {
      logger.error(`Proposal processing error: ${error.message}`);
      
      // Create proposal record with error status
      const proposal = await Proposal.create({
        user: userId,
        filePath: proposalFile.path,
        originalFilename: proposalFile.originalname,
        fileSize: proposalFile.size,
        mimeType: proposalFile.mimetype,
        status: 'error',
        processingErrors: [error.message],
      });

      return {
        success: false,
        error: error.message,
        proposal,
      };
    }
  }

  /**
   * Process a utility bill file
   * @param {Object} utilityBillFile - File object from multer
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Processed utility bill data
   */
  async processUtilityBill(utilityBillFile, userId) {
    try {
      let extractedData;
      const fileType = utilityBillFile.mimetype === 'application/pdf' ? 'pdf' : 'image';
      
      // Parse the utility bill based on file type
      if (fileType === 'pdf') {
        extractedData = await parseUtilityBillPdf(utilityBillFile.path);
      } else {
        extractedData = await parseUtilityBillImage(utilityBillFile.path);
      }
      
      // Create utility bill record in database
      const utilityBill = await UtilityBill.create({
        user: userId,
        filePath: utilityBillFile.path,
        originalFilename: utilityBillFile.originalname,
        fileSize: utilityBillFile.size,
        mimeType: utilityBillFile.mimetype,
        fileType,
        extractedData,
        status: 'processed',
      });

      return {
        success: true,
        utilityBill,
      };
    } catch (error) {
      logger.error(`Utility bill processing error: ${error.message}`);
      
      // Create utility bill record with error status
      const utilityBill = await UtilityBill.create({
        user: userId,
        filePath: utilityBillFile.path,
        originalFilename: utilityBillFile.originalname,
        fileSize: utilityBillFile.size,
        mimeType: utilityBillFile.mimetype,
        fileType: utilityBillFile.mimetype === 'application/pdf' ? 'pdf' : 'image',
        status: 'error',
        processingErrors: [error.message],
      });

      return {
        success: false,
        error: error.message,
        utilityBill,
      };
    }
  }

  /**
   * Generate analysis results from proposal and utility bill data
   * @param {string} proposalId - Proposal document ID
   * @param {string} utilityBillId - Utility bill document ID
   * @param {string} userId - User ID
   * @param {Object} locationData - User location data (optional)
   * @returns {Promise<Object>} - Analysis results
   */
  async generateResults(proposalId, utilityBillId, userId, locationData = null) {
    try {
      // Get proposal and utility bill data
      const proposal = await Proposal.findById(proposalId);
      const utilityBill = await UtilityBill.findById(utilityBillId);

      if (!proposal || !utilityBill) {
        throw new Error('Proposal or utility bill not found');
      }

      // Create a new result document with pending status
      const result = await Result.create({
        user: userId,
        proposal: proposalId,
        utilityBill: utilityBillId,
        status: 'pending',
      });

      // Extract necessary data for analysis
      const systemSize = proposal.extractedData.systemSize;
      const estimatedProduction = proposal.extractedData.estimatedProduction;
      const energyUsage = utilityBill.extractedData.energyUsage;
      const electricityRate = utilityBill.extractedData.rate;

      // Get location data either from input or user profile
      let coordinates = null;
      let state = null;

      if (locationData) {
        coordinates = locationData.coordinates;
        state = locationData.state;
      } else {
        // Get user to fetch location data
        const User = require('../models/userModel');
        const user = await User.findById(userId);
        if (user && user.location) {
          coordinates = user.location.coordinates;
          state = user.location.state;
        }
      }

      // Get solar potential from Google Sunroof API if coordinates are available
      let solarPotential = null;
      if (coordinates && coordinates.latitude && coordinates.longitude) {
        const sunroofResult = await googleSunroofService.getSolarPotential(
          coordinates.latitude,
          coordinates.longitude
        );
        if (sunroofResult.success) {
          solarPotential = sunroofResult.data;
        }
      }

      // Get solar production from PVWatts API if system size and coordinates are available
      let solarProduction = null;
      if (systemSize && coordinates && coordinates.latitude && coordinates.longitude) {
        const pvWattsResult = await pvWattsService.getSolarProduction({
          systemCapacity: systemSize,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        });
        if (pvWattsResult.success) {
          solarProduction = pvWattsService.formatSolarProduction(pvWattsResult.data);
        }
      }

      // Get SREC incentives if state and system size are available
      let srecIncentives = null;
      if (state && systemSize && (estimatedProduction || (solarProduction && solarProduction.annualProduction))) {
        const production = estimatedProduction || solarProduction.annualProduction;
        const srecResult = await srecTradeService.getSrecIncentives({
          state,
          systemCapacity: systemSize,
          annualProduction: production,
        });
        if (srecResult.success) {
          srecIncentives = srecResult.data;
        }
      }

      // Calculate savings based on utility bill and solar production
      let solarSavings = null;
      let monthlyBreakdown = [];

      if (energyUsage && electricityRate) {
        // Use estimated production from proposal or PVWatts
        const annualProduction = estimatedProduction || 
          (solarProduction ? solarProduction.annualProduction : null);

        if (annualProduction) {
          // Estimate monthly usage and production
          const monthlyUsage = estimateMonthlyEnergyUsage(energyUsage * 12); // Convert to annual
          const monthlyProduction = solarProduction ? 
            solarProduction.monthlyProduction : 
            estimateMonthlyEnergyUsage(annualProduction);

          // Calculate monthly breakdown
          if (monthlyUsage && monthlyProduction) {
            monthlyBreakdown = Object.keys(monthlyUsage).map(month => {
              const usage = monthlyUsage[month];
              const production = monthlyProduction[month];
              const originalBill = calculateUtilityBill(usage, electricityRate);
              const newBill = calculateUtilityBillWithSolar(usage, production, electricityRate);
              const savings = calculateSavings(originalBill, newBill);

              return {
                month,
                solarProduction: production,
                gridConsumption: Math.max(0, usage - production),
                utilityBillWithSolar: newBill,
                utilityBillWithoutSolar: originalBill,
                savings,
              };
            });
          }

          // Calculate savings metrics
          const annualBillWithoutSolar = energyUsage * 12 * electricityRate;
          const annualBillWithSolar = Math.max(0, (energyUsage * 12 - annualProduction) * electricityRate);
          const annualSavings = annualBillWithoutSolar - annualBillWithSolar;

          // Calculate 20-year savings (simple calculation, not accounting for inflation or degradation)
          const twentyYearSavings = annualSavings * 20;

          // Calculate payback period
          const systemCost = proposal.extractedData.pricing?.netCost || 0;
          const paybackPeriod = systemCost > 0 ? systemCost / annualSavings : 0;

          solarSavings = {
            monthlySavings: annualSavings / 12,
            annualSavings,
            twentyYearSavings,
            paybackPeriod,
          };
        }
      }

      // Update the result document with the analysis data
      const updatedResult = await Result.findByIdAndUpdate(
        result._id,
        {
          solarSavings,
          monthlyBreakdown,
          solarPotential: solarPotential ? {
            roofSegmentSummary: solarPotential.roofSegmentStats,
            solarPotential: solarPotential.solarPotential?.yearlyEnergyDcKwh,
            panelCapacityWatts: solarPotential.solarPotential?.panelCapacityWatts,
            carbonOffsetFactorKgPerMwh: solarPotential.solarPotential?.carbonOffsetFactorKgPerMwh,
          } : null,
          solarProduction: solarProduction ? {
            annualProduction: solarProduction.annualProduction,
            monthlyProduction: solarProduction.monthlyProduction,
            capacityFactor: solarProduction.capacityFactor,
          } : null,
          srecIncentives: srecIncentives ? {
            srecEligible: srecIncentives.srec_eligible,
            srecRate: srecIncentives.srec_rate,
            estimatedAnnualSrecValue: srecIncentives.estimated_annual_srec_value,
            srecProgramDetails: srecIncentives.srec_program_details,
          } : null,
          status: 'completed',
        },
        { new: true }
      );

      return {
        success: true,
        result: updatedResult,
      };
    } catch (error) {
      logger.error(`Results generation error: ${error.message}`);
      
      // Update result with error status if it exists
      if (arguments[0] && arguments[1] && arguments[2]) {
        await Result.findOneAndUpdate(
          { user: userId, proposal: proposalId, utilityBill: utilityBillId },
          {
            status: 'error',
            processingErrors: [error.message],
          }
        );
      }

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get analysis results for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User's analysis results
   */
  async getUserResults(userId) {
    try {
      const results = await Result.find({ user: userId })
        .populate('proposal')
        .populate('utilityBill')
        .sort({ createdAt: -1 });

      return {
        success: true,
        results,
      };
    } catch (error) {
      logger.error(`Get user results error: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new AnalysisService(); 