/**
 * API configuration for external services
 */
const apiConfig = {
  // Google Sunroof API configuration
  googleSunroof: {
    baseUrl: process.env.GOOGLE_SUNROOF_API_URL || 'https://solar.googleapis.com/v1',
    apiKey: process.env.GOOGLE_SUNROOF_API_KEY,
  },
  
  // PVWatts API configuration
  pvWatts: {
    baseUrl: process.env.PVWATTS_API_URL || 'https://developer.nrel.gov/api/pvwatts/v6',
    apiKey: process.env.PVWATTS_API_KEY,
  },
  
  // SREC Trade API configuration
  srecTrade: {
    baseUrl: process.env.SREC_TRADE_API_URL || 'https://api.srectrade.com/v1',
    apiKey: process.env.SREC_TRADE_API_KEY,
  },
};

module.exports = apiConfig; 