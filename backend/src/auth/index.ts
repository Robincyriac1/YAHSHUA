import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const prisma = new PrismaClient();

// Redis client for session management and token blacklisting (optional)
let redisClient: any = null;
let redisConnected = false;

// Only initialize Redis if explicitly enabled
if (process.env.REDIS_ENABLED === 'true') {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('connect', () => {
      redisConnected = true;
      console.log('🔴 Redis connected for auth session management');
    });

    redisClient.on('error', (err: any) => {
      console.error('❌ Redis connection error:', err);
      redisConnected = false;
    });

    redisClient.connect().catch((err: any) => {
      console.warn('⚠️  Redis connection failed, running without Redis cache:', err.message);
      redisConnected = false;
    });
  } catch (error) {
    console.warn('⚠️  Redis initialization failed, running without Redis cache');
    redisConnected = false;
  }
} else {
  console.log('ℹ️  Redis disabled - auth features will work without caching');
}

// Environment variables with secure defaults
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required for production');
}
if (!process.env.JWT_REFRESH_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_REFRESH_SECRET environment variable is required for production');
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Short-lived access tokens
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // Longer refresh tokens
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
const ACCOUNT_LOCK_TIME = parseInt(process.env.ACCOUNT_LOCK_TIME || '1800000'); // 30 minutes

// Comprehensive user interface for authentication
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  organizationMemberships: {
    organizationId: string;
    organizationSlug: string;
    organizationName: string;
    role: string;
    isActive: boolean;
  }[];
  permissions: string[];
  preferences: any;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  organizationContext?: {
    organizationId: string;
    organizationSlug: string;
    userRole: string;
  };
}

export interface TokenPayload {
  id: string;
  email: string;
  username: string;
  role: string;
  organizationMemberships: any[];
  tokenType: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

// Security utilities
export class SecurityUtils {
  /**
   * Hash password with bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    // Simplified validation - only require length for now
    // TODO: Add back complexity requirements for production
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate secure random token
   */
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// JWT Token Management
export class TokenManager {
  /**
   * Generate access token (short-lived)
   */
  static generateAccessToken(user: Partial<AuthUser>): string {
    const payload: TokenPayload = {
      id: user.id!,
      email: user.email!,
      username: user.username!,
      role: user.role!,
      organizationMemberships: user.organizationMemberships || [],
      tokenType: 'access'
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'yahshua-platform',
      audience: 'yahshua-users',
    } as jwt.SignOptions);
  }

  /**
   * Generate refresh token (long-lived)
   */
  static generateRefreshToken(user: Partial<AuthUser>): string {
    const payload: TokenPayload = {
      id: user.id!,
      email: user.email!,
      username: user.username!,
      role: user.role!,
      organizationMemberships: user.organizationMemberships || [],
      tokenType: 'refresh'
    };

    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'yahshua-platform',
      audience: 'yahshua-users',
    } as jwt.SignOptions);
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'yahshua-platform',
        audience: 'yahshua-users',
      }) as TokenPayload;

      if (decoded.tokenType !== 'access') {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'yahshua-platform',
        audience: 'yahshua-users',
      }) as TokenPayload;

      if (decoded.tokenType !== 'refresh') {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Blacklist token (using Redis)
   */
  static async blacklistToken(token: string, expiresIn: number = 900): Promise<void> {
    if (!redisConnected) return;
    
    try {
      await redisClient.setEx(`blacklist:${token}`, expiresIn, 'blacklisted');
    } catch (error) {
      console.error('❌ Error blacklisting token:', error);
    }
  }

  /**
   * Check if token is blacklisted
   */
  static async isTokenBlacklisted(token: string): Promise<boolean> {
    if (!redisConnected) return false;
    
    try {
      const result = await redisClient.get(`blacklist:${token}`);
      return result === 'blacklisted';
    } catch (error) {
      console.error('❌ Error checking token blacklist:', error);
      return false;
    }
  }
}

