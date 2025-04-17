import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Loader2 } from 'lucide-react';
import type { MonthlyBreakdownItem } from '@/lib/types';
import axios from 'axios';
import { PROPOSAL_UPDATED_EVENT } from './ProposalAnalysis';

// Default empty data for loading state
const defaultData: MonthlyBreakdownItem[] = [];

const MonthlyBreakdown = () => {
  const [data, setData] = useState<MonthlyBreakdownItem[]>(defaultData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch monthly breakdown data
  const fetchMonthlyBreakdown = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/results/monthly-breakdown');
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching monthly breakdown data:', err);
      setError('Failed to load monthly breakdown data');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Initial data fetch and set up event listener for proposal updates
  useEffect(() => {
    fetchMonthlyBreakdown();
    
    // Add event listener for when proposal values change
    const handleProposalUpdated = () => {
      fetchMonthlyBreakdown();
    };
    
    window.addEventListener(PROPOSAL_UPDATED_EVENT, handleProposalUpdated);
    
    // Clean up listener on unmount
    return () => {
      window.removeEventListener(PROPOSAL_UPDATED_EVENT, handleProposalUpdated);
    };
  }, [fetchMonthlyBreakdown]);
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Monthly Breakdown
        </CardTitle>
        <CardDescription>
          Detailed month-by-month analysis of your solar system performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-3 font-medium">Month</th>
                  <th className="text-left p-3 font-medium">Solar Production</th>
                  <th className="text-left p-3 font-medium">Grid Usage</th>
                  <th className="text-left p-3 font-medium">Savings</th>
                  <th className="text-left p-3 font-medium">New Bill</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr 
                    key={index} 
                    className={`border-t hover:bg-muted/50 transition-colors ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                    }`}
                  >
                    <td className="p-3 font-medium">{item.month}</td>
                    <td className="p-3">{item.solarProduction}</td>
                    <td className="p-3">{item.gridUsage}</td>
                    <td className="p-3 text-solar-600 font-medium">{item.savings}</td>
                    <td className="p-3">{item.newBill}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyBreakdown;
