const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Proposal',
    },
    utilityBill: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'UtilityBill',
    },
    // Analysis results
    solarSavings: {
      monthlySavings: {
        type: Number,
        description: 'Estimated monthly savings in dollars',
      },
      annualSavings: {
        type: Number,
        description: 'Estimated annual savings in dollars',
      },
      twentyYearSavings: {
        type: Number,
        description: 'Estimated 20-year savings in dollars',
      },
      paybackPeriod: {
        type: Number,
        description: 'Estimated payback period in years',
      },
    },
    // Monthly breakdown of savings, production, and consumption
    monthlyBreakdown: [{
      month: {
        type: String,
        enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
               'August', 'September', 'October', 'November', 'December'],
        required: true,
      },
      solarProduction: {
        type: Number,
        description: 'Estimated solar production for the month in kWh',
      },
      gridConsumption: {
        type: Number,
        description: 'Estimated grid consumption for the month in kWh',
      },
      utilityBillWithSolar: {
        type: Number,
        description: 'Estimated utility bill with solar in dollars',
      },
      utilityBillWithoutSolar: {
        type: Number,
        description: 'Original utility bill without solar in dollars',
      },
      savings: {
        type: Number,
        description: 'Estimated savings for the month in dollars',
      },
    }],
    // Environmental impact data
    environmentalImpact: {
      carbonOffsetAnnual: {
        type: Number,
        description: 'Annual carbon offset in tons of CO2',
      },
      carbonOffsetLifetime: {
        type: Number,
        description: 'Lifetime carbon offset (25 years) in tons of CO2',
      },
      treesPlantedEquivalent: {
        type: Number,
        description: 'Equivalent number of trees planted',
      },
      milesNotDrivenEquivalent: {
        type: Number,
        description: 'Equivalent miles not driven in a gasoline vehicle',
      },
      coalNotBurnedPounds: {
        type: Number,
        description: 'Equivalent coal not burned in pounds',
      },
      carbonOffsetFactorKgPerMwh: {
        type: Number,
        description: 'Carbon offset factor in kg per MWh',
      },
      estimatedProduction: {
        type: Number,
        description: 'Estimated annual production in kWh',
      },
      dataSource: {
        type: String,
        enum: ['openai', 'system-calculated'],
        description: 'Source of the environmental impact data',
      },
      carbonCalculationExplanation: {
        type: String,
        description: 'Explanation of how carbon calculations were performed',
      },
    },
    // Solar potential data from Google Sunroof
    solarPotential: {
      roofSegmentSummary: {
        type: Map,
        of: Number,
        description: 'Summary of roof segments and their solar potential',
      },
      solarPotential: {
        type: Number,
        description: 'Total solar potential in kWh per year',
      },
      panelCapacityWatts: {
        type: Number,
        description: 'Maximum panel capacity in watts',
      },
      carbonOffsetFactorKgPerMwh: {
        type: Number,
        description: 'Carbon offset factor in kg per MWh',
      },
    },
    // PVWatts API data
    solarProduction: {
      annualProduction: {
        type: Number,
        description: 'Annual solar production estimate from PVWatts API in kWh',
      },
      monthlyProduction: {
        type: Map,
        of: Number,
        description: 'Monthly solar production estimates from PVWatts API',
      },
      capacityFactor: {
        type: Number,
        description: 'System capacity factor',
      },
    },
    // SREC incentives data
    srecIncentives: {
      srecEligible: {
        type: Boolean,
        description: 'Whether the location is eligible for SRECs',
      },
      srecRate: {
        type: Number,
        description: 'Current SREC rate in dollars per MWh',
      },
      estimatedAnnualSrecValue: {
        type: Number,
        description: 'Estimated annual SREC value in dollars',
      },
      srecProgramDetails: {
        type: String,
        description: 'Details about the SREC program',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'error'],
      default: 'pending',
    },
    processingErrors: [String],
  },
  {
    timestamps: true,
  }
);

const Result = mongoose.model('Result', resultSchema);

module.exports = Result; 