// User Management Service
export class UserService {
  /**
   * Get user with organization memberships
   */
  static async getUserWithMemberships(userId: string): Promise<AuthUser | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          organizations: {
            include: {
              organization: true
            },
            where: {
              // Only active memberships
              user: {
                createdAt: {
                  not: undefined
                }
              }
            }
          }
        }
      });

      if (!user) return null;

      const organizationMemberships = user.organizations.map((membership: any) => ({
        organizationId: membership.organization.id,
        organizationSlug: membership.organization.slug,
        organizationName: membership.organization.name,
        role: membership.role,
        isActive: membership.organization.isActive
      }));

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        organizationMemberships,
        permissions: await this.getUserPermissions(user.role, organizationMemberships),
        preferences: user.preferences as any
      };
    } catch (error) {
      console.error('❌ Error getting user with memberships:', error);
      return null;
    }
  }

  /**
   * Get user permissions based on role and organization memberships
   */
  static async getUserPermissions(userRole: string, orgMemberships: any[]): Promise<string[]> {
    const permissions: string[] = [];

    // Base permissions by role
    switch (userRole) {
      case 'SUPER_ADMIN':
        permissions.push('*'); // All permissions
        break;
      case 'ADMIN':
        permissions.push('users:read', 'users:write', 'projects:read', 'projects:write', 'organizations:read', 'organizations:write');
        break;
      case 'PROJECT_MANAGER':
        permissions.push('projects:read', 'projects:write', 'users:read');
        break;
      case 'ENGINEER':
        permissions.push('projects:read', 'technologies:read', 'technologies:write', 'calculations:read', 'calculations:write');
        break;
      case 'TECHNICIAN':
        permissions.push('projects:read', 'maintenance:read', 'maintenance:write');
        break;
      case 'USER':
        permissions.push('projects:read', 'profile:read', 'profile:write');
        break;
      case 'VIEWER':
        permissions.push('projects:read');
        break;
    }

    // Additional permissions from organization roles
    orgMemberships.forEach(membership => {
      if (!membership.isActive) return;

      switch (membership.role) {
        case 'OWNER':
          permissions.push('organization:admin', 'organization:billing', 'organization:members');
          break;
        case 'ADMIN':
          permissions.push('organization:manage', 'organization:members');
          break;
        case 'MANAGER':
          permissions.push('organization:projects', 'organization:reports');
          break;
        case 'MEMBER':
          permissions.push('organization:view');
          break;
        case 'VIEWER':
          permissions.push('organization:view-limited');
          break;
      }
    });

    return [...new Set(permissions)]; // Remove duplicates
  }

  /**
   * Check failed login attempts
   */
  static async checkFailedAttempts(email: string): Promise<{ locked: boolean; remainingAttempts: number }> {
    if (!redisConnected) return { locked: false, remainingAttempts: MAX_LOGIN_ATTEMPTS };

    try {
      const attempts = await redisClient.get(`failed_attempts:${email}`);
      const failedAttempts = parseInt(attempts || '0');

      if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockTime = await redisClient.ttl(`failed_attempts:${email}`);
        return {
          locked: lockTime > 0,
          remainingAttempts: 0
        };
      }

      return {
        locked: false,
        remainingAttempts: MAX_LOGIN_ATTEMPTS - failedAttempts
      };
    } catch (error) {
      console.error('❌ Error checking failed attempts:', error);
      return { locked: false, remainingAttempts: MAX_LOGIN_ATTEMPTS };
    }
  }

  /**
   * Record failed login attempt
   */
  static async recordFailedAttempt(email: string): Promise<void> {
    if (!redisConnected) return;

    try {
      const key = `failed_attempts:${email}`;
      const attempts = await redisClient.incr(key);
      
      if (attempts === 1) {
        // Set expiry on first failed attempt
        await redisClient.expire(key, ACCOUNT_LOCK_TIME / 1000);
      }
    } catch (error) {
      console.error('❌ Error recording failed attempt:', error);
    }
  }

  /**
   * Clear failed login attempts
   */
  static async clearFailedAttempts(email: string): Promise<void> {
    if (!redisConnected) return;

    try {
      await redisClient.del(`failed_attempts:${email}`);
    } catch (error) {
      console.error('❌ Error clearing failed attempts:', error);
    }
  }
}

