
// File Types
export interface ProposalFile {
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

export interface UtilityBillFile {
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

// Analysis Results
export interface ProposalAnalysis {
  systemSize: string;
  panelType: string;
  panelQuantity: number;
  estimatedProduction: string;
  oldUtilityBill: string;
  newUtilityBill: string;
  savings: string;
}

export interface UtilityBillAnalysis {
  energyUsage: string;
  savingsBreakdown: {
    monthly: string;
    yearly: string;
    twentyYear: string;
  };
}

export interface MonthlyBreakdownItem {
  month: string;
  solarProduction: string;
  gridUsage: string;
  savings: string;
  newBill: string;
}
