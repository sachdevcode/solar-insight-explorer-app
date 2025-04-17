const { OpenAI } = require('openai');
const { logger } = require('../middleware/errorMiddleware');
const fs = require('fs');
const path = require('path');

/**
 * Service for interacting with OpenAI API for document processing
 */
class OpenAiService {
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Create AI extraction logs subdirectory
    this.aiExtractionsDir = path.join(logsDir, 'ai-extractions');
    if (!fs.existsSync(this.aiExtractionsDir)) {
      fs.mkdirSync(this.aiExtractionsDir, { recursive: true });
    }
    
    if (!apiKey || apiKey === 'your_openai_api_key') {
      this.isConfigured = false;
      logger.warn('OpenAI API key is not configured or is using the default value');
    } else {
      this.isConfigured = true;
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
    }
  }

  /**
   * Save document extraction data to log file
   * @param {string} documentType - Type of document (proposal, utilityBill)
   * @param {string} extractionType - Type of extraction (text, data)
   * @param {any} data - Data to log
   * @param {string} [documentId] - Optional document ID
   */
  logExtraction(documentType, extractionType, data, documentId = null) {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const id = documentId || `doc_${Math.random().toString(36).substring(2, 10)}`;
      const fileName = `${timestamp}_${documentType}_${extractionType}_${id}.json`;
      const filePath = path.join(this.aiExtractionsDir, fileName);
      
      const logData = {
        timestamp: new Date().toISOString(),
        documentType,
        extractionType,
        documentId: id,
        data
      };
      
      fs.writeFileSync(filePath, JSON.stringify(logData, null, 2));
      logger.info(`AI extraction logged: ${documentType} ${extractionType}, file: ${fileName}`);
    } catch (error) {
      logger.error(`Failed to log extraction: ${error.message}`);
    }
  }

  /**
   * Extract data from solar proposal using OpenAI
   * @param {string} pdfText - Text extracted from solar proposal PDF
   * @param {string} [documentId] - Optional document ID for logging
   * @returns {Promise<Object|null>} - Extracted data or null if failed
   */
  async extractProposalData(pdfText, documentId = null) {
    try {
      if (!this.isConfigured) {
        logger.info('OpenAI not configured, skipping proposal data extraction');
        return null;
      }

      // Generate document ID if not provided
      const docId = documentId || `prop_${Math.random().toString(36).substring(2, 10)}`;
      
      // Log the raw text extracted from the PDF
      this.logExtraction('proposal', 'raw_text', {
        textLength: pdfText.length,
        textSample: pdfText.substring(0, 500) + (pdfText.length > 500 ? '...' : '')
      }, docId);
      
      logger.info(`Processing proposal document ${docId}, text length: ${pdfText.length} characters`);

      // Limit text length for API call
      const limitedText = pdfText.substring(0, 12000);
      
      const prompt = `
        You are an expert at analyzing solar proposals.
        Extract the following information from this solar proposal document:
        - System size in kW
        - Panel type and wattage
        - Number of panels
        - Estimated annual production in kWh
        - Total system cost (before incentives)
        - Federal tax credit amount
        - State rebates or incentives amount
        - Net cost after incentives
        
        Format your response as JSON with these fields:
        {
          "systemSize": (number in kW),
          "panelType": (string with brand and model),
          "panelWattage": (number in watts),
          "panelQuantity": (number of panels),
          "estimatedProduction": (number in kWh),
          "pricing": {
            "totalCost": (number in dollars),
            "federalTaxCredit": (number in dollars),
            "stateRebates": (number in dollars),
            "netCost": (number in dollars)
          }
        }
        
        If you can't find a specific piece of information, use null for that field.
        Do not include any explanations, just the JSON object.
      `;

      logger.info(`Sending proposal to OpenAI for extraction: document ${docId}, using model: gpt-3.5-turbo`);
      const startTime = Date.now();

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo", // You can upgrade to gpt-4 for better accuracy
        messages: [
          {role: "system", content: "You are a solar proposal analysis assistant that extracts structured data."},
          {role: "user", content: prompt + "\n\nHere is the proposal text:\n" + limitedText}
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const processingTime = Date.now() - startTime;
      logger.info(`OpenAI proposal extraction completed in ${processingTime}ms for document ${docId}`);

      try {
        // Parse the JSON response
        const responseContent = response.choices[0].message.content;
        const extractedData = JSON.parse(responseContent);
        
        // Log the extraction results
        this.logExtraction('proposal', 'extracted_data', {
          processingTime,
          model: "gpt-3.5-turbo",
          promptTokens: response.usage?.prompt_tokens,
          completionTokens: response.usage?.completion_tokens,
          totalTokens: response.usage?.total_tokens,
          extractedData
        }, docId);
        
        logger.info(`Successfully extracted proposal data with OpenAI: document ${docId}, system size: ${extractedData.systemSize}, production: ${extractedData.estimatedProduction}`);
        return extractedData;
      } catch (parseError) {
        logger.error(`Failed to parse OpenAI response for document ${docId}: ${parseError.message}`);
        
        // Log the failed extraction
        this.logExtraction('proposal', 'extraction_error', {
          processingTime,
          error: parseError.message,
          rawResponse: response.choices[0].message.content
        }, docId);
        
        return null;
      }
    } catch (error) {
      const docId = documentId || 'unknown';
      logger.error(`OpenAI proposal extraction error for document ${docId}: ${error.message}`);
      
      // Log the API error
      this.logExtraction('proposal', 'api_error', {
        error: error.message,
        errorDetails: error.stack
      }, docId);
      
      return null;
    }
  }

  /**
   * Extract data from utility bill using OpenAI
   * @param {string} pdfText - Text extracted from utility bill PDF
   * @param {string} [documentId] - Optional document ID for logging
   * @returns {Promise<Object|null>} - Extracted data or null if failed
   */
  async extractUtilityBillData(pdfText, documentId = null) {
    try {
      if (!this.isConfigured) {
        logger.info('OpenAI not configured, skipping utility bill data extraction');
        return null;
      }

      // Generate document ID if not provided
      const docId = documentId || `bill_${Math.random().toString(36).substring(2, 10)}`;
      
      // Log the raw text extracted from the PDF
      this.logExtraction('utilityBill', 'raw_text', {
        textLength: pdfText.length,
        textSample: pdfText.substring(0, 500) + (pdfText.length > 500 ? '...' : '')
      }, docId);
      
      logger.info(`Processing utility bill document ${docId}, text length: ${pdfText.length} characters`);

      // Limit text length for API call
      const limitedText = pdfText.substring(0, 12000);
      
      const prompt = `
        You are an expert at analyzing utility bills.
        Extract the following information from this utility bill:
        - Utility company name
        - Account number
        - Billing period (start and end dates)
        - Total amount due
        - Energy usage in kWh
        - Electricity rate ($/kWh)
        
        Format your response as JSON with these fields:
        {
          "utilityCompany": (string),
          "accountNumber": (string),
          "billingPeriod": {
            "startDate": (date in MM/DD/YYYY format),
            "endDate": (date in MM/DD/YYYY format)
          },
          "totalAmount": (number in dollars),
          "energyUsage": (number in kWh),
          "rate": (number in $/kWh)
        }
        
        If you can't find a specific piece of information, use null for that field.
        Do not include any explanations, just the JSON object.
      `;

      logger.info(`Sending utility bill to OpenAI for extraction: document ${docId}, using model: gpt-3.5-turbo`);
      const startTime = Date.now();

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo", // You can upgrade to gpt-4 for better accuracy
        messages: [
          {role: "system", content: "You are a utility bill analysis assistant that extracts structured data."},
          {role: "user", content: prompt + "\n\nHere is the utility bill text:\n" + limitedText}
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const processingTime = Date.now() - startTime;
      logger.info(`OpenAI utility bill extraction completed in ${processingTime}ms for document ${docId}`);

      try {
        // Parse the JSON response
        const responseContent = response.choices[0].message.content;
        const extractedData = JSON.parse(responseContent);
        
        // Convert date strings to Date objects
        if (extractedData.billingPeriod) {
          if (extractedData.billingPeriod.startDate) {
            extractedData.billingPeriod.startDate = new Date(extractedData.billingPeriod.startDate);
          }
          if (extractedData.billingPeriod.endDate) {
            extractedData.billingPeriod.endDate = new Date(extractedData.billingPeriod.endDate);
          }
        }
        
        // Log the extraction results
        this.logExtraction('utilityBill', 'extracted_data', {
          processingTime,
          model: "gpt-3.5-turbo",
          promptTokens: response.usage?.prompt_tokens,
          completionTokens: response.usage?.completion_tokens,
          totalTokens: response.usage?.total_tokens,
          extractedData
        }, docId);
        
        logger.info(`Successfully extracted utility bill data with OpenAI: document ${docId}, company: ${extractedData.utilityCompany}, usage: ${extractedData.energyUsage}`);
        return extractedData;
      } catch (parseError) {
        logger.error(`Failed to parse OpenAI response for document ${docId}: ${parseError.message}`);
        
        // Log the failed extraction
        this.logExtraction('utilityBill', 'extraction_error', {
          processingTime,
          error: parseError.message,
          rawResponse: response.choices[0].message.content
        }, docId);
        
        return null;
      }
    } catch (error) {
      const docId = documentId || 'unknown';
      logger.error(`OpenAI utility bill extraction error for document ${docId}: ${error.message}`);
      
      // Log the API error
      this.logExtraction('utilityBill', 'api_error', {
        error: error.message,
        errorDetails: error.stack
      }, docId);
      
      return null;
    }
  }

  /**
   * Calculate environmental impact data based on extracted proposal and utility bill information
   * @param {Object} proposalData - Extracted data from the proposal
   * @param {number} systemSize - System size in kW
   * @param {number} estimatedProduction - Estimated annual production in kWh
   * @returns {Promise<Object|null>} - Environmental impact calculations or null if failed
   */
  async calculateEnvironmentalImpact(proposalData, systemSize, estimatedProduction) {
    try {
      if (!this.isConfigured) {
        logger.info('OpenAI not configured, skipping environmental impact calculation');
        return null;
      }
      
      const calcId = `env_${Math.random().toString(36).substring(2, 10)}`;
      logger.info(`Calculating environmental impact ${calcId}, system size: ${systemSize}kW, production: ${estimatedProduction}kWh`);
      
      // Create input for OpenAI based on available data
      const prompt = `
        You are an environmental impact analysis expert for solar energy systems.
        Calculate the environmental benefits of the following solar system:
        
        - System size: ${systemSize} kW
        - Estimated annual production: ${estimatedProduction} kWh
        ${proposalData.panelType ? `- Panel type: ${proposalData.panelType}` : ''}
        ${proposalData.panelQuantity ? `- Number of panels: ${proposalData.panelQuantity}` : ''}
        
        Based on this information, calculate:
        1. Annual carbon offset in tons of CO2
        2. Equivalent number of trees planted
        3. Equivalent miles not driven in a gasoline vehicle
        4. Equivalent coal not burned (in lbs)
        5. Lifetime carbon offset (25 years) in tons
        
        Format your response as JSON with these fields:
        {
          "carbonOffsetAnnual": (number in tons of CO2),
          "carbonOffsetLifetime": (number in tons of CO2),
          "treesPlantedEquivalent": (number of trees),
          "milesNotDrivenEquivalent": (number of miles),
          "coalNotBurnedPounds": (number in lbs),
          "carbonOffsetFactorKgPerMwh": (number - kg CO2 per MWh),
          "carbonCalculationExplanation": (brief explanation of how values were calculated)
        }
        
        Base your calculations on the standard environmental conversion factors used in the solar industry.
        Do not include any explanations outside of the JSON, just return the JSON object.
      `;

      logger.info(`Sending environmental calculation request to OpenAI: calculation ${calcId}`);
      const startTime = Date.now();

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {role: "system", content: "You are an environmental impact calculation assistant for solar energy."},
          {role: "user", content: prompt}
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      const processingTime = Date.now() - startTime;
      logger.info(`OpenAI environmental calculation completed in ${processingTime}ms for ${calcId}`);

      try {
        // Parse the JSON response
        const responseContent = response.choices[0].message.content;
        const environmentalData = JSON.parse(responseContent);
        
        // Log the calculation results
        this.logExtraction('environmental', 'calculation', {
          processingTime,
          model: "gpt-3.5-turbo",
          promptTokens: response.usage?.prompt_tokens,
          completionTokens: response.usage?.completion_tokens,
          totalTokens: response.usage?.total_tokens,
          systemSize,
          estimatedProduction,
          environmentalData
        }, calcId);
        
        logger.info(`Successfully calculated environmental impact with OpenAI: ${calcId}, annual offset: ${environmentalData.carbonOffsetAnnual} tons CO2`);
        return {
          ...environmentalData,
          dataSource: 'openai'
        };
      } catch (parseError) {
        logger.error(`Failed to parse OpenAI environmental calculation for ${calcId}: ${parseError.message}`);
        
        // Log the failed calculation
        this.logExtraction('environmental', 'calculation_error', {
          processingTime,
          error: parseError.message,
          rawResponse: response.choices[0].message.content
        }, calcId);
        
        return null;
      }
    } catch (error) {
      logger.error(`OpenAI environmental calculation error: ${error.message}`);
      
      // Log the API error
      this.logExtraction('environmental', 'api_error', {
        error: error.message,
        errorDetails: error.stack,
        systemSize,
        estimatedProduction
      });
      
      return null;
    }
  }
}

module.exports = new OpenAiService(); 