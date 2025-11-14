import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '../generated/prisma';
import {
  SecurityUtils,
  TokenManager,
  UserService,
  AuthMiddleware,
  AuthRequest
} from '../auth';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  organizationName: z.string().optional(),
  organizationSlug: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER', 'ENGINEER', 'TECHNICIAN', 'USER', 'VIEWER']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

/**
 * POST /api/auth/register
 * Register a new user account
 */
router.post('/register', async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input data',
        details: validation.error.issues
      });
    }

    const {
      email,
      password,
      username,
      firstName,
      lastName,
      organizationName,
      organizationSlug,
      role = 'USER'
    } = validation.data;

    // Validate password strength
    const passwordValidation = SecurityUtils.validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Weak password',
        message: 'Password does not meet security requirements',
        details: passwordValidation.errors
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: existingUser.email === email.toLowerCase() 
          ? 'An account with this email already exists' 
          : 'Username is already taken'
      });
    }

    // Hash password
    const hashedPassword = await SecurityUtils.hashPassword(password);

    // Generate verification token
    const emailVerificationToken = SecurityUtils.generateSecureToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    let organizationId: string | undefined;

    // Handle organization creation or joining
    if (organizationName && organizationSlug) {
      // Check if organization slug is available
      const existingOrg = await prisma.organization.findUnique({
        where: { slug: organizationSlug }
      });

      if (existingOrg) {
        return res.status(409).json({
          error: 'Organization slug taken',
          message: 'This organization slug is already in use'
        });
      }

      // Create new organization
      const organization = await prisma.organization.create({
        data: {
          name: organizationName,
          slug: organizationSlug,
          description: `${organizationName} - Created during user registration`,
          isActive: true
        }
      });

      organizationId = organization.id;
    }

    // Create user with correct field names
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword, // Using 'password' field from updated schema
        username,
        firstName,
        lastName,
        role,
        emailVerified: false,
        emailVerificationToken,
        emailVerificationExpiry: tokenExpiry,
        preferences: {
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            marketing: false
          },
          language: 'en',
          timezone: 'UTC'
        }
      }
    });

    // Add user to organization if provided
    if (organizationId) {
      await prisma.organizationMember.create({
        data: {
          userId: user.id,
          organizationId,
          role: 'OWNER', // First member becomes owner
          joinedAt: new Date()
        }
      });
    }

    // Return success (don't include password or sensitive data)
    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        organizationId
      },
      nextStep: 'Please check your email and verify your account before signing in'
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An unexpected error occurred during registration'
    });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input data',
        details: validation.error.issues
      });
    }

    const { email, password, remember = false } = validation.data;

    // Check for account lockout
    const lockStatus = await UserService.checkFailedAttempts(email);
    if (lockStatus.locked) {
      return res.status(429).json({
        error: 'Account locked',
        message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    });

    if (!user) {
      await UserService.recordFailedAttempt(email);
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
        remainingAttempts: lockStatus.remainingAttempts - 1
      });
    }

    // Verify password - using correct field name
    const isValidPassword = await SecurityUtils.verifyPassword(password, user.password);
    if (!isValidPassword) {
      await UserService.recordFailedAttempt(email);
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
        remainingAttempts: lockStatus.remainingAttempts - 1
      });
    }

    // Clear failed attempts on successful login
    await UserService.clearFailedAttempts(email);

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(401).json({
        error: 'Email not verified',
        message: 'Please verify your email address before signing in',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Get full user data with organization memberships
    const authUser = await UserService.getUserWithMemberships(user.id);
    if (!authUser) {
      return res.status(500).json({
        error: 'Login failed',
        message: 'Unable to retrieve user information'
      });
    }

    // Generate tokens
    const accessToken = TokenManager.generateAccessToken(authUser);
    const refreshToken = TokenManager.generateRefreshToken(authUser);

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + (remember ? 30 : 7) * 24 * 60 * 60 * 1000),
        userAgent: req.headers['user-agent'] || 'Unknown',
        ipAddress: req.ip || 'Unknown'
      }
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        lastLoginAt: new Date(),
        lastLoginIp: req.ip || 'Unknown'
      }
    });

    res.json({
      message: 'Login successful',
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
      },
      user: {
        id: authUser.id,
        email: authUser.email,
        username: authUser.username,
        firstName: authUser.firstName,
        lastName: authUser.lastName,
        role: authUser.role,
        emailVerified: authUser.emailVerified,
        organizationMemberships: authUser.organizationMemberships,
        permissions: authUser.permissions,
        preferences: authUser.preferences
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An unexpected error occurred during login'
    });
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', AuthMiddleware.authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await UserService.getUserWithMemberships(req.user!.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Unable to retrieve user profile'
      });
    }

    res.json({
      message: 'Profile retrieved successfully',
      user: user
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      error: 'Profile retrieval failed',
      message: 'An unexpected error occurred'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout and revoke tokens
 */
router.post('/logout', AuthMiddleware.authenticate, async (req: AuthRequest, res) => {
  try {
    const token = AuthMiddleware.extractToken(req);
    const { refreshToken } = req.body;

    // Blacklist access token
    if (token) {
      await TokenManager.blacklistToken(token);
    }

    // Revoke refresh token if provided
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: {
          token: refreshToken,
          userId: req.user!.id
        },
        data: {
          revokedAt: new Date()
        }
      });
    }

    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'An unexpected error occurred during logout'
    });
  }
});

export default router;
