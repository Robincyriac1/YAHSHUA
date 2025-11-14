import { useState, useEffect, useCallback } from 'react';
import { DashboardStats, TimeSeriesData, RealTimeData } from '../types';
import { getAuthToken } from '../lib/utils';

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const fetchStats = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setError('Authentication required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetch('http://localhost:3001/api/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      } else {
        // For now, return mock data if API isn't implemented
        setStats({
          totalProjects: 12,
          activeProjects: 8,
          totalCapacity: 2.5, // MW
          totalGeneration: 12500, // MWh
          totalRevenue: 4200000, // USD
          totalCo2Saved: 8750, // kg
          averageEfficiency: 89.2, // %
          systemUptime: 98.5, // %
        });
      }
    } catch (error) {
      // Return mock data on error for development
      setStats({
        totalProjects: 12,
        activeProjects: 8,
        totalCapacity: 2.5,
        totalGeneration: 12500,
        totalRevenue: 4200000,
        totalCo2Saved: 8750,
        averageEfficiency: 89.2,
        systemUptime: 98.5,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  };
}

export function useRealTimeData(projectId?: string) {
  const [data, setData] = useState<RealTimeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const fetchRealTimeData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setError('Authentication required');
      setIsLoading(false);
      return;
    }

    try {
      const url = projectId 
        ? `http://localhost:3001/api/real-time/${projectId}`
        : 'http://localhost:3001/api/real-time';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const responseData = await response.json();
        setData(responseData.data);
      } else {
        // Mock real-time data for development
        const mockData: RealTimeData[] = [
          {
            projectId: projectId || 'mock-1',
            timestamp: new Date(),
            generation: 850 + Math.random() * 100, // kW
            efficiency: 88 + Math.random() * 4, // %
            weather: {
              temperature: 22 + Math.random() * 8,
              humidity: 45 + Math.random() * 20,
              windSpeed: 3 + Math.random() * 5,
              windDirection: Math.random() * 360,
              irradiance: 750 + Math.random() * 250,
              cloudCover: Math.random() * 30,
              visibility: 10,
              pressure: 1013 + Math.random() * 20
            },
            alerts: []
          }
        ];
        setData(mockData);
      }
    } catch (error) {
      // Mock data on error
      const mockData: RealTimeData[] = [
        {
          projectId: projectId || 'mock-1',
          timestamp: new Date(),
          generation: 850,
          efficiency: 89.2,
          weather: {
            temperature: 25,
            humidity: 55,
            windSpeed: 4.2,
            windDirection: 180,
            irradiance: 850,
            cloudCover: 15,
            visibility: 10,
            pressure: 1015
          },
          alerts: []
        }
      ];
      setData(mockData);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchRealTimeData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchRealTimeData, 30000);
    
    return () => clearInterval(interval);
  }, [fetchRealTimeData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchRealTimeData
  };
}

export function usePerformanceChart(projectId: string, timeRange: string = '24h') {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const fetchChartData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setError('Authentication required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/analytics/performance/${projectId}?range=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChartData(data.data);
      } else {
        // Generate mock chart data
        const now = new Date();
        const labels: string[] = [];
        const generationData: number[] = [];
        const efficiencyData: number[] = [];

        for (let i = 23; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 60 * 60 * 1000);
          labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
          
          // Mock generation data with realistic solar curve
          const hour = time.getHours();
          let baseGeneration = 0;
          if (hour >= 6 && hour <= 18) {
            const solarCurve = Math.sin(((hour - 6) / 12) * Math.PI);
            baseGeneration = solarCurve * 1000 + Math.random() * 100;
          }
          generationData.push(Math.max(0, baseGeneration));
          
          // Mock efficiency data
          efficiencyData.push(85 + Math.random() * 10);
        }

        setChartData({
          labels,
          datasets: [
            {
              label: 'Generation (kW)',
              data: generationData,
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.4,
            },
            {
              label: 'Efficiency (%)',
              data: efficiencyData,
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: false,
              tension: 0.4,
            }
          ]
        });
      }
    } catch (error) {
      // Mock data on error
      const labels = Array.from({ length: 24 }, (_, i) => {
        const hour = (new Date().getHours() - 23 + i) % 24;
        return `${hour.toString().padStart(2, '0')}:00`;
      });

      setChartData({
        labels,
        datasets: [
          {
            label: 'Generation (kW)',
            data: Array.from({ length: 24 }, () => Math.random() * 1000),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, timeRange]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  return {
    chartData,
    isLoading,
    error,
    refetch: fetchChartData
  };
}
