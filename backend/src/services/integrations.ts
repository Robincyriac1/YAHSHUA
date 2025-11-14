import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Types for external data sources
export interface ElectricityMapsData {
  zone: string;
  carbonIntensity: number;
  renewablePercentage: number;
  timestamp: string;
}

export interface WeatherData {
  location: {
    lat: number;
    lng: number;
  };
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    cloudCover: number;
    solarIrradiance: number;
  };
  forecast: Array<{
    date: string;
    temperature: {
      min: number;
      max: number;
    };
    windSpeed: number;
    cloudCover: number;
    solarIrradiance: number;
  }>;
}

export interface EquipmentData {
  manufacturer: string;
  model: string;
  type: string;
  capacity: number;
  efficiency: number;
  price: number;
  warranty: number;
  certifications: string[];
}

// Base integration service
export abstract class BaseIntegrationService {
  protected client: AxiosInstance;
  protected apiKey?: string;
  protected baseUrl: string;
  protected rateLimitDelay: number = 1000; // 1 second between requests

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'User-Agent': 'YAHSHUA-Platform/1.0',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      }
    });

    this.setupInterceptors();
  }

  // Getter for baseUrl to allow access from IntegrationManager
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  private setupInterceptors() {
    // Request interceptor for rate limiting
    this.client.interceptors.request.use(async (config) => {
      await this.waitForRateLimit();
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error(`API Error (${this.baseUrl}):`, error.response?.data || error.message);
        throw error;
      }
    );
  }

  private async waitForRateLimit() {
    return new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
  }

  abstract getName(): string;
  abstract isHealthy(): Promise<boolean>;
}

// Electricity Maps Integration
export class ElectricityMapsService extends BaseIntegrationService {
  constructor(apiKey?: string) {
    super('https://api.electricitymap.org/v3', apiKey);
  }

  getName(): string {
    return 'Electricity Maps';
  }

  async isHealthy(): Promise<boolean> {
    try {
      // If no API key, consider the service healthy for mock data
      if (!this.apiKey) {
        return true;
      }
      
      const response = await this.client.get('/zones');
      return response.status === 200;
    } catch {
      // If API call fails, still return true for mock data availability
      return !this.apiKey;
    }
  }

  async getCarbonIntensity(zone: string): Promise<ElectricityMapsData | null> {
    try {
      // If no API key, return mock data for development
      if (!this.apiKey) {
        return this.getMockCarbonIntensity(zone);
      }

      const response = await this.client.get(`/carbon-intensity/latest?zone=${zone}`);
      
      return {
        zone,
        carbonIntensity: response.data.carbonIntensity,
        renewablePercentage: response.data.renewablePercentage || 0,
        timestamp: response.data.datetime
      };
    } catch (error) {
      console.error('Failed to fetch carbon intensity, using mock data:', error);
      return this.getMockCarbonIntensity(zone);
    }
  }

  private getMockCarbonIntensity(zone: string): ElectricityMapsData {
    // Realistic mock data based on different zones
    const mockData: { [key: string]: { carbonIntensity: number; renewablePercentage: number } } = {
      'US': { carbonIntensity: 418, renewablePercentage: 21.5 },
      'DE': { carbonIntensity: 374, renewablePercentage: 45.2 },
      'FR': { carbonIntensity: 59, renewablePercentage: 87.3 },
      'NO': { carbonIntensity: 24, renewablePercentage: 98.1 },
      'CN': { carbonIntensity: 555, renewablePercentage: 12.8 },
      'AU': { carbonIntensity: 634, renewablePercentage: 24.1 },
      'GB': { carbonIntensity: 233, renewablePercentage: 42.9 },
      'CA': { carbonIntensity: 130, renewablePercentage: 67.3 },
      'DK': { carbonIntensity: 165, renewablePercentage: 76.8 },
      'SE': { carbonIntensity: 45, renewablePercentage: 89.2 }
    };

    const data = mockData[zone] || mockData['US']; // Default to US data
    
    // Add some realistic variation (±10%)
    const variation = 0.9 + (Math.random() * 0.2);
    
    return {
      zone,
      carbonIntensity: Math.round(data.carbonIntensity * variation),
      renewablePercentage: Math.round(data.renewablePercentage * variation * 10) / 10,
      timestamp: new Date().toISOString()
    };
  }