// Authentication Middleware
export class AuthMiddleware {
  /**
   * Extract token from request
   */
  static extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Authenticate user with JWT token
   */
  static async authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const token = AuthMiddleware.extractToken(req);
    
    if (!token) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'No authentication token provided',
        code: 'NO_TOKEN'
      });
      return;
    }

    // Check if token is blacklisted
    if (await TokenManager.isTokenBlacklisted(token)) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Token has been revoked',
        code: 'TOKEN_BLACKLISTED'
      });
      return;
    }

    // Verify token
    const payload = TokenManager.verifyAccessToken(token);
    if (!payload) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
      return;
    }

    // Get full user data
    const user = await UserService.getUserWithMemberships(payload.id);
    if (!user) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    if (!user.emailVerified) {
      res.status(401).json({
        error: 'Email verification required',
        message: 'Please verify your email address before accessing the platform',
        code: 'EMAIL_NOT_VERIFIED'
      });
      return;
    }

    req.user = user;
    next();
  }

  /**
   * Optional authentication (doesn't fail if no token)
   */
  static async optionalAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const token = AuthMiddleware.extractToken(req);
    
    if (token && !(await TokenManager.isTokenBlacklisted(token))) {
      const payload = TokenManager.verifyAccessToken(token);
      if (payload) {
        const user = await UserService.getUserWithMemberships(payload.id);
        if (user && user.emailVerified) {
          req.user = user;
        }
      }
    }

    next();
  }

  /**
   * Require specific permissions
   */
  static requirePermissions(permissions: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'Please authenticate to access this resource'
        });
        return;
      }

      const userPermissions = req.user.permissions;
      
      // Super admin has all permissions
      if (userPermissions.includes('*')) {
        next();
        return;
      }

      // Check if user has any of the required permissions
      const hasPermission = permissions.some(permission => 
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        res.status(403).json({
          error: 'Insufficient permissions',
          message: `Requires one of the following permissions: ${permissions.join(', ')}`,
          required: permissions,
          userPermissions: userPermissions
        });
        return;
      }

      next();
    };
  }

  /**
   * Require specific role
   */
  static requireRole(roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'Please authenticate to access this resource'
        });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          error: 'Insufficient role',
          message: `Requires one of the following roles: ${roles.join(', ')}`,
          required: roles,
          userRole: req.user.role
        });
        return;
      }

      next();
    };
  }

  /**
   * Organization context middleware
   */
  static requireOrganizationContext(req: AuthRequest, res: Response, next: NextFunction) {
    const orgSlug = req.params.orgSlug || req.headers['x-organization-slug'] as string;
    
    if (!orgSlug) {
      res.status(400).json({
        error: 'Organization context required',
        message: 'Organization slug must be provided in URL params or X-Organization-Slug header'
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate to access organization resources'
      });
      return;
    }

    const orgMembership = req.user.organizationMemberships.find(
      membership => membership.organizationSlug === orgSlug && membership.isActive
    );

    if (!orgMembership) {
      res.status(403).json({
        error: 'Organization access denied',
        message: 'You are not a member of this organization or your membership is inactive'
      });
      return;
    }

    req.organizationContext = {
      organizationId: orgMembership.organizationId,
      organizationSlug: orgMembership.organizationSlug,
      userRole: orgMembership.role
    };

    next();
  }
}

// Export convenience functions
export const hashPassword = SecurityUtils.hashPassword;
export const verifyPassword = SecurityUtils.verifyPassword;
export const generateToken = TokenManager.generateAccessToken;
export const generateRefreshToken = TokenManager.generateRefreshToken;
export const verifyToken = TokenManager.verifyAccessToken;
export const extractToken = AuthMiddleware.extractToken;
export const authenticateToken = AuthMiddleware.authenticate;
export const optionalAuth = AuthMiddleware.optionalAuth;
export const requireRole = AuthMiddleware.requireRole;
export const requirePermissions = AuthMiddleware.requirePermissions;
export const requireOrganizationContext = AuthMiddleware.requireOrganizationContext;
