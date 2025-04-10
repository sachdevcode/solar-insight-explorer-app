const { createWorker } = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { logger } = require('../middleware/errorMiddleware');

/**
 * Preprocess image for better OCR results
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} - Path to the preprocessed image
 */
const preprocessImage = async (imagePath) => {
  try {
    const outputPath = path.join(
      path.dirname(imagePath),
      `preprocessed-${path.basename(imagePath)}`
    );

    // Preprocess the image for better OCR
    await sharp(imagePath)
      .greyscale() // Convert to grayscale
      .normalize() // Normalize the image
      .sharpen() // Sharpen the image
      .threshold(128) // Apply threshold to make the text stand out
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    logger.error(`Image preprocessing error: ${error.message}`);
    throw new Error(`Failed to preprocess image: ${error.message}`);
  }
};

/**
 * Extract text from an image using OCR
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} - Extracted text from the image
 */
const extractTextFromImage = async (imagePath) => {
  try {
    // Preprocess the image first
    const preprocessedPath = await preprocessImage(imagePath);
    
    // Initialize tesseract worker
    const worker = await createWorker('eng');

    // Recognize text from the image
    const { data: { text } } = await worker.recognize(preprocessedPath);

    // Terminate the worker
    await worker.terminate();

    // Clean up the preprocessed image
    if (fs.existsSync(preprocessedPath)) {
      fs.unlinkSync(preprocessedPath);
    }

    return text;
  } catch (error) {
    logger.error(`OCR error: ${error.message}`);
    throw new Error(`Failed to perform OCR: ${error.message}`);
  }
};

/**
 * Extract utility company name from OCR text
 * @param {string} text - Text extracted from utility bill
 * @returns {string|null} - Utility company name or null if not found
 */
const extractUtilityCompany = (text) => {
  try {
    // Common utility company names
    const commonUtilities = [
      'Pacific Gas and Electric', 'PG&E',
      'Southern California Edison', 'SCE',
      'San Diego Gas & Electric', 'SDG&E',
      'Duke Energy',
      'Dominion Energy',
      'Florida Power & Light', 'FPL',
      'Exelon',
      'American Electric Power', 'AEP',
      'Xcel Energy',
      'Entergy',
      'Consolidated Edison', 'ConEd',
      'FirstEnergy',
      'PPL',
      'Ameren',
      'DTE Energy',
      'CenterPoint Energy',
      'National Grid',
      'PSEG',
      'Evergy',
      'CPS Energy',
      'Austin Energy',
      'Salt River Project', 'SRP',
      'SMUD',
      'LADWP',
      'NV Energy',
    ];

    // Check if any utility name appears in the text
    for (const utility of commonUtilities) {
      if (text.includes(utility)) {
        return utility;
      }
    }

    // Try to find utility company using regex
    const utilityPattern = /([A-Z][A-Za-z&\s]+)(?:Utilities|Power|Energy|Electric)/;
    const match = text.match(utilityPattern);
    if (match && match[1]) {
      return match[1].trim();
    }

    return null;
  } catch (error) {
    logger.error(`Utility company extraction error: ${error.message}`);
    return null;
  }
};

/**
 * Extract billing period from OCR text
 * @param {string} text - Text extracted from utility bill
 * @returns {Object|null} - Billing period start and end dates or null if not found
 */
const extractBillingPeriod = (text) => {
  try {
    // Common date formats in utility bills
    const datePattern = /billing period:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})\s*(?:to|-|through)\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i;
    const match = text.match(datePattern);

    if (match && match[1] && match[2]) {
      return {
        startDate: new Date(match[1]),
        endDate: new Date(match[2]),
      };
    }

    // Alternative date formats
    const altDatePattern = /(?:from|period)?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s*(?:to|through|thru|-)\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i;
    const altMatch = text.match(altDatePattern);

    if (altMatch && altMatch[1] && altMatch[2]) {
      return {
        startDate: new Date(altMatch[1].replace(/-/g, '/')),
        endDate: new Date(altMatch[2].replace(/-/g, '/')),
      };
    }

    return null;
  } catch (error) {
    logger.error(`Billing period extraction error: ${error.message}`);
    return null;
  }
};

