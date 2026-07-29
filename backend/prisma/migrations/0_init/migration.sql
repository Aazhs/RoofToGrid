-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('HOMEOWNER', 'INSTALLER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('INDEPENDENT_HOUSE', 'ROW_HOUSE', 'APARTMENT', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('MANUAL', 'OCR', 'INVERTER_API');

-- CreateEnum
CREATE TYPE "RoofType" AS ENUM ('FLAT', 'SLOPED', 'MIXED');

-- CreateEnum
CREATE TYPE "Orientation" AS ENUM ('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW');

-- CreateEnum
CREATE TYPE "ShadingLevel" AS ENUM ('NONE', 'LIGHT', 'MODERATE', 'HEAVY');

-- CreateEnum
CREATE TYPE "Suitability" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'UNSUITABLE');

-- CreateEnum
CREATE TYPE "ScenarioKey" AS ENUM ('CONSERVATIVE', 'OPTIMAL', 'MAX_ROOF');

-- CreateEnum
CREATE TYPE "PanelTechnology" AS ENUM ('MONO_PERC', 'TOPCON', 'HJT', 'N_TYPE', 'POLY', 'THIN_FILM', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "InverterType" AS ENUM ('STRING', 'MICRO', 'HYBRID', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "EquipmentTier" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "FinancingType" AS ENUM ('CASH', 'LOAN', 'LEASE_PPA');

-- CreateEnum
CREATE TYPE "GenerationSource" AS ENUM ('INSTALLER', 'PLATFORM');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'IN_PROGRESS', 'COMMISSIONED', 'ON_HOLD', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MilestoneKey" AS ENUM ('INQUIRY', 'SITE_SURVEY', 'DESIGN_CONFIRMED', 'DISCOM_APPLICATION_SUBMITTED', 'DISCOM_APPROVED', 'INSTALLATION_SCHEDULED', 'INSTALLATION_COMPLETE', 'NET_METERING_ACTIVE', 'SUBSIDY_RECEIVED');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('BILL', 'QUOTE', 'CONTRACT', 'DESIGN_DRAWING', 'DISCOM_APPROVAL', 'NET_METERING', 'SUBSIDY', 'WARRANTY', 'INVOICE', 'PHOTO', 'OTHER');

-- CreateEnum
CREATE TYPE "WarrantyComponent" AS ENUM ('PANEL', 'INVERTER', 'STRUCTURE', 'WORKMANSHIP', 'BATTERY', 'OTHER');

-- CreateEnum
CREATE TYPE "ServiceSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'HOMEOWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "discomName" TEXT,
    "consumerNumber" TEXT,
    "phone" TEXT,
    "propertyType" "PropertyType",
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "region" TEXT NOT NULL DEFAULT 'IN',
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "onboardingCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedByTokenHash" TEXT,
    "userAgent" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "electricity_bill_summaries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "billMonth" TEXT NOT NULL,
    "unitsKwh" DOUBLE PRECISION NOT NULL,
    "billAmount" DOUBLE PRECISION,
    "tariffPerKwh" DOUBLE PRECISION NOT NULL,
    "sanctionedLoadKw" DOUBLE PRECISION,
    "connectionType" TEXT,
    "documentId" TEXT,
    "source" "DataSource" NOT NULL DEFAULT 'MANUAL',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "electricity_bill_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roof_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'My roof',
    "roofType" "RoofType" NOT NULL,
    "usableAreaSqft" DOUBLE PRECISION NOT NULL,
    "orientation" "Orientation" NOT NULL DEFAULT 'S',
    "tiltDegrees" DOUBLE PRECISION,
    "shadingLevel" "ShadingLevel" NOT NULL DEFAULT 'NONE',
    "structureType" TEXT,
    "notes" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roof_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sizing_runs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "roofProfileId" TEXT,
    "avgMonthlyUnits" DOUBLE PRECISION NOT NULL,
    "tariffPerKwh" DOUBLE PRECISION NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'IN',
    "assumptionSetId" TEXT NOT NULL,
    "yieldEngine" TEXT NOT NULL DEFAULT 'rule-based',
    "suitability" "Suitability" NOT NULL,
    "suitabilityReasons" TEXT[],
    "roofCapacityKwp" DOUBLE PRECISION NOT NULL,
    "assumptions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sizing_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sizing_scenarios" (
    "id" TEXT NOT NULL,
    "sizingRunId" TEXT NOT NULL,
    "key" "ScenarioKey" NOT NULL,
    "label" TEXT NOT NULL,
    "systemSizeKwp" DOUBLE PRECISION NOT NULL,
    "annualGenerationKwh" INTEGER NOT NULL,
    "estimatedCost" DOUBLE PRECISION NOT NULL,
    "subsidyAmount" DOUBLE PRECISION NOT NULL,
    "netCost" DOUBLE PRECISION NOT NULL,
    "annualSavings" DOUBLE PRECISION NOT NULL,
    "paybackYears" DOUBLE PRECISION,
    "lifetimeSavings25y" DOUBLE PRECISION NOT NULL,
    "co2OffsetTonnesPerYear" DOUBLE PRECISION NOT NULL,
    "roofAreaRequiredSqft" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sizing_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "installerName" TEXT NOT NULL,
    "installerId" TEXT,
    "systemSizeKwp" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "panelBrand" TEXT,
    "panelTechnology" "PanelTechnology" NOT NULL DEFAULT 'UNKNOWN',
    "panelWattage" INTEGER,
    "panelProductWarrantyYears" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "panelPerformanceWarrantyYears" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "inverterBrand" TEXT,
    "inverterType" "InverterType" NOT NULL DEFAULT 'UNKNOWN',
    "inverterWarrantyYears" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "workmanshipWarrantyYears" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "includesNetMetering" BOOLEAN NOT NULL DEFAULT false,
    "includesStructure" BOOLEAN NOT NULL DEFAULT false,
    "includesAmcYears" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectedAnnualGenerationKwh" INTEGER,
    "financingType" "FinancingType" NOT NULL DEFAULT 'CASH',
    "interestRatePct" DOUBLE PRECISION,
    "tenureMonths" INTEGER,
    "downPayment" DOUBLE PRECISION,
    "pricePerKwp" DOUBLE PRECISION NOT NULL,
    "equipmentTier" "EquipmentTier" NOT NULL,
    "valueScore" DOUBLE PRECISION NOT NULL,
    "scoreBreakdown" JSONB NOT NULL,
    "redFlags" TEXT[],
    "financedTotalCost" DOUBLE PRECISION NOT NULL,
    "estimatedAnnualSavings" DOUBLE PRECISION NOT NULL,
    "paybackYears" DOUBLE PRECISION,
    "generationSource" "GenerationSource" NOT NULL DEFAULT 'PLATFORM',
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "quoteDocumentId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceQuoteId" TEXT,
    "installerName" TEXT NOT NULL,
    "systemSizeKwp" DOUBLE PRECISION NOT NULL,
    "contractValue" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "name" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "expectedAnnualGenerationKwh" INTEGER,
    "baselineMonthlyUnits" DOUBLE PRECISION,
    "baselineTariffPerKwh" DOUBLE PRECISION,
    "commissionedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "key" "MilestoneKey" NOT NULL,
    "title" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "plannedDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "notes" TEXT,
    "ownerHint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL DEFAULT 'OTHER',
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageDriver" TEXT NOT NULL DEFAULT 'local',
    "projectId" TEXT,
    "milestoneId" TEXT,
    "quoteId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generation_logs" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "generatedKwh" DOUBLE PRECISION NOT NULL,
    "billAmount" DOUBLE PRECISION,
    "unitsImportedKwh" DOUBLE PRECISION,
    "unitsExportedKwh" DOUBLE PRECISION,
    "notes" TEXT,
    "source" "DataSource" NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warranties" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "component" "WarrantyComponent" NOT NULL,
    "brand" TEXT,
    "serialNumber" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "durationYears" DOUBLE PRECISION NOT NULL,
    "documentId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warranties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_requests" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "ServiceSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "ServiceStatus" NOT NULL DEFAULT 'OPEN',
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_familyId_idx" ON "refresh_tokens"("familyId");

-- CreateIndex
CREATE INDEX "electricity_bill_summaries_userId_idx" ON "electricity_bill_summaries"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "electricity_bill_summaries_userId_billMonth_key" ON "electricity_bill_summaries"("userId", "billMonth");

-- CreateIndex
CREATE INDEX "roof_profiles_userId_idx" ON "roof_profiles"("userId");

-- CreateIndex
CREATE INDEX "sizing_runs_userId_idx" ON "sizing_runs"("userId");

-- CreateIndex
CREATE INDEX "sizing_scenarios_sizingRunId_idx" ON "sizing_scenarios"("sizingRunId");

-- CreateIndex
CREATE INDEX "quotes_userId_idx" ON "quotes"("userId");

-- CreateIndex
CREATE INDEX "projects_userId_idx" ON "projects"("userId");

-- CreateIndex
CREATE INDEX "milestones_projectId_sequence_idx" ON "milestones"("projectId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "milestones_projectId_key_key" ON "milestones"("projectId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "documents_storageKey_key" ON "documents"("storageKey");

-- CreateIndex
CREATE INDEX "documents_userId_idx" ON "documents"("userId");

-- CreateIndex
CREATE INDEX "documents_projectId_idx" ON "documents"("projectId");

-- CreateIndex
CREATE INDEX "documents_milestoneId_idx" ON "documents"("milestoneId");

-- CreateIndex
CREATE INDEX "documents_quoteId_idx" ON "documents"("quoteId");

-- CreateIndex
CREATE INDEX "generation_logs_projectId_idx" ON "generation_logs"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "generation_logs_projectId_month_key" ON "generation_logs"("projectId", "month");

-- CreateIndex
CREATE INDEX "warranties_projectId_idx" ON "warranties"("projectId");

-- CreateIndex
CREATE INDEX "service_requests_projectId_idx" ON "service_requests"("projectId");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "electricity_bill_summaries" ADD CONSTRAINT "electricity_bill_summaries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roof_profiles" ADD CONSTRAINT "roof_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sizing_runs" ADD CONSTRAINT "sizing_runs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sizing_runs" ADD CONSTRAINT "sizing_runs_roofProfileId_fkey" FOREIGN KEY ("roofProfileId") REFERENCES "roof_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sizing_scenarios" ADD CONSTRAINT "sizing_scenarios_sizingRunId_fkey" FOREIGN KEY ("sizingRunId") REFERENCES "sizing_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_sourceQuoteId_fkey" FOREIGN KEY ("sourceQuoteId") REFERENCES "quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "milestones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_logs" ADD CONSTRAINT "generation_logs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