  async getZones(): Promise<string[]> {
    try {
      const response = await this.client.get('/zones');
      return Object.keys(response.data);
    } catch (error) {
      console.error('Failed to fetch zones:', error);
      return [];
    }
  }
}

// Weather Service (using OpenWeatherMap API)
export class WeatherService extends BaseIntegrationService {
  constructor(apiKey?: string) {
    super('https://api.openweathermap.org/data/2.5', apiKey);
  }

  getName(): string {
    return 'OpenWeatherMap';
  }

  async isHealthy(): Promise<boolean> {
    try {
      // If no API key, consider the service healthy for mock data
      if (!this.apiKey) {
        return true;
      }
      
      // Test with a simple weather request for London
      const response = await this.client.get(`/weather?q=London&appid=${this.apiKey}`);
      return response.status === 200;
    } catch {
      // If API call fails, still return true for mock data availability
      return !this.apiKey;
    }
  }

  async getCurrentWeather(lat: number, lng: number): Promise<WeatherData | null> {
    try {
      // If no API key, return mock data for development
      if (!this.apiKey) {
        return this.getMockWeatherData(lat, lng);
      }

      const [current, forecast] = await Promise.all([
        this.client.get(`/weather?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=metric`),
        this.client.get(`/forecast?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=metric`)
      ]);

      return {
        location: { lat, lng },
        current: {
          temperature: current.data.main.temp,
          humidity: current.data.main.humidity,
          windSpeed: current.data.wind?.speed || 0,
          cloudCover: current.data.clouds?.all || 0,
          solarIrradiance: this.calculateSolarIrradiance(current.data)
        },
        forecast: forecast.data.list.slice(0, 5).map((item: any) => ({
          date: item.dt_txt,
          temperature: {
            min: item.main.temp_min,
            max: item.main.temp_max
          },
          windSpeed: item.wind?.speed || 0,
          cloudCover: item.clouds?.all || 0,
          solarIrradiance: this.calculateSolarIrradiance(item)
        }))
      };
    } catch (error) {
      console.error('Failed to fetch weather data, using mock data:', error);
      return this.getMockWeatherData(lat, lng);
    }
  }

  private getMockWeatherData(lat: number, lng: number): WeatherData {
    // Generate realistic weather data based on location and current time
    const hour = new Date().getHours();
    const baseTemp = this.getBaseTemperatureForLocation(lat, lng);
    const seasonalVariation = this.getSeasonalVariation();
    const dailyVariation = Math.cos((hour - 14) * Math.PI / 12) * 5; // Peak at 2 PM
    
    const currentTemp = baseTemp + seasonalVariation + dailyVariation + (Math.random() - 0.5) * 4;
    const windSpeed = 3 + Math.random() * 8; // 3-11 m/s
    const cloudCover = Math.random() * 100; // 0-100%
    const humidity = 40 + Math.random() * 40; // 40-80%
    
    const solarIrradiance = this.calculateSolarIrradiance({
      clouds: { all: cloudCover },
      dt: Math.floor(Date.now() / 1000)
    });

    // Generate 5-day forecast
    const forecast = [];
    for (let i = 1; i <= 5; i++) {
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + i);
      
      const dailyTemp = baseTemp + seasonalVariation + (Math.random() - 0.5) * 6;
      
      forecast.push({
        date: forecastDate.toISOString(),
        temperature: {
          min: dailyTemp - 5 - Math.random() * 3,
          max: dailyTemp + 5 + Math.random() * 3
        },
        windSpeed: 2 + Math.random() * 10,
        cloudCover: Math.random() * 100,
        solarIrradiance: 800 + Math.random() * 400 // W/m²
      });
    }

