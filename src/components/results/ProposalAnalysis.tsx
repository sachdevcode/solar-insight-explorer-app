
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeCheck, Sun, Zap } from 'lucide-react';
import type { ProposalAnalysis as ProposalAnalysisType } from '@/lib/types';

// Mock data
const mockProposalData: ProposalAnalysisType = {
  systemSize: '14.8 kW DC',
  panelType: 'WSMD-400, 400W',
  panelQuantity: 37,
  estimatedProduction: '18,462 kWh',
  oldUtilityBill: '$208.99/month',
  newUtilityBill: '$50.90/month',
  savings: '$158.09/month',
};

const ProposalAnalysis = () => {
  const data = mockProposalData;
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-solar-500" />
          Solar Proposal Analysis
        </CardTitle>
        <CardDescription>
          Key information extracted from your solar proposal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">System Size</p>
              <p className="text-xl font-semibold">{data.systemSize}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Panel Type</p>
              <p className="text-xl font-semibold">{data.panelType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Panel Quantity</p>
              <p className="text-xl font-semibold">{data.panelQuantity}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Est. First-Year Production</p>
              <p className="text-xl font-semibold">{data.estimatedProduction}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Old Utility Bill</p>
              <p className="text-xl font-semibold">{data.oldUtilityBill}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Utility Bill Estimate</p>
              <p className="text-xl font-semibold">{data.newUtilityBill}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Savings</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-semibold text-solar-600">{data.savings}</p>
                <BadgeCheck className="h-5 w-5 text-solar-600" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalAnalysis;
