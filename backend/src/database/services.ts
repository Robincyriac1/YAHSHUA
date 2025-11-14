import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

// Use string literals for enum types since Prisma types aren't properly exported
type EnergySource = 'SOLAR_PV' | 'SOLAR_THERMAL' | 'BIPV' | 'WIND_ONSHORE' | 'WIND_OFFSHORE' | 'HYDROELECTRIC' | 'MICRO_HYDRO' | 'PUMPED_STORAGE_HYDRO' | 'GEOTHERMAL' | 'ENHANCED_GEOTHERMAL' | 'BIOMASS' | 'BIOGAS' | 'BIOFUEL' | 'OCEAN_WAVE' | 'OCEAN_TIDAL' | 'OCEAN_THERMAL' | 'HYBRID';
type ProjectStatus = 'PLANNING' | 'DESIGN' | 'PERMITTING' | 'FINANCING' | 'PROCUREMENT' | 'CONSTRUCTION' | 'COMMISSIONING' | 'OPERATIONAL' | 'MAINTENANCE' | 'DECOMMISSIONING' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
type ProjectType = 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'UTILITY_SCALE' | 'COMMUNITY' | 'RESEARCH';
type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'PROJECT_MANAGER' | 'ENGINEER' | 'TECHNICIAN' | 'USER' | 'VIEWER';
type OrganizationRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';
type DataSourceType = 'WEATHER' | 'SOLAR_IRRADIANCE' | 'WIND_DATA' | 'ECONOMIC' | 'REGULATORY' | 'GRID_DATA' | 'MARKET_PRICES';

// =======================
// USER SERVICES
// =======================

export class UserService {
  static async createUser(userData: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    role?: UserRole;
    company?: string;
    jobTitle?: string;
  }) {
    const password = await bcrypt.hash(userData.password, 12);
    
    return await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password,
        role: userData.role || 'USER',
        company: userData.company,
        jobTitle: userData.jobTitle,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        company: true,
        jobTitle: true,
        createdAt: true,
      }
    });
  }

  static async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        password: true,
        role: true,
        company: true,
        jobTitle: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
      }
    });
  }

  static async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        company: true,
        jobTitle: true,
        phone: true,
        avatar: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  }

  static async updateLastLogin(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    });
  }

  static async getAllUsers(limit = 50, offset = 0) {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        company: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }
}

// =======================
// ORGANIZATION SERVICES
// =======================

export class OrganizationService {
  static async createOrganization(orgData: {
    name: string;
    slug: string;
    description?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    settings?: Record<string, any>;
  }) {
    return await prisma.organization.create({
      data: {
        name: orgData.name,
        slug: orgData.slug,
        description: orgData.description,
        email: orgData.email,
        phone: orgData.phone,
        website: orgData.website,
        address: orgData.address,
        settings: orgData.settings,
      }
    });
  }

  static async findBySlug(slug: string) {
    return await prisma.organization.findUnique({
      where: { slug },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              }
            }
          }
        },
        projects: true,
      }
    });
  }

  static async addMember(organizationId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER') {
    return await prisma.organizationMember.create({
      data: {
        organizationId,
        userId,
        role: role as any,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });
  }

  static async removeMember(organizationId: string, userId: string) {
    return await prisma.organizationMember.deleteMany({
      where: {
        organizationId,
        userId,
      }
    });
  }

  static async getMembersByOrganization(organizationId: string) {
    return await prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            avatar: true,
          }
        }
      },
      orderBy: { joinedAt: 'asc' }
    });
  }
}

// =======================
// USER + ORGANIZATION SIGNUP SERVICES
// =======================

