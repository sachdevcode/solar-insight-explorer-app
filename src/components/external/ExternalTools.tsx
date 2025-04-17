import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ExternalLink,
  MapPin,
  AreaChart,
  BadgeDollarSign,
  X,
  Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';

const ExternalTools = () => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  // SREC states
  const [selectedState, setSelectedState] = useState<string>('');
  const [srecData, setSrecData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // PVWatts states
  const [pvSystemSize, setPvSystemSize] = useState<string>("10");
  const [pvZipCode, setPvZipCode] = useState<string>("");
  const [pvArrayType, setPvArrayType] = useState<string>("1");
  const [pvTilt, setPvTilt] = useState<string>("20");
  const [pvwattsData, setPvwattsData] = useState<any>(null);
  const [pvwattsLoading, setPvwattsLoading] = useState<boolean>(false);
  const [pvwattsError, setPvwattsError] = useState<string | null>(null);

  // Google Sunroof states
  const [sunroofAddress, setSunroofAddress] = useState<string>("");
  const [sunroofData, setSunroofData] = useState<any>(null);
  const [sunroofLoading, setSunroofLoading] = useState<boolean>(false);
  const [sunroofError, setSunroofError] = useState<string | null>(null);

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error fetching location:', error);
          setUserLocation(null);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setUserLocation(null);
    }
  }, []);

  useEffect(() => {
    if (openDialog === 'sunroof' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSunroofAddress(`${position.coords.latitude}, ${position.coords.longitude}`);
        },
        (error) => {
          console.error('Error fetching location:', error);
          setSunroofAddress('');
        }
      );
    }
  }, [openDialog]);

  // Function to check SREC incentives
  const checkSrecIncentives = async () => {
    if (!selectedState) {
      setError('Please select a state');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/srec-incentives?state=${selectedState}`);
      setSrecData(response.data);
    } catch (err) {
      console.error('Error fetching SREC data:', err);
      setError('Failed to fetch SREC incentives. Please try again.');
      setSrecData(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to calculate solar production
  const calculateSolarProduction = async () => {
    if (!pvSystemSize) {
      setPvwattsError('System Size is required');
      return;
    }

    setPvwattsLoading(true);
    setPvwattsError(null);

    try {
      const latitude = userLocation?.latitude;
      const longitude = userLocation?.longitude;

      if (!latitude || !longitude) {
        throw new Error('Unable to fetch user location. Please enable location services.');
      }

      const params = {
        systemCapacity: pvSystemSize,
        latitude,
        longitude,
        arrayType: pvArrayType,
        tilt: pvTilt,
      };

      const queryString = new URLSearchParams(params as any).toString();
      const response = await axios.get(`/api/solar-production?${queryString}`);

      setPvwattsData(response.data);
    } catch (err) {
      console.error('Error fetching PVWatts data:', err);
      setPvwattsError('Failed to fetch solar production estimates. Please try again.');
      setPvwattsData(null);
    } finally {
      setPvwattsLoading(false);
    }
  };

  // Function to check solar potential
  const checkSolarPotential = async () => {
    if (!sunroofAddress && (!userLocation?.latitude || !userLocation?.longitude)) {
      setSunroofError('Address or location is required');
      return;
    }

    setSunroofLoading(true);
    setSunroofError(null);

    try {
      const latitude = userLocation?.latitude || 40.7128; // Default to NYC if location is unavailable
      const longitude = userLocation?.longitude || -74.0060;

      const response = await axios.get(`/api/solar-potential?latitude=${latitude}&longitude=${longitude}`);
      setSunroofData(response.data);
    } catch (err) {
      console.error('Error fetching solar potential data:', err);
      setSunroofError('Failed to fetch solar potential data. Please try again.');
      setSunroofData(null);
    } finally {
      setSunroofLoading(false);
    }
  };

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
                  onClick={() => {
                    setOpenDialog('sunroof');
                    setSunroofData(null);
                    setSunroofAddress('');
                    setSunroofError(null);
                  }}
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
                  onClick={() => {
                    setOpenDialog('pvwatts');
                    setPvwattsData(null);
                    setPvSystemSize('10');
                    setPvZipCode('');
                    setPvArrayType('1');
                    setPvTilt('20');
                    setPvwattsError(null);
                  }}
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
                  onClick={() => {
                    setOpenDialog('srec');
                    setSrecData(null);
                    setSelectedState('');
                    setError(null);
                  }}
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
                  value={sunroofAddress}
                  onChange={(e) => setSunroofAddress(e.target.value)}
                  placeholder="Enter your address"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button
                  onClick={checkSolarPotential}
                  disabled={sunroofLoading}
                >
                  {sunroofLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : 'Search'}
                </Button>
              </div>
            </div>

            {sunroofError && (
              <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                {sunroofError}
              </div>
            )}

            {sunroofData && (
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <h4 className="font-medium mb-2">Solar Potential Results:</h4>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Maximum System Size:</p>
                      <p className="text-xl font-bold">{sunroofData.solarPotential?.maxCapacityKw.toFixed(1)} kW</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Annual Production Potential:</p>
                      <p className="text-xl font-bold text-green-600">
                        {sunroofData.solarPotential?.yearlyEnergyDcKwh.toLocaleString()} kWh/year
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Carbon Offset Equivalent:</p>
                      <p className="text-sm">
                        {((sunroofData.solarPotential?.yearlyEnergyDcKwh / 1000) *
                          (sunroofData.solarPotential?.carbonOffsetFactorKgPerMwh || 0) / 1000).toFixed(1)}
                        {' '}tons CO₂ per year
                      </p>
                    </div>
                  </div>
                </div>

                {sunroofData.roofSegmentStats && sunroofData.roofSegmentStats.length > 0 && (
                  <div className="rounded-md bg-muted p-4">
                    <h4 className="font-medium mb-2">Roof Segments:</h4>
                    <div className="space-y-2">
                      {sunroofData.roofSegmentStats.map((segment: any, index: number) => (
                        <div key={index} className="bg-background rounded p-2">
                          <div className="flex justify-between">
                            <span>
                              <span className="font-medium">Orientation: </span>
                              {segment.azimuthDegrees}°
                              ({segment.azimuthDegrees > 135 && segment.azimuthDegrees < 225 ? 'South' :
                                segment.azimuthDegrees >= 225 && segment.azimuthDegrees < 315 ? 'West' :
                                  segment.azimuthDegrees >= 315 || segment.azimuthDegrees < 45 ? 'North' : 'East'})
                            </span>
                            <span>
                              <span className="font-medium">Pitch: </span>
                              {segment.pitchDegrees}°
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Area: </span>
                            {segment.stats.areaMeters2.toFixed(1)} m²
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!sunroofData && !sunroofLoading && !sunroofError && (
              <div className="h-[300px] bg-muted rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Enter an address above to check solar potential</p>
              </div>
            )}
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
                  value={pvSystemSize}
                  onChange={(e) => setPvSystemSize(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Zip Code (Optional)</label>
                <input
                  type="text"
                  value={pvZipCode}
                  onChange={(e) => setPvZipCode(e.target.value)}
                  placeholder="Enter zip code"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Array Type</label>
                <select
                  value={pvArrayType}
                  onChange={(e) => setPvArrayType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
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
                  value={pvTilt}
                  onChange={(e) => setPvTilt(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={calculateSolarProduction}
              disabled={pvwattsLoading}
            >
              {pvwattsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : 'Calculate Production'}
            </Button>

            {pvwattsError && (
              <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                {pvwattsError}
              </div>
            )}

            {pvwattsData && (
              <div className="rounded-md bg-muted p-4 space-y-4">
                <div>
                  <p className="font-medium mb-2">Estimated Annual Production:</p>
                  <p className="text-2xl font-bold text-green-600">{pvwattsData.annualProduction.toLocaleString()} kWh</p>
                </div>

                <div>
                  <p className="font-medium mb-2">Estimated Annual Savings:</p>
                  <p className="text-xl font-bold">${pvwattsData.annualSavings?.toLocaleString()}</p>
                </div>

                {pvwattsData.monthlyProduction && (
                  <div>
                    <p className="font-medium mb-2">Monthly Production:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(pvwattsData.monthlyProduction).map(([month, production]) => (
                        <div key={month} className="bg-background rounded p-2 text-sm">
                          <span className="font-medium">{month}:</span> {(production as number).toLocaleString()} kWh
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!pvwattsData && !pvwattsLoading && !pvwattsError && (
              <div className="rounded-md bg-muted p-4">
                <p className="font-medium mb-2">Enter your system information to calculate production</p>
                <p className="text-sm text-muted-foreground">Calculations are based on historical weather data and typical system performance.</p>
              </div>
            )}
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
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                <option value="">Select your state</option>
                <option value="CA">California</option>
                <option value="MA">Massachusetts</option>
                <option value="NJ">New Jersey</option>
                <option value="NY">New York</option>
                <option value="PA">Pennsylvania</option>
                <option value="MD">Maryland</option>
                <option value="DC">Washington DC</option>
                <option value="OH">Ohio</option>
                <option value="IL">Illinois</option>
                <option value="DE">Delaware</option>
                <option value="TX">Texas</option>
              </select>
              <Button
                onClick={checkSrecIncentives}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : 'Check'}
              </Button>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                {error}
              </div>
            )}

            {srecData && (
              <div className="rounded-md bg-muted p-4 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">SREC Program Availability:</h4>
                  <div className={`text-lg font-bold ${srecData.srec_eligible ? 'text-green-600' : 'text-red-600'}`}>
                    {srecData.srec_eligible ? 'Available' : 'Not Available'}
                  </div>
                  <p className="text-sm text-muted-foreground">{srecData.srec_program_details}</p>
                </div>

                {srecData.srec_eligible && (
                  <>
                    <div>
                      <h4 className="font-medium mb-1">Current SREC Rate:</h4>
                      <p className="text-xl font-bold">${srecData.srec_rate} <span className="text-sm font-normal text-muted-foreground">per SREC</span></p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-1">Estimated Annual SREC Value:</h4>
                      <p className="text-xl font-bold text-green-600">${srecData.estimated_annual_srec_value}</p>
                      <p className="text-xs text-muted-foreground">Based on 1 SREC per MWh of production</p>
                    </div>
                  </>
                )}

                {srecData.additional_incentives && srecData.additional_incentives.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Additional Incentives:</h4>
                    <ul className="space-y-2">
                      {srecData.additional_incentives.map((incentive: any, index: number) => (
                        <li key={index} className="bg-background rounded p-2">
                          <div className="font-medium">{incentive.name}</div>
                          <div className="text-sm">Type: {incentive.type}</div>
                          <div className="text-sm">Value: ${incentive.amount}</div>
                          <div className="text-xs text-muted-foreground">{incentive.details}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!srecData && !loading && !error && (
              <div className="rounded-md bg-muted p-4">
                <h4 className="font-medium mb-2">SREC Program Availability:</h4>
                <p className="mb-2">Please select a state to check SREC program availability.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExternalTools;
