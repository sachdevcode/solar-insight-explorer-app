const { extractTextFromPdf } = require('./pdfParser');
const {
  extractUtilityCompany,
  extractBillingPeriod,
  extractAccountNumber,
  extractTotalAmount,
  extractEnergyUsage,
  extractElectricityRate,
} = require('./imageProcessor');
const { logger } = require('../middleware/errorMiddleware');

/**
 * Parse utility bill PDF and extract all relevant data
 * @param {string} filePath - Path to utility bill PDF file
 * @returns {Promise<Object>} - Extracted data from utility bill
 */
const parseUtilityBillPdf = async (filePath) => {
  try {
    const text = await extractTextFromPdf(filePath);
    
    // Extract all relevant data using the same extraction functions as for images
    const utilityCompany = extractUtilityCompany(text);
    const billingPeriod = extractBillingPeriod(text);
    const accountNumber = extractAccountNumber(text);
    const totalAmount = extractTotalAmount(text);
    const energyUsage = extractEnergyUsage(text);
    const rate = extractElectricityRate(text);
    
    return {
      utilityCompany,
      billingPeriod,
      accountNumber,
      totalAmount,
      energyUsage,
      rate,
      rawText: text, // Include raw text for debugging if needed
    };
  } catch (error) {
    logger.error(`Utility bill PDF parsing error: ${error.message}`);
    throw new Error(`Failed to parse utility bill PDF: ${error.message}`);
  }
};

/**
 * Estimate monthly energy usage based on annual usage
 * @param {number} annualUsage - Annual energy usage in kWh
 * @returns {Object} - Monthly breakdown of energy usage
 */
const estimateMonthlyEnergyUsage = (annualUsage) => {
  if (!annualUsage) return null;

  // Monthly percentage distribution based on typical residential usage patterns
  // This is an approximation and should be adjusted based on location
  const monthlyDistribution = {
    January: 0.10, // 10% of annual usage in January (winter)
    February: 0.09,
    March: 0.08,
    April: 0.07,
    May: 0.07,
    June: 0.08, // Summer begins
    July: 0.10, // Peak summer usage
    August: 0.10, // Peak summer usage
    September: 0.08,
    October: 0.07,
    November: 0.08,
    December: 0.08,
  };

  // Calculate monthly usage based on annual usage and distribution
  const monthlyUsage = {};
  Object.entries(monthlyDistribution).forEach(([month, percentage]) => {
    monthlyUsage[month] = Math.round(annualUsage * percentage);
  });

  return monthlyUsage;
};

/**
 * Calculate projected utility bill without solar
 * @param {number} energyUsage - Energy usage in kWh
 * @param {number} rate - Electricity rate in $/kWh
 * @returns {number} - Projected bill amount in dollars
 */
const calculateUtilityBill = (energyUsage, rate) => {
  if (!energyUsage || !rate) return null;
  return parseFloat((energyUsage * rate).toFixed(2));
};

/**
 * Calculate solar offset based on energy usage and solar production
 * @param {number} energyUsage - Energy usage in kWh
 * @param {number} solarProduction - Solar production in kWh
 * @returns {number} - Solar offset percentage
 */
const calculateSolarOffset = (energyUsage, solarProduction) => {
  if (!energyUsage || !solarProduction) return null;
  const offset = Math.min((solarProduction / energyUsage) * 100, 100);
  return parseFloat(offset.toFixed(2));
};

/**
 * Calculate utility bill with solar
 * @param {number} energyUsage - Energy usage in kWh
 * @param {number} solarProduction - Solar production in kWh
 * @param {number} rate - Electricity rate in $/kWh
 * @returns {number} - Utility bill with solar in dollars
 */
const calculateUtilityBillWithSolar = (energyUsage, solarProduction, rate) => {
  if (!energyUsage || !solarProduction || !rate) return null;
  
  // Calculate remaining grid consumption after solar
  const remainingUsage = Math.max(0, energyUsage - solarProduction);
  
  // Calculate bill based on remaining usage
  return parseFloat((remainingUsage * rate).toFixed(2));
};

/**
 * Calculate projected savings with solar
 * @param {number} billWithoutSolar - Utility bill without solar
 * @param {number} billWithSolar - Utility bill with solar
 * @returns {number} - Savings in dollars
 */
const calculateSavings = (billWithoutSolar, billWithSolar) => {
  if (!billWithoutSolar || billWithSolar === null) return null;
  return parseFloat((billWithoutSolar - billWithSolar).toFixed(2));
};

module.exports = {
  parseUtilityBillPdf,
  estimateMonthlyEnergyUsage,
  calculateUtilityBill,
  calculateSolarOffset,
  calculateUtilityBillWithSolar,
  calculateSavings,
}; 