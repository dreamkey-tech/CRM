-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "BrokerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('FLAT', 'LAND', 'WAREHOUSE', 'COMMERCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "PropertyPricingType" AS ENUM ('SALE', 'RENT');

-- CreateEnum
CREATE TYPE "PropertyListingStatus" AS ENUM ('AVAILABLE', 'UNDER_NEGOTIATION', 'TOKEN_PAID', 'DEAL_DONE', 'RENTED_OUT', 'SOLD', 'UPCOMING');

-- CreateEnum
CREATE TYPE "PropertyAccessType" AS ENUM ('DIRECT', 'BROKER');

-- CreateEnum
CREATE TYPE "PropertyMediaCategory" AS ENUM ('PHOTOGRAPH', 'VIDEO', 'FLOOR_PLAN', 'BROCHURE', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "website_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT,
    "authProvider" TEXT NOT NULL DEFAULT 'EMAIL',
    "lastAuthProvider" TEXT DEFAULT 'EMAIL',
    "googleId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "website_user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_enquiries" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "mobileNo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "preferredLocation" TEXT NOT NULL,
    "estimatedBudgetBand" TEXT NOT NULL,
    "specificRequirements" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brokers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "whatsappNumber" TEXT,
    "areaOfOperation" TEXT,
    "primaryContactPartnerId" TEXT,
    "minDealValue" DOUBLE PRECISION,
    "maxDealValue" DOUBLE PRECISION,
    "societyExpertise" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "BrokerStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brokers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "propertyType" "PropertyType" NOT NULL DEFAULT 'FLAT',
    "societyBuildingName" TEXT NOT NULL,
    "locationArea" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Mumbai',
    "floorNumber" INTEGER,
    "totalFloors" INTEGER,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "balconies" INTEGER,
    "carpetAreaSqFt" DOUBLE PRECISION NOT NULL,
    "superBuiltUpAreaSqFt" DOUBLE PRECISION,
    "pricingType" "PropertyPricingType" NOT NULL DEFAULT 'SALE',
    "askingPrice" DOUBLE PRECISION NOT NULL,
    "availabilityStatus" "PropertyListingStatus" NOT NULL DEFAULT 'AVAILABLE',
    "availabilityDate" TIMESTAMP(3),
    "accessType" "PropertyAccessType" NOT NULL DEFAULT 'DIRECT',
    "brokerId" TEXT,
    "sourcePartnerId" TEXT NOT NULL,
    "builderName" TEXT,
    "yearOfConstruction" INTEGER,
    "totalUnits" INTEGER,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reraNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_media" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "category" "PropertyMediaCategory" NOT NULL DEFAULT 'PHOTOGRAPH',
    "title" TEXT,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_audit_logs" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "changes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_filter_presets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_filter_presets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "website_users_email_key" ON "website_users"("email");

-- CreateIndex
CREATE INDEX "website_users_googleId_idx" ON "website_users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "website_user_sessions_token_key" ON "website_user_sessions"("token");

-- CreateIndex
CREATE INDEX "website_user_sessions_userId_idx" ON "website_user_sessions"("userId");

-- CreateIndex
CREATE INDEX "website_enquiries_email_idx" ON "website_enquiries"("email");

-- CreateIndex
CREATE INDEX "website_enquiries_mobileNo_idx" ON "website_enquiries"("mobileNo");

-- CreateIndex
CREATE INDEX "website_enquiries_status_idx" ON "website_enquiries"("status");

-- CreateIndex
CREATE INDEX "brokers_status_idx" ON "brokers"("status");

-- CreateIndex
CREATE INDEX "brokers_phone_idx" ON "brokers"("phone");

-- CreateIndex
CREATE INDEX "brokers_email_idx" ON "brokers"("email");

-- CreateIndex
CREATE INDEX "brokers_primaryContactPartnerId_idx" ON "brokers"("primaryContactPartnerId");

-- CreateIndex
CREATE INDEX "properties_propertyType_idx" ON "properties"("propertyType");

-- CreateIndex
CREATE INDEX "properties_availabilityStatus_idx" ON "properties"("availabilityStatus");

-- CreateIndex
CREATE INDEX "properties_sourcePartnerId_idx" ON "properties"("sourcePartnerId");

-- CreateIndex
CREATE INDEX "properties_brokerId_idx" ON "properties"("brokerId");

-- CreateIndex
CREATE INDEX "properties_locationArea_idx" ON "properties"("locationArea");

-- CreateIndex
CREATE INDEX "properties_pincode_idx" ON "properties"("pincode");

-- CreateIndex
CREATE INDEX "properties_isDraft_idx" ON "properties"("isDraft");

-- CreateIndex
CREATE INDEX "properties_isArchived_idx" ON "properties"("isArchived");

-- CreateIndex
CREATE INDEX "property_media_propertyId_idx" ON "property_media"("propertyId");

-- CreateIndex
CREATE INDEX "property_media_category_idx" ON "property_media"("category");

-- CreateIndex
CREATE INDEX "property_audit_logs_propertyId_idx" ON "property_audit_logs"("propertyId");

-- CreateIndex
CREATE INDEX "property_audit_logs_userId_idx" ON "property_audit_logs"("userId");

-- CreateIndex
CREATE INDEX "property_audit_logs_createdAt_idx" ON "property_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "property_filter_presets_userId_idx" ON "property_filter_presets"("userId");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_user_sessions" ADD CONSTRAINT "website_user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "website_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brokers" ADD CONSTRAINT "brokers_primaryContactPartnerId_fkey" FOREIGN KEY ("primaryContactPartnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_sourcePartnerId_fkey" FOREIGN KEY ("sourcePartnerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "brokers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_media" ADD CONSTRAINT "property_media_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_audit_logs" ADD CONSTRAINT "property_audit_logs_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_audit_logs" ADD CONSTRAINT "property_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_filter_presets" ADD CONSTRAINT "property_filter_presets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
