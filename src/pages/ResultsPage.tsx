import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProposalAnalysis from '@/components/results/ProposalAnalysis';
import UtilityBillAnalysis from '@/components/results/UtilityBillAnalysis';
import MonthlyBreakdown from '@/components/results/MonthlyBreakdown';
import EnvironmentalImpact from '@/components/results/EnvironmentalImpact';
import ExternalTools from '@/components/external/ExternalTools';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ResultsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-12">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <Link to="/upload" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Upload
              </Link>
              <h1 className="text-3xl font-bold mb-2">Your Solar Analysis Results</h1>
              <p className="text-muted-foreground max-w-2xl">
                Here's a detailed breakdown of your solar proposal and utility bill analysis.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                <span>Share Results</span>
              </Button>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProposalAnalysis />
              <UtilityBillAnalysis />
            </div>
            
            <MonthlyBreakdown />
            
            <EnvironmentalImpact />
            
            <ExternalTools />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResultsPage;
