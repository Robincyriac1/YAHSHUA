'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ProjectCard, StatCard, RecentActivity } from '@/components/dashboard/ProjectCard';
import { PerformanceChart } from '@/components/dashboard/Charts';
import { RealTimeMetrics } from '@/components/dashboard/RealTimeMetrics';
import { IntegrationDashboard } from '@/components/dashboard/IntegrationDashboard';
import { TechnologySelector, TechnologyType } from '@/components/technology/TechnologySelector';
import { ProjectStatus, ProjectType, EnergySource } from '@/types';
import { 
  Activity, 
  Battery, 
  DollarSign, 
  TrendingUp, 
  Zap,
  Sun,
  Wind,
  Waves,
  AlertTriangle,
  CheckCircle,
  Clock,
  Grid3X3,
  Settings,
  BarChart3,
  Users,
  MapPin
} from 'lucide-react';

type DashboardView = 'overview' | 'technologies' | 'projects' | 'analytics' | 'integrations';

export default function DemoDashboard() {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [selectedTechnology, setSelectedTechnology] = useState<TechnologyType>('overview');

  // Mock data for charts and components
  const mockPerformanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Energy Production (MWh)',
        data: [45, 52, 48, 61, 55, 67],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const mockActivities = [
    {
      id: '1',
      type: 'project_update' as const,
      message: 'Solar array efficiency increased to 95.2%',
      timestamp: new Date(),
      user: 'System',
    },
    {
      id: '2',
      type: 'maintenance' as const,
      message: 'Wind turbine scheduled maintenance completed',
      timestamp: new Date(Date.now() - 3600000),
      user: 'John Doe',
    },
  ];

  // Navigation items
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Grid3X3 },
    { id: 'technologies', label: 'Technologies', icon: Zap },
    { id: 'projects', label: 'Projects', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'integrations', label: 'Integrations', icon: Settings }
  ] as const;

  const handleTechnologyChange = (technology: TechnologyType) => {
    setSelectedTechnology(technology);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Capacity"
          value="8.7 MW"
          trend={{ value: 12.5, isPositive: true }}
          icon={Zap}
        />
        <StatCard
          title="Energy Generated"
          value="45.2 MWh"
          trend={{ value: 8.3, isPositive: true }}
          icon={Battery}
        />
        <StatCard
          title="Revenue"
          value="$234,567"
          trend={{ value: 15.2, isPositive: true }}
          icon={DollarSign}
        />
        <StatCard
          title="Efficiency"
          value="94.8%"
          trend={{ value: 2.1, isPositive: true }}
          icon={Activity}
        />
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Energy Production Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceChart data={mockPerformanceData} isLoading={false} />
        </CardContent>
      </Card>

      {/* Recent Projects and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProjectCard
              project={{
                id: '1',
                name: 'Downtown Solar Array',
                type: ProjectType.COMMERCIAL,
                status: ProjectStatus.OPERATIONAL,
                energySource: EnergySource.SOLAR_PV,
                systemCapacity: 2.5,
                estimatedGeneration: 3500,
                location: 'New York, NY',
                progress: 100,
                tags: ['solar', 'commercial'],
                ownerId: 'user1',
                organizationId: 'org1',
                currency: 'USD',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                owner: {} as any,
                organization: {} as any,
              }}
            />
            <ProjectCard
              project={{
                id: '2',
                name: 'Coastal Wind Farm',
                type: ProjectType.UTILITY_SCALE,
                status: ProjectStatus.CONSTRUCTION,
                energySource: EnergySource.WIND_ONSHORE,
                systemCapacity: 4.2,
                estimatedGeneration: 12000,
                location: 'Cape Cod, MA',
                progress: 65,
                tags: ['wind', 'utility'],
                ownerId: 'user1',
                organizationId: 'org1',
                currency: 'USD',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                owner: {} as any,
                organization: {} as any,
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity activities={mockActivities} />
          </CardContent>
        </Card>
      </div>

      {/* Real-time Metrics */}
      <RealTimeMetrics />
    </div>
  );

  const renderTechnologies = () => (
    <TechnologySelector 
      projectId="demo-project"
      location={{ lat: 40.7128, lng: -74.0060 }}
      onTechnologyChange={handleTechnologyChange}
    />
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Management</h2>
        <Button>
          <Sun className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Solar Projects</CardTitle>
            <Badge variant="outline">5 Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Downtown Array</span>
                <span className="text-sm text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rooftop Installation</span>
                <span className="text-sm text-blue-600">Planning</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wind Projects</CardTitle>
            <Badge variant="outline">3 Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Coastal Farm</span>
                <span className="text-sm text-orange-600">Construction</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Hill Ridge</span>
                <span className="text-sm text-green-600">Operational</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hydro Projects</CardTitle>
            <Badge variant="outline">2 Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">River Station</span>
                <span className="text-sm text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mountain Stream</span>
                <span className="text-sm text-blue-600">Planning</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Advanced Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={mockPerformanceData} isLoading={false} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Efficiency Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Solar PV</span>
                  <span>95.2%</span>
                </div>
                <Progress value={95.2} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Wind</span>
                  <span>87.8%</span>
                </div>
                <Progress value={87.8} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Hydro</span>
                  <span>91.5%</span>
                </div>
                <Progress value={91.5} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <IntegrationDashboard />
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return renderOverview();
      case 'technologies':
        return renderTechnologies();
      case 'projects':
        return renderProjects();
      case 'analytics':
        return renderAnalytics();
      case 'integrations':
        return renderIntegrations();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Mode Alert */}
      <div className="bg-blue-600 text-white px-4 py-2 text-center">
        <div className="flex items-center justify-center space-x-2">
          <span>🚀 DEMO MODE - Universal Renewable Energy Dashboard</span>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-4 text-blue-600 bg-white hover:bg-gray-100"
            onClick={() => window.location.href = '/'}
          >
            ← Back to Home
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Renewable Energy Dashboard
              </h1>
              <p className="text-gray-600">
                Universal platform for renewable energy management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as DashboardView)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  currentView === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </div>
    </div>
  );
}
