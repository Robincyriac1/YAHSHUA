import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Cloud, 
  Zap, 
  Thermometer, 
  Wind, 
  Sun, 
  Wifi, 
  WifiOff,
  AlertCircle,
  CheckCircle,
  Leaf,
  MapPin
} from 'lucide-react';

interface IntegrationData {
  carbonIntensity?: {
    zone: string;
    carbonIntensity: number;
    renewablePercentage: number;
    timestamp: string;
  };
  weather?: {
    location: { lat: number; lng: number };
    current: {
      temperature: number;
      humidity: number;
      windSpeed: number;
      cloudCover: number;
      solarIrradiance: number;
    };
    forecast: Array<{
      date: string;
      temperature: { min: number; max: number };
      windSpeed: number;
      cloudCover: number;
      solarIrradiance: number;
    }>;
  };
  serviceStatus?: Record<string, boolean>;
}

interface IntegrationDashboardProps {
  projectId?: string;
  location?: { lat: number; lng: number; zone?: string };
}

export const IntegrationDashboard: React.FC<IntegrationDashboardProps> = ({ 
  projectId, 
  location 
}) => {
  const [data, setData] = useState<IntegrationData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch integration data
  const fetchData = async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const promises: Promise<any>[] = [];

      // Fetch weather data
      promises.push(
        fetch(`http://localhost:3001/api/integrations/weather/${location.lat}/${location.lng}`)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      );

      // Fetch carbon intensity
      if (location.zone) {
        promises.push(
          fetch(`http://localhost:3001/api/integrations/carbon-intensity/${location.zone}`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      // Fetch service status
      promises.push(
        fetch('http://localhost:3001/api/integrations/status')
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      );

      const [weatherData, carbonData, statusData] = await Promise.all(promises);

      setData({
        weather: weatherData,
        carbonIntensity: carbonData,
        serviceStatus: statusData?.health
      });

    } catch (err) {
      setError('Failed to fetch integration data');
      console.error('Integration data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Refresh data every 10 minutes
    const interval = setInterval(fetchData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [location]);

  if (loading && !data.weather) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading integration data...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service Status Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wifi className="h-5 w-5" />
            <span>Integration Services</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.serviceStatus && Object.entries(data.serviceStatus).map(([service, isHealthy]) => (
              <div key={service} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {isHealthy ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="text-sm font-medium capitalize">{service.replace('-', ' ')}</p>
                  <p className="text-xs text-gray-500">
                    {isHealthy ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weather Data */}
      {data.weather && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cloud className="h-5 w-5" />
              <span>Weather Conditions</span>
              <Badge variant="secondary" className="ml-2">
                Live Data
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Temperature */}
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Thermometer className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-700">
                  {Math.round(data.weather.current.temperature)}°C
                </p>
                <p className="text-sm text-orange-600">Temperature</p>
              </div>

              {/* Wind Speed */}
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Wind className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">
                  {Math.round(data.weather.current.windSpeed)} m/s
                </p>
                <p className="text-sm text-blue-600">Wind Speed</p>
              </div>

              {/* Solar Irradiance */}
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Sun className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-700">
                  {Math.round(data.weather.current.solarIrradiance)} W/m²
                </p>
                <p className="text-sm text-yellow-600">Solar Irradiance</p>
              </div>

              {/* Cloud Cover */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Cloud className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-700">
                  {data.weather.current.cloudCover}%
                </p>
                <p className="text-sm text-gray-600">Cloud Cover</p>
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">5-Day Forecast</h4>
              <div className="grid grid-cols-5 gap-3">
                {data.weather.forecast.map((day, index) => (
                  <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {Math.round(day.temperature.max)}°/{Math.round(day.temperature.min)}°
                      </p>
                      <p className="text-xs text-gray-600">
                        {Math.round(day.solarIrradiance)} W/m²
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Carbon Intensity */}
      {data.carbonIntensity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Leaf className="h-5 w-5" />
              <span>Grid Carbon Intensity</span>
              <Badge variant="secondary" className="ml-2">
                {data.carbonIntensity.zone}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Carbon Intensity */}
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-700 mb-2">
                  {Math.round(data.carbonIntensity.carbonIntensity)}
                </p>
                <p className="text-sm text-green-600">gCO₂/kWh</p>
                <p className="text-xs text-gray-500 mt-2">Carbon Intensity</p>
              </div>

              {/* Renewable Percentage */}
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-4">
                  <Leaf className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-700 mb-2">
                  {Math.round(data.carbonIntensity.renewablePercentage)}%
                </p>
                <p className="text-sm text-blue-600">Renewable</p>
                <p className="text-xs text-gray-500 mt-2">Grid Mix</p>
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Environmental Impact</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Optimal generation time: </span>
                  <span className="font-medium">
                    {data.carbonIntensity.carbonIntensity < 200 ? 'Now (Low Carbon)' : 
                     data.carbonIntensity.carbonIntensity < 400 ? 'Moderate' : 'High Carbon Period'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Grid renewability: </span>
                  <span className="font-medium">
                    {data.carbonIntensity.renewablePercentage > 70 ? 'Excellent' :
                     data.carbonIntensity.renewablePercentage > 40 ? 'Good' : 'Improving'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Info */}
      {location && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Location Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Coordinates:</span>
                <span className="font-medium">
                  {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
                </span>
              </div>
              {location.zone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Grid Zone:</span>
                  <span className="font-medium">{location.zone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Data Sources:</span>
                <div className="flex space-x-2">
                  {data.serviceStatus && Object.entries(data.serviceStatus).map(([service, isHealthy]) => (
                    <Badge key={service} variant={isHealthy ? "default" : "destructive"}>
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <span className="text-red-600">{error}</span>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!location && (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <MapPin className="h-6 w-6 text-gray-400 mr-3" />
            <span className="text-gray-500">
              Set project location to view environmental data
            </span>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntegrationDashboard;