export class SignupService {
  static async createUserWithOrganization(signupData: {
    // User data
    user: {
      email: string;
      username: string;
      firstName: string;
      lastName: string;
      password: string;
      jobTitle?: string;
      phone?: string;
    };
    // Organization data
    organization: {
      name: string;
      slug: string;
      description?: string;
      email?: string;
      phone?: string;
      website?: string;
      address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
      };
    };
  }) {
    // Use transaction to ensure both user and org are created together
    return await prisma.$transaction(async (tx: any) => {
      // 1. Create the user
      const password = await bcrypt.hash(signupData.user.password, 12);
      const user = await tx.user.create({
        data: {
          email: signupData.user.email,
          username: signupData.user.username,
          firstName: signupData.user.firstName,
          lastName: signupData.user.lastName,
          password,
          role: 'ADMIN', // Owner gets admin role
          jobTitle: signupData.user.jobTitle,
          phone: signupData.user.phone,
        }
      });

      // 2. Create the organization
      const organization = await tx.organization.create({
        data: {
          name: signupData.organization.name,
          slug: signupData.organization.slug,
          description: signupData.organization.description,
          email: signupData.organization.email,
          phone: signupData.organization.phone,
          website: signupData.organization.website,
          address: signupData.organization.address,
        }
      });

      // 3. Make user the owner of the organization
      await tx.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: 'OWNER',
        }
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          createdAt: user.createdAt,
        },
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          description: organization.description,
          createdAt: organization.createdAt,
        }
      };
    });
  }

  static async joinExistingOrganization(userData: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    jobTitle?: string;
    phone?: string;
  }, organizationSlug: string) {
    return await prisma.$transaction(async (tx: any) => {
      // 1. Find the organization
      const organization = await tx.organization.findUnique({
        where: { slug: organizationSlug }
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      // 2. Create the user
      const password = await bcrypt.hash(userData.password, 12);
      const user = await tx.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          password,
          role: 'USER', // Default role for joining users
          jobTitle: userData.jobTitle,
          phone: userData.phone,
        }
      });

      // 3. Add user to organization as member
      await tx.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: 'MEMBER',
        }
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          createdAt: user.createdAt,
        },
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          description: organization.description,
        }
      };
    });
  }

  static async validateOrganizationSlug(slug: string) {
    const existing = await prisma.organization.findUnique({
      where: { slug }
    });
    return !existing; // Return true if slug is available
  }

  static async validateUsername(username: string) {
    const existing = await prisma.user.findUnique({
      where: { username }
    });
    return !existing; // Return true if username is available
  }

  static async validateEmail(email: string) {
    const existing = await prisma.user.findUnique({
      where: { email }
    });
    return !existing; // Return true if email is available
  }
}

// =======================
// PROJECT SERVICES
// =======================

