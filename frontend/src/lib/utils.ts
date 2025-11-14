import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function to merge CSS classes with Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency with proper localization
export function formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

// Format large numbers with abbreviations (K, M, B)
export function formatNumber(num: number, decimals: number = 1): string {
  if (num === 0) return '0';
  
  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['', 'K', 'M', 'B', 'T'];
  
  const i = Math.floor(Math.log(Math.abs(num)) / Math.log(k));
  
  if (i === 0) {
    return num.toLocaleString();
  }
  
  return parseFloat((num / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}

// Format capacity with units (kW, MW, GW)
export function formatCapacity(capacity: number): string {
  if (capacity === 0) return '0 W';
  
  const units = ['W', 'kW', 'MW', 'GW', 'TW'];
  const base = 1000;
  
  let unitIndex = 0;
  let value = capacity;
  
  while (value >= base && unitIndex < units.length - 1) {
    value /= base;
    unitIndex++;
  }
  
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`;
}

// Format energy generation with units (kWh, MWh, GWh)
export function formatEnergy(energy: number): string {
  if (energy === 0) return '0 Wh';
  
  const units = ['Wh', 'kWh', 'MWh', 'GWh', 'TWh'];
  const base = 1000;
  
  let unitIndex = 0;
  let value = energy;
  
  while (value >= base && unitIndex < units.length - 1) {
    value /= base;
    unitIndex++;
  }
  
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`;
}

// Format percentage with proper precision
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Format dates in a user-friendly way
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return dateObj.toLocaleDateString('en-US', options || defaultOptions);
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  
  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  if (diffInMs < minute) {
    return 'just now';
  } else if (diffInMs < hour) {
    const minutes = Math.floor(diffInMs / minute);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else if (diffInMs < day) {
    const hours = Math.floor(diffInMs / hour);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (diffInMs < week) {
    const days = Math.floor(diffInMs / day);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else if (diffInMs < month) {
    const weeks = Math.floor(diffInMs / week);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  } else if (diffInMs < year) {
    const months = Math.floor(diffInMs / month);
    return `${months} month${months === 1 ? '' : 's'} ago`;
  } else {
    const years = Math.floor(diffInMs / year);
    return `${years} year${years === 1 ? '' : 's'} ago`;
  }
}

// Calculate percentage change
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

// Generate a color based on string (for consistent avatar colors, etc.)
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
    '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
    '#EC4899', '#F43F5E'
  ];
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function validatePassword(password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
} {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  
  const score = Object.values(requirements).filter(Boolean).length;
  
  let strength: 'weak' | 'medium' | 'strong';
  if (score < 3) strength = 'weak';
  else if (score < 5) strength = 'medium';
  else strength = 'strong';
  
  return {
    isValid: score >= 4 && requirements.length,
    strength,
    requirements,
  };
}

// Generate initials from name
export function getInitials(firstName: string, lastName?: string): string {
  if (!firstName) return '';
  if (!lastName) return firstName.charAt(0).toUpperCase();
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

// Calculate CO2 savings based on energy generation
export function calculateCO2Savings(energyGenerated: number, region: string = 'US'): number {
  // CO2 emission factors (kg CO2 per kWh) by region
  const emissionFactors: Record<string, number> = {
    US: 0.386, // United States average
    EU: 0.296, // European Union average
    CN: 0.555, // China
    IN: 0.708, // India
    JP: 0.462, // Japan
    GB: 0.277, // United Kingdom
    DE: 0.401, // Germany
    FR: 0.058, // France (heavy nuclear)
    NO: 0.013, // Norway (hydro)
    DEFAULT: 0.386
  };
  
  const factor = emissionFactors[region.toUpperCase()] || emissionFactors.DEFAULT;
  return energyGenerated * factor;
}

// Calculate equivalent trees planted
export function calculateTreesEquivalent(co2Saved: number): number {
  // Average tree absorbs ~21.77 kg of CO2 per year
  return Math.round(co2Saved / 21.77);
}

// Calculate equivalent homes powered
export function calculateHomesEquivalent(energyGenerated: number, region: string = 'US'): number {
  // Average annual household electricity consumption (kWh) by region
  const consumptionByRegion: Record<string, number> = {
    US: 10632, // United States
    EU: 3500,  // European Union
    CN: 1500,  // China
    IN: 1000,  // India
    JP: 7348,  // Japan
    GB: 3760,  // United Kingdom
    DE: 3200,  // Germany
    FR: 4770,  // France
    DEFAULT: 10632
  };
  
  const annualConsumption = consumptionByRegion[region.toUpperCase()] || consumptionByRegion.DEFAULT;
  return Math.round(energyGenerated / annualConsumption);
}

// API utility functions
export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Get authentication token from cookie
export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; auth-token=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Set authentication token in cookie
export function setAuthToken(token: string, remember: boolean = false): void {
  if (typeof document === 'undefined') return;
  
  const maxAge = remember ? 604800 : 3600; // 7 days or 1 hour
  document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}; secure; samesite=strict`;
}

// Remove authentication token
export function removeAuthToken(): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
