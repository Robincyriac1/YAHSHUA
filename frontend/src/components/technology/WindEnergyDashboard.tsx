import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  Wind, 
  Zap, 
  TrendingUp, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  MapPin,
  Calendar,
  DollarSign,
  Gauge,
  Activity
} from 'lucide-react';

interface WindEnergyData {
  systemInfo: {
    capacity: number; // MW
    turbines: number;
    hubHeight: number; // meters
    rotorDiameter: number; // meters
    cutInSpeed: number; // m/s
    cutOutSpeed: number; // m/s
    ratedSpeed: number; // m/s
    installationDate: string;
    warrantyYears: number;
  };
  performance: {
    currentGeneration: number; // MW
    dailyGeneration: number; // MWh
    monthlyGeneration: number; // MWh
    yearlyGeneration: number; // MWh
    capacityFactor: number; // %
    availability: number; // %
    avgWindSpeed: number; // m/s
  };
  financial: {
    totalInvestment: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    paybackPeriod: number; // years
    roi: number; // %
    operatingCosts: number; // monthly
  };
  maintenance: {
    lastInspection: string;
    nextMaintenance: string;
    alerts: Array<{
      turbineId: string;
      type: 'warning' | 'error' | 'info';
      message: string;
      date: string;
    }>;
    turbineStatus: {
      operational: number;
      maintenance: number;
      offline: number;
    };
  };
  environmental: {
    co2Saved: number; // tonnes
    householdsSupplied: number;
    oilBarrelsEquivalent: number;
  };
  windConditions: {
    currentSpeed: number; // m/s
    currentDirection: number; // degrees
    forecast: Array<{
      time: string;
      speed: number; // m/s
      direction: number; // degrees
      expectedGeneration: number; // MW
    }>;
  };
}

interface WindEnergyDashboardProps {
  projectId: string;
  location?: { lat: number; lng: number };
}

