const axios = require('axios');
const apiConfig = require('../config/apiConfig');
const { logger } = require('../middleware/errorMiddleware');

/**
 * Service for interacting with SREC Trade API to check incentives
 */
class SrecTradeService {
  constructor() {
    this.baseUrl = apiConfig.srecTrade.baseUrl;
    this.apiKey = apiConfig.srecTrade.apiKey;
    
    // Set up axios instance with base URL and API key
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get SREC incentives for a location
   * @param {Object} params - Parameters for SREC Trade API
   * @param {string} params.state - US State code (e.g., CA, NY)
   * @param {number} params.systemCapacity - System capacity in kW DC
   * @param {number} params.annualProduction - Annual production in kWh
   * @returns {Promise<Object>} - SREC incentives data
   */
  async getSrecIncentives({ state, systemCapacity, annualProduction }) {
    try {
      if (!state) {
        throw new Error('State is required');
      }

      // Check if API key is configured
      if (!this.apiKey) {
        throw new Error('SREC Trade API key is not configured');
      }

      // Build request parameters
      const params = {
        state,
        system_size: systemCapacity,
        annual_production: annualProduction,
      };

      // Make API call to SREC Trade
      const response = await this.api.get('/incentives', { params });
      
      // Return the SREC incentives data
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      logger.error(`SREC Trade API error: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        // If we have a mock implementation for testing or fallback
        data: this._getMockSrecIncentives(state, systemCapacity, annualProduction),
      };
    }
  }

  /**
   * Mock implementation for SREC incentives (used when API is not available)
   * @param {string} state - US State code
   * @param {number} systemCapacity - System capacity in kW DC
   * @param {number} annualProduction - Annual production in kWh
   * @returns {Object} - Mock SREC incentives data
   * @private
   */
  _getMockSrecIncentives(state, systemCapacity, annualProduction) {
    // Define SREC-eligible states and their rates
    const srecEligibleStates = {
      'MA': { rate: 275, factor: 1.0 },
      'NJ': { rate: 225, factor: 1.0 },
      'DC': { rate: 435, factor: 1.0 },
      'MD': { rate: 75, factor: 1.0 },
      'PA': { rate: 40, factor: 1.0 },
      'OH': { rate: 15, factor: 1.0 },
      'DE': { rate: 35, factor: 1.0 },
      'IL': { rate: 70, factor: 1.0 },
    };

    // Check if state is eligible for SRECs
    const isEligible = srecEligibleStates.hasOwnProperty(state);
    
    // Calculate incentives
    let srecRate = 0;
    let estimatedAnnualSrecValue = 0;
    let srecProgramDetails = 'Not eligible for SREC incentives';

    if (isEligible) {
      srecRate = srecEligibleStates[state].rate;
      // 1 SREC is typically issued per MWh of generation
      const annualSrecs = annualProduction / 1000; 
      estimatedAnnualSrecValue = Math.round(annualSrecs * srecRate);
      srecProgramDetails = `${state} SREC Program - Current market price: $${srecRate} per SREC`;
    }

    return {
      state,
      system_capacity_kw: systemCapacity,
      annual_production_kwh: annualProduction,
      srec_eligible: isEligible,
      srec_rate: srecRate,
      estimated_annual_srec_value: estimatedAnnualSrecValue,
      srec_program_details: srecProgramDetails,
      additional_incentives: this._getAdditionalIncentives(state, systemCapacity),
    };
  }

  /**
   * Helper function to get additional state incentives
   * @param {string} state - US State code
   * @param {number} systemCapacity - System capacity in kW DC
   * @returns {Array} - List of additional incentives
   * @private
   */
  _getAdditionalIncentives(state, systemCapacity) {
    // Map of additional state incentives (simplified for mockup)
    const stateIncentives = {
      'CA': [
        {
          name: 'Self-Generation Incentive Program (SGIP)',
          type: 'rebate',
          amount: Math.round(systemCapacity * 500), // $500 per kW
          details: 'Incentive for battery storage systems paired with solar',
        },
      ],
      'NY': [
        {
          name: 'NY-Sun Incentive Program',
          type: 'rebate',
          amount: Math.round(systemCapacity * 350), // $350 per kW
          details: 'Declining block incentive program for solar installations',
        },
      ],
      'MA': [
        {
          name: 'SMART Program',
          type: 'production-based',
          amount: Math.round(systemCapacity * 1200), // Simplified calculation
          details: 'Solar Massachusetts Renewable Target (SMART) Program',
        },
      ],
      'TX': [
        {
          name: 'Austin Energy Rebate',
          type: 'rebate',
          amount: Math.round(systemCapacity * 2500), // Simplified
          details: 'Available only for Austin Energy customers',
        },
      ],
    };

    return stateIncentives[state] || [];
  }
}

module.exports = new SrecTradeService(); 