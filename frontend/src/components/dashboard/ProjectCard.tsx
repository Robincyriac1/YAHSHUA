'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Sun, 
  Wind, 
  Zap,
  MapPin,
  Calendar,
  DollarSign,
  Leaf
} from 'lucide-react';
import { Project, EnergySource } from '../../types';
import { formatCurrency, formatCapacity, formatPercentage, formatDate, formatRelativeTime } from '../../lib/utils';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const getEnergyIcon = (energySource: EnergySource) => {
    switch (energySource) {
      case EnergySource.SOLAR_PV:
      case EnergySource.SOLAR_THERMAL:
      case EnergySource.BIPV:
        return Sun;
      case EnergySource.WIND_ONSHORE:
      case EnergySource.WIND_OFFSHORE:
        return Wind;
      default:
        return Zap;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational':
        return 'success';
      case 'construction':
      case 'commissioning':
        return 'warning';
      case 'planning':
      case 'design':
        return 'secondary';
      case 'cancelled':
      case 'on_hold':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const IconComponent = getEnergyIcon(project.energySource);

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <IconComponent className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{project.type}</p>
            </div>
          </div>
          <Badge variant={getStatusColor(project.status) as any}>
            {project.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-muted-foreground">Capacity:</span>
            <span className="font-medium">{formatCapacity(project.systemCapacity)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-red-500" />
            <span className="text-muted-foreground">Location:</span>
            <span className="font-medium truncate">{project.location}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{formatPercentage(project.progress)}</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* Financial Info */}
        {project.estimatedCost && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Cost:</span>
            </div>
            <span className="font-medium">
              {formatCurrency(project.estimatedCost, project.currency)}
            </span>
          </div>
        )}

        {/* Timeline */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Updated {formatRelativeTime(project.updatedAt)}</span>
          </div>
          {project.plannedEndDate && (
            <span>Due {formatDate(project.plannedEndDate)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  className 
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            {trend && (
              <div className={`flex items-center space-x-1 text-xs ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{formatPercentage(Math.abs(trend.value), 1)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface RecentActivityProps {
  activities: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: Date;
    user?: string;
    project?: string;
  }>;
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'project_created':
      case 'project_updated':
        return Activity;
      case 'generation':
        return Zap;
      case 'maintenance':
        return Calendar;
      case 'financial':
        return DollarSign;
      case 'environmental':
        return Leaf;
      default:
        return Activity;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </p>
        ) : (
          activities.map((activity) => {
            const IconComponent = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="p-1 bg-gray-100 rounded-full">
                  <IconComponent className="h-3 w-3 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {activity.user && (
                      <span className="text-xs text-muted-foreground">
                        by {activity.user}
                      </span>
                    )}
                    {activity.project && (
                      <span className="text-xs text-muted-foreground">
                        in {activity.project}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
