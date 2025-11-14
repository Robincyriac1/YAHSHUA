-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER', 'ENGINEER', 'TECHNICIAN', 'USER', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."OrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."ProjectType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'UTILITY_SCALE', 'COMMUNITY', 'RESEARCH');

-- CreateEnum
CREATE TYPE "public"."EnergySource" AS ENUM ('SOLAR_PV', 'SOLAR_THERMAL', 'BIPV', 'WIND_ONSHORE', 'WIND_OFFSHORE', 'HYDROELECTRIC', 'GEOTHERMAL', 'BIOMASS', 'OCEAN_WAVE', 'OCEAN_TIDAL', 'HYBRID');

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('PLANNING', 'DESIGN', 'PERMITTING', 'FINANCING', 'PROCUREMENT', 'CONSTRUCTION', 'COMMISSIONING', 'OPERATIONAL', 'MAINTENANCE', 'DECOMMISSIONING', 'COMPLETED', 'CANCELLED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "public"."ProjectPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."SolarSystemType" AS ENUM ('GRID_TIED', 'OFF_GRID', 'HYBRID', 'GRID_TIED_WITH_BATTERY');

-- CreateEnum
CREATE TYPE "public"."SolarInstallationType" AS ENUM ('ROOFTOP', 'GROUND_MOUNT', 'CARPORT', 'CANOPY', 'FLOATING', 'AGRIVOLTAICS', 'BIPV');

-- CreateEnum
CREATE TYPE "public"."SolarModuleType" AS ENUM ('MONOCRYSTALLINE', 'POLYCRYSTALLINE', 'THIN_FILM', 'PEROVSKITE', 'ORGANIC', 'BIFACIAL');

-- CreateEnum
CREATE TYPE "public"."SolarInverterType" AS ENUM ('STRING', 'POWER_OPTIMIZER', 'MICROINVERTER', 'CENTRAL');

-- CreateEnum
CREATE TYPE "public"."BipvApplication" AS ENUM ('FACADES', 'ROOFING', 'WINDOWS', 'SKYLIGHTS', 'SHADING_SYSTEMS', 'CURTAIN_WALLS', 'BALCONY_RAILINGS');

-- CreateEnum
CREATE TYPE "public"."WindSystemType" AS ENUM ('ONSHORE', 'OFFSHORE', 'DISTRIBUTED', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "public"."WindTurbineType" AS ENUM ('HORIZONTAL_AXIS', 'VERTICAL_AXIS', 'HYBRID');

-- CreateEnum
CREATE TYPE "public"."StorageType" AS ENUM ('BATTERY', 'PUMPED_HYDRO', 'COMPRESSED_AIR', 'FLYWHEEL', 'THERMAL', 'HYDROGEN');

-- CreateEnum
CREATE TYPE "public"."BatteryChemistry" AS ENUM ('LITHIUM_ION', 'LITHIUM_IRON_PHOSPHATE', 'NICKEL_METAL_HYDRIDE', 'LEAD_ACID', 'SODIUM_ION', 'SOLID_STATE', 'FLOW_BATTERY');

-- CreateEnum
CREATE TYPE "public"."MonitoringType" AS ENUM ('PRODUCTION_MONITORING', 'ENVIRONMENTAL_MONITORING', 'PERFORMANCE_MONITORING', 'SECURITY_MONITORING', 'COMPREHENSIVE');

-- CreateEnum
CREATE TYPE "public"."AlertType" AS ENUM ('PERFORMANCE_DEGRADATION', 'EQUIPMENT_FAILURE', 'COMMUNICATION_LOSS', 'ENVIRONMENTAL_HAZARD', 'SECURITY_BREACH', 'MAINTENANCE_REQUIRED', 'THRESHOLD_EXCEEDED');

-- CreateEnum
CREATE TYPE "public"."AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."AlertStatus" AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "public"."MaintenanceType" AS ENUM ('PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE', 'EMERGENCY', 'INSPECTION', 'CALIBRATION', 'CLEANING', 'REPLACEMENT');

-- CreateEnum
CREATE TYPE "public"."MaintenancePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DEFERRED');

-- CreateEnum
CREATE TYPE "public"."CalculationType" AS ENUM ('ENERGY_YIELD', 'FINANCIAL_ANALYSIS', 'CARBON_FOOTPRINT', 'SHADING_ANALYSIS', 'WIND_RESOURCE', 'SITE_ASSESSMENT', 'PAYBACK_ANALYSIS', 'LIFECYCLE_ANALYSIS', 'PERFORMANCE_RATIO', 'CAPACITY_FACTOR');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('CONTRACT', 'PERMIT', 'DRAWING', 'SPECIFICATION', 'REPORT', 'CERTIFICATE', 'INVOICE', 'PHOTO', 'VIDEO', 'MANUAL', 'DATASHEET', 'CALCULATION', 'PRESENTATION', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AccessLevel" AS ENUM ('PUBLIC', 'ORGANIZATION', 'PROJECT_TEAM', 'PRIVATE');

-- CreateEnum
CREATE TYPE "public"."PartnerType" AS ENUM ('WEATHER_DATA', 'SOLAR_IRRADIANCE', 'WIND_RESOURCE', 'EQUIPMENT_SUPPLIER', 'FINANCIAL_ANALYSIS', 'REGULATORY_DATA', 'MAPPING_SERVICE', 'MONITORING_SYSTEM', 'AI_ML_SERVICE', 'UTILITY_PROVIDER');

-- CreateEnum
CREATE TYPE "public"."AuthType" AS ENUM ('API_KEY', 'OAUTH2', 'BASIC_AUTH', 'TOKEN_BASED', 'CERTIFICATE');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('SYSTEM', 'PROJECT_UPDATE', 'ALERT', 'MAINTENANCE', 'FINANCIAL', 'WEATHER', 'PERFORMANCE', 'SECURITY');

-- CreateEnum
CREATE TYPE "public"."NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "passwordHash" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpiry" TIMESTAMP(3),
    "company" TEXT,
    "jobTitle" TEXT,
    "phone" TEXT,
    "timezone" TEXT,
    "preferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" JSONB,
    "settings" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organization_members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "public"."OrganizationRole" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "projectType" "public"."ProjectType" NOT NULL,
    "energySource" "public"."EnergySource" NOT NULL,
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "priority" "public"."ProjectPriority" NOT NULL DEFAULT 'MEDIUM',
    "location" JSONB NOT NULL,
    "siteData" JSONB,
    "estimatedCost" DECIMAL(65,30),
    "actualCost" DECIMAL(65,30),
    "estimatedSavings" DECIMAL(65,30),
    "actualSavings" DECIMAL(65,30),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "plannedStartDate" TIMESTAMP(3),
    "actualStartDate" TIMESTAMP(3),
    "plannedEndDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "systemCapacity" DECIMAL(65,30),
    "specifications" JSONB,
    "equipment" JSONB,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "milestones" JSONB,
    "ownerId" TEXT NOT NULL,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."solar_systems" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "systemType" "public"."SolarSystemType" NOT NULL,
    "installationType" "public"."SolarInstallationType" NOT NULL,
    "moduleType" "public"."SolarModuleType" NOT NULL,
    "inverterType" "public"."SolarInverterType" NOT NULL,
    "totalCapacity" DECIMAL(65,30) NOT NULL,
    "moduleCount" INTEGER NOT NULL,
    "moduleWattage" DECIMAL(65,30) NOT NULL,
    "moduleEfficiency" DECIMAL(65,30),
    "bipvApplication" "public"."BipvApplication",
    "buildingIntegration" JSONB,
    "architecturalSpecs" JSONB,
    "expectedAnnualGeneration" DECIMAL(65,30),
    "actualAnnualGeneration" DECIMAL(65,30),
    "performanceRatio" DECIMAL(65,30),
    "irradianceData" JSONB,
    "weatherData" JSONB,
    "shadingAnalysis" JSONB,
    "systemCost" DECIMAL(65,30),
    "incentives" JSONB,
    "paybackPeriod" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solar_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wind_systems" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "systemType" "public"."WindSystemType" NOT NULL,
    "turbineType" "public"."WindTurbineType" NOT NULL,
    "turbineCount" INTEGER NOT NULL,
    "totalCapacity" DECIMAL(65,30) NOT NULL,
    "turbineCapacity" DECIMAL(65,30) NOT NULL,
    "hubHeight" DECIMAL(65,30) NOT NULL,
    "rotorDiameter" DECIMAL(65,30) NOT NULL,
    "cutInSpeed" DECIMAL(65,30) NOT NULL,
    "cutOutSpeed" DECIMAL(65,30) NOT NULL,
    "ratedWindSpeed" DECIMAL(65,30) NOT NULL,
    "expectedAnnualGeneration" DECIMAL(65,30),
    "actualAnnualGeneration" DECIMAL(65,30),
    "capacityFactor" DECIMAL(65,30),
    "windResourceData" JSONB,
    "turbulenceData" JSONB,
    "noiseAssessment" JSONB,
    "systemCost" DECIMAL(65,30),
    "landLeaseCost" DECIMAL(65,30),
    "maintenanceCost" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wind_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."energy_storage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "storageType" "public"."StorageType" NOT NULL,
    "batteryChemistry" "public"."BatteryChemistry",
    "totalCapacity" DECIMAL(65,30) NOT NULL,
    "power" DECIMAL(65,30) NOT NULL,
    "efficiency" DECIMAL(65,30),
    "cycleLife" INTEGER,
    "depthOfDischarge" DECIMAL(65,30),
    "actualEfficiency" DECIMAL(65,30),
    "cyclesCompleted" INTEGER,
    "healthStatus" DECIMAL(65,30),
    "safetyFeatures" JSONB,
    "temperatureRange" JSONB,
    "coolingSystem" TEXT,
    "systemCost" DECIMAL(65,30),
    "replacementCost" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "energy_storage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."monitoring_systems" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "systemType" "public"."MonitoringType" NOT NULL,
    "dataLogger" TEXT,
    "sensors" JSONB,
    "communicationProtocol" TEXT,
    "dataInterval" INTEGER NOT NULL,
    "dataRetention" INTEGER NOT NULL,
    "alertThresholds" JSONB,
    "systemUptime" DECIMAL(65,30),
    "dataAccuracy" DECIMAL(65,30),
    "lastDataUpdate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monitoring_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."energy_data" (
    "id" TEXT NOT NULL,
    "monitoringSystemId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "powerGeneration" DECIMAL(65,30),
    "energyProduced" DECIMAL(65,30),
    "voltage" DECIMAL(65,30),
    "current" DECIMAL(65,30),
    "frequency" DECIMAL(65,30),
    "powerFactor" DECIMAL(65,30),
    "temperature" DECIMAL(65,30),
    "humidity" DECIMAL(65,30),
    "windSpeed" DECIMAL(65,30),
    "windDirection" DECIMAL(65,30),
    "solarIrradiance" DECIMAL(65,30),
    "efficiency" DECIMAL(65,30),
    "availability" DECIMAL(65,30),
    "performanceRatio" DECIMAL(65,30),

    CONSTRAINT "energy_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_alerts" (
    "id" TEXT NOT NULL,
    "monitoringSystemId" TEXT NOT NULL,
    "alertType" "public"."AlertType" NOT NULL,
    "severity" "public"."AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "alertData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."maintenance_records" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "maintenanceType" "public"."MaintenanceType" NOT NULL,
    "priority" "public"."MaintenancePriority" NOT NULL,
    "status" "public"."MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "estimatedDuration" INTEGER,
    "actualDuration" INTEGER,
    "assignedTo" TEXT,
    "performedBy" TEXT,
    "estimatedCost" DECIMAL(65,30),
    "actualCost" DECIMAL(65,30),
    "partsCost" DECIMAL(65,30),
    "laborCost" DECIMAL(65,30),
    "partsUsed" JSONB,
    "materialsUsed" JSONB,
    "workPerformed" TEXT,
    "issues" JSONB,
    "recommendations" TEXT,
    "nextMaintenanceDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."calculations" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "calculationType" "public"."CalculationType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "inputParameters" JSONB NOT NULL,
    "assumptions" JSONB,
    "results" JSONB NOT NULL,
    "summary" TEXT,
    "calculationEngine" TEXT,
    "version" TEXT,
    "confidence" DECIMAL(65,30),
    "isValidated" BOOLEAN NOT NULL DEFAULT false,
    "validatedBy" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_documents" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "documentType" "public"."DocumentType" NOT NULL,
    "category" TEXT,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileHash" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isLatestVersion" BOOLEAN NOT NULL DEFAULT true,
    "parentDocumentId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "accessLevel" "public"."AccessLevel" NOT NULL DEFAULT 'PRIVATE',
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."partner_integrations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "partnerType" "public"."PartnerType" NOT NULL,
    "apiEndpoint" TEXT,
    "configuration" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rateLimitPerHour" INTEGER,
    "authType" "public"."AuthType" NOT NULL,
    "authConfig" JSONB,
    "totalRequests" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."api_keys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "integrationId" TEXT,
    "permissions" JSONB NOT NULL,
    "rateLimitPerHour" INTEGER NOT NULL DEFAULT 1000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "lastUsed" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "notificationType" "public"."NotificationType" NOT NULL,
    "priority" "public"."NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "actionUrl" TEXT,
    "actionText" TEXT,
    "relatedEntityType" TEXT,
    "relatedEntityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "public"."organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_userId_organizationId_key" ON "public"."organization_members"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "energy_data_timestamp_idx" ON "public"."energy_data"("timestamp");

-- CreateIndex
CREATE INDEX "energy_data_monitoringSystemId_timestamp_idx" ON "public"."energy_data"("monitoringSystemId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_keyHash_key" ON "public"."api_keys"("keyHash");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "public"."system_config"("key");

-- AddForeignKey
ALTER TABLE "public"."organization_members" ADD CONSTRAINT "organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_members" ADD CONSTRAINT "organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solar_systems" ADD CONSTRAINT "solar_systems_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wind_systems" ADD CONSTRAINT "wind_systems_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."energy_storage" ADD CONSTRAINT "energy_storage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monitoring_systems" ADD CONSTRAINT "monitoring_systems_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."energy_data" ADD CONSTRAINT "energy_data_monitoringSystemId_fkey" FOREIGN KEY ("monitoringSystemId") REFERENCES "public"."monitoring_systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."system_alerts" ADD CONSTRAINT "system_alerts_monitoringSystemId_fkey" FOREIGN KEY ("monitoringSystemId") REFERENCES "public"."monitoring_systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."maintenance_records" ADD CONSTRAINT "maintenance_records_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."calculations" ADD CONSTRAINT "calculations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_documents" ADD CONSTRAINT "project_documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_documents" ADD CONSTRAINT "project_documents_parentDocumentId_fkey" FOREIGN KEY ("parentDocumentId") REFERENCES "public"."project_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."api_keys" ADD CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."api_keys" ADD CONSTRAINT "api_keys_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "public"."partner_integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
