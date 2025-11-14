import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  Waves, 
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
  Droplets,
  Activity,
  Thermometer
} from 'lucide-react';

interface HydroelectricData {
  systemInfo: {
    capacity: number; // MW
    turbines: number;
    headHeight: number; // meters
    flowRate: number; // m³/s
    turbineType: string;
    damHeight: number; // meters
    reservoirCapacity: number; // million m³
    installationDate: string;
    warrantyYears: number;
  };
  performance: {
    currentGeneration: number; // MW
    dailyGeneration: number; // MWh
    monthlyGeneration: number; // MWh
    yearlyGeneration: number; // MWh
    efficiency: number; // %
    availability: number; // %
    currentFlow: number; // m³/s
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
      component: string;
      type: 'warning' | 'error' | 'info';
      message: string;
      date: string;
    }>;
    componentStatus: {
      turbines: { operational: number; maintenance: number; offline: number };
      generators: { operational: number; maintenance: number; offline: number };
      dam: 'excellent' | 'good' | 'fair' | 'poor';
    };
  };
  environmental: {
    co2Saved: number; // tonnes
    householdsSupplied: number;
    fishLadderUsage: number; // fish per month
    waterQuality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  waterConditions: {
    reservoirLevel: number; // % of capacity
    inflow: number; // m³/s
    outflow: number; // m³/s
    waterTemperature: number; // °C
    spillwayStatus: 'closed' | 'open' | 'partial';
    forecast: Array<{
      date: string;
      expectedInflow: number; // m³/s
      precipitationMm: number;
      expectedGeneration: number; // MW
    }>;
  };
}

interface HydroelectricDashboardProps {
  projectId: string;
  location?: { lat: number; lng: number };
}

