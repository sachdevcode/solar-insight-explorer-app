import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, DollarSign, Loader2 } from 'lucide-react';
import type { UtilityBillAnalysis as UtilityBillAnalysisType } from '@/lib/types';
import axios from 'axios';
import { PROPOSAL_UPDATED_EVENT } from './ProposalAnalysis';

// Default data for loading state
const defaultData: Partial<UtilityBillAnalysisType> = {
  energyUsage: '1,542 kWh/month',
  savingsBreakdown: {
    monthly: '...',
    yearly: '...',
    twentyYear: '...',
  },
};

const UtilityBillAnalysis = () => {
  const [data, setData] = useState<Partial<UtilityBillAnalysisType>>(defaultData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch utility bill analysis data
  const fetchUtilityBillAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/results/utility-bill-analysis');
      
      // Keep the same energy usage but update the savings values
      setData({
        ...response.data,
        energyUsage: defaultData.energyUsage // Always keep this constant
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching utility bill analysis:', err);
      setError('Failed to load utility bill data');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Initial data fetch and set up event listener
  useEffect(() => {
    fetchUtilityBillAnalysis();
    
    // Add event listener for when proposal values change
    const handleProposalUpdated = () => {
      fetchUtilityBillAnalysis();
    };
    
    window.addEventListener(PROPOSAL_UPDATED_EVENT, handleProposalUpdated);
    
    // Clean up listener on unmount
    return () => {
      window.removeEventListener(PROPOSAL_UPDATED_EVENT, handleProposalUpdated);
    };
  }, [fetchUtilityBillAnalysis]);
  
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
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 text-energy-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : (
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
                <p className="text-2xl font-bold text-solar-600">{data.savingsBreakdown?.monthly}</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Yearly</p>
                <p className="text-2xl font-bold text-solar-600">{data.savingsBreakdown?.yearly}</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">20-Year</p>
                <p className="text-2xl font-bold text-solar-600">{data.savingsBreakdown?.twentyYear}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UtilityBillAnalysis;
