-- CreateEnum
CREATE TYPE "public"."HydroType" AS ENUM ('RUN_OF_RIVER', 'STORAGE_DAM', 'PUMPED_STORAGE', 'MICRO_HYDRO', 'SMALL_HYDRO', 'LARGE_HYDRO');

-- CreateEnum
CREATE TYPE "public"."HydroTurbineType" AS ENUM ('PELTON', 'FRANCIS', 'KAPLAN', 'TURGO', 'CROSS_FLOW', 'ARCHIMEDES_SCREW');

-- CreateEnum
CREATE TYPE "public"."FishPassageType" AS ENUM ('FISH_LADDER', 'FISH_ELEVATOR', 'BYPASS_CHANNEL', 'NATURE_LIKE_FISHWAY', 'NONE_REQUIRED');

-- CreateEnum
CREATE TYPE "public"."GeothermalType" AS ENUM ('DRY_STEAM', 'FLASH_STEAM', 'BINARY_CYCLE', 'ENHANCED_GEOTHERMAL', 'GROUND_SOURCE_HEAT_PUMP');

-- CreateEnum
CREATE TYPE "public"."PowerCycleType" AS ENUM ('SINGLE_FLASH', 'DOUBLE_FLASH', 'ORGANIC_RANKINE_CYCLE', 'KALINA_CYCLE', 'DIRECT_STEAM');

-- CreateEnum
CREATE TYPE "public"."BiomassType" AS ENUM ('WOODY_BIOMASS', 'AGRICULTURAL_RESIDUE', 'MUNICIPAL_SOLID_WASTE', 'LANDFILL_GAS', 'ANAEROBIC_DIGESTION', 'ALGAE', 'ENERGY_CROPS');

-- CreateEnum
CREATE TYPE "public"."ConversionTechnology" AS ENUM ('DIRECT_COMBUSTION', 'GASIFICATION', 'PYROLYSIS', 'ANAEROBIC_DIGESTION', 'FERMENTATION', 'TRANSESTERIFICATION');

-- CreateEnum
CREATE TYPE "public"."OceanEnergyType" AS ENUM ('WAVE_ENERGY', 'TIDAL_STREAM', 'TIDAL_RANGE', 'OCEAN_THERMAL', 'SALINITY_GRADIENT', 'OCEAN_CURRENT');

-- CreateEnum
CREATE TYPE "public"."MooringType" AS ENUM ('TENSION_LEG', 'CATENARY', 'SEMI_TAUT', 'DYNAMIC_POSITIONING', 'BOTTOM_FIXED');

-- CreateEnum
CREATE TYPE "public"."DataQuality" AS ENUM ('PRELIMINARY', 'FEASIBILITY_LEVEL', 'BANKABLE', 'CONSTRUCTION_READY');

-- CreateEnum
CREATE TYPE "public"."ResourceGrade" AS ENUM ('POOR', 'FAIR', 'GOOD', 'EXCELLENT');

