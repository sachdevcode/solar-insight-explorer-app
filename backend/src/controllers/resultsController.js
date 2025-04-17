const analysisService = require('../services/analysisService');
const { logger } = require('../middleware/errorMiddleware');
const openAiService = require('../services/openAiService');
const utilityBillParser = require('../utils/utilityBillParser');

/**
 * Get environmental impact data
 * @route GET /api/results/environmental-impact
 * @access Public
 */
const getEnvironmentalImpact = async (req, res) => {
  try {
    // For this demo, get the proposal analysis first to use its system size
    const systemSizes = ['8.5 kW DC', '10.2 kW DC', '12.7 kW DC', '14.8 kW DC', '16.3 kW DC'];
    const systemSize = systemSizes[Math.floor(Math.random() * systemSizes.length)];
    const kW = parseFloat(systemSize.split(' ')[0]);
    
    // Calculate estimated production (around 1300-1600 kWh per kW per year)
    const productionFactor = 1300 + Math.floor(Math.random() * 300);
    const estimatedProduction = Math.round(kW * productionFactor);
    
    // Simulate proposal data for OpenAI analysis
    const proposalData = {
      systemSize: kW,
      panelType: ['Monocrystalline', 'Polycrystalline', 'Thin Film'][Math.floor(Math.random() * 3)],
      panelWattage: [350, 375, 400, 425][Math.floor(Math.random() * 4)],
      panelQuantity: Math.round(kW * 1000 / 400), // Approximate panel count
    };

    // Try to calculate with OpenAI first
    let environmentalImpact = null;
    
    try {
      environmentalImpact = await openAiService.calculateEnvironmentalImpact(
        proposalData,
        kW,
        estimatedProduction
      );
    } catch (openAiError) {
      logger.error(`OpenAI environmental calculation failed: ${openAiError.message}`);
      // Will use fallback calculation below
    }
    
    if (!environmentalImpact) {
      // Use fallback calculations
      const carbonOffsetFactor = 680; // 680 kg/MWh is a common average
      
      // Calculate annual carbon offset (tons) - convert kWh to MWh and kg to tons
      const carbonOffsetAnnual = (estimatedProduction / 1000) * (carbonOffsetFactor / 1000);
      
      // Standard conversion factors
      const treesPerTonCO2 = 45; // Approximately 45 trees offset 1 ton of CO2 annually
      const milesPerTonCO2 = 2500; // Approximately 2500 miles driven produces 1 ton of CO2
      const lbsCoalPerKwh = 0.9; // About 0.9 lbs of coal to generate 1 kWh
      
      environmentalImpact = {
        carbonOffsetAnnual: parseFloat(carbonOffsetAnnual.toFixed(2)),
        carbonOffsetLifetime: parseFloat((carbonOffsetAnnual * 25).toFixed(2)), // 25-year lifespan
        treesPlantedEquivalent: Math.round(carbonOffsetAnnual * treesPerTonCO2),
        milesNotDrivenEquivalent: Math.round(carbonOffsetAnnual * milesPerTonCO2),
        coalNotBurnedPounds: Math.round(estimatedProduction * lbsCoalPerKwh),
        carbonOffsetFactorKgPerMwh: carbonOffsetFactor,
        estimatedProduction,
        dataSource: 'system-calculated',
        carbonCalculationExplanation: `Calculated using standard industry factors with a carbon offset factor of ${carbonOffsetFactor} kg/MWh`
      };
    }

    res.json(environmentalImpact);
  } catch (error) {
    logger.error(`Get environmental impact error: ${error.message}`);
    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

/**
 * Get random proposal analysis data
 * @route GET /api/results/proposal-analysis
 * @access Public
 */
const getProposalAnalysis = async (req, res) => {
  try {
    const proposalAnalysis = getProposalAnalysisData();
    res.json(proposalAnalysis);
  } catch (error) {
    logger.error(`Get proposal analysis error: ${error.message}`);
    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

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

/**
 * Update only specific fields in proposal analysis
 * @route PUT /api/results/proposal-analysis/update-values
 * @access Public
 */
const updateProposalAnalysisValues = async (req, res) => {
  try {
    const { estimatedProduction, newUtilityBill, monthlySavings } = req.body;

    // Validate that at least one of the required fields is provided
    if (!estimatedProduction && !newUtilityBill && !monthlySavings) {
      res.status(400);
      throw new Error('At least one field to update is required');
    }

    // Get current values first (to maintain other values)
    const currentAnalysis = await getProposalAnalysisData();
    
    // Format the values correctly
    const updatedAnalysis = {
      ...currentAnalysis,
      // Only override the specified fields
      ...(estimatedProduction && { estimatedProduction: `${parseInt(estimatedProduction).toLocaleString()} kWh` }),
      ...(newUtilityBill && { newUtilityBill: typeof newUtilityBill === 'string' ? newUtilityBill : `$${parseFloat(newUtilityBill).toFixed(2)}/month` }),
      ...(monthlySavings && { savings: typeof monthlySavings === 'string' ? monthlySavings : `$${parseFloat(monthlySavings).toFixed(2)}/month` })
    };

    res.json(updatedAnalysis);
  } catch (error) {
    logger.error(`Update proposal analysis values error: ${error.message}`);
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

/**
 * Helper function to get proposal analysis data
 * This is extracted from getProposalAnalysis to reuse the logic
 */
const getProposalAnalysisData = () => {
  // Generate random proposal analysis data (same as in getProposalAnalysis)
  const systemSizes = ['8.5 kW DC', '10.2 kW DC', '12.7 kW DC', '14.8 kW DC', '16.3 kW DC'];
  const panelTypes = ['WSMD-400, 400W', 'LG Neon-R 360W', 'SunPower A-Series 425W', 'Canadian Solar 350W', 'Panasonic EVPV 340W'];
  const systemSize = systemSizes[Math.floor(Math.random() * systemSizes.length)];
  
  // Extract the kW value from the system size string for calculations
  const kW = parseFloat(systemSize.split(' ')[0]);
  
  // Calculate panel quantity based on system size and assumed panel wattage
  const panelWattage = parseInt(panelTypes[Math.floor(Math.random() * panelTypes.length)].match(/\d+W/)[0]);
  const panelQuantity = Math.round(kW * 1000 / panelWattage);
  
  // Calculate estimated production (around 1300-1600 kWh per kW per year)
  const productionFactor = 1300 + Math.floor(Math.random() * 300);
  const estimatedProduction = `${Math.round(kW * productionFactor).toLocaleString()} kWh`;
  
  // Generate random utility bill amounts
  const oldMonthlyBill = 150 + Math.floor(Math.random() * 200); // $150-$350
  const newMonthlyBill = oldMonthlyBill * (0.2 + Math.random() * 0.3); // 20-50% of old bill
  const savings = oldMonthlyBill - newMonthlyBill;
  
  // For demonstration, randomly choose a data source
  const dataSources = ['openai', 'pattern-extraction', 'fallback-generation'];
  const dataSource = dataSources[Math.floor(Math.random() * dataSources.length)];
  
  return {
    systemSize,
    panelType: panelTypes[Math.floor(Math.random() * panelTypes.length)],
    panelQuantity,
    estimatedProduction,
    oldUtilityBill: `$${oldMonthlyBill.toFixed(2)}/month`,
    newUtilityBill: `$${newMonthlyBill.toFixed(2)}/month`,
    savings: `$${savings.toFixed(2)}/month`,
    dataSource,
    generatedFromError: dataSource === 'fallback-generation'
  };
};

/**
 * Get utility bill analysis data
 * @route GET /api/results/utility-bill-analysis
 * @access Public
 */
const getUtilityBillAnalysis = async (req, res) => {
  try {
    // Fixed energy usage - this will remain constant
    const energyUsage = '1,542 kWh/month';
    
    // Generate random values for savings
    // Average monthly utility bill between $150-$300
    const avgMonthlyBill = (150 + Math.floor(Math.random() * 150)).toFixed(2);
    
    // Calculate monthlySavings as 40-60% of the avgMonthlyBill
    const savingsPercentage = 0.4 + (Math.random() * 0.2);
    const monthlySavings = (avgMonthlyBill * savingsPercentage).toFixed(2);
    
    // Calculate yearly savings (monthly * 12)
    const yearlySavings = (parseFloat(monthlySavings) * 12).toFixed(2);
    
    // Calculate 20-year savings with 2.5% inflation per year
    let twentyYearSavings = 0;
    const annualSavings = parseFloat(yearlySavings);
    const inflationRate = 0.025;
    
    for (let year = 0; year < 20; year++) {
      twentyYearSavings += annualSavings * Math.pow(1 + inflationRate, year);
    }
    
    // Format the 20-year savings with commas and no decimal places
    const formattedTwentyYearSavings = Math.round(twentyYearSavings).toLocaleString();
    
    const utilityBillAnalysis = {
      energyUsage, // This stays constant
      savingsBreakdown: {
        monthly: `$${monthlySavings}`,
        yearly: `$${yearlySavings}`,
        twentyYear: `$${formattedTwentyYearSavings}`,
      }
    };

    res.json(utilityBillAnalysis);
  } catch (error) {
    logger.error(`Get utility bill analysis error: ${error.message}`);
    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

/**
 * Get monthly breakdown data
 * @route GET /api/results/monthly-breakdown
 * @access Public
 */
const getMonthlyBreakdown = async (req, res) => {
  try {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Generate a base production value that will be scaled for different months
    const baseProduction = 1000 + Math.floor(Math.random() * 500);
    
    // Seasonal variations - summer has more production, winter less
    const seasonalFactors = [
      0.65, 0.70, 0.85, 0.95, 1.05, 1.15,
      1.20, 1.15, 1.00, 0.85, 0.70, 0.65
    ];
    
    // Randomize a bit for each month
    const randomFactor = () => 0.95 + (Math.random() * 0.1);
    
    // Average electricity rate ($/kWh)
    const electricityRate = 0.12 + (Math.random() * 0.04);
    
    const monthlyBreakdown = months.map((month, index) => {
      // Calculate solar production with seasonal variations and some randomness
      const solarProduction = Math.round(baseProduction * seasonalFactors[index] * randomFactor());
      
      // Grid usage is generally lower in summer, higher in winter
      const gridUsageFactor = 1 - (seasonalFactors[index] * 0.5);
      const gridUsage = Math.round(200 * gridUsageFactor * randomFactor());
      
      // Calculate savings based on production and electricity rate
      const savings = Math.round(solarProduction * electricityRate);
      
      // Calculate new bill based on grid usage and electricity rate
      const newBill = Math.round(gridUsage * electricityRate);
      
      return {
        month,
        solarProduction: `${solarProduction.toLocaleString()} kWh`,
        gridUsage: `${gridUsage.toLocaleString()} kWh`,
        savings: `$${savings.toLocaleString()}`,
        newBill: `$${newBill.toLocaleString()}`
      };
    });

    res.json(monthlyBreakdown);
  } catch (error) {
    logger.error(`Get monthly breakdown error: ${error.message}`);
    res.status(500).json({
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
  getProposalAnalysis,
  getEnvironmentalImpact,
  updateProposalAnalysisValues,
  getUtilityBillAnalysis,
  getMonthlyBreakdown,
}; 