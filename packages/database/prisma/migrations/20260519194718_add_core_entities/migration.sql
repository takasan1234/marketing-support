-- CreateEnum
CREATE TYPE "FrameworkType" AS ENUM ('PEST', 'FIVE_FORCES', 'INTERNAL_ANALYSIS', 'VRIO', 'THREE_C_PLUS_C', 'SWOT', 'CROSS_SWOT', 'SEGMENTATION', 'TARGETING', 'POSITIONING', 'CONCEPT_SHEET', 'PRODUCT_4P', 'PRICE_4P', 'PLACE_4P', 'PROMOTION_4P', 'FOUR_C_SEVEN_P', 'BLUE_OCEAN', 'EXPERIENCE_VALUE', 'VALUE_ADD_METHODS', 'KGI_KSF_KPI', 'CUSTOMER_JOURNEY', 'CRM_OVERVIEW', 'CRM_ANALYSIS');

-- CreateEnum
CREATE TYPE "RawDataType" AS ENUM ('MARKET_STATS', 'INDUSTRY_REPORT', 'NEWS', 'CUSTOMER_RESEARCH', 'SNS_ANALYTICS', 'SEARCH_TRENDS', 'LOCATION_DATA', 'SALES_DATA', 'COMPETITOR_INFO', 'PARTNER_HEARING', 'FINANCIAL_DATA', 'EXPERT_HEARING');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrameworkEntry" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "frameworkType" "FrameworkType" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "data" JSONB NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FrameworkEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawData" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "RawDataType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "sourceNote" TEXT,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrameworkRawDataLink" (
    "id" TEXT NOT NULL,
    "frameworkEntryId" TEXT NOT NULL,
    "rawDataId" TEXT NOT NULL,
    "subElementId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FrameworkRawDataLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FrameworkEntry_projectId_frameworkType_isLatest_idx" ON "FrameworkEntry"("projectId", "frameworkType", "isLatest");

-- CreateIndex
CREATE UNIQUE INDEX "FrameworkEntry_projectId_frameworkType_version_key" ON "FrameworkEntry"("projectId", "frameworkType", "version");

-- CreateIndex
CREATE INDEX "RawData_projectId_type_idx" ON "RawData"("projectId", "type");

-- CreateIndex
CREATE INDEX "RawData_projectId_expiresAt_idx" ON "RawData"("projectId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "FrameworkRawDataLink_frameworkEntryId_rawDataId_subElementI_key" ON "FrameworkRawDataLink"("frameworkEntryId", "rawDataId", "subElementId");

-- AddForeignKey
ALTER TABLE "FrameworkEntry" ADD CONSTRAINT "FrameworkEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawData" ADD CONSTRAINT "RawData_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrameworkRawDataLink" ADD CONSTRAINT "FrameworkRawDataLink_frameworkEntryId_fkey" FOREIGN KEY ("frameworkEntryId") REFERENCES "FrameworkEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrameworkRawDataLink" ADD CONSTRAINT "FrameworkRawDataLink_rawDataId_fkey" FOREIGN KEY ("rawDataId") REFERENCES "RawData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
