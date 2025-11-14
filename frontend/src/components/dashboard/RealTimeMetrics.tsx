import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import { useAuth } from '../../hooks/useAuth';
import { 
  Activity, 
  Zap, 
  DollarSign, 
  TrendingUp, 
  Wifi, 
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface RealTimeMetricsProps {
  projectId?: string;
  organizationId?: string;
}

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({ 
  projectId, 
  organizationId 
}) => {
  const { user } = useAuth();
  const {
    connected,
    metrics,
    systemHealth,
    notifications,
    analytics,
    joinOrganization,
    joinProject,
    requestAnalytics,
    requestSystemHealth,
    getProjectMetrics,
    getAggregatedMetrics
  } = useRealTimeData();

  useEffect(() => {
    // Join rooms and request initial data
    if (connected && user) {
      if (organizationId) {
        joinOrganization(organizationId);
      }
      
      if (projectId) {
        joinProject(projectId);
      }
      
      // Request initial analytics
      requestAnalytics(organizationId, projectId);
      requestSystemHealth();
    }
  }, [connected, user, organizationId, projectId]);

  const projectMetrics = projectId ? getProjectMetrics(projectId) : null;
  const aggregatedMetrics = getAggregatedMetrics();
  const latestNotifications = notifications.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Real-Time Monitoring</h3>
        <div className="flex items-center space-x-2">
          {connected ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600">Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Project-Specific Metrics */}
      {projectMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Live Project Metrics</span>
              <Badge variant="secondary" className="ml-2">
                Updated {new Date(projectMetrics.timestamp).toLocaleTimeString()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Energy Production */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">
                  {projectMetrics.energyProduction.current.toFixed(1)}
                </p>
                <p className="text-sm text-blue-600">kW Current</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">
                  {projectMetrics.energyProduction.daily.toFixed(1)}
                </p>
                <p className="text-sm text-green-600">kWh Today</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-700">
                  ${projectMetrics.financialMetrics.dailyRevenue.toFixed(2)}
                </p>
                <p className="text-sm text-purple-600">Revenue Today</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-700">
                  {projectMetrics.efficiency.toFixed(1)}%
                </p>
                <p className="text-sm text-orange-600">Efficiency</p>
              </div>
            </div>

            {/* System Health */}
            <div className="mt-4">
              <h4 className="font-medium mb-3">System Health</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  {projectMetrics.systemHealth.inverters === 'online' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">Inverters</span>
                </div>
                <div className="flex items-center space-x-2">
                  {projectMetrics.systemHealth.sensors === 'online' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">Sensors</span>
                </div>
                <div className="flex items-center space-x-2">
                  {projectMetrics.systemHealth.communication === 'online' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">Communication</span>
                </div>
              </div>
            </div>

            {/* Efficiency Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>System Efficiency</span>
                <span>{projectMetrics.efficiency.toFixed(1)}%</span>
              </div>
              <Progress value={projectMetrics.efficiency} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aggregated Metrics (when no specific project) */}
      {!projectId && aggregatedMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Portfolio Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">
                  {aggregatedMetrics.projectCount}
                </p>
                <p className="text-sm text-blue-600">Active Projects</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">
                  {aggregatedMetrics.totalProduction.toFixed(1)}
                </p>
                <p className="text-sm text-green-600">Total kW</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-700">
                  ${aggregatedMetrics.totalRevenue.toFixed(2)}
                </p>
                <p className="text-sm text-purple-600">Daily Revenue</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-700">
                  {aggregatedMetrics.averageEfficiency.toFixed(1)}%
                </p>
                <p className="text-sm text-orange-600">Avg Efficiency</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Summary */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle>Analytics Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-xl font-semibold">{analytics.totalProjects}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Projects</p>
                <p className="text-xl font-semibold">{analytics.activeProjects}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Capacity</p>
                <p className="text-xl font-semibold">{analytics.totalCapacity.toFixed(1)} kW</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Health */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>System Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Clock className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                <p className="text-lg font-semibold">
                  {Math.floor(systemHealth.uptime / 3600)}h
                </p>
                <p className="text-sm text-gray-600">Uptime</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Activity className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                <p className="text-lg font-semibold">
                  {systemHealth.memory.used}/{systemHealth.memory.total} MB
                </p>
                <p className="text-sm text-gray-600">Memory</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-semibold flex items-center justify-center">
                  {systemHealth.database === 'healthy' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                </p>
                <p className="text-sm text-gray-600">Database</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-semibold flex items-center justify-center">
                  {systemHealth.api === 'healthy' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                </p>
                <p className="text-sm text-gray-600">API</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Notifications */}
      {latestNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {latestNotifications.map((notification, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  {notification.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />}
                  {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                  {notification.type === 'info' && <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Status Footer */}
      {!connected && (
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            Real-time monitoring is currently offline. Data may not be up to date.
          </p>
        </div>
      )}
    </div>
  );
};

export default RealTimeMetrics;