export const HydroelectricDashboard: React.FC<HydroelectricDashboardProps> = ({ 
  projectId, 
  location 
}) => {
  const [data, setData] = useState<HydroelectricData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'financial' | 'maintenance'>('overview');

  // Mock data for development
  useEffect(() => {
    const mockData: HydroelectricData = {
      systemInfo: {
        capacity: 1.5, // 1.5 MW micro-hydro
        turbines: 2,
        headHeight: 45,
        flowRate: 8.5,
        turbineType: 'Francis',
        damHeight: 12,
        reservoirCapacity: 2.8,
        installationDate: '2023-09-10',
        warrantyYears: 30
      },
      performance: {
        currentGeneration: 1.2, // MW
        dailyGeneration: 28.8, // MWh
        monthlyGeneration: 864, // MWh
        yearlyGeneration: 10368, // MWh
        efficiency: 88.5,
        availability: 96.2,
        currentFlow: 7.8
      },
      financial: {
        totalInvestment: 2250000,
        monthlyRevenue: 51840,
        yearlyRevenue: 622080,
        paybackPeriod: 3.6,
        roi: 27.7,
        operatingCosts: 4500
      },
      maintenance: {
        lastInspection: '2025-06-15',
        nextMaintenance: '2025-09-20',
        alerts: [
          {
            component: 'Turbine 1',
            type: 'info',
            message: 'Scheduled bearing lubrication due',
            date: '2025-08-16'
          },
          {
            component: 'Fish Ladder',
            type: 'warning',
            message: 'Debris clearance needed',
            date: '2025-08-14'
          }
        ],
        componentStatus: {
          turbines: { operational: 2, maintenance: 0, offline: 0 },
          generators: { operational: 2, maintenance: 0, offline: 0 },
          dam: 'excellent'
        }
      },
      environmental: {
        co2Saved: 7315, // tonnes annually
        householdsSupplied: 2890,
        fishLadderUsage: 1250,
        waterQuality: 'excellent'
      },
      waterConditions: {
        reservoirLevel: 78.5, // % of capacity
        inflow: 8.2,
        outflow: 7.8,
        waterTemperature: 14.5,
        spillwayStatus: 'closed',
        forecast: [
          { date: '2025-08-17', expectedInflow: 8.5, precipitationMm: 2, expectedGeneration: 1.25 },
          { date: '2025-08-18', expectedInflow: 9.2, precipitationMm: 8, expectedGeneration: 1.35 },
          { date: '2025-08-19', expectedInflow: 7.8, precipitationMm: 0, expectedGeneration: 1.15 },
          { date: '2025-08-20', expectedInflow: 7.2, precipitationMm: 0, expectedGeneration: 1.08 },
          { date: '2025-08-21', expectedInflow: 6.8, precipitationMm: 1, expectedGeneration: 1.02 }
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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'excellent': return 'text-green-700 bg-green-50';
      case 'good': return 'text-blue-700 bg-blue-50';
      case 'fair': return 'text-yellow-700 bg-yellow-50';
      case 'poor': return 'text-red-700 bg-red-50';
      default: return 'text-gray-700 bg-gray-50';
    }
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
          <p className="text-center text-gray-500">No hydroelectric data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with System Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Waves className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Hydroelectric Power</CardTitle>
                <p className="text-gray-600">{data.systemInfo.capacity} MW • {data.systemInfo.turbineType} turbines</p>
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
                <Droplets className="h-6 w-6 text-cyan-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  {data.waterConditions.reservoirLevel}%
                </span>
              </div>
              <p className="text-sm text-gray-600">Reservoir Level</p>
              <Progress value={data.waterConditions.reservoirLevel} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  {data.performance.efficiency}%
                </span>
              </div>
              <p className="text-sm text-gray-600">System Efficiency</p>
              <Progress value={data.performance.efficiency} className="mt-2" />
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
          { id: 'overview', label: 'Overview', icon: Waves },
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
          {/* Water Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Water Conditions & Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xl font-bold text-blue-700">{data.waterConditions.inflow} m³/s</p>
                    <p className="text-sm text-blue-600">Inflow Rate</p>
                  </div>
                  <div className="text-center p-3 bg-cyan-50 rounded-lg">
                    <p className="text-xl font-bold text-cyan-700">{data.waterConditions.outflow} m³/s</p>
                    <p className="text-sm text-cyan-600">Outflow Rate</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Thermometer className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">Water Temperature</span>
                  </div>
                  <span className="text-lg font-bold">{data.waterConditions.waterTemperature}°C</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Spillway Status</span>
                  <Badge variant="outline" className={getStatusColor(data.waterConditions.spillwayStatus)}>
                    {data.waterConditions.spillwayStatus.charAt(0).toUpperCase() + data.waterConditions.spillwayStatus.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environmental Impact & Fish Ladder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Waves className="h-5 w-5 mr-2 text-green-600" />
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
                    <p className="text-xl font-bold text-purple-700">{formatNumber(data.environmental.fishLadderUsage)}</p>
                    <p className="text-sm text-purple-600">Fish/Month (Ladder)</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Water Quality</span>
                  <Badge variant="outline" className={getStatusColor(data.environmental.waterQuality)}>
                    {data.environmental.waterQuality.charAt(0).toUpperCase() + data.environmental.waterQuality.slice(1)}
                  </Badge>
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
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Turbines</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {data.maintenance.componentStatus.turbines.operational}/{data.systemInfo.turbines}
                    </Badge>
                  </div>
                  <Progress 
                    value={(data.maintenance.componentStatus.turbines.operational / data.systemInfo.turbines) * 100} 
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Generators</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {data.maintenance.componentStatus.generators.operational}/{data.systemInfo.turbines}
                    </Badge>
                  </div>
                  <Progress 
                    value={(data.maintenance.componentStatus.generators.operational / data.systemInfo.turbines) * 100} 
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Dam Condition</span>
                  <Badge variant="outline" className={getStatusColor(data.maintenance.componentStatus.dam)}>
                    {data.maintenance.componentStatus.dam.charAt(0).toUpperCase() + data.maintenance.componentStatus.dam.slice(1)}
                  </Badge>
                </div>
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
                  <span className="text-gray-600">Head Height</span>
                  <span className="font-medium">{data.systemInfo.headHeight}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dam Height</span>
                  <span className="font-medium">{data.systemInfo.damHeight}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Design Flow Rate</span>
                  <span className="font-medium">{data.systemInfo.flowRate} m³/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reservoir Capacity</span>
                  <span className="font-medium">{data.systemInfo.reservoirCapacity}M m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Turbine Type</span>
                  <span className="font-medium">{data.systemInfo.turbineType}</span>
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
              <CardTitle>Operating Economics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-700">
                    {formatCurrency(data.financial.operatingCosts)}
                  </p>
                  <p className="text-sm text-orange-600">Monthly operating costs</p>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Net Monthly Income</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(data.financial.monthlyRevenue - data.financial.operatingCosts)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Operating Margin</span>
                    <span className="font-medium">
                      {(((data.financial.monthlyRevenue - data.financial.operatingCosts) / data.financial.monthlyRevenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Revenue vs Costs Chart</p>
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
                System Alerts
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
                          {alert.component}: {alert.message}
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
                    Turbine Inspections
                  </Button>
                  <Button className="w-full" variant="outline">
                    Dam Safety Check
                  </Button>
                  <Button className="w-full" variant="outline">
                    Fish Ladder Maintenance
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
