import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Sun, 
  Wind, 
  Waves, 
  Zap, 
  Leaf, 
  Mountain, 
  Factory,
  Grid3X3,
  TrendingUp,
  Users,
  MapPin
} from 'lucide-react';

import { SolarPVDashboard } from './SolarPVDashboard';
import { WindEnergyDashboard } from './WindEnergyDashboard';
import { HydroelectricDashboard } from './HydroelectricDashboard';

export type TechnologyType = 
  | 'solar-pv' 
  | 'solar-thermal' 
  | 'wind-onshore' 
  | 'wind-offshore' 
  | 'hydroelectric' 
  | 'micro-hydro'
  | 'geothermal' 
  | 'biomass' 
  | 'ocean-wave' 
  | 'ocean-tidal'
  | 'hybrid'
  | 'overview';

interface TechnologyInfo {
  id: TechnologyType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: 'Solar' | 'Wind' | 'Hydro' | 'Geothermal' | 'Biomass' | 'Ocean' | 'Hybrid' | 'Overview';
  color: string;
  bgColor: string;
  available: boolean;
  projects?: number;
  capacity?: string;
}

const technologies: TechnologyInfo[] = [
  {
    id: 'overview',
    name: 'All Technologies',
    icon: Grid3X3,
    description: 'Comprehensive view of all renewable energy systems',
    category: 'Overview',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    available: true,
    projects: 12,
    capacity: '8.7 MW'
  },
  {
    id: 'solar-pv',
    name: 'Solar PV',
    icon: Sun,
    description: 'Photovoltaic solar panels and BIPV systems',
    category: 'Solar',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    available: true,
    projects: 5,
    capacity: '2.1 MW'
  },
  {
    id: 'solar-thermal',
    name: 'Solar Thermal',
    icon: Sun,
    description: 'Concentrated solar power and thermal systems',
    category: 'Solar',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    available: false
  },
  {
    id: 'wind-onshore',
    name: 'Wind Onshore',
    icon: Wind,
    description: 'Land-based wind turbines and wind farms',
    category: 'Wind',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    available: true,
    projects: 3,
    capacity: '4.2 MW'
  },
  {
    id: 'wind-offshore',
    name: 'Wind Offshore',
    icon: Wind,
    description: 'Offshore wind installations',
    category: 'Wind',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    available: false
  },
  {
    id: 'hydroelectric',
    name: 'Hydroelectric',
    icon: Waves,
    description: 'Large-scale hydroelectric power plants',
    category: 'Hydro',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    available: true,
    projects: 2,
    capacity: '1.5 MW'
  },
  {
    id: 'micro-hydro',
    name: 'Micro Hydro',
    icon: Waves,
    description: 'Small-scale run-of-river systems',
    category: 'Hydro',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    available: false
  },
  {
    id: 'geothermal',
    name: 'Geothermal',
    icon: Mountain,
    description: 'Geothermal power generation systems',
    category: 'Geothermal',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    available: false
  },
  {
    id: 'biomass',
    name: 'Biomass',
    icon: Leaf,
    description: 'Biomass and bioenergy systems',
    category: 'Biomass',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    available: false
  },
  {
    id: 'ocean-wave',
    name: 'Ocean Wave',
    icon: Waves,
    description: 'Wave energy conversion systems',
    category: 'Ocean',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    available: false
  },
  {
    id: 'ocean-tidal',
    name: 'Ocean Tidal',
    icon: Waves,
    description: 'Tidal energy generation systems',
    category: 'Ocean',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    available: false
  },
  {
    id: 'hybrid',
    name: 'Hybrid Systems',
    icon: Factory,
    description: 'Multi-technology renewable systems',
    category: 'Hybrid',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    available: false
  }
];

interface TechnologySelectorProps {
  projectId?: string;
  location?: { lat: number; lng: number };
  onTechnologyChange?: (technology: TechnologyType) => void;
}

export const TechnologySelector: React.FC<TechnologySelectorProps> = ({ 
  projectId = 'demo-project',
  location = { lat: 40.7128, lng: -74.0060 },
  onTechnologyChange 
}) => {
  const [selectedTechnology, setSelectedTechnology] = useState<TechnologyType>('overview');

  const handleTechnologySelect = (technology: TechnologyType) => {
    setSelectedTechnology(technology);
    onTechnologyChange?.(technology);
  };

  const availableTechnologies = technologies.filter(tech => tech.available);
  const comingSoonTechnologies = technologies.filter(tech => !tech.available);

  const renderDashboard = () => {
    switch (selectedTechnology) {
      case 'solar-pv':
        return <SolarPVDashboard projectId={projectId} location={location} />;
      case 'wind-onshore':
        return <WindEnergyDashboard projectId={projectId} location={location} />;
      case 'hydroelectric':
        return <HydroelectricDashboard projectId={projectId} location={location} />;
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            {/* Technology Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTechnologies.filter(tech => tech.id !== 'overview').map((tech) => (
                <Card key={tech.id} className="hover:shadow-lg transition-shadow cursor-pointer" 
                      onClick={() => handleTechnologySelect(tech.id)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 ${tech.bgColor} rounded-lg`}>
                          <tech.icon className={`h-6 w-6 ${tech.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tech.name}</CardTitle>
                          <p className="text-sm text-gray-600">{tech.category}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{tech.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{tech.projects}</p>
                        <p className="text-xs text-gray-500">Projects</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{tech.capacity}</p>
                        <p className="text-xs text-gray-500">Capacity</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
                  Portfolio Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">10</div>
                    <div className="text-sm text-gray-600">Total Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">7.8 MW</div>
                    <div className="text-sm text-gray-600">Total Capacity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">95.2%</div>
                    <div className="text-sm text-gray-600">Availability</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">$890K</div>
                    <div className="text-sm text-gray-600">Annual Revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coming Soon Technologies */}
            {comingSoonTechnologies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-6 w-6 mr-2 text-purple-600" />
                    Coming Soon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {comingSoonTechnologies.map((tech) => (
                      <div key={tech.id} className="flex items-center p-3 bg-gray-50 rounded-lg opacity-75">
                        <div className={`p-2 ${tech.bgColor} rounded-lg mr-3`}>
                          <tech.icon className={`h-5 w-5 ${tech.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{tech.name}</p>
                          <p className="text-xs text-gray-500">{tech.category}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Soon
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Technology Selection Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Renewable Energy Technologies</CardTitle>
              <p className="text-gray-600">Select a technology to view detailed analytics and management tools</p>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <Button
                key={tech.id}
                variant={selectedTechnology === tech.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleTechnologySelect(tech.id)}
                disabled={!tech.available}
                className={`flex items-center space-x-2 ${
                  selectedTechnology === tech.id 
                    ? `${tech.color} ${tech.bgColor}` 
                    : tech.available 
                      ? 'hover:bg-gray-50' 
                      : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <tech.icon className="h-4 w-4" />
                <span>{tech.name}</span>
                {!tech.available && (
                  <Badge variant="secondary" className="text-xs ml-1">
                    Soon
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Technology Dashboard */}
      {renderDashboard()}
    </div>
  );
};

export default TechnologySelector;
