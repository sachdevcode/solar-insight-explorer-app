
import React from 'react';
import { FileUp, PieChart, BarChart3, TrendingUp, ExternalLink } from 'lucide-react';

const features = [
  {
    title: "Upload & Analyze",
    description: "Upload your sales proposal and utility bill documents for instant analysis.",
    icon: FileUp
  },
  {
    title: "System Analysis",
    description: "Get insights on your system size, panel type, and estimated production.",
    icon: PieChart
  },
  {
    title: "Bill Comparison",
    description: "Compare your current utility bills with potential solar savings.",
    icon: BarChart3
  },
  {
    title: "Monthly Breakdown",
    description: "View month-by-month production, grid usage, and savings estimates.",
    icon: TrendingUp
  },
  {
    title: "External Tools",
    description: "Connect with Google Sunroof, PVWatts Calculator, and SREC Trade for additional insights.",
    icon: ExternalLink
  }
];

const Features = () => {
  return (
    <section className="section" id="how-it-works">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="section-title">How It Works</h2>
          <p className="section-description">
            Our platform helps you analyze your solar proposal and utility bill to 
            make informed decisions about solar energy for your home.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
            >
              <div className="h-12 w-12 rounded-full bg-solar-100 text-solar-600 flex items-center justify-center mb-4">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
