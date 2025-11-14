import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface RealTimeMetrics {
  projectId: string;
  energyProduction: {
    current: number;
    daily: number;
    weekly: number;
    monthly: number;
  };
  efficiency: number;
  systemHealth: {
    inverters: string;
    sensors: string;
    communication: string;
    lastCheck: Date;
  };
  financialMetrics: {
    dailyRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    roi: number;
    paybackPeriod: number;
  };
  timestamp: Date;
}

interface SystemHealth {
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
  database: string;
  api: string;
  timestamp: Date;
}

interface SystemNotification {
  message: string;
  type: 'info' | 'warning' | 'error';
  timestamp: Date;
}

interface AnalyticsData {
  totalProjects: number;
  activeProjects: number;
  totalCapacity: number;
  totalEnergyProduced: number;
  averageEfficiency: number;
  timeRange: string;
  timestamp: Date;
}

export const useRealTimeData = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [metrics, setMetrics] = useState<RealTimeMetrics[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      upgrade: true
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to real-time server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from real-time server');
      setConnected(false);
    });

    // Real-time data handlers
    newSocket.on('real-time-metrics', (data: RealTimeMetrics) => {
      setMetrics(prev => {
        const filtered = prev.filter(m => m.projectId !== data.projectId);
        return [...filtered, data].slice(-100); // Keep last 100 metrics
      });
    });

    newSocket.on('system-health', (data: SystemHealth) => {
      setSystemHealth(data);
    });

    newSocket.on('system-health-update', (data: SystemHealth) => {
      setSystemHealth(data);
    });

    newSocket.on('system-notification', (data: SystemNotification) => {
      setNotifications(prev => [data, ...prev].slice(0, 50)); // Keep last 50 notifications
    });

    newSocket.on('analytics-data', (data: AnalyticsData) => {
      setAnalytics(data);
    });

    newSocket.on('organization-metrics-update', (data: RealTimeMetrics) => {
      setMetrics(prev => {
        const filtered = prev.filter(m => m.projectId !== data.projectId);
        return [...filtered, data].slice(-100);
      });
    });

    newSocket.on('error', (error: any) => {
      console.error('Socket error:', error);
      setNotifications(prev => [{
        message: `Connection error: ${error.message}`,
        type: 'error' as const,
        timestamp: new Date()
      }, ...prev].slice(0, 50));
    });

    // Cleanup
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Join organization room
  const joinOrganization = (orgId: string) => {
    if (socket && connected) {
      socket.emit('join-organization', orgId);
    }
  };

  // Join project room
  const joinProject = (projectId: string) => {
    if (socket && connected) {
      socket.emit('join-project', projectId);
    }
  };

  // Request analytics data
  const requestAnalytics = (organizationId?: string, projectId?: string, timeRange: string = '24h') => {
    if (socket && connected) {
      socket.emit('request-analytics', {
        organizationId,
        projectId,
        timeRange
      });
    }
  };

  // Request system health
  const requestSystemHealth = () => {
    if (socket && connected) {
      socket.emit('request-system-health');
    }
  };

  // Update project (real-time)
  const updateProject = (projectId: string, updates: any) => {
    if (socket && connected) {
      socket.emit('project-update', {
        projectId,
        updates
      });
    }
  };

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Get latest metrics for a project
  const getProjectMetrics = (projectId: string): RealTimeMetrics | null => {
    return metrics.find(m => m.projectId === projectId) || null;
  };

  // Get aggregated metrics for all projects
  const getAggregatedMetrics = () => {
    if (metrics.length === 0) return null;

    const totalProduction = metrics.reduce((sum, m) => sum + m.energyProduction.current, 0);
    const averageEfficiency = metrics.reduce((sum, m) => sum + m.efficiency, 0) / metrics.length;
    const totalRevenue = metrics.reduce((sum, m) => sum + m.financialMetrics.dailyRevenue, 0);

    return {
      totalProduction: Math.round(totalProduction * 100) / 100,
      averageEfficiency: Math.round(averageEfficiency * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      projectCount: metrics.length
    };
  };

  return {
    // Connection state
    connected,
    socket,
    
    // Data
    metrics,
    systemHealth,
    notifications,
    analytics,
    
    // Actions
    joinOrganization,
    joinProject,
    requestAnalytics,
    requestSystemHealth,
    updateProject,
    clearNotifications,
    
    // Helpers
    getProjectMetrics,
    getAggregatedMetrics
  };
};

export default useRealTimeData;
