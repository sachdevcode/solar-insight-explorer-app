
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ExternalLink, 
  MapPin, 
  AreaChart, 
  BadgeDollarSign,
  X 
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ExternalTools = () => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-accent-500" />
            External Tools
          </CardTitle>
          <CardDescription>
            Use these tools to get additional insights about solar potential for your property
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Google Sunroof
                </CardTitle>
                <CardDescription className="text-xs">
                  Check your roof's solar potential
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  See if your roof gets enough sunlight for solar panels and estimate potential savings.
                </p>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => setOpenDialog('sunroof')}
                >
                  Check Solar Potential
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AreaChart className="h-4 w-4" />
                  PVWatts Calculator
                </CardTitle>
                <CardDescription className="text-xs">
                  Estimate solar production
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Calculate solar production based on your location and system specifications.
                </p>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => setOpenDialog('pvwatts')}
                >
                  Calculate Production
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BadgeDollarSign className="h-4 w-4" />
                  SREC Trade
                </CardTitle>
                <CardDescription className="text-xs">
                  Check for available incentives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Find out if Solar Renewable Energy Credits (SRECs) apply to your location.
                </p>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => setOpenDialog('srec')}
                >
                  Check Incentives
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Google Sunroof Dialog */}
      <Dialog open={openDialog === 'sunroof'} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Google Sunroof - Solar Potential
            </DialogTitle>
            <DialogDescription>
              Check your roof's solar potential based on your address
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm mb-4">
                Enter your address to check your roof's solar potential using Google Sunroof.
              </p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter your address"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button>Search</Button>
              </div>
            </div>
            <div className="h-[300px] bg-muted rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Map preview will appear here</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PVWatts Dialog */}
      <Dialog open={openDialog === 'pvwatts'} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AreaChart className="h-5 w-5 text-primary" />
              PVWatts Calculator
            </DialogTitle>
            <DialogDescription>
              Calculate solar production based on your location and system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">System Size (kW)</label>
                <input 
                  type="number" 
                  defaultValue="14.8"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Zip Code</label>
                <input 
                  type="text" 
                  placeholder="Enter zip code"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Array Type</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="0">Fixed - Open Rack</option>
                  <option value="1">Fixed - Roof Mounted</option>
                  <option value="2">1-Axis Tracking</option>
                  <option value="3">2-Axis Tracking</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Tilt (degrees)</label>
                <input 
                  type="number" 
                  defaultValue="20"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <Button className="w-full">Calculate Production</Button>
            <div className="rounded-md bg-muted p-4">
              <p className="font-medium mb-2">Estimated Annual Production:</p>
              <p className="text-2xl font-bold text-solar-600">18,462 kWh</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SREC Dialog */}
      <Dialog open={openDialog === 'srec'} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BadgeDollarSign className="h-5 w-5 text-primary" />
              SREC Trade - Incentives Check
            </DialogTitle>
            <DialogDescription>
              Check if Solar Renewable Energy Credits (SRECs) apply to your location
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Select your state</option>
                <option value="CA">California</option>
                <option value="MA">Massachusetts</option>
                <option value="NJ">New Jersey</option>
                <option value="NY">New York</option>
                <option value="PA">Pennsylvania</option>
              </select>
              <Button>Check</Button>
            </div>
            <div className="rounded-md bg-muted p-4">
              <h4 className="font-medium mb-2">SREC Program Availability:</h4>
              <p className="mb-2">Please select a state to check SREC program availability.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExternalTools;
