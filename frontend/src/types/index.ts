// Core user and authentication types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  jobTitle?: string;
  phone?: string;
  company?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  organizationMemberships?: OrganizationMembership[];
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  logo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMembership {
  id: string;
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  isActive: boolean;
  joinedAt: Date;
  organization: Organization;
  user: User;
}

// Project and energy system types
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  type: ProjectType;
  energySource: EnergySource;
  systemCapacity: number;
  estimatedGeneration?: number;
  estimatedCost?: number;
  currency: string;
  location: string;
  latitude?: number;
  longitude?: number;
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  progress: number;
  tags: string[];
  ownerId: string;
  organizationId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  owner: User;
  organization: Organization;
  equipment?: Equipment[];
  metrics?: ProjectMetrics;
}

export interface ProjectMetrics {
  id: string;
  projectId: string;
  currentGeneration: number;
  todayGeneration: number;
  monthlyGeneration: number;
  yearlyGeneration: number;
  efficiency: number;
  uptime: number;
  revenue: number;
  co2Saved: number;
  lastUpdated: Date;
}

export interface Equipment {
  id: string;
  projectId: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  capacity: number;
  efficiency?: number;
  warrantyExpires?: Date;
  status: EquipmentStatus;
  installationDate?: Date;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  location?: string;
  specifications: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Real-time data types
export interface RealTimeData {
  projectId: string;
  timestamp: Date;
  generation: number;
  efficiency: number;
  weather?: WeatherData;
  alerts?: Alert[];
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  irradiance?: number;
  cloudCover: number;
  visibility: number;
  pressure: number;
}

export interface Alert {
  id: string;
  projectId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  isRead: boolean;
  isResolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

// Financial and analytics types
export interface FinancialMetrics {
  totalInvestment: number;
  currentValue: number;
  roi: number;
  paybackPeriod: number;
  irr: number;
  npv: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalRevenue: number;
  operatingCosts: number;
  maintenanceCosts: number;
  currency: string;
}

export interface PerformanceAnalytics {
  efficiency: {
    current: number;
    average: number;
    trend: number;
    historicalData: TimeSeriesData[];
  };
  generation: {
    today: number;
    thisMonth: number;
    thisYear: number;
    total: number;
    trend: number;
    historicalData: TimeSeriesData[];
  };
  environmental: {
    co2Saved: number;
    treesEquivalent: number;
    homesEquivalent: number;
  };
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  label?: string;
}

// API and state management types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
  lastUpdated?: Date;
}

// Enums
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  ENGINEER = 'ENGINEER',
  TECHNICIAN = 'TECHNICIAN',
  USER = 'USER',
  VIEWER = 'VIEWER'
}

export enum OrganizationRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  DESIGN = 'DESIGN',
  PERMITTING = 'PERMITTING',
  FINANCING = 'FINANCING',
  PROCUREMENT = 'PROCUREMENT',
  CONSTRUCTION = 'CONSTRUCTION',
  COMMISSIONING = 'COMMISSIONING',
  OPERATIONAL = 'OPERATIONAL',
  MAINTENANCE = 'MAINTENANCE',
  DECOMMISSIONING = 'DECOMMISSIONING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD'
}

export enum ProjectType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  UTILITY_SCALE = 'UTILITY_SCALE',
  COMMUNITY = 'COMMUNITY',
  RESEARCH = 'RESEARCH'
}

export enum EnergySource {
  SOLAR_PV = 'SOLAR_PV',
  SOLAR_THERMAL = 'SOLAR_THERMAL',
  BIPV = 'BIPV',
  WIND_ONSHORE = 'WIND_ONSHORE',
  WIND_OFFSHORE = 'WIND_OFFSHORE',
  HYDROELECTRIC = 'HYDROELECTRIC',
  MICRO_HYDRO = 'MICRO_HYDRO',
  PUMPED_STORAGE_HYDRO = 'PUMPED_STORAGE_HYDRO',
  GEOTHERMAL = 'GEOTHERMAL',
  ENHANCED_GEOTHERMAL = 'ENHANCED_GEOTHERMAL',
  BIOMASS = 'BIOMASS',
  BIOGAS = 'BIOGAS',
  BIOFUEL = 'BIOFUEL',
  OCEAN_WAVE = 'OCEAN_WAVE',
  OCEAN_TIDAL = 'OCEAN_TIDAL',
  OCEAN_THERMAL = 'OCEAN_THERMAL',
  HYBRID = 'HYBRID'
}

export enum EquipmentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  FAULT = 'FAULT',
  OFFLINE = 'OFFLINE'
}

export enum AlertType {
  PERFORMANCE = 'PERFORMANCE',
  MAINTENANCE = 'MAINTENANCE',
  SECURITY = 'SECURITY',
  WEATHER = 'WEATHER',
  SYSTEM = 'SYSTEM',
  FINANCIAL = 'FINANCIAL'
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Dashboard and UI types
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalCapacity: number;
  totalGeneration: number;
  totalRevenue: number;
  totalCo2Saved: number;
  averageEfficiency: number;
  systemUptime: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  alerts: {
    performance: boolean;
    maintenance: boolean;
    financial: boolean;
    weather: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}
