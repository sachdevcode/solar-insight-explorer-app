
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import type { MonthlyBreakdownItem } from '@/lib/types';

// Mock data
const mockMonthlyData: MonthlyBreakdownItem[] = [
  { month: 'January', solarProduction: '1,250 kWh', gridUsage: '200 kWh', savings: '$125', newBill: '$42' },
  { month: 'February', solarProduction: '1,345 kWh', gridUsage: '180 kWh', savings: '$135', newBill: '$40' },
  { month: 'March', solarProduction: '1,556 kWh', gridUsage: '150 kWh', savings: '$155', newBill: '$38' },
  { month: 'April', solarProduction: '1,723 kWh', gridUsage: '120 kWh', savings: '$172', newBill: '$36' },
  { month: 'May', solarProduction: '1,892 kWh', gridUsage: '100 kWh', savings: '$189', newBill: '$35' },
  { month: 'June', solarProduction: '1,956 kWh', gridUsage: '90 kWh', savings: '$195', newBill: '$32' },
  { month: 'July', solarProduction: '1,942 kWh', gridUsage: '95 kWh', savings: '$194', newBill: '$32' },
  { month: 'August', solarProduction: '1,875 kWh', gridUsage: '100 kWh', savings: '$187', newBill: '$33' },
  { month: 'September', solarProduction: '1,720 kWh', gridUsage: '115 kWh', savings: '$172', newBill: '$35' },
  { month: 'October', solarProduction: '1,532 kWh', gridUsage: '145 kWh', savings: '$153', newBill: '$37' },
  { month: 'November', solarProduction: '1,367 kWh', gridUsage: '175 kWh', savings: '$136', newBill: '$40' },
  { month: 'December', solarProduction: '1,304 kWh', gridUsage: '190 kWh', savings: '$130', newBill: '$41' },
];

const MonthlyBreakdown = () => {
  const data = mockMonthlyData;
  
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
      </CardContent>
    </Card>
  );
};

export default MonthlyBreakdown;
