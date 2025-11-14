import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  Sun, 
  Zap, 
  Battery, 
  TrendingUp, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Info,
  Calculator,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';

interface SolarPVData {
  systemInfo: {
    capacity: number; // kW
    modules: number;
    inverters: number;
    batteryCapacity?: number; // kWh
    efficiency: number; // %
    installationDate: string;
    warrantyYears: number;
  };
  performance: {
    currentGeneration: number; // kW
    dailyGeneration: number; // kWh
    monthlyGeneration: number; // kWh
    yearlyGeneration: number; // kWh
    efficiency: number; // %
    capacityFactor: number; // %
  };
  financial: {
    totalInvestment: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    paybackPeriod: number; // years
    roi: number; // %
    savings: number; // monthly
  };
  maintenance: {
    lastInspection: string;
    nextMaintenance: string;
    alerts: Array<{
      type: 'warning' | 'error' | 'info';
      message: string;
      date: string;
    }>;
    moduleStatus: {
      operational: number;
      underperforming: number;
      faulty: number;
    };
  };
  environmental: {
    co2Saved: number; // kg
    treesEquivalent: number;
    carsOffRoad: number; // equivalent days
  };
}

interface SolarPVDashboardProps {
  projectId: string;
  location?: { lat: number; lng: number };
}

export const SolarPVDashboard: React.FC<SolarPVDashboardProps> = ({ 
  projectId, 
  location 
}) => {
  const [data, setData] = useState<SolarPVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'financial' | 'maintenance'>('overview');

  // Mock data for development
  useEffect(() => {
    const mockData: SolarPVData = {
      systemInfo: {
        capacity: 250, // 250 kW system
        modules: 625, // 400W modules
        inverters: 5,
        batteryCapacity: 500, // 500 kWh battery storage
        efficiency: 87.3,
        installationDate: '2024-03-15',
        warrantyYears: 25
      },
      performance: {
        currentGeneration: 187.5, // 75% of capacity
        dailyGeneration: 1250,
        monthlyGeneration: 35000,
        yearlyGeneration: 420000,
        efficiency: 87.3,
        capacityFactor: 23.8
      },
      financial: {
        totalInvestment: 375000,
        monthlyRevenue: 4200,
        yearlyRevenue: 50400,
        paybackPeriod: 7.4,
        roi: 13.5,
        savings: 3800
      },
      maintenance: {
        lastInspection: '2025-07-15',
        nextMaintenance: '2025-09-15',
        alerts: [
          {
            type: 'warning',
            message: 'Module performance decreased 2% in Sector B',
            date: '2025-08-14'
          },
          {
            type: 'info',
            message: 'Scheduled cleaning due next week',
            date: '2025-08-12'
          }
        ],
        moduleStatus: {
          operational: 618,
          underperforming: 5,
          faulty: 2
        }
      },
      environmental: {
        co2Saved: 12500,
        treesEquivalent: 285,
        carsOffRoad: 52
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
          <p className="text-center text-gray-500">No solar PV data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with System Overview */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Sun className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Solar PV System</CardTitle>
                <p className="text-gray-600">{formatNumber(data.systemInfo.capacity)} kW • {data.systemInfo.modules} modules</p>
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
                <Zap className="h-6 w-6 text-yellow-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  {data.performance.currentGeneration} kW
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
                <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
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
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Battery className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  {data.systemInfo.batteryCapacity || 0} kWh
                </span>
              </div>
              <p className="text-sm text-gray-600">Battery Storage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: Sun },
          { id: 'performance', label: 'Performance', icon: TrendingUp },
          { id: 'financial', label: 'Financial', icon: DollarSign },
          { id: 'maintenance', label: 'Maintenance', icon: Settings }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === id
                ? 'border-yellow-500 text-yellow-600'
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
          {/* Daily Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Generation Chart Placeholder</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(data.performance.dailyGeneration)}</p>
                  <p className="text-sm text-gray-600">kWh Today</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(data.performance.monthlyGeneration)}</p>
                  <p className="text-sm text-gray-600">kWh This Month</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(data.performance.yearlyGeneration)}</p>
                  <p className="text-sm text-gray-600">kWh This Year</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environmental Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sun className="h-5 w-5 mr-2 text-green-600" />
                Environmental Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-900">CO₂ Emissions Saved</p>
                    <p className="text-2xl font-bold text-green-700">{formatNumber(data.environmental.co2Saved)} kg</p>
                  </div>
                  <div className="text-green-600">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xl font-bold text-blue-700">{data.environmental.treesEquivalent}</p>
                    <p className="text-sm text-blue-600">Trees Planted Equivalent</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-xl font-bold text-purple-700">{data.environmental.carsOffRoad}</p>
                    <p className="text-sm text-purple-600">Car Days Off Road</p>
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
              <CardTitle>Module Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Operational</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {data.maintenance.moduleStatus.operational}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Underperforming</span>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    {data.maintenance.moduleStatus.underperforming}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Faulty</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    {data.maintenance.moduleStatus.faulty}
                  </Badge>
                </div>
                <Progress 
                  value={(data.maintenance.moduleStatus.operational / data.systemInfo.modules) * 100} 
                  className="mt-3"
                />
                <p className="text-xs text-gray-500 text-center">
                  {((data.maintenance.moduleStatus.operational / data.systemInfo.modules) * 100).toFixed(1)}% operational
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Capacity Factor</span>
                    <span className="text-sm text-gray-600">{data.performance.capacityFactor}%</span>
                  </div>
                  <Progress value={data.performance.capacityFactor} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">System Efficiency</span>
                    <span className="text-sm text-gray-600">{data.performance.efficiency}%</span>
                  </div>
                  <Progress value={data.performance.efficiency} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                System Configuration
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calculator className="h-4 w-4 mr-2" />
                Performance Analysis
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                Site Layout
              </Button>
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
              <CardTitle>Monthly Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-green-700">
                  {formatCurrency(data.financial.savings)}
                </p>
                <p className="text-sm text-gray-600">Average monthly savings on electricity</p>
              </div>
              <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Savings Chart Placeholder</p>
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
                        <p className="text-sm font-medium">{alert.message}</p>
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
                
                <Button className="w-full" variant="outline">
                  Schedule Maintenance
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
