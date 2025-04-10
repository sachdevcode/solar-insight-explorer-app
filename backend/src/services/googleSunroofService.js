const axios = require('axios');
const apiConfig = require('../config/apiConfig');
const { logger } = require('../middleware/errorMiddleware');

/**
 * Service for interacting with Google Sunroof API
 */
class GoogleSunroofService {
  constructor() {
    this.baseUrl = apiConfig.googleSunroof.baseUrl;
    this.apiKey = apiConfig.googleSunroof.apiKey;
    
    // Set up axios instance with base URL and API key
    this.api = axios.create({
      baseURL: this.baseUrl,
      params: {
        key: this.apiKey,
      },
    });
  }

  /**
   * Get solar potential for a location
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Promise<Object>} - Solar potential data
   */
  async getSolarPotential(latitude, longitude) {
    try {
      if (!latitude || !longitude) {
        throw new Error('Latitude and longitude are required');
      }

      // Check if API key is configured
      if (!this.apiKey) {
        throw new Error('Google Sunroof API key is not configured');
      }

      // Build request parameters
      const params = {
        location: {
          latitude,
          longitude,
        },
      };

      // Make API call to Google Sunroof
      const response = await this.api.post('/buildingInsights', params);
      
      // Return the solar potential data
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      logger.error(`Google Sunroof API error: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        // If we have a mock implementation for testing or fallback
        data: this._getMockSolarPotential(latitude, longitude),
      };
    }
  }

  /**
   * Mock implementation for solar potential (used when API is not available)
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Object} - Mock solar potential data
   * @private
   */
  _getMockSolarPotential(latitude, longitude) {
    // Return mock data for testing or when API is unavailable
    return {
      _note: "This is mock data for testing purposes",
      name: `buildings/${latitude},${longitude}`,
      center: {
        latitude,
        longitude,
      },
      imageryDate: {
        year: 2022,
        month: 6,
        day: 15,
      },
      imageryProcessedDate: {
        year: 2022,
        month: 6,
        day: 20,
      },
      roofSegmentStats: [
        {
          pitchDegrees: 25,
          azimuthDegrees: 180, // South facing
          stats: {
            areaMeters2: 50,
            sunshineQuantiles: [
              0.85, 0.87, 0.90, 0.92, 0.95, 0.97, 0.98, 0.99, 1.0
            ],
            groundAreaMeters2: 48,
          },
        },
        {
          pitchDegrees: 15,
          azimuthDegrees: 90, // East facing
          stats: {
            areaMeters2: 30,
            sunshineQuantiles: [
              0.65, 0.70, 0.75, 0.80, 0.82, 0.85, 0.87, 0.90, 0.92
            ],
            groundAreaMeters2: 29,
          },
        },
      ],
      solarPotential: {
        maxArrayAreaMeters2: 70,
        maxCapacityKw: 14.0,
        panelCapacityWatts: 250,
        panelHeightMeters: 1.65,
        panelWidthMeters: 0.99,
        panelLifetimeYears: 25,
        yearlyEnergyDcKwh: 15000,
        carbonOffsetFactorKgPerMwh: 680.0,
      },
      solarPanelConfigs: [
        {
          panelsCount: 20,
          yearlyEnergyDcKwh: 6000,
          roofSegmentSummaries: [
            {
              pitchDegrees: 25,
              azimuthDegrees: 180,
              panelsCount: 15,
              yearlyEnergyDcKwh: 4500,
            },
            {
              pitchDegrees: 15,
              azimuthDegrees: 90,
              panelsCount: 5,
              yearlyEnergyDcKwh: 1500,
            },
          ],
        },
        {
          panelsCount: 40,
          yearlyEnergyDcKwh: 12000,
          roofSegmentSummaries: [
            {
              pitchDegrees: 25,
              azimuthDegrees: 180,
              panelsCount: 30,
              yearlyEnergyDcKwh: 9000,
            },
            {
              pitchDegrees: 15,
              azimuthDegrees: 90,
              panelsCount: 10,
              yearlyEnergyDcKwh: 3000,
            },
          ],
        },
      ],
    };
  }
}

module.exports = new GoogleSunroofService(); 