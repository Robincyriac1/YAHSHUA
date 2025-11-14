import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient, Project, Organization, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class WebSocketService {
  private io: SocketIOServer;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Join user to their organization rooms
      socket.on('join-organization', (orgId: string) => {
        socket.join(`org-${orgId}`);
        console.log(`Socket ${socket.id} joined organization ${orgId}`);
      });

      // Join user to project rooms
      socket.on('join-project', (projectId: string) => {
        socket.join(`project-${projectId}`);
        console.log(`Socket ${socket.id} joined project ${projectId}`);
      });

      // Handle real-time project updates
      socket.on('project-update', async (data) => {
        try {
          const { projectId, updates } = data;
          
          // Update project in database
          const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: updates,
            include: {
              organization: true,
              owner: true
            }
          });

          // Broadcast to all clients in the project room
          this.io.to(`project-${projectId}`).emit('project-updated', updatedProject);
          
          // Also broadcast to organization room
          this.io.to(`org-${updatedProject.organizationId}`).emit('organization-project-updated', updatedProject);
          
        } catch (error) {
          console.error('Error updating project:', error);
          socket.emit('error', { message: 'Failed to update project' });
        }
      });

      // Handle real-time analytics updates
      socket.on('request-analytics', async (data) => {
        try {
          const { organizationId, projectId, timeRange } = data;
          
          // Fetch analytics data
          const analytics = await this.getAnalyticsData(organizationId, projectId, timeRange);
          
          socket.emit('analytics-data', analytics);
        } catch (error) {
          console.error('Error fetching analytics:', error);
          socket.emit('error', { message: 'Failed to fetch analytics' });
        }
      });

      // Handle system health monitoring
      socket.on('request-system-health', async () => {
        try {
          const healthData = await this.getSystemHealth();
          socket.emit('system-health', healthData);
        } catch (error) {
          console.error('Error fetching system health:', error);
          socket.emit('error', { message: 'Failed to fetch system health' });
        }
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  // Broadcast real-time project metrics
  public async broadcastProjectMetrics(projectId: string) {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          organization: true
        }
      });

      if (!project) return;

      const metrics = {
        projectId,
        energyProduction: this.generateEnergyData(),
        efficiency: this.calculateEfficiency(project),
        systemHealth: this.getSystemHealthForProject(projectId),
        financialMetrics: await this.getFinancialMetrics(projectId),
        timestamp: new Date()
      };

      this.io.to(`project-${projectId}`).emit('real-time-metrics', metrics);
      this.io.to(`org-${project.organizationId}`).emit('organization-metrics-update', metrics);

    } catch (error) {
      console.error('Error broadcasting project metrics:', error);
    }
  }

  // Broadcast system-wide notifications
  public broadcastSystemNotification(message: string, type: 'info' | 'warning' | 'error' = 'info') {
    this.io.emit('system-notification', {
      message,
      type,
      timestamp: new Date()
    });
  }

  // Get analytics data for real-time updates
  private async getAnalyticsData(organizationId?: string, projectId?: string, timeRange: string = '24h') {
    try {
      const where: any = {};
      if (organizationId) where.organizationId = organizationId;
      if (projectId) where.id = projectId;

      const projects = await prisma.project.findMany({
        where,
        include: {
          organization: true
        }
      });

      return {
        totalProjects: projects.length,
        activeProjects: projects.filter((p: any) => p.status === ProjectStatus.OPERATIONAL).length,
        totalCapacity: projects.reduce((sum: number, p: any) => sum + (p.systemCapacity ? Number(p.systemCapacity) : 0), 0),
        totalEnergyProduced: projects.reduce((sum: number, p: any) => sum + this.generateEnergyData().current, 0),
        averageEfficiency: projects.reduce((sum: number, p: any) => sum + this.calculateEfficiency(p), 0) / projects.length || 0,
        timeRange,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return null;
    }
  }

  // Get system health metrics
  private async getSystemHealth() {
    try {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();
      
      // Check database connection
      let dbHealth = 'healthy';
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch {
        dbHealth = 'unhealthy';
      }

      return {
        uptime: uptime,
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024)
        },
        database: dbHealth,
        api: 'healthy',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting system health:', error);
      return null;
    }
  }

  // Generate mock energy data (replace with real data source)
  private generateEnergyData() {
    const baseProduction = 100;
    const variation = Math.random() * 20 - 10; // ±10% variation
    
    return {
      current: Math.max(0, baseProduction + variation),
      daily: Math.max(0, (baseProduction + variation) * 8), // 8 hours of production
      weekly: Math.max(0, (baseProduction + variation) * 8 * 7),
      monthly: Math.max(0, (baseProduction + variation) * 8 * 30)
    };
  }

  // Calculate efficiency for a project
  private calculateEfficiency(project: any) {
    // Mock efficiency calculation (replace with real algorithm)
    const baseEfficiency = 85;
    const variation = Math.random() * 10 - 5; // ±5% variation
    return Math.max(0, Math.min(100, baseEfficiency + variation));
  }

  // Get system health for specific project
  private getSystemHealthForProject(projectId: string) {
    // Mock system health (replace with real monitoring)
    return {
      inverters: Math.random() > 0.1 ? 'online' : 'offline',
      sensors: Math.random() > 0.05 ? 'online' : 'offline',
      communication: Math.random() > 0.02 ? 'online' : 'offline',
      lastCheck: new Date()
    };
  }

  // Get financial metrics for a project
  private async getFinancialMetrics(projectId: string) {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) return null;

      // Mock financial calculations (replace with real data)
      const dailyRevenue = this.generateEnergyData().daily * 0.12; // $0.12/kWh
      const monthlyRevenue = dailyRevenue * 30;
      const yearlyRevenue = monthlyRevenue * 12;

      return {
        dailyRevenue: Math.round(dailyRevenue * 100) / 100,
        monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
        yearlyRevenue: Math.round(yearlyRevenue * 100) / 100,
        roi: Math.round(((yearlyRevenue * 20) / (Number(project.estimatedCost) || 100000)) * 100 * 100) / 100,
        paybackPeriod: Math.round(((Number(project.estimatedCost) || 100000) / yearlyRevenue) * 10) / 10
      };
    } catch (error) {
      console.error('Error calculating financial metrics:', error);
      return null;
    }
  }

  // Start periodic data broadcasting
  public startPeriodicUpdates() {
    // Broadcast system health every 30 seconds
    setInterval(async () => {
      const healthData = await this.getSystemHealth();
      this.io.emit('system-health-update', healthData);
    }, 30000);

    // Broadcast project metrics every 10 seconds
    setInterval(async () => {
      try {
        const projects = await prisma.project.findMany({
          where: { status: ProjectStatus.OPERATIONAL },
          select: { id: true }
        });

        for (const project of projects) {
          await this.broadcastProjectMetrics(project.id);
        }
      } catch (error) {
        console.error('Error in periodic project updates:', error);
      }
    }, 10000);
  }

  public getIO() {
    return this.io;
  }
}
