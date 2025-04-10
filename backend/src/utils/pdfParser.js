const pdfParse = require('pdf-parse');
const fs = require('fs');
const { logger } = require('../middleware/errorMiddleware');

/**
 * Parse PDF file and extract text content
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} - Extracted text from PDF
 */
const extractTextFromPdf = async (filePath) => {
  try {
    // Read the PDF file as a buffer
    const pdfBuffer = fs.readFileSync(filePath);
    
    // Parse the PDF
    const data = await pdfParse(pdfBuffer);
    
    return data.text;
  } catch (error) {
    logger.error(`PDF parsing error: ${error.message}`);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

/**
 * Extract system size from proposal text
 * @param {string} text - Text extracted from PDF
 * @returns {number|null} - System size in kW or null if not found
 */
const extractSystemSize = (text) => {
  try {
    // Common patterns for system size in sales proposals
    const patterns = [
      /system size[:\s]*(\d+(?:\.\d+)?)\s*kw/i,
      /(\d+(?:\.\d+)?)\s*kw\s*system/i,
      /(\d+(?:\.\d+)?)\s*kilowatt/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return parseFloat(match[1]);
      }
    }

    return null;
  } catch (error) {
    logger.error(`System size extraction error: ${error.message}`);
    return null;
  }
};

/**
 * Extract panel details from proposal text
 * @param {string} text - Text extracted from PDF
 * @returns {Object|null} - Panel details or null if not found
 */
const extractPanelDetails = (text) => {
  try {
    // Panel type pattern
    const typePattern = /([\w\d-]+)\s*(\d+W)/i;
    const typeMatch = text.match(typePattern);

    // Panel quantity pattern
    const quantityPattern = /(\d+)\s*(?:x|pcs|pieces|panels)/i;
    const quantityMatch = text.match(quantityPattern);

    if (typeMatch) {
      const result = {
        panelType: typeMatch[1],
        panelWattage: parseInt(typeMatch[2], 10) || null,
      };

      if (quantityMatch) {
        result.panelQuantity = parseInt(quantityMatch[1], 10);
      }

      return result;
    }

    return null;
  } catch (error) {
    logger.error(`Panel details extraction error: ${error.message}`);
    return null;
  }
};

/**
 * Extract estimated production from proposal text
 * @param {string} text - Text extracted from PDF
 * @returns {number|null} - Estimated annual production in kWh or null if not found
 */
const extractEstimatedProduction = (text) => {
  try {
    // Common patterns for estimated production in sales proposals
    const patterns = [
      /estimated\s*(?:annual)?\s*production[:\s]*(\d+(?:,\d+)?)\s*kwh/i,
      /(\d+(?:,\d+)?)\s*kwh\s*(?:per|\/)\s*year/i,
      /annual\s*production[:\s]*(\d+(?:,\d+)?)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        // Remove commas and convert to number
        return parseInt(match[1].replace(/,/g, ''), 10);
      }
    }

    return null;
  } catch (error) {
    logger.error(`Estimated production extraction error: ${error.message}`);
    return null;
  }
};

/**
 * Extract pricing details from proposal text
 * @param {string} text - Text extracted from PDF
 * @returns {Object|null} - Pricing details or null if not found
 */
const extractPricingDetails = (text) => {
  try {
    const pricing = {};

    // Total cost pattern
    const totalCostPattern = /total\s*(?:system)?\s*cost[:\s]*\$?(\d+(?:,\d+)?(?:\.\d+)?)/i;
    const totalCostMatch = text.match(totalCostPattern);
    if (totalCostMatch && totalCostMatch[1]) {
      pricing.totalCost = parseFloat(totalCostMatch[1].replace(/,/g, ''));
    }

    // Federal tax credit pattern
    const fedTaxPattern = /federal\s*tax\s*credit[:\s]*\$?(\d+(?:,\d+)?(?:\.\d+)?)/i;
    const fedTaxMatch = text.match(fedTaxPattern);
    if (fedTaxMatch && fedTaxMatch[1]) {
      pricing.federalTaxCredit = parseFloat(fedTaxMatch[1].replace(/,/g, ''));
    }

    // State rebates pattern
    const stateRebatePattern = /state\s*rebate[:\s]*\$?(\d+(?:,\d+)?(?:\.\d+)?)/i;
    const stateRebateMatch = text.match(stateRebatePattern);
    if (stateRebateMatch && stateRebateMatch[1]) {
      pricing.stateRebates = parseFloat(stateRebateMatch[1].replace(/,/g, ''));
    }

    // Net cost pattern
    const netCostPattern = /net\s*cost[:\s]*\$?(\d+(?:,\d+)?(?:\.\d+)?)/i;
    const netCostMatch = text.match(netCostPattern);
    if (netCostMatch && netCostMatch[1]) {
      pricing.netCost = parseFloat(netCostMatch[1].replace(/,/g, ''));
    }

    return Object.keys(pricing).length > 0 ? pricing : null;
  } catch (error) {
    logger.error(`Pricing details extraction error: ${error.message}`);
    return null;
  }
};

/**
 * Extract inverter details from proposal text
 * @param {string} text - Text extracted from PDF
 * @returns {Object|null} - Inverter details or null if not found
 */
const extractInverterDetails = (text) => {
  try {
    // Inverter type pattern
    const typePattern = /inverter[:\s]*([\w\d-]+)/i;
    const typeMatch = text.match(typePattern);

    // Inverter model pattern
    const modelPattern = /model[:\s]*([\w\d-]+)/i;
    const modelMatch = text.match(modelPattern);

    // Inverter quantity pattern
    const quantityPattern = /(\d+)\s*(?:x|pcs|pieces|inverters)/i;
    const quantityMatch = text.match(quantityPattern);

    if (typeMatch || modelMatch) {
      const result = {
        type: typeMatch ? typeMatch[1] : null,
        model: modelMatch ? modelMatch[1] : null,
      };

      if (quantityMatch) {
        result.quantity = parseInt(quantityMatch[1], 10);
      }

      return result;
    }

    return null;
  } catch (error) {
    logger.error(`Inverter details extraction error: ${error.message}`);
    return null;
  }
};

/**
 * Parse proposal PDF and extract all relevant data
 * @param {string} filePath - Path to proposal PDF file
 * @returns {Promise<Object>} - Extracted data from proposal
 */
const parseProposalPdf = async (filePath) => {
  try {
    const text = await extractTextFromPdf(filePath);
    
    // Extract all relevant data
    const systemSize = extractSystemSize(text);
    const panelDetails = extractPanelDetails(text);
    const estimatedProduction = extractEstimatedProduction(text);
    const pricingDetails = extractPricingDetails(text);
    const inverterDetails = extractInverterDetails(text);
    
    return {
      systemSize,
      ...(panelDetails || {}),
      estimatedProduction,
      inverterDetails: inverterDetails || {},
      pricing: pricingDetails || {},
      rawText: text, // Include raw text for debugging if needed
    };
  } catch (error) {
    logger.error(`Proposal parsing error: ${error.message}`);
    throw new Error(`Failed to parse proposal: ${error.message}`);
  }
};

module.exports = {
  extractTextFromPdf,
  parseProposalPdf,
  extractSystemSize,
  extractPanelDetails,
  extractEstimatedProduction,
  extractPricingDetails,
  extractInverterDetails,
}; 