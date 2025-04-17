import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, TreePine, Car, Factory, Loader2, Bot } from 'lucide-react';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { EnvironmentalImpactType } from '@/lib/types';

// Default data for loading state or when API fails
const defaultData = {
  carbonOffsetAnnual: 0,
  carbonOffsetLifetime: 0,
  treesPlantedEquivalent: 0,
  milesNotDrivenEquivalent: 0,
  coalNotBurnedPounds: 0,
  carbonOffsetFactorKgPerMwh: 0,
  estimatedProduction: 0,
  dataSource: 'loading'
};

const EnvironmentalImpact = () => {
  const [data, setData] = useState<EnvironmentalImpactType>(defaultData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchEnvironmentalImpact = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/results/environmental-impact');
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching environmental impact data:', err);
        setError('Failed to load environmental impact data. We will use estimated values.');
        // Try to get data from external API with system size only
        try {
          const proposalResponse = await axios.get('/api/results/proposal-analysis');
          if (proposalResponse.data?.systemSize) {
            const systemSize = parseFloat(proposalResponse.data.systemSize);
            if (!isNaN(systemSize)) {
              const fallbackResponse = await axios.get(`/api/environmental-impact?systemSize=${systemSize}`);
              setData(fallbackResponse.data);
              setError(null);
            }
          }
        } catch (fallbackErr) {
          console.error('Error fetching fallback environmental data:', fallbackErr);
          // Keep the original error
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnvironmentalImpact();
  }, []);

  // Function to render data source badge
  const renderDataSourceBadge = () => {
    if (loading || !data.dataSource) return null;
    
    switch (data.dataSource) {
      case 'openai':
        return (
          <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
            <Bot className="h-3 w-3 mr-1" /> AI Calculated
          </Badge>
        );
      case 'system-calculated':
        return (
          <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
            System Calculated
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
          <Leaf className="h-5 w-5 text-green-500" />
          Environmental Impact
          {renderDataSourceBadge()}
        </CardTitle>
        <CardDescription>
          Estimated environmental benefits of your solar system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
          </div>
        ) : error ? (
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Carbon Offset</h3>
                <p className="text-2xl font-bold">{data.carbonOffsetAnnual.toLocaleString(undefined, {maximumFractionDigits: 1})} tons/year</p>
                <p className="text-sm text-muted-foreground">{data.carbonOffsetLifetime.toLocaleString(undefined, {maximumFractionDigits: 1})} tons over 25 years</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-amber-100 p-3">
                <TreePine className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Trees Planted Equivalent</h3>
                <p className="text-2xl font-bold">{data.treesPlantedEquivalent.toLocaleString()} trees</p>
                <p className="text-sm text-muted-foreground">Annual carbon sequestration equivalent</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Miles Not Driven</h3>
                <p className="text-2xl font-bold">{data.milesNotDrivenEquivalent.toLocaleString()} miles</p>
                <p className="text-sm text-muted-foreground">Equivalent car miles not driven</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-slate-100 p-3">
                <Factory className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Coal Not Burned</h3>
                <p className="text-2xl font-bold">{data.coalNotBurnedPounds.toLocaleString()} lbs</p>
                <p className="text-sm text-muted-foreground">Pounds of coal not burned</p>
              </div>
            </div>
          </div>
        </div>
        
        {data.carbonCalculationExplanation && (
          <div className="mt-6 text-sm text-muted-foreground">
            <p className="italic">Note: {data.carbonCalculationExplanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnvironmentalImpact; 