/**
 * Extract account number from OCR text
 * @param {string} text - Text extracted from utility bill
 * @returns {string|null} - Account number or null if not found
 */
const extractAccountNumber = (text) => {
  try {
    // Common patterns for account numbers in utility bills
    const patterns = [
      /account\s*(?:number|#|no):?\s*(\d[\d-]+\d)/i,
      /account:?\s*(\d[\d-]+\d)/i,
      /customer\s*(?:number|#|no):?\s*(\d[\d-]+\d)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  } catch (error) {
    logger.error(`Account number extraction error: ${error.message}`);
    return null;
  }
};

/**
 * Extract total bill amount from OCR text
 * @param {string} text - Text extracted from utility bill
 * @returns {number|null} - Total bill amount or null if not found
 */
const extractTotalAmount = (text) => {
  try {
    // Common patterns for total bill amount in utility bills
    const patterns = [
      /total\s*amount\s*due:?\s*\$?\s*(\d+(?:,\d+)?(?:\.\d+)?)/i,
      /amount\s*due:?\s*\$?\s*(\d+(?:,\d+)?(?:\.\d+)?)/i,
      /total:?\s*\$?\s*(\d+(?:,\d+)?(?:\.\d+)?)/i,
      /please\s*pay:?\s*\$?\s*(\d+(?:,\d+)?(?:\.\d+)?)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        // Remove commas and convert to float
        return parseFloat(match[1].replace(/,/g, ''));
      }
    }

    return null;
  } catch (error) {
    logger.error(`Total amount extraction error: ${error.message}`);
    return null;
  }
};

/**
 * Extract energy usage from OCR text
 * @param {string} text - Text extracted from utility bill
 * @returns {number|null} - Energy usage in kWh or null if not found
 */
const extractEnergyUsage = (text) => {
  try {
    // Common patterns for energy usage in utility bills
    const patterns = [
      /total\s*(?:energy|electricity)\s*usage:?\s*(\d+(?:,\d+)?)\s*kwh/i,
      /(\d+(?:,\d+)?)\s*kwh\s*(?:used|consumed|total)/i,
      /usage:?\s*(\d+(?:,\d+)?)\s*kwh/i,
      /electricity\s*used:?\s*(\d+(?:,\d+)?)\s*kwh/i,
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
    logger.error(`Energy usage extraction error: ${error.message}`);
    return null;
  }
};

/**
 * Extract electricity rate from OCR text
 * @param {string} text - Text extracted from utility bill
 * @returns {number|null} - Electricity rate in $/kWh or null if not found
 */
const extractElectricityRate = (text) => {
  try {
    // Common patterns for electricity rate in utility bills
    const patterns = [
      /rate:?\s*\$?\s*(\d+(?:\.\d+)?)\s*(?:per|\/)\s*kwh/i,
      /\$?\s*(\d+(?:\.\d+)?)\s*(?:per|\/)\s*kwh/i,
      /kwh\s*(?:costs?|rate):?\s*\$?\s*(\d+(?:\.\d+)?)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return parseFloat(match[1]);
      }
    }

    // Calculate rate from total kWh and bill amount if available
    const usage = extractEnergyUsage(text);
    const totalAmount = extractTotalAmount(text);
    if (usage && totalAmount && usage > 0) {
      return parseFloat((totalAmount / usage).toFixed(4));
    }

    return null;
  } catch (error) {
    logger.error(`Electricity rate extraction error: ${error.message}`);
    return null;
  }
};

/**
 * Parse utility bill image and extract all relevant data
 * @param {string} imagePath - Path to utility bill image
 * @returns {Promise<Object>} - Extracted data from utility bill
 */
const parseUtilityBillImage = async (imagePath) => {
  try {
    const text = await extractTextFromImage(imagePath);
    
    // Extract all relevant data
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
    logger.error(`Utility bill image parsing error: ${error.message}`);
    throw new Error(`Failed to parse utility bill image: ${error.message}`);
  }
};

module.exports = {
  preprocessImage,
  extractTextFromImage,
  parseUtilityBillImage,
  extractUtilityCompany,
  extractBillingPeriod,
  extractAccountNumber,
  extractTotalAmount,
  extractEnergyUsage,
  extractElectricityRate,
}; 