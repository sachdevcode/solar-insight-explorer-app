
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="section bg-gradient-to-b from-background to-muted">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="font-bold tracking-tight mb-6">
              <span className="text-solar-600 block">Analyze Your</span> 
              Solar Proposal & Utility Bills
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-md">
              Upload your documents and get detailed insights about potential savings, 
              solar production estimates, and utility bill analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/upload">
                <Button size="lg" className="bg-solar-600 hover:bg-solar-700">
                  Start Your Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="#how-it-works">
                <Button size="lg" variant="outline">
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full h-[400px] rounded-lg bg-gradient-to-br from-energy-600 to-energy-800 shadow-lg flex items-center justify-center p-8">
              <div className="w-full max-w-sm bg-white/95 p-6 rounded-lg shadow-xl">
                <div className="space-y-4">
                  <div className="h-4 bg-solar-200 rounded"></div>
                  <div className="h-4 w-3/4 bg-solar-200 rounded"></div>
                  <div className="flex gap-2">
                    <div className="h-16 w-1/2 bg-energy-100 rounded"></div>
                    <div className="h-16 w-1/2 bg-solar-100 rounded"></div>
                  </div>
                  <div className="h-32 bg-gray-100 rounded"></div>
                  <div className="h-8 w-28 bg-solar-500 rounded"></div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent-400 rounded-full"></div>
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-solar-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