export class ProjectService {
  static async createProject(projectData: {
    name: string;
    description?: string;
    projectType: ProjectType;
    energySource: EnergySource;
    ownerId: string;
    organizationId?: string;
    location: {
      lat: number;
      lng: number;
      address: string;
      country: string;
      region?: string;
    };
    systemCapacity?: number;
    estimatedCost?: number;
    currency?: string;
    plannedStartDate?: Date;
    plannedEndDate?: Date;
  }) {
    return await prisma.project.create({
      data: {
        name: projectData.name,
        description: projectData.description,
        projectType: projectData.projectType,
        energySource: projectData.energySource,
        ownerId: projectData.ownerId,
        organizationId: projectData.organizationId,
        location: projectData.location,
        systemCapacity: projectData.systemCapacity,
        estimatedCost: projectData.estimatedCost,
        currency: projectData.currency || 'USD',
        plannedStartDate: projectData.plannedStartDate,
        plannedEndDate: projectData.plannedEndDate,
        status: 'PLANNING',
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });
  }

  static async getProjectById(id: string) {
    return await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        solarSystems: true,
        windSystems: true,
        energyStorage: true,
        monitoring: true,
      }
    });
  }

  static async getProjectsByOwner(ownerId: string, limit = 20, offset = 0) {
    return await prisma.project.findMany({
      where: { ownerId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  static async updateProjectStatus(id: string, status: ProjectStatus, progressPercent?: number) {
    return await prisma.project.update({
      where: { id },
      data: { 
        status,
        progressPercent,
        updatedAt: new Date(),
      }
    });
  }

  static async getAllProjects(limit = 50, offset = 0, filters?: {
    energySource?: EnergySource;
    status?: ProjectStatus;
    projectType?: ProjectType;
  }) {
    const where: any = {};
    
    if (filters?.energySource) where.energySource = filters.energySource;
    if (filters?.status) where.status = filters.status;
    if (filters?.projectType) where.projectType = filters.projectType;

    return await prisma.project.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  static async getProjectStats() {
    const totalProjects = await prisma.project.count();
    
    const projectsByEnergySource = await prisma.project.groupBy({
      by: ['energySource'],
      _count: { energySource: true }
    });

    const projectsByStatus = await prisma.project.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const totalSystemCapacity = await prisma.project.aggregate({
      _sum: { systemCapacity: true }
    });

    const totalEstimatedCost = await prisma.project.aggregate({
      _sum: { estimatedCost: true }
    });

    return {
      totalProjects,
      projectsByEnergySource: projectsByEnergySource.reduce((acc: Record<string, number>, item: any) => {
        acc[item.energySource] = item._count.energySource;
        return acc;
      }, {} as Record<string, number>),
      projectsByStatus: projectsByStatus.reduce((acc: Record<string, number>, item: any) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      totalSystemCapacity: totalSystemCapacity._sum.systemCapacity || 0,
      totalEstimatedCost: totalEstimatedCost._sum.estimatedCost || 0,
    };
  }
}

// =======================
// MONITORING SERVICES
// =======================

export class MonitoringService {
  static async recordEnergyData(data: {
    monitoringSystemId: string;
    timestamp: Date;
    powerGeneration?: number;
    energyProduced?: number;
    voltage?: number;
    current?: number;
    temperature?: number;
    solarIrradiance?: number;
    windSpeed?: number;
    efficiency?: number;
  }) {
    return await prisma.energyData.create({
      data
    });
  }

  static async getLatestEnergyData(monitoringSystemId: string, limit = 100) {
    return await prisma.energyData.findMany({
      where: { monitoringSystemId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  static async getEnergyDataByDateRange(
    monitoringSystemId: string, 
    startDate: Date, 
    endDate: Date
  ) {
    return await prisma.energyData.findMany({
      where: {
        monitoringSystemId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        }
      },
      orderBy: { timestamp: 'asc' },
    });
  }
}

// =======================
// SYSTEM UTILITIES
// =======================

export class SystemService {
  static async getDashboardStats() {
    const [totalUsers, projectStats] = await Promise.all([
      prisma.user.count(),
      ProjectService.getProjectStats(),
    ]);

    return {
      totalUsers,
      ...projectStats,
    };
  }

  static async getSystemHealth() {
    try {
      // Test database connection
      await prisma.$queryRaw`SELECT 1`;
      
      // Get basic stats
      const userCount = await prisma.user.count();
      const projectCount = await prisma.project.count();
      
      return {
        status: 'healthy',
        message: 'All systems operational',
        database: 'connected',
        stats: {
          users: userCount,
          projects: projectCount,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // Graceful fallback when database is not available
      console.warn('Database not available:', error instanceof Error ? error.message : 'Unknown error');
      
      return {
        status: 'partial',
        message: 'Backend API operational (database pending setup)',
        database: 'disconnected',
        note: 'Database will be available after PostgreSQL setup',
        backend: 'running',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// =======================
// UNIVERSAL TECHNOLOGY SERVICES
// =======================

export class HydroSystemService {
  static async createHydroSystem(hydroData: any) {
    return await prisma.hydroSystem.create({
      data: hydroData,
      include: {
        project: true,
      }
    });
  }

  static async getHydroSystemsByProject(projectId: string) {
    return await prisma.hydroSystem.findMany({
      where: { projectId },
      include: {
        project: true,
      }
    });
  }

  static async updateHydroSystem(id: string, updateData: any) {
    return await prisma.hydroSystem.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
      }
    });
  }
}

export class GeothermalSystemService {
  static async createGeothermalSystem(geothermalData: any) {
    return await prisma.geothermalSystem.create({
      data: geothermalData,
      include: {
        project: true,
      }
    });
  }

  static async getGeothermalSystemsByProject(projectId: string) {
    return await prisma.geothermalSystem.findMany({
      where: { projectId },
      include: {
        project: true,
      }
    });
  }

  static async updateGeothermalSystem(id: string, updateData: any) {
    return await prisma.geothermalSystem.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
      }
    });
  }
}

export class BiomassSystemService {
  static async createBiomassSystem(biomassData: any) {
    return await prisma.biomassSystem.create({
      data: biomassData,
      include: {
        project: true,
      }
    });
  }

  static async getBiomassSystemsByProject(projectId: string) {
    return await prisma.biomassSystem.findMany({
      where: { projectId },
      include: {
        project: true,
      }
    });
  }

  static async updateBiomassSystem(id: string, updateData: any) {
    return await prisma.biomassSystem.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
      }
    });
  }
}

export class OceanEnergySystemService {
  static async createOceanEnergySystem(oceanData: any) {
    return await prisma.oceanEnergySystem.create({
      data: oceanData,
      include: {
        project: true,
      }
    });
  }

  static async getOceanEnergySystemsByProject(projectId: string) {
    return await prisma.oceanEnergySystem.findMany({
      where: { projectId },
      include: {
        project: true,
      }
    });
  }

  static async updateOceanEnergySystem(id: string, updateData: any) {
    return await prisma.oceanEnergySystem.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
      }
    });
  }
}

export class HybridSystemService {
  static async createHybridSystem(hybridData: any) {
    return await prisma.hybridSystem.create({
      data: hybridData,
      include: {
        project: true,
      }
    });
  }

  static async getHybridSystemsByProject(projectId: string) {
    return await prisma.hybridSystem.findMany({
      where: { projectId },
      include: {
        project: true,
      }
    });
  }

  static async updateHybridSystem(id: string, updateData: any) {
    return await prisma.hybridSystem.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
      }
    });
  }
}

