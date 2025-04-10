const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    filePath: {
      type: String,
      required: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    // Extracted data from PDF
    extractedData: {
      systemSize: {
        type: Number,
        description: 'System size in kW DC',
      },
      panelType: {
        type: String,
        description: 'Type of panels (e.g., WSMD-400)',
      },
      panelWattage: {
        type: Number,
        description: 'Panel wattage (e.g., 400W)',
      },
      panelQuantity: {
        type: Number,
        description: 'Number of panels',
      },
      estimatedProduction: {
        type: Number,
        description: 'Estimated annual production in kWh',
      },
      estimatedProductionMonthly: {
        type: Map,
        of: Number,
        description: 'Monthly breakdown of estimated production',
      },
      inverterDetails: {
        type: {
          type: String,
          description: 'Type of inverter',
        },
        model: {
          type: String,
          description: 'Model of inverter',
        },
        quantity: {
          type: Number,
          description: 'Number of inverters',
        },
      },
      pricing: {
        totalCost: {
          type: Number,
          description: 'Total system cost before incentives',
        },
        federalTaxCredit: {
          type: Number,
          description: 'Federal tax credit amount',
        },
        stateRebates: {
          type: Number,
          description: 'State rebates amount',
        },
        otherIncentives: {
          type: Number,
          description: 'Other incentives amount',
        },
        netCost: {
          type: Number,
          description: 'Net cost after incentives',
        },
      },
    },
    status: {
      type: String,
      enum: ['pending', 'processed', 'error'],
      default: 'pending',
    },
    processingErrors: [String],
  },
  {
    timestamps: true,
  }
);

const Proposal = mongoose.model('Proposal', proposalSchema);

module.exports = Proposal; 