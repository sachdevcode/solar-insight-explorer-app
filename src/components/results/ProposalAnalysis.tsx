import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeCheck, Sun, Zap, Loader2, Bot } from 'lucide-react';
import type { ProposalAnalysis as ProposalAnalysisType } from '@/lib/types';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';

// Event name for signaling that proposal values have changed
export const PROPOSAL_UPDATED_EVENT = 'proposal-updated';

// Enhanced type that includes data source information
interface EnhancedProposalAnalysisType extends ProposalAnalysisType {
  dataSource?: 'openai' | 'pattern-extraction' | 'fallback-generation';
  generatedFromError?: boolean;
}

// Default data for loading state or when API fails
const defaultData: EnhancedProposalAnalysisType = {
  systemSize: '...',
  panelType: '...',
  panelQuantity: 0,
  estimatedProduction: '...',
  oldUtilityBill: '...',
  newUtilityBill: '...',
  savings: '...',
};

const ProposalAnalysis = () => {
  const [data, setData] = useState<EnhancedProposalAnalysisType>(defaultData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create a memoized fetchProposalAnalysis function that can be called multiple times
  const fetchProposalAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/results/proposal-analysis');
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching proposal analysis:', err);
      setError('Failed to load proposal analysis data');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchProposalAnalysis();
  }, [fetchProposalAnalysis]);

  // Function to render data source badge
  const renderDataSourceBadge = () => {
    if (!data.dataSource) return null;
    
    switch (data.dataSource) {
      case 'openai':
        return (
          <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
            <Bot className="h-3 w-3 mr-1" /> AI Extracted
          </Badge>
        );
      case 'pattern-extraction':
        return (
          <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
            Pattern Extracted
          </Badge>
        );
      case 'fallback-generation':
        return (
          <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
            Simulated Data
          </Badge>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-solar-500" />
          Solar Proposal Analysis
          {!loading && !error && renderDataSourceBadge()}
        </CardTitle>
        <CardDescription>
          Key information extracted from your solar proposal
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 text-solar-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <p className="text-sm text-muted-foreground">Estimated Production</p>
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
        )}
      </CardContent>
    </Card>
  );
};

export default ProposalAnalysis;
