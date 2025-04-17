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
  dataSource?: string; // 'openai', 'pattern-extraction', or 'fallback-generation'
  generatedFromError?: boolean;
}

export interface UtilityBillAnalysis {
  utilityCompany?: string;
  accountNumber?: string;
  billingPeriod?: {
    startDate: string;
    endDate: string;
  };
  energyUsage: string;
  rate?: string;
  totalAmount?: string;
  dataSource?: string;
  savingsBreakdown?: {
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

export interface MonthlyBreakdownData {
  month: string;
  usage: number;
  production: number;
  netUsage: number;
  savings: number;
}

export interface EnvironmentalImpactType {
  carbonOffsetAnnual: number;
  carbonOffsetLifetime: number;
  treesPlantedEquivalent: number;
  milesNotDrivenEquivalent: number;
  coalNotBurnedPounds: number;
  carbonOffsetFactorKgPerMwh: number;
  carbonCalculationExplanation?: string;
  estimatedProduction: number;
  dataSource?: string;
}
