
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, DollarSign } from 'lucide-react';
import type { UtilityBillAnalysis as UtilityBillAnalysisType } from '@/lib/types';

// Mock data
const mockUtilityData: UtilityBillAnalysisType = {
  energyUsage: '1,542 kWh/month',
  savingsBreakdown: {
    monthly: '$158.09',
    yearly: '$1,897.08',
    twentyYear: '$51,220',
  },
};

const UtilityBillAnalysis = () => {
  const data = mockUtilityData;
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-energy-500" />
          Utility Bill Analysis
        </CardTitle>
        <CardDescription>
          Analysis of your current energy usage and potential savings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-1">Average Energy Usage</p>
            <p className="text-xl font-semibold">{data.energyUsage}</p>
          </div>
          
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-accent-500" />
            Savings Breakdown
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Monthly</p>
              <p className="text-2xl font-bold text-solar-600">{data.savingsBreakdown.monthly}</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Yearly</p>
              <p className="text-2xl font-bold text-solar-600">{data.savingsBreakdown.yearly}</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">20-Year</p>
              <p className="text-2xl font-bold text-solar-600">{data.savingsBreakdown.twentyYear}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UtilityBillAnalysis;
