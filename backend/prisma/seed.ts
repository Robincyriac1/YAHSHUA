import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clean existing data in correct order
  console.log('Cleaning existing data...');
  
  await prisma.organizationMember.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10);

  console.log('Creating organizations...');
  
  // Create Organizations
  const greenTechSolutions = await prisma.organization.create({
    data: {
      name: 'GreenTech Solutions',
      slug: 'greentech-solutions',
      description: 'Leading provider of solar energy solutions for commercial and residential clients',
      website: 'https://greentechsolutions.com',
      email: 'contact@greentechsolutions.com',
      phone: '+1-555-0123',
      address: {
        street: '123 Solar Drive',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA'
      },
      settings: {
        defaultCurrency: 'USD',
        timezone: 'America/Los_Angeles',
        notifications: {
          projectUpdates: true,
          systemAlerts: true
        }
      }
    }
  });

  const solarDynamics = await prisma.organization.create({
    data: {
      name: 'Solar Dynamics Corp',
      slug: 'solar-dynamics',
      description: 'Innovative BIPV and advanced solar technology specialists',
      website: 'https://solardynamics.com',
      email: 'info@solardynamics.com',
      phone: '+1-555-0456',
      address: {
        street: '456 Innovation Blvd',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        country: 'USA'
      },
      settings: {
        defaultCurrency: 'USD',
        timezone: 'America/Chicago'
      }
    }
  });

  const windPowerEng = await prisma.organization.create({
    data: {
      name: 'WindPower Engineering',
      slug: 'windpower-engineering',
      description: 'Comprehensive wind energy solutions and consulting services',
      website: 'https://windpowereng.com',
      email: 'hello@windpowereng.com',
      phone: '+1-555-0789',
      address: {
        street: '789 Wind Valley Road',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        country: 'USA'
      }
    }
  });

  console.log('Creating users...');

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      email: 'sarah.martinez@greentechsolutions.com',
      username: 'sarah_martinez',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Martinez',
      role: 'PROJECT_MANAGER',
      company: 'GreenTech Solutions',
      jobTitle: 'Senior Project Manager',
      emailVerified: true,
      preferences: {
        dashboardLayout: 'grid',
        defaultView: 'projects',
        notifications: {
          projectUpdates: true,
          systemAlerts: true
        }
      }
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'alex.thompson@solardynamics.com',
      username: 'alex_thompson',
      password: hashedPassword,
      firstName: 'Alex',
      lastName: 'Thompson',
      role: 'ENGINEER',
      company: 'Solar Dynamics Corp',
      jobTitle: 'Lead Solar Engineer',
      emailVerified: true,
      preferences: {
        dashboardLayout: 'list',
        defaultView: 'technologies',
        notifications: {
          projectUpdates: true,
          systemAlerts: false
        }
      }
    }
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'emma.wilson@windpowereng.com',
      username: 'emma_wilson',
      password: hashedPassword,
      firstName: 'Emma',
      lastName: 'Wilson',
      role: 'ADMIN',
      company: 'WindPower Engineering',
      jobTitle: 'Wind Energy Consultant',
      emailVerified: true,
      preferences: {
        dashboardLayout: 'grid',
        defaultView: 'dashboard'
      }
    }
  });

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@solarpro.com',
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      company: 'SolarPro Platform',
      jobTitle: 'System Administrator',
      emailVerified: true
    }
  });

  console.log('Creating organization memberships...');

  // Create Organization Memberships
  await prisma.organizationMember.create({
    data: {
      userId: user1.id,
      organizationId: greenTechSolutions.id,
      role: 'MANAGER'
    }
  });

  await prisma.organizationMember.create({
    data: {
      userId: user2.id,
      organizationId: solarDynamics.id,
      role: 'MEMBER'
    }
  });

  await prisma.organizationMember.create({
    data: {
      userId: user3.id,
      organizationId: windPowerEng.id,
      role: 'OWNER'
    }
  });

  // Add admin to all organizations
  await prisma.organizationMember.create({
    data: {
      userId: adminUser.id,
      organizationId: greenTechSolutions.id,
      role: 'ADMIN'
    }
  });

  console.log('Creating projects...');

  // Create Projects
  const solarProject1 = await prisma.project.create({
    data: {
      name: 'Downtown Office BIPV Installation',
      description: 'Building-integrated photovoltaic system for 50-story office building',
      projectType: 'COMMERCIAL',
      energySource: 'BIPV',
      status: 'CONSTRUCTION',
      priority: 'HIGH',
      ownerId: user1.id,
      organizationId: greenTechSolutions.id,
      location: {
        lat: 37.7749,
        lng: -122.4194,
        address: '123 Market Street, San Francisco, CA',
        country: 'USA',
        region: 'California'
      },
      estimatedCost: 2500000,
      currency: 'USD',
      systemCapacity: 500,
      plannedStartDate: new Date('2024-03-01'),
      plannedEndDate: new Date('2024-09-30'),
      progressPercent: 45,
      specifications: {
        panelType: 'BIPV_CURTAIN_WALL',
        efficiency: 20.5,
        orientation: 'South',
        tilt: 90,
        inverterType: 'String',
        mountingSystem: 'Integrated'
      }
    }
  });

  const windProject1 = await prisma.project.create({
    data: {
      name: 'Mountain Ridge Wind Farm',
      description: 'Onshore wind energy project with 25 turbines',
      projectType: 'UTILITY_SCALE',
      energySource: 'WIND_ONSHORE',
      status: 'PLANNING',
      priority: 'MEDIUM',
      ownerId: user3.id,
      organizationId: windPowerEng.id,
      location: {
        lat: 39.7392,
        lng: -104.9903,
        address: 'Mountain Ridge, Colorado',
        country: 'USA',
        region: 'Colorado'
      },
      estimatedCost: 45000000,
      currency: 'USD',
      systemCapacity: 50000,
      plannedStartDate: new Date('2024-06-01'),
      plannedEndDate: new Date('2025-12-31'),
      specifications: {
        turbineModel: 'Vestas V136-3.45MW',
        hubHeight: 112,
        rotorDiameter: 136,
        numberOfTurbines: 25,
        windSpeed: {
          cut_in: 3.5,
          rated: 13,
          cut_out: 25
        }
      }
    }
  });

  const solarProject2 = await prisma.project.create({
    data: {
      name: 'Residential Solar Array',
      description: 'Rooftop solar installation for residential community',
      projectType: 'RESIDENTIAL',
      energySource: 'SOLAR_PV',
      status: 'OPERATIONAL',
      priority: 'MEDIUM',
      ownerId: user2.id,
      organizationId: solarDynamics.id,
      location: {
        lat: 30.2672,
        lng: -97.7431,
        address: 'Austin, TX',
        country: 'USA',
        region: 'Texas'
      },
      estimatedCost: 150000,
      actualCost: 145000,
      currency: 'USD',
      systemCapacity: 100,
      actualStartDate: new Date('2024-01-15'),
      actualEndDate: new Date('2024-04-30'),
      progressPercent: 100,
      specifications: {
        panelType: 'Monocrystalline',
        efficiency: 22.1,
        orientation: 'South',
        tilt: 30,
        inverterType: 'Power Optimizers',
        batteryStorage: true,
        storageCapacity: 50
      }
    }
  });

  console.log('Seed completed successfully!');
  console.log(`Created:`);
  console.log(`- ${3} organizations`);
  console.log(`- ${4} users`);
  console.log(`- ${4} organization memberships`);
  console.log(`- ${3} projects`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
