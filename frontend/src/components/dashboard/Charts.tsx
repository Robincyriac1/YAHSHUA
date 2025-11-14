'use client';

import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Zap,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  Gauge
} from 'lucide-react';
import { formatNumber, formatPercentage } from '../../lib/utils';

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor?: string;
    fill?: boolean;
    tension?: number;
  }>;
}

interface PerformanceChartProps {
  data: ChartData | null;
  isLoading: boolean;
  title?: string;
  height?: number;
}

export function PerformanceChart({ 
  data, 
  isLoading, 
  title = "Performance Overview",
  height = 300 
}: PerformanceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;

    // Simple canvas-based chart implementation
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Chart dimensions
    const padding = 60;
    const chartWidth = canvas.offsetWidth - padding * 2;
    const chartHeight = height - padding * 2;

    if (data.datasets.length > 0) {
      const dataset = data.datasets[0];
      const maxValue = Math.max(...dataset.data);
      const minValue = Math.min(...dataset.data);
      const range = maxValue - minValue || 1;

      // Draw grid lines
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      
      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
      }

      // Vertical grid lines
      const xStep = chartWidth / (data.labels.length - 1);
      for (let i = 0; i < data.labels.length; i++) {
        const x = padding + xStep * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, padding + chartHeight);
        ctx.stroke();
      }

      // Draw line chart
      ctx.strokeStyle = dataset.borderColor;
      ctx.lineWidth = 2;
      ctx.beginPath();

      dataset.data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.labels.length - 1)) * index;
        const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();

      // Draw fill area if specified
      if (dataset.fill && dataset.backgroundColor) {
        ctx.fillStyle = dataset.backgroundColor;
        ctx.lineTo(padding + chartWidth, padding + chartHeight);
        ctx.lineTo(padding, padding + chartHeight);
        ctx.closePath();
        ctx.fill();
      }

      // Draw data points
      ctx.fillStyle = dataset.borderColor;
      dataset.data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.labels.length - 1)) * index;
        const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Draw labels
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      
      // X-axis labels
      data.labels.forEach((label, index) => {
        if (index % Math.ceil(data.labels.length / 6) === 0) {
          const x = padding + (chartWidth / (data.labels.length - 1)) * index;
          ctx.fillText(label, x, height - 20);
        }
      });

      // Y-axis labels
      ctx.textAlign = 'right';
      for (let i = 0; i <= 5; i++) {
        const value = minValue + (range / 5) * (5 - i);
        const y = padding + (chartHeight / 5) * i + 5;
        ctx.fillText(formatNumber(value), padding - 10, y);
      }
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data, height]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: `${height}px` }}
            className="rounded-md"
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface RealTimeMetricsProps {
  data: {
    generation: number;
    efficiency: number;
    weather?: {
      temperature: number;
      humidity: number;
      windSpeed: number;
      irradiance?: number;
      cloudCover: number;
      visibility: number;
    };
  } | null;
  isLoading: boolean;
}

export function RealTimeMetrics({ data, isLoading }: RealTimeMetricsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No real-time data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Real-Time Metrics</CardTitle>
        <Badge variant="success">
          <Activity className="w-3 h-3 mr-1" />
          Live
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Power Generation */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Zap className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Current Generation</p>
              <p className="text-xs text-muted-foreground">Real-time output</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-600">
              {formatNumber(data.generation)} kW
            </p>
          </div>
        </div>

        {/* System Efficiency */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Gauge className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">System Efficiency</p>
              <p className="text-xs text-muted-foreground">Current performance</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold ${getEfficiencyColor(data.efficiency)}`}>
              {formatPercentage(data.efficiency, 1)}
            </p>
          </div>
        </div>

        {/* Weather Conditions */}
        {data.weather && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Weather Conditions</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <Thermometer className="h-3 w-3 text-orange-500" />
                <span>{data.weather.temperature.toFixed(1)}°C</span>
              </div>
              <div className="flex items-center space-x-2">
                <Droplets className="h-3 w-3 text-blue-500" />
                <span>{data.weather.humidity.toFixed(0)}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wind className="h-3 w-3 text-gray-500" />
                <span>{data.weather.windSpeed.toFixed(1)} m/s</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-3 w-3 text-purple-500" />
                <span>{data.weather.visibility} km</span>
              </div>
              {data.weather.irradiance && (
                <div className="flex items-center space-x-2 col-span-2">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <span>Irradiance: {data.weather.irradiance} W/m²</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className="flex items-center justify-center pt-2">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Last updated: just now</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