    return {
      location: { lat, lng },
      current: {
        temperature: Math.round(currentTemp * 10) / 10,
        humidity: Math.round(humidity),
        windSpeed: Math.round(windSpeed * 10) / 10,
        cloudCover: Math.round(cloudCover),
        solarIrradiance: Math.round(solarIrradiance)
      },
      forecast
    };
  }

  private getBaseTemperatureForLocation(lat: number, lng: number): number {
    // Rough temperature estimation based on latitude
    const absLat = Math.abs(lat);
    if (absLat < 23.5) return 28; // Tropical
    if (absLat < 35) return 22; // Subtropical
    if (absLat < 50) return 15; // Temperate
    if (absLat < 66.5) return 5; // Subarctic
    return -10; // Arctic
  }

  private getSeasonalVariation(): number {
    const month = new Date().getMonth(); // 0-11
    // Simple seasonal variation for Northern Hemisphere
    const seasonalTemp = Math.cos((month - 6) * Math.PI / 6) * 10;
    return seasonalTemp;
  }

  private calculateSolarIrradiance(weatherData: any): number {
    // Simplified solar irradiance calculation based on cloud cover
    const maxIrradiance = 1000; // W/m² (clear sky)
    const cloudCover = weatherData.clouds?.all || 0;
    return maxIrradiance * (1 - cloudCover / 100) * 0.8; // Rough approximation
  }
}

// Equipment Database Service (mock implementation)
export class EquipmentService extends BaseIntegrationService {
  constructor() {
    super('https://api.renewable-equipment.com/v1'); // Mock URL
    this.rateLimitDelay = 500; // Faster for equipment queries
  }

  getName(): string {
    return 'Equipment Database';
  }

  async isHealthy(): Promise<boolean> {
    // Mock health check - always return true for demo
    return true;
  }

  async searchEquipment(type: 'solar' | 'wind' | 'hydro' | 'battery', criteria: any): Promise<EquipmentData[]> {
    // Mock equipment data for demo purposes
    const mockEquipment: Record<string, EquipmentData[]> = {
      solar: [
        {
          manufacturer: 'SolarTech Pro',
          model: 'ST-400W',
          type: 'Solar Panel',
          capacity: 0.4,
          efficiency: 22.1,
          price: 250,
          warranty: 25,
          certifications: ['IEC 61215', 'IEC 61730', 'UL 1703']
        },
        {
          manufacturer: 'SunPower',
          model: 'Maxeon 3',
          type: 'Solar Panel',
          capacity: 0.4,
          efficiency: 22.6,
          price: 320,
          warranty: 25,
          certifications: ['IEC 61215', 'IEC 61730', 'UL 1703']
        }
      ],
      wind: [
        {
          manufacturer: 'WindForce',
          model: 'WF-2.5MW',
          type: 'Wind Turbine',
          capacity: 2500,
          efficiency: 45,
          price: 1250000,
          warranty: 20,
          certifications: ['IEC 61400', 'GL 2010']
        }
      ],
      hydro: [
        {
          manufacturer: 'HydroTech',
          model: 'HT-100kW',
          type: 'Hydro Turbine',
          capacity: 100,
          efficiency: 85,
          price: 180000,
          warranty: 15,
          certifications: ['IEC 60193']
        }
      ],
      battery: [
        {
          manufacturer: 'EnergyStore',
          model: 'ES-10kWh',
          type: 'Battery Storage',
          capacity: 10,
          efficiency: 95,
          price: 8000,
          warranty: 10,
          certifications: ['UL 9540', 'IEC 62619']
        }
      ]
    };

    return mockEquipment[type] || [];
  }

  async getEquipmentById(id: string): Promise<EquipmentData | null> {
    // Mock implementation
    const allEquipment = [
      ...await this.searchEquipment('solar', {}),
      ...await this.searchEquipment('wind', {}),
      ...await this.searchEquipment('hydro', {}),
      ...await this.searchEquipment('battery', {})
    ];

    return allEquipment[0] || null; // Return first item for demo
  }
}

