const mongoose = require('mongoose');

const utilityBillSchema = new mongoose.Schema(
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
    // File type (PDF or Image)
    fileType: {
      type: String,
      enum: ['pdf', 'image'],
      required: true,
    },
    // Extracted data from utility bill
    extractedData: {
      utilityCompany: {
        type: String,
        description: 'Utility company name',
      },
      billingPeriod: {
        startDate: {
          type: Date,
          description: 'Billing period start date',
        },
        endDate: {
          type: Date,
          description: 'Billing period end date',
        },
      },
      accountNumber: {
        type: String,
        description: 'Utility account number',
      },
      totalAmount: {
        type: Number,
        description: 'Total bill amount',
      },
      energyUsage: {
        type: Number,
        description: 'Energy usage in kWh',
      },
      energyUsageMonthly: {
        type: Map,
        of: Number,
        description: 'Monthly breakdown of energy usage',
      },
      rate: {
        type: Number,
        description: 'Electricity rate in $/kWh',
      },
      demandCharges: {
        type: Number,
        description: 'Demand charges if applicable',
      },
      taxes: {
        type: Number,
        description: 'Taxes on the bill',
      },
      fees: {
        type: Number,
        description: 'Additional fees',
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

const UtilityBill = mongoose.model('UtilityBill', utilityBillSchema);

module.exports = UtilityBill; 