export const WindEnergyDashboard: React.FC<WindEnergyDashboardProps> = ({ 
  projectId, 
  location 
}) => {
  const [data, setData] = useState<WindEnergyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'financial' | 'maintenance'>('overview');

  // Mock data for development
  useEffect(() => {
    const mockData: WindEnergyData = {
      systemInfo: {
        capacity: 2.1, // 2.1 MW wind farm
        turbines: 3, // 700kW turbines
        hubHeight: 80,
        rotorDiameter: 77,
        cutInSpeed: 3.5,
        cutOutSpeed: 25,
        ratedSpeed: 12,
        installationDate: '2024-01-20',
        warrantyYears: 20
      },
      performance: {
        currentGeneration: 1.45, // MW
        dailyGeneration: 28.5, // MWh
        monthlyGeneration: 850, // MWh
        yearlyGeneration: 10200, // MWh
        capacityFactor: 55.2,
        availability: 97.8,
        avgWindSpeed: 8.3
      },
      financial: {
        totalInvestment: 3150000,
        monthlyRevenue: 51000,
        yearlyRevenue: 612000,
        paybackPeriod: 5.1,
        roi: 19.4,
        operatingCosts: 8500
      },
      maintenance: {
        lastInspection: '2025-07-20',
        nextMaintenance: '2025-10-15',
        alerts: [
          {
            turbineId: 'T-002',
            type: 'warning',
            message: 'Gearbox temperature slightly elevated',
            date: '2025-08-15'
          },
          {
            turbineId: 'T-001',
            type: 'info',
            message: 'Blade cleaning scheduled',
            date: '2025-08-13'
          }
        ],
        turbineStatus: {
          operational: 3,
          maintenance: 0,
          offline: 0
        }
      },
      environmental: {
        co2Saved: 7200, // tonnes annually
        householdsSupplied: 2850,
        oilBarrelsEquivalent: 18500
      },
      windConditions: {
        currentSpeed: 8.3,
        currentDirection: 245, // SW
        forecast: [
          { time: '14:00', speed: 8.3, direction: 245, expectedGeneration: 1.45 },
          { time: '15:00', speed: 9.1, direction: 250, expectedGeneration: 1.68 },
          { time: '16:00', speed: 7.8, direction: 240, expectedGeneration: 1.32 },
          { time: '17:00', speed: 6.5, direction: 235, expectedGeneration: 0.95 },
          { time: '18:00', speed: 5.2, direction: 230, expectedGeneration: 0.58 }
        ]
      }
    };

    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  }, [projectId]);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">No wind energy data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with System Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Wind className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Wind Energy System</CardTitle>
                <p className="text-gray-600">{data.systemInfo.capacity} MW • {data.systemInfo.turbines} turbines</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Operational
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  {data.performance.currentGeneration} MW
                </span>
              </div>
              <p className="text-sm text-gray-600">Current Generation</p>
              <Progress 
                value={(data.performance.currentGeneration / data.systemInfo.capacity) * 100} 
                className="mt-2"
              />
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Gauge className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  {data.windConditions.currentSpeed} m/s
                </span>
              </div>
              <p className="text-sm text-gray-600">Wind Speed ({getWindDirection(data.windConditions.currentDirection)})</p>
              <Progress value={(data.windConditions.currentSpeed / 15) * 100} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-6 w-6 text-purple-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  {data.performance.capacityFactor}%
                </span>
              </div>
              <p className="text-sm text-gray-600">Capacity Factor</p>
              <Progress value={data.performance.capacityFactor} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.financial.monthlyRevenue)}
                </span>
              </div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: Wind },
          { id: 'performance', label: 'Performance', icon: TrendingUp },
          { id: 'financial', label: 'Financial', icon: DollarSign },
          { id: 'maintenance', label: 'Maintenance', icon: Settings }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wind Conditions & Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>Wind Conditions & Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Current Conditions</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {data.windConditions.currentSpeed} m/s {getWindDirection(data.windConditions.currentDirection)}
                  </Badge>
                </div>
              </div>
              
              <div className="h-48 bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500 text-center mb-4">Wind Speed Forecast</p>
                <div className="space-y-2">
                  {data.windConditions.forecast.slice(0, 4).map((forecast, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{forecast.time}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{forecast.speed} m/s</span>
                        <span className="text-gray-500">{getWindDirection(forecast.direction)}</span>
                        <span className="text-blue-600">{forecast.expectedGeneration} MW</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environmental Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wind className="h-5 w-5 mr-2 text-green-600" />
                Environmental Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-900">CO₂ Emissions Saved</p>
                    <p className="text-2xl font-bold text-green-700">{formatNumber(data.environmental.co2Saved)} tonnes/year</p>
                  </div>
                  <div className="text-green-600">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xl font-bold text-blue-700">{formatNumber(data.environmental.householdsSupplied)}</p>
                    <p className="text-sm text-blue-600">Households Supplied</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-xl font-bold text-purple-700">{formatNumber(data.environmental.oilBarrelsEquivalent)}</p>
                    <p className="text-sm text-purple-600">Oil Barrels Equivalent</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Turbine Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Operational</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {data.maintenance.turbineStatus.operational}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Maintenance</span>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    {data.maintenance.turbineStatus.maintenance}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Offline</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    {data.maintenance.turbineStatus.offline}
                  </Badge>
                </div>
                <Progress 
                  value={(data.maintenance.turbineStatus.operational / data.systemInfo.turbines) * 100} 
                  className="mt-3"
                />
                <p className="text-xs text-gray-500 text-center">
                  {data.performance.availability}% availability
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generation Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">{data.performance.dailyGeneration}</p>
                  <p className="text-sm text-blue-600">MWh Today</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">{formatNumber(data.performance.monthlyGeneration)}</p>
                  <p className="text-sm text-green-600">MWh This Month</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-700">{formatNumber(data.performance.yearlyGeneration)}</p>
                  <p className="text-sm text-purple-600">MWh This Year</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hub Height</span>
                  <span className="font-medium">{data.systemInfo.hubHeight}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rotor Diameter</span>
                  <span className="font-medium">{data.systemInfo.rotorDiameter}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cut-in Speed</span>
                  <span className="font-medium">{data.systemInfo.cutInSpeed} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rated Speed</span>
                  <span className="font-medium">{data.systemInfo.ratedSpeed} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cut-out Speed</span>
                  <span className="font-medium">{data.systemInfo.cutOutSpeed} m/s</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 mb-1">Total Investment</p>
                    <p className="text-xl font-bold text-blue-700">
                      {formatCurrency(data.financial.totalInvestment)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 mb-1">Annual Revenue</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency(data.financial.yearlyRevenue)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600 mb-1">ROI</p>
                    <p className="text-xl font-bold text-purple-700">{data.financial.roi}%</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-600 mb-1">Payback Period</p>
                    <p className="text-xl font-bold text-orange-700">{data.financial.paybackPeriod} years</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operating Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-orange-700">
                  {formatCurrency(data.financial.operatingCosts)}
                </p>
                <p className="text-sm text-gray-600">Monthly operating costs</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Net Monthly Income</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(data.financial.monthlyRevenue - data.financial.operatingCosts)}
                  </span>
                </div>
                <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Cost Breakdown Chart</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                Turbine Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.maintenance.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.type === 'error'
                        ? 'bg-red-50 border-red-400 text-red-700'
                        : alert.type === 'warning'
                        ? 'bg-yellow-50 border-yellow-400 text-yellow-700'
                        : 'bg-blue-50 border-blue-400 text-blue-700'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {alert.type === 'error' ? (
                          <AlertTriangle className="h-4 w-4 mt-0.5" />
                        ) : alert.type === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 mt-0.5" />
                        ) : (
                          <Info className="h-4 w-4 mt-0.5" />
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium">
                          {alert.turbineId}: {alert.message}
                        </p>
                        <p className="text-xs opacity-75 mt-1">{alert.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Maintenance Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-900">Last Inspection</p>
                    <p className="text-sm text-green-600">{data.maintenance.lastInspection}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900">Next Maintenance</p>
                    <p className="text-sm text-blue-600">{data.maintenance.nextMaintenance}</p>
                  </div>
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    Individual Turbine Status
                  </Button>
                  <Button className="w-full" variant="outline">
                    Schedule Maintenance
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