// =======================
// UNIVERSAL FRAMEWORK SERVICES
// =======================

export class ResourceAssessmentService {
  static async createResourceAssessment(assessmentData: any) {
    return await prisma.resourceAssessment.create({
      data: assessmentData,
      include: {
        project: true,
      }
    });
  }

  static async getResourceAssessmentsByProject(projectId: string) {
    return await prisma.resourceAssessment.findMany({
      where: { projectId },
      include: {
        project: true,
      }
    });
  }

  static async updateResourceAssessment(id: string, updateData: any) {
    return await prisma.resourceAssessment.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
      }
    });
  }
}

export class RegulatoryComplianceService {
  static async createRegulatoryCompliance(complianceData: any) {
    return await prisma.regulatoryCompliance.create({
      data: complianceData,
      include: {
        project: true,
      }
    });
  }

  static async getRegulatoryComplianceByProject(projectId: string) {
    return await prisma.regulatoryCompliance.findMany({
      where: { projectId },
      include: {
        project: true,
      }
    });
  }

  static async updateRegulatoryCompliance(id: string, updateData: any) {
    return await prisma.regulatoryCompliance.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
      }
    });
  }
}

export class FinancialModelService {
  static async createFinancialModel(financialData: any) {
    return await prisma.financialModel.create({
      data: financialData,
      include: {
        project: true,
      }
    });
  }

  static async getFinancialModelsByProject(projectId: string) {
    return await prisma.financialModel.findMany({
      where: { projectId },
      include: {
        project: true,
      }
    });
  }

  static async updateFinancialModel(id: string, updateData: any) {
    return await prisma.financialModel.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
      }
    });
  }
}

export class ExternalDataSourceService {
  static async createExternalDataSource(dataSourceData: any) {
    return await prisma.externalDataSource.create({
      data: dataSourceData,
    });
  }

  static async getAllExternalDataSources() {
    return await prisma.externalDataSource.findMany({
      include: {
        projects: true,
      }
    });
  }

  static async getExternalDataSourcesByType(dataSourceType: string) {
    return await prisma.externalDataSource.findMany({
      where: { dataSourceType: dataSourceType as any },
      include: {
        projects: true,
      }
    });
  }

  static async updateExternalDataSource(id: string, updateData: any) {
    return await prisma.externalDataSource.update({
      where: { id },
      data: updateData,
      include: {
        projects: true,
      }
    });
  }
}