// Integration Manager - coordinates all external services
export class IntegrationManager {
  private services: Map<string, BaseIntegrationService> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeServices();
    this.startHealthChecks();
  }

  private initializeServices() {
    // Initialize services with API keys from environment (optional for mock data)
    const electricityMapsKey = process.env.ELECTRICITY_MAPS_API_KEY;
    const weatherApiKey = process.env.WEATHER_API_KEY;

    // Always initialize services - they'll use mock data if no API key is provided
    this.services.set('electricity-maps', new ElectricityMapsService(electricityMapsKey));
    this.services.set('weather', new WeatherService(weatherApiKey));
    this.services.set('equipment', new EquipmentService());

    console.log('🔗 Integration Services initialized:', {
      'electricity-maps': electricityMapsKey ? 'Live API' : 'Mock Data',
      'weather': weatherApiKey ? 'Live API' : 'Mock Data',
      'equipment': 'Database'
    });
  }

  private startHealthChecks() {
    // Check service health every 5 minutes
    this.healthCheckInterval = setInterval(async () => {
      await this.checkAllServiceHealth();
    }, 5 * 60 * 1000);
  }

  async checkAllServiceHealth(): Promise<Record<string, boolean>> {
    const healthStatus: Record<string, boolean> = {};

    for (const [name, service] of this.services) {
      try {
        healthStatus[name] = await service.isHealthy();
      } catch {
        healthStatus[name] = false;
      }
    }

    // Store health status in database
    await this.storeHealthStatus(healthStatus);

    return healthStatus;
  }

  private async storeHealthStatus(healthStatus: Record<string, boolean>) {
    try {
      // Log health status instead of storing in database for now
      console.log('🔗 Integration Services Health Status:', healthStatus);
      
      // TODO: Add ExternalDataSource model to Prisma schema and uncomment below
      /*
      for (const [serviceName, isHealthy] of Object.entries(healthStatus)) {
        await prisma.externalDataSource.upsert({
          where: { name: serviceName },
          update: { 
            isHealthy,
            lastHealthCheck: new Date()
          },
          create: {
            name: serviceName,
            type: serviceName.includes('weather') ? 'WEATHER' : 
                  serviceName.includes('electricity') ? 'GRID_DATA' :
                  serviceName.includes('equipment') ? 'EQUIPMENT' : 'OTHER',
            url: this.services.get(serviceName)?.getBaseUrl() || '',
            isHealthy,
            lastHealthCheck: new Date()
          }
        });
      }
      */
    } catch (error) {
      console.error('Failed to store health status:', error);
    }
  }

  // Get carbon intensity for a location
  async getCarbonIntensity(zone: string): Promise<ElectricityMapsData | null> {
    const service = this.services.get('electricity-maps') as ElectricityMapsService;
    return service ? await service.getCarbonIntensity(zone) : null;
  }

  // Get weather data for a location
  async getWeatherData(lat: number, lng: number): Promise<WeatherData | null> {
    const service = this.services.get('weather') as WeatherService;
    return service ? await service.getCurrentWeather(lat, lng) : null;
  }

  // Search for equipment
  async searchEquipment(type: 'solar' | 'wind' | 'hydro' | 'battery', criteria: any): Promise<EquipmentData[]> {
    const service = this.services.get('equipment') as EquipmentService;
    return service ? await service.searchEquipment(type, criteria) : [];
  }

  // Get equipment data by type
  async getEquipmentData(type: 'solar' | 'wind' | 'hydro' | 'battery'): Promise<{ type: string; equipment: EquipmentData[] } | null> {
    const service = this.services.get('equipment') as EquipmentService;
    if (!service) return null;
    
    const equipment = await service.searchEquipment(type, {});
    return {
      type,
      equipment
    };
  }

  // Get comprehensive project data
  async getProjectEnvironmentalData(projectId: string) {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project || !project.location) {
        return null;
      }

      const location = project.location as any;
      const [weatherData, carbonData] = await Promise.all([
        this.getWeatherData(location.lat, location.lng),
        this.getCarbonIntensity(location.zone || 'US')
      ]);

      return {
        project,
        weather: weatherData,
        carbonIntensity: carbonData,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Failed to get project environmental data:', error);
      return null;
    }
  }

  // Get service status
  getServiceStatus(): Record<string, string> {
    const status: Record<string, string> = {};
    
    for (const [name, service] of this.services) {
      status[name] = service.getName();
    }

    return status;
  }

  // Cleanup resources
  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// Export singleton instance
export const integrationManager = new IntegrationManager();