-- CreateEnum
CREATE TYPE "public"."PermitType" AS ENUM ('ENVIRONMENTAL_PERMIT', 'BUILDING_PERMIT', 'ELECTRICAL_PERMIT', 'GRID_CONNECTION', 'WATER_RIGHTS', 'LAND_USE', 'AVIATION_CLEARANCE', 'MARINE_LICENSE', 'MINING_PERMIT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PermitStatus" AS ENUM ('NOT_REQUIRED', 'PLANNING', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'CONDITIONAL_APPROVAL', 'DENIED', 'EXPIRED', 'RENEWED');

-- CreateEnum
CREATE TYPE "public"."ComplianceStatus" AS ENUM ('COMPLIANT', 'NON_COMPLIANT', 'UNDER_REVIEW', 'REMEDIATION_REQUIRED');

-- CreateEnum
CREATE TYPE "public"."FinancialModelType" AS ENUM ('FEASIBILITY_STUDY', 'INVESTMENT_GRADE', 'FINANCING_PROPOSAL', 'PERFORMANCE_UPDATE');

-- CreateEnum
CREATE TYPE "public"."DataSourceType" AS ENUM ('WEATHER_DATA', 'SOLAR_IRRADIANCE', 'WIND_RESOURCE', 'WATER_FLOW', 'GEOLOGICAL_DATA', 'ENVIRONMENTAL_DATA', 'FINANCIAL_DATA', 'REGULATORY_DATA', 'EQUIPMENT_DATABASE', 'GRID_DATA', 'MARKET_DATA');

-- CreateEnum
CREATE TYPE "public"."UpdateFrequency" AS ENUM ('REAL_TIME', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'ON_DEMAND');

-- CreateEnum
CREATE TYPE "public"."DataFormat" AS ENUM ('JSON', 'XML', 'CSV', 'BINARY', 'NETCDF', 'HDF5', 'GEOTIFF');

-- CreateEnum
CREATE TYPE "public"."HybridIntegrationType" AS ENUM ('AC_COUPLED', 'DC_COUPLED', 'SEPARATE_SYSTEMS', 'INTEGRATED_SYSTEM');

-- CreateEnum
CREATE TYPE "public"."OptimizationGoal" AS ENUM ('MAXIMIZE_GENERATION', 'MINIMIZE_COST', 'MAXIMIZE_REVENUE', 'GRID_STABILITY', 'LOAD_FOLLOWING');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."EnergySource" ADD VALUE 'MICRO_HYDRO';
ALTER TYPE "public"."EnergySource" ADD VALUE 'PUMPED_STORAGE_HYDRO';
ALTER TYPE "public"."EnergySource" ADD VALUE 'ENHANCED_GEOTHERMAL';
ALTER TYPE "public"."EnergySource" ADD VALUE 'BIOGAS';
ALTER TYPE "public"."EnergySource" ADD VALUE 'BIOFUEL';
ALTER TYPE "public"."EnergySource" ADD VALUE 'OCEAN_THERMAL';

-- CreateTable
CREATE TABLE "public"."hydro_systems" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "hydroType" "public"."HydroType" NOT NULL,
    "turbineType" "public"."HydroTurbineType" NOT NULL,
    "turbineCount" INTEGER NOT NULL,
    "totalCapacity" DECIMAL(65,30) NOT NULL,
    "headHeight" DECIMAL(65,30) NOT NULL,
    "designFlow" DECIMAL(65,30) NOT NULL,
    "minimumFlow" DECIMAL(65,30) NOT NULL,
    "maximumFlow" DECIMAL(65,30) NOT NULL,
    "efficiency" DECIMAL(65,30),
    "environmentalFlow" DECIMAL(65,30),
    "fishPassageType" "public"."FishPassageType",
    "sedimentManagement" JSONB,
    "recreationImpact" JSONB,
    "expectedAnnualGeneration" DECIMAL(65,30),
    "actualAnnualGeneration" DECIMAL(65,30),
    "capacityFactor" DECIMAL(65,30),
    "hydrologyData" JSONB,
    "droughtRisk" JSONB,
    "floodRisk" JSONB,
    "systemCost" DECIMAL(65,30),
    "damCost" DECIMAL(65,30),
    "environmentalMitigation" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hydro_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."geothermal_systems" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "geothermalType" "public"."GeothermalType" NOT NULL,
    "powerCycleType" "public"."PowerCycleType" NOT NULL,
    "wellCount" INTEGER NOT NULL,
    "totalCapacity" DECIMAL(65,30) NOT NULL,
    "resourceTemperature" DECIMAL(65,30) NOT NULL,
    "depth" DECIMAL(65,30) NOT NULL,
    "flowRate" DECIMAL(65,30),
    "geologicalData" JSONB,
    "reservoirProperties" JSONB,
    "thermalGradient" DECIMAL(65,30),
    "heatFlow" DECIMAL(65,30),
    "seismicRisk" JSONB,
    "waterRights" JSONB,
    "landSubsidence" JSONB,
    "expectedAnnualGeneration" DECIMAL(65,30),
    "actualAnnualGeneration" DECIMAL(65,30),
    "capacityFactor" DECIMAL(65,30),
    "plantEfficiency" DECIMAL(65,30),
    "isEnhancedSystem" BOOLEAN NOT NULL DEFAULT false,
    "stimulationData" JSONB,
    "systemCost" DECIMAL(65,30),
    "drillingCost" DECIMAL(65,30),
    "explorationCost" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "geothermal_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."biomass_systems" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "biomassType" "public"."BiomassType" NOT NULL,
    "conversionTechnology" "public"."ConversionTechnology" NOT NULL,
    "feedstockType" JSONB NOT NULL,
    "totalCapacity" DECIMAL(65,30) NOT NULL,
    "feedstockConsumption" DECIMAL(65,30) NOT NULL,
    "efficiency" DECIMAL(65,30),
    "heatRate" DECIMAL(65,30),
    "feedstockSources" JSONB,
    "transportDistance" DECIMAL(65,30),
    "seasonalAvailability" JSONB,
    "moistureContent" DECIMAL(65,30),
    "heatingValue" DECIMAL(65,30),
    "sustainabilityCert" JSONB,
    "carbonIntensity" DECIMAL(65,30),
    "lifecycleAssessment" JSONB,
    "airEmissions" JSONB,
    "ashProduction" DECIMAL(65,30),
    "wasteWaterTreatment" JSONB,
    "expectedAnnualGeneration" DECIMAL(65,30),
    "actualAnnualGeneration" DECIMAL(65,30),
    "capacityFactor" DECIMAL(65,30),
    "systemCost" DECIMAL(65,30),
    "feedstockCost" DECIMAL(65,30),
    "transportationCost" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biomass_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ocean_energy_systems" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "oceanEnergyType" "public"."OceanEnergyType" NOT NULL,
    "deviceType" TEXT NOT NULL,
    "deviceCount" INTEGER NOT NULL,
    "totalCapacity" DECIMAL(65,30) NOT NULL,
    "deviceCapacity" DECIMAL(65,30) NOT NULL,
    "operatingDepth" DECIMAL(65,30),
    "mooringType" "public"."MooringType",
    "waveHeight" JSONB,
    "wavePeriod" JSONB,
    "tidalRange" DECIMAL(65,30),
    "currentSpeed" JSONB,
    "waterDepth" DECIMAL(65,30) NOT NULL,
    "marineEnvironment" JSONB,
    "fisheriesImpact" JSONB,
    "shippingRoutes" JSONB,
    "corrosionProtection" JSONB,
    "installationMethod" JSONB,
    "maintenanceAccess" JSONB,
    "cableRouting" JSONB,
    "expectedAnnualGeneration" DECIMAL(65,30),
    "actualAnnualGeneration" DECIMAL(65,30),
    "capacityFactor" DECIMAL(65,30),
    "availability" DECIMAL(65,30),
    "systemCost" DECIMAL(65,30),
    "marineInstallation" DECIMAL(65,30),
    "submarineCabling" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ocean_energy_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_assessments" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "resourceType" "public"."EnergySource" NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL,
    "assessmentPeriod" INTEGER NOT NULL,
    "dataQuality" "public"."DataQuality" NOT NULL,
    "confidence" DECIMAL(65,30) NOT NULL,
    "meteorologicalData" JSONB,
    "topographicalData" JSONB,
    "environmentalData" JSONB,
    "resourceIntensity" DECIMAL(65,30),
    "variabilityIndex" DECIMAL(65,30),
    "seasonalPattern" JSONB,
    "interannualVariation" DECIMAL(65,30),
    "technologyData" JSONB,
    "resourceGrade" "public"."ResourceGrade" NOT NULL,
    "energyYieldEstimate" DECIMAL(65,30),
    "uncertaintyRange" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."regulatory_compliance" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state_province" TEXT,
    "locality" TEXT,
    "jurisdiction" TEXT NOT NULL,
    "permitType" "public"."PermitType" NOT NULL,
    "permitNumber" TEXT,
    "applicationDate" TIMESTAMP(3),
    "approvalDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "renewalDate" TIMESTAMP(3),
    "permitStatus" "public"."PermitStatus" NOT NULL,
    "regulatoryFramework" JSONB,
    "complianceRequirements" JSONB,
    "environmentalRequirements" JSONB,
    "technologyRegulations" JSONB,
    "gridConnectionRequirements" JSONB,
    "complianceStatus" "public"."ComplianceStatus" NOT NULL,
    "lastAuditDate" TIMESTAMP(3),
    "nextAuditDate" TIMESTAMP(3),
    "complianceNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regulatory_compliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."financial_models" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "modelType" "public"."FinancialModelType" NOT NULL,
    "baseCurrency" TEXT NOT NULL DEFAULT 'USD',
    "projectLifespan" INTEGER NOT NULL,
    "discountRate" DECIMAL(65,30) NOT NULL,
    "inflationRate" DECIMAL(65,30),
    "equipmentCost" DECIMAL(65,30),
    "installationCost" DECIMAL(65,30),
    "developmentCost" DECIMAL(65,30),
    "contingency" DECIMAL(65,30),
    "totalCapex" DECIMAL(65,30),
    "annualOMCost" DECIMAL(65,30),
    "fuelCost" DECIMAL(65,30),
    "insuranceCost" DECIMAL(65,30),
    "landLeaseCost" DECIMAL(65,30),
    "totalOpex" DECIMAL(65,30),
    "electricityRevenue" JSONB,
    "incentiveRevenue" JSONB,
    "carbonCredits" JSONB,
    "ancillaryServices" JSONB,
    "lcoe" DECIMAL(65,30),
    "npv" DECIMAL(65,30),
    "irr" DECIMAL(65,30),
    "paybackPeriod" DECIMAL(65,30),
    "profitabilityIndex" DECIMAL(65,30),
    "technologyCosts" JSONB,
    "debtEquityRatio" DECIMAL(65,30),
    "debtInterestRate" DECIMAL(65,30),
    "loanTerm" INTEGER,
    "sensitivityAnalysis" JSONB,
    "scenarioAnalysis" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."external_data_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dataSourceType" "public"."DataSourceType" NOT NULL,
    "apiEndpoint" TEXT,
    "authType" "public"."AuthType" NOT NULL,
    "authConfig" JSONB,
    "dataTypes" JSONB,
    "updateFrequency" "public"."UpdateFrequency" NOT NULL,
    "dataFormat" "public"."DataFormat" NOT NULL,
    "geographicCoverage" JSONB,
    "dataQualityRating" INTEGER,
    "reliabilityScore" DECIMAL(65,30),
    "lastSuccessfulSync" TIMESTAMP(3),
    "totalApiCalls" INTEGER NOT NULL DEFAULT 0,
    "monthlyApiLimit" INTEGER,
    "costPerApiCall" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_data_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hybrid_systems" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "primaryTechnology" "public"."EnergySource" NOT NULL,
    "secondaryTechnology" "public"."EnergySource",
    "additionalTechnologies" JSONB,
    "integrationApproach" "public"."HybridIntegrationType" NOT NULL,
    "sharedInfrastructure" JSONB,
    "controlStrategy" JSONB,
    "optimizationGoal" "public"."OptimizationGoal" NOT NULL,
    "loadBalancing" JSONB,
    "storageIntegration" JSONB,
    "synergyFactors" JSONB,
    "resourceComplementarity" DECIMAL(65,30),
    "costSynergies" DECIMAL(65,30),
    "revenueOptimization" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hybrid_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ProjectDataSources" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectDataSources_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProjectDataSources_B_index" ON "public"."_ProjectDataSources"("B");

-- AddForeignKey
ALTER TABLE "public"."hydro_systems" ADD CONSTRAINT "hydro_systems_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."geothermal_systems" ADD CONSTRAINT "geothermal_systems_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."biomass_systems" ADD CONSTRAINT "biomass_systems_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ocean_energy_systems" ADD CONSTRAINT "ocean_energy_systems_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_assessments" ADD CONSTRAINT "resource_assessments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."regulatory_compliance" ADD CONSTRAINT "regulatory_compliance_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."financial_models" ADD CONSTRAINT "financial_models_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hybrid_systems" ADD CONSTRAINT "hybrid_systems_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProjectDataSources" ADD CONSTRAINT "_ProjectDataSources_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."external_data_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProjectDataSources" ADD CONSTRAINT "_ProjectDataSources_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
