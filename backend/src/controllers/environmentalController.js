const openAiService = require('../services/openAiService');
const googleSunroofService = require('../services/googleSunroofService');
const pvWattsService = require('../services/pvWattsService');
const { logger } = require('../middleware/errorMiddleware');
const Result = require('../models/resultModel');
const Proposal = require('../models/proposalModel');

/**
 * Get environmental impact data based on system size and estimated production
 * @route GET /api/environmental-impact
 * @access Public
 */
const getEnvironmentalImpact = async (req, res) => {
  try {
    const { systemSize, estimatedProduction, latitude, longitude } = req.query;

    // Validate required parameters
    if (!systemSize) {
      res.status(400);
      throw new Error('System size is required');
    }

    const parsedSystemSize = parseFloat(systemSize);
    const parsedEstimatedProduction = estimatedProduction ? parseFloat(estimatedProduction) : null;

    if (isNaN(parsedSystemSize)) {
      res.status(400);
      throw new Error('Invalid system size value');
    }

    // For parsing potential coordinates
    let parsedLatitude = null;
    let parsedLongitude = null;
    
    if (latitude && longitude) {
      parsedLatitude = parseFloat(latitude);
      parsedLongitude = parseFloat(longitude);
      
      if (isNaN(parsedLatitude) || isNaN(parsedLongitude)) {
        logger.warn('Invalid coordinates provided for environmental impact calculation');
        // Don't throw error, just log warning and proceed without coordinates
      }
    }

    // Determine estimated production if not provided
    let finalEstimatedProduction = parsedEstimatedProduction;
    if (!finalEstimatedProduction) {
      // If we have coordinates, try to get production from PVWatts
      if (parsedLatitude && parsedLongitude) {
        try {
          const pvWattsResponse = await pvWattsService.getSolarProduction({
            systemCapacity: parsedSystemSize,
            latitude: parsedLatitude,
            longitude: parsedLongitude
          });
          
          if (pvWattsResponse.success && pvWattsResponse.data?.outputs?.ac_annual) {
            finalEstimatedProduction = pvWattsResponse.data.outputs.ac_annual;
          }
        } catch (pvError) {
          logger.error(`PVWatts error in environmental calculation: ${pvError.message}`);
          // Continue with fallback calculation
        }
      }
      
      // If still no production estimate, use a default multiplier
      if (!finalEstimatedProduction) {
        // Typical solar production is roughly 1200-1600 kWh per kW per year
        finalEstimatedProduction = parsedSystemSize * 1400;
      }
    }

    // Try to get carbon offset factor from Google Sunroof first
    let carbonOffsetFactorKgPerMwh = null;
    if (parsedLatitude && parsedLongitude) {
      try {
        const sunroofResponse = await googleSunroofService.getSolarPotential(
          parsedLatitude,
          parsedLongitude
        );
        
        if (sunroofResponse.success && 
            sunroofResponse.data?.solarPotential?.carbonOffsetFactorKgPerMwh) {
          carbonOffsetFactorKgPerMwh = sunroofResponse.data.solarPotential.carbonOffsetFactorKgPerMwh;
        }
      } catch (sunroofError) {
        logger.error(`Sunroof error in environmental calculation: ${sunroofError.message}`);
        // Continue with OpenAI calculation
      }
    }

    // Get mock data for proposal to send to OpenAI
    const proposalDataForOpenAI = {
      systemSize: parsedSystemSize,
      // Include dummy data to ensure OpenAI has something to work with
      panelType: "Standard Monocrystalline",
      panelWattage: 400,
      panelQuantity: Math.ceil(parsedSystemSize * 1000 / 400), // Approximate panel count
    };

    // Try to calculate with OpenAI
    const openAiEnvironmentalData = await openAiService.calculateEnvironmentalImpact(
      proposalDataForOpenAI,
      parsedSystemSize,
      finalEstimatedProduction
    );

    // Prepare the response
    let environmentalImpact;

    if (openAiEnvironmentalData) {
      // Use OpenAI-calculated data
      environmentalImpact = {
        ...openAiEnvironmentalData,
        estimatedProduction: finalEstimatedProduction,
      };
    } else {
      // Use fallback calculations if OpenAI failed
      // Use the carbon offset factor from Sunroof or a default value
      const finalCarbonOffsetFactor = carbonOffsetFactorKgPerMwh || 680; // 680 kg/MWh is a common average
      
      // Calculate annual carbon offset (tons) - convert kWh to MWh and kg to tons
      const carbonOffsetAnnual = (finalEstimatedProduction / 1000) * (finalCarbonOffsetFactor / 1000);
      
      // Standard conversion factors
      const treesPerTonCO2 = 45; // Approximately 45 trees offset 1 ton of CO2 annually
      const milesPerTonCO2 = 2500; // Approximately 2500 miles driven produces 1 ton of CO2
      const lbsCoalPerKwh = 0.9; // About 0.9 lbs of coal to generate 1 kWh
      
      environmentalImpact = {
        carbonOffsetAnnual: parseFloat(carbonOffsetAnnual.toFixed(2)),
        carbonOffsetLifetime: parseFloat((carbonOffsetAnnual * 25).toFixed(2)), // 25-year lifespan
        treesPlantedEquivalent: Math.round(carbonOffsetAnnual * treesPerTonCO2),
        milesNotDrivenEquivalent: Math.round(carbonOffsetAnnual * milesPerTonCO2),
        coalNotBurnedPounds: Math.round(finalEstimatedProduction * lbsCoalPerKwh),
        carbonOffsetFactorKgPerMwh: finalCarbonOffsetFactor,
        dataSource: 'system-calculated',
        carbonCalculationExplanation: `Calculated using standard industry factors with a carbon offset factor of ${finalCarbonOffsetFactor} kg/MWh`
      };
    }

    // Return the environmental impact data
    res.status(200).json(environmentalImpact);
  } catch (error) {
    logger.error(`Environmental impact calculation error: ${error.message}`);
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

/**
 * Get environmental impact data for a specific analysis result
 * @route GET /api/results/:resultId/environmental-impact
 * @access Private
 */
const getResultEnvironmentalImpact = async (req, res) => {
  try {
    const { resultId } = req.params;

    // Validate the result ID
    if (!resultId) {
      res.status(400);
      throw new Error('Result ID is required');
    }

    // Find the result in the database
    const result = await Result.findById(resultId).populate('proposal');
    
    if (!result) {
      res.status(404);
      throw new Error('Result not found');
    }

    // Check if the result already has environmental impact data
    if (result.environmentalImpact) {
      return res.status(200).json(result.environmentalImpact);
    }

    // If not, generate environmental impact data
    const proposal = await Proposal.findById(result.proposal);
    
    if (!proposal) {
      res.status(404);
      throw new Error('Proposal not found');
    }

    const systemSize = proposal.extractedData.systemSize;
    const estimatedProduction = proposal.extractedData.estimatedProduction;

    if (!systemSize) {
      res.status(400);
      throw new Error('System size not found in proposal data');
    }

    // Calculate environmental impact
    const openAiEnvironmentalData = await openAiService.calculateEnvironmentalImpact(
      proposal.extractedData,
      systemSize,
      estimatedProduction || systemSize * 1400
    );

    let environmentalImpact;

    if (openAiEnvironmentalData) {
      // Use OpenAI-calculated data
      environmentalImpact = {
        ...openAiEnvironmentalData,
        estimatedProduction: estimatedProduction || systemSize * 1400,
      };
    } else {
      // Use fallback calculations
      const carbonOffsetFactor = 680; // 680 kg/MWh is a common average
      const finalEstimatedProduction = estimatedProduction || systemSize * 1400;
      
      // Calculate annual carbon offset (tons) - convert kWh to MWh and kg to tons
      const carbonOffsetAnnual = (finalEstimatedProduction / 1000) * (carbonOffsetFactor / 1000);
      
      // Standard conversion factors
      const treesPerTonCO2 = 45; // Approximately 45 trees offset 1 ton of CO2 annually
      const milesPerTonCO2 = 2500; // Approximately 2500 miles driven produces 1 ton of CO2
      const lbsCoalPerKwh = 0.9; // About 0.9 lbs of coal to generate 1 kWh
      
      environmentalImpact = {
        carbonOffsetAnnual: parseFloat(carbonOffsetAnnual.toFixed(2)),
        carbonOffsetLifetime: parseFloat((carbonOffsetAnnual * 25).toFixed(2)), // 25-year lifespan
        treesPlantedEquivalent: Math.round(carbonOffsetAnnual * treesPerTonCO2),
        milesNotDrivenEquivalent: Math.round(carbonOffsetAnnual * milesPerTonCO2),
        coalNotBurnedPounds: Math.round(finalEstimatedProduction * lbsCoalPerKwh),
        carbonOffsetFactorKgPerMwh: carbonOffsetFactor,
        dataSource: 'system-calculated',
        carbonCalculationExplanation: `Calculated using standard industry factors with a carbon offset factor of ${carbonOffsetFactor} kg/MWh`
      };
    }

    // Update the result with the calculated environmental impact
    await Result.findByIdAndUpdate(
      resultId,
      { environmentalImpact },
      { new: true }
    );

    // Return the environmental impact data
    res.status(200).json(environmentalImpact);
  } catch (error) {
    logger.error(`Result environmental impact calculation error: ${error.message}`);
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

module.exports = {
  getEnvironmentalImpact,
  getResultEnvironmentalImpact
}; 