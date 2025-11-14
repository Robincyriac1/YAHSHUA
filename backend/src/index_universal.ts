import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase, checkDatabaseHealth } from './database/prisma';
import { 
  SystemService, 
  SignupService, 
  OrganizationService, 
  UserService,
  HydroSystemService,
  GeothermalSystemService,
  BiomassSystemService,
  OceanEnergySystemService,
  HybridSystemService,
  ResourceAssessmentService,
  RegulatoryComplianceService,
  FinancialModelService,
  ExternalDataSourceService
} from './database/services';

// Load environment variables
dotenv.config();

class YahshuaServer {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3002');
  }

  private setupMiddleware(): void {
    // Security and performance middleware
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3001",
      credentials: true
    }));
    
    // Request parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Logging middleware
    this.app.use(morgan('combined'));
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const systemHealth = await SystemService.getSystemHealth();
        res.json(systemHealth);
      } catch (error) {
        res.status(500).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          message: 'Health check failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Welcome to YAHSHUA Universal Renewable Energy Platform',
        description: 'A comprehensive platform serving all renewable energy technologies',
        technologies: ['Solar', 'Wind', 'Hydroelectric', 'Geothermal', 'Biomass', 'Ocean Energy', 'Hybrid Systems'],
        status: 'operational'
      });
    });

    // =======================
    // VALIDATION ENDPOINTS
    // =======================

    // Validate organization slug
    this.app.get('/api/validate/org-slug/:slug', async (req, res) => {
      try {
        const { slug } = req.params;
        console.log(`🔍 Validating org slug: ${slug}`);
        
        const isAvailable = await SignupService.validateOrganizationSlug(slug);
        console.log(`✅ Slug '${slug}' available: ${isAvailable}`);
        
        res.json({
          available: isAvailable,
          slug: slug
        });
      } catch (error) {
        console.error('Slug validation error:', error);
        res.status(500).json({ error: 'Validation failed' });
      }
    });

    // Validate username
    this.app.get('/api/validate/username/:username', async (req, res) => {
      try {
        const { username } = req.params;
        const isAvailable = await SignupService.validateUsername(username);
        res.json({
          available: isAvailable,
          username: username
        });
      } catch (error) {
        res.status(500).json({ error: 'Validation failed' });
      }
    });

    // Validate email
    this.app.get('/api/validate/email/:email', async (req, res) => {
      try {
        const { email } = req.params;
        const isAvailable = await SignupService.validateEmail(email);
        res.json({
          available: isAvailable,
          email: email
        });
      } catch (error) {
        res.status(500).json({ error: 'Validation failed' });
      }
    });

    // =======================
    // SIGNUP ENDPOINTS
    // =======================

    // Create new organization with owner
    this.app.post('/api/signup/organization', async (req, res) => {
      try {
        const { organization, user } = req.body;

        // Validation
        if (!organization?.name || !organization?.slug) {
          return res.status(400).json({ error: 'Missing required organization fields' });
        }

        if (!user?.email || !user?.password || !user?.firstName || !user?.lastName) {
          return res.status(400).json({ error: 'Missing required user fields' });
        }

        // Check if slug and email are available
        const slugAvailable = await SignupService.validateOrganizationSlug(organization.slug);
        if (!slugAvailable) {
          return res.status(400).json({ error: 'Organization slug already in use' });
        }

        const emailAvailable = await SignupService.validateEmail(user.email);
        if (!emailAvailable) {
          return res.status(400).json({ error: 'Email already in use' });
        }

        // Create organization and user
        const result = await SignupService.createUserWithOrganization({
          user: {
            email: user.email,
            username: user.username || user.email.split('@')[0],
            firstName: user.firstName,
            lastName: user.lastName,
            password: user.password,
            jobTitle: user.jobTitle,
            phone: user.phone,
          },
          organization: {
            name: organization.name,
            slug: organization.slug,
            description: organization.description,
            website: organization.website,
            email: organization.email,
            phone: organization.phone,
            address: organization.address,
          }
        });

        res.status(201).json({
          message: 'Organization and user created successfully',
          ...result
        });

      } catch (error) {
        console.error('Organization signup error:', error);
        res.status(500).json({
          error: 'Failed to create organization',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Join existing organization
    this.app.post('/api/signup/join/:orgSlug', async (req, res) => {
      try {
        const { orgSlug } = req.params;
        const { user } = req.body;

        // Validation
        if (!user?.email || !user?.password || !user?.firstName || !user?.lastName) {
          return res.status(400).json({ error: 'Missing required user fields' });
        }

        // Check if email is available
        const emailAvailable = await SignupService.validateEmail(user.email);
        if (!emailAvailable) {
          return res.status(400).json({ error: 'Email already in use' });
        }

        // Join organization
        const result = await SignupService.joinExistingOrganization({
          email: user.email,
          username: user.username || user.email.split('@')[0],
          firstName: user.firstName,
          lastName: user.lastName,
          password: user.password,
          jobTitle: user.jobTitle,
          phone: user.phone,
        }, orgSlug);

        res.status(201).json({
          message: 'Successfully joined organization',
          ...result
        });

      } catch (error) {
        console.error('Join organization error:', error);
        res.status(500).json({
          error: 'Failed to join organization',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Get organization details (public endpoint for signup)
    this.app.get('/api/organizations/:slug', async (req, res) => {
      try {
        const { slug } = req.params;
        const organization = await OrganizationService.findBySlug(slug);
        
        if (!organization) {
          return res.status(404).json({ error: 'Organization not found' });
        }

        // Return limited public info
        res.json({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          description: organization.description,
          website: organization.website,
          memberCount: organization.members.length,
          projectCount: organization.projects.length,
          createdAt: organization.createdAt,
        });

      } catch (error) {
        res.status(500).json({
          error: 'Failed to fetch organization',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // =======================
    // USER & PROJECT MANAGEMENT ROUTES  
    // =======================

    // Get user profile (placeholder for authentication)
    this.app.get('/api/users/me', async (req, res) => {
      res.json({
        message: 'User profile endpoint - Authentication coming soon!',
        note: 'This will return the current user\'s profile'
      });
    });

    // Projects API placeholder
    this.app.get('/api/projects', async (req, res) => {
      res.json({
        message: 'Projects API - Universal Renewable Energy Platform',
        description: 'Manage projects across all renewable energy technologies',
        technologies: ['Solar', 'Wind', 'Hydroelectric', 'Geothermal', 'Biomass', 'Ocean Energy', 'Hybrid'],
        status: 'Active - Universal Technology Support'
      });
    });

    // Solar API
    this.app.get('/api/solar', async (req, res) => {
      res.json({
        message: 'Solar Energy Systems API',
        description: 'Advanced solar PV and BIPV management with comprehensive design tools',
        capabilities: [
          'BIPV (Building-Integrated Photovoltaics) design',
          'Advanced shading analysis',
          'Performance optimization',
          'Module selection and layout',
          'Grid integration planning'
        ],
        status: 'Active - Enhanced with BIPV Support'
      });
    });

    // Wind API  
    this.app.get('/api/wind', async (req, res) => {
      res.json({
        message: 'Wind Energy Systems API',
        description: 'Comprehensive wind energy project management and optimization',
        capabilities: [
          'Wind resource assessment',
          'Turbine selection and layout optimization',
          'Wake effect modeling',
          'Noise and visual impact analysis',
          'Onshore and offshore support'
        ],
        status: 'Active - Universal Technology Support'
      });
    });

    // =======================
    // UNIVERSAL TECHNOLOGY APIS
    // =======================

    // Hydroelectric Systems API
    this.app.get('/api/hydro', async (req, res) => {
      res.json({
        message: 'Hydroelectric Systems API',
        description: 'Manage hydroelectric power systems including run-of-river, storage dams, and pumped storage',
        capabilities: [
          'Flow analysis and resource assessment',
          'Environmental impact evaluation', 
          'Fish passage design integration',
          'Seasonal variation modeling',
          'Turbine selection optimization'
        ],
        status: 'Active - Universal Technology Support'
      });
    });

    // Geothermal Systems API
    this.app.get('/api/geothermal', async (req, res) => {
      res.json({
        message: 'Geothermal Energy Systems API',
        description: 'Manage geothermal power systems including conventional and enhanced geothermal systems (EGS)',
        capabilities: [
          'Subsurface resource assessment',
          'Drilling optimization and planning',
          'Enhanced geothermal system (EGS) support',
          'Geological survey integration',
          'Seismic risk assessment'
        ],
        status: 'Active - Universal Technology Support'
      });
    });

    // Biomass/Bioenergy Systems API
    this.app.get('/api/biomass', async (req, res) => {
      res.json({
        message: 'Biomass/Bioenergy Systems API',
        description: 'Manage biomass and bioenergy systems with comprehensive supply chain tracking',
        capabilities: [
          'Feedstock supply chain management',
          'Sustainability certification tracking',
          'Carbon lifecycle assessment',
          'Conversion technology optimization',
          'Waste stream management'
        ],
        status: 'Active - Universal Technology Support'
      });
    });

    // Ocean Energy Systems API
    this.app.get('/api/ocean', async (req, res) => {
      res.json({
        message: 'Ocean Energy Systems API',
        description: 'Manage ocean energy systems including wave, tidal, and ocean thermal energy',
        capabilities: [
          'Marine resource assessment',
          'Wave and tidal modeling',
          'Marine environmental impact analysis',
          'Underwater installation planning',
          'Maritime logistics coordination'
        ],
        status: 'Active - Universal Technology Support'
      });
    });

    // Hybrid Multi-Technology Systems API
    this.app.get('/api/hybrid', async (req, res) => {
      res.json({
        message: 'Hybrid Multi-Technology Systems API',
        description: 'Optimize multi-technology renewable energy projects for maximum efficiency',
        capabilities: [
          'Multi-technology integration planning',
          'Resource complementarity analysis',
          'Shared infrastructure optimization',
          'Integrated control system design',
          'Cross-technology performance analytics'
        ],
        status: 'Active - Universal Technology Support'
      });
    });

    // =======================
    // UNIVERSAL FRAMEWORK APIS
    // =======================

    // Universal Resource Assessment API
    this.app.get('/api/resource-assessment', async (req, res) => {
      res.json({
        message: 'Universal Resource Assessment API',
        description: 'Technology-agnostic resource evaluation and analysis',
        capabilities: [
          'Multi-technology resource analysis',
          'Standardized quality metrics',
          'Seasonal pattern analysis',
          'Uncertainty quantification',
          'Bankable assessment reports'
        ],
        status: 'Active - Universal Framework'
      });
    });

    // Regulatory Compliance API
    this.app.get('/api/compliance', async (req, res) => {
      res.json({
        message: 'Regulatory Compliance API',
        description: 'Multi-jurisdiction permit and compliance management',
        capabilities: [
          'Multi-jurisdiction permit tracking',
          'Regulatory framework mapping',
          'Compliance status monitoring',
          'Environmental requirement management',
          'Technology-specific regulation support'
        ],
        status: 'Active - Universal Framework'
      });
    });

    // Financial Modeling API
    this.app.get('/api/financial', async (req, res) => {
      res.json({
        message: 'Universal Financial Modeling API',
        description: 'Comprehensive financial analysis for all renewable technologies',
        capabilities: [
          'Universal LCOE calculations',
          'Technology-specific cost modeling',
          'Multi-scenario risk analysis',
          'Revenue stream optimization',
          'Investment grade financial models'
        ],
        status: 'Active - Universal Framework'
      });
    });

    // External Data Sources API
    this.app.get('/api/data-sources', async (req, res) => {
      res.json({
        message: 'External Data Sources Integration API',
        description: 'Comprehensive external data source management and integration',
        capabilities: [
          'Multi-source data aggregation',
          'Real-time data synchronization',
          'API integration management',
          'Data quality assurance',
          'Technology-specific data feeds'
        ],
        status: 'Active - Universal Framework'
      });
    });

    // Get organization members
    this.app.get('/api/organizations/:slug/members', async (req, res) => {
      try {
        const { slug } = req.params;
        const organization = await OrganizationService.findBySlug(slug);
        
        if (!organization) {
          return res.status(404).json({ error: 'Organization not found' });
        }

        const members = await OrganizationService.getMembersByOrganization(organization.id);
        res.json(members);

      } catch (error) {
        res.status(500).json({
          error: 'Failed to fetch organization members',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        available_routes: [
          'GET /',
          'GET /health',
          'GET /api/projects',
          'GET /api/solar',
          'GET /api/wind',
          'GET /api/hydro',
          'GET /api/geothermal', 
          'GET /api/biomass',
          'GET /api/ocean',
          'GET /api/hybrid',
          'GET /api/resource-assessment',
          'GET /api/compliance',
          'GET /api/financial',
          'GET /api/data-sources'
        ]
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong!'
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      console.log('🔌 Connecting to database...');
      const dbConnected = await connectDatabase();
      
      if (!dbConnected) {
        console.log('⚠️  Database connection failed - continuing without database');
      }

      // Setup Express middleware and routes
      this.setupMiddleware();
      this.setupRoutes();
      this.setupErrorHandling();

      // Start the server
      this.app.listen(this.port, () => {
        console.log(`
🚀 YAHSHUA Universal Renewable Energy Platform
📡 Server running on port ${this.port}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🗄️  Database: ${dbConnected ? 'Connected' : 'Disconnected'}
📊 Health check: http://localhost:${this.port}/health
🏠 Welcome page: http://localhost:${this.port}/
🎯 Ready to serve all renewable energy technologies!

Available endpoints:
  GET /                              - Welcome message
  GET /health                       - Health check (includes database status)
  
  🔐 Authentication & Signup:
  GET /api/validate/org-slug/:slug  - Check org slug availability
  GET /api/validate/username/:user  - Check username availability  
  GET /api/validate/email/:email    - Check email availability
  POST /api/signup/organization     - Create new organization + owner
  POST /api/signup/join/:orgSlug    - Join existing organization
  
  🏢 Organizations:
  GET /api/organizations/:slug      - Get organization info
  GET /api/organizations/:slug/members - Get organization members
  
  🚀 Universal Technology APIs:
  GET /api/projects                 - Projects management
  GET /api/solar                    - Solar PV & BIPV systems
  GET /api/wind                     - Wind energy systems
  GET /api/hydro                    - Hydroelectric systems
  GET /api/geothermal              - Geothermal energy systems
  GET /api/biomass                 - Biomass/Bioenergy systems
  GET /api/ocean                   - Ocean energy systems
  GET /api/hybrid                  - Multi-technology systems
  
  🌐 Universal Framework APIs:
  GET /api/resource-assessment     - Resource evaluation
  GET /api/compliance              - Regulatory compliance
  GET /api/financial               - Financial modeling
  GET /api/data-sources           - External data integration
  GET /api/users/me               - User profile (auth coming soon)
        `);
      });

    } catch (error) {
      console.error('❌ Server startup failed:', error);
      process.exit(1);
    }
  }
}

// Initialize and start the server
const server = new YahshuaServer();
server.start().catch((error) => {
  console.error('❌ Failed to start YAHSHUA server:', error);
  process.exit(1);
});

export { YahshuaServer };
