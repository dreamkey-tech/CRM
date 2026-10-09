-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ClientShortlistStatus" AS ENUM ('SHORTLISTED', 'SHARED', 'VISITED', 'INTERESTED', 'NOT_INTERESTED');

-- CreateEnum
CREATE TYPE "ClientShareChannel" AS ENUM ('WHATSAPP', 'EMAIL', 'LINK');

-- CreateEnum
CREATE TYPE "ClientShareStatus" AS ENUM ('PREPARED', 'COMPOSER_OPENED', 'SENT_CONFIRMED');

-- CreateEnum
CREATE TYPE "ClientDocumentCategory" AS ENUM ('AADHAAR', 'PAYMENT_RECEIPT', 'CLIENT_DOCUMENT', 'PCC_APPLICATION', 'CERTIFICATE', 'KYC');

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "whatsappNumber" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_partner_assignments" (
    "clientId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_partner_assignments_pkey" PRIMARY KEY ("clientId","partnerId")
);

-- CreateTable
CREATE TABLE "client_shortlisted_properties" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "status" "ClientShortlistStatus" NOT NULL DEFAULT 'SHORTLISTED',
    "notes" TEXT,
    "addedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_shortlisted_properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_property_shares" (
    "id" TEXT NOT NULL,
    "shortlistedPropertyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "publicToken" TEXT NOT NULL,
    "channel" "ClientShareChannel" NOT NULL,
    "status" "ClientShareStatus" NOT NULL DEFAULT 'PREPARED',
    "recipient" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "propertySnapshot" JSONB NOT NULL,
    "selectedMediaSnapshot" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "composerOpenedAt" TIMESTAMP(3),
    "sentConfirmedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_property_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_property_share_media" (
    "shareId" TEXT NOT NULL,
    "propertyMediaId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "client_property_share_media_pkey" PRIMARY KEY ("shareId","propertyMediaId")
);

-- CreateTable
CREATE TABLE "client_documents" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "category" "ClientDocumentCategory" NOT NULL,
    "title" TEXT,
    "originalName" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clients_phone_idx" ON "clients"("phone");

-- CreateIndex
CREATE INDEX "clients_email_idx" ON "clients"("email");

-- CreateIndex
CREATE INDEX "clients_status_idx" ON "clients"("status");

-- CreateIndex
CREATE INDEX "clients_createdById_idx" ON "clients"("createdById");

-- CreateIndex
CREATE INDEX "clients_createdAt_idx" ON "clients"("createdAt");

-- CreateIndex
CREATE INDEX "client_partner_assignments_partnerId_clientId_idx" ON "client_partner_assignments"("partnerId", "clientId");

-- CreateIndex
CREATE INDEX "client_partner_assignments_assignedById_idx" ON "client_partner_assignments"("assignedById");

-- CreateIndex
CREATE INDEX "client_shortlisted_properties_propertyId_idx" ON "client_shortlisted_properties"("propertyId");

-- CreateIndex
CREATE INDEX "client_shortlisted_properties_clientId_status_idx" ON "client_shortlisted_properties"("clientId", "status");

-- CreateIndex
CREATE INDEX "client_shortlisted_properties_addedById_idx" ON "client_shortlisted_properties"("addedById");

-- CreateIndex
CREATE UNIQUE INDEX "client_shortlisted_properties_clientId_propertyId_key" ON "client_shortlisted_properties"("clientId", "propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "client_shortlisted_properties_id_clientId_propertyId_key" ON "client_shortlisted_properties"("id", "clientId", "propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "client_property_shares_publicToken_key" ON "client_property_shares"("publicToken");

-- CreateIndex
CREATE INDEX "client_property_shares_clientId_createdAt_idx" ON "client_property_shares"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "client_property_shares_propertyId_idx" ON "client_property_shares"("propertyId");

-- CreateIndex
CREATE INDEX "client_property_shares_shortlistedPropertyId_clientId_prope_idx" ON "client_property_shares"("shortlistedPropertyId", "clientId", "propertyId");

-- CreateIndex
CREATE INDEX "client_property_shares_createdById_idx" ON "client_property_shares"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "client_property_shares_id_propertyId_key" ON "client_property_shares"("id", "propertyId");

-- CreateIndex
CREATE INDEX "client_property_share_media_shareId_propertyId_idx" ON "client_property_share_media"("shareId", "propertyId");

-- CreateIndex
CREATE INDEX "client_property_share_media_propertyMediaId_propertyId_idx" ON "client_property_share_media"("propertyMediaId", "propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "client_documents_key_key" ON "client_documents"("key");

-- CreateIndex
CREATE INDEX "client_documents_clientId_category_idx" ON "client_documents"("clientId", "category");

-- CreateIndex
CREATE INDEX "client_documents_uploadedById_idx" ON "client_documents"("uploadedById");

-- CreateIndex
CREATE UNIQUE INDEX "property_media_id_propertyId_key" ON "property_media"("id", "propertyId");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_partner_assignments" ADD CONSTRAINT "client_partner_assignments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_partner_assignments" ADD CONSTRAINT "client_partner_assignments_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_partner_assignments" ADD CONSTRAINT "client_partner_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_shortlisted_properties" ADD CONSTRAINT "client_shortlisted_properties_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_shortlisted_properties" ADD CONSTRAINT "client_shortlisted_properties_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_shortlisted_properties" ADD CONSTRAINT "client_shortlisted_properties_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_property_shares" ADD CONSTRAINT "client_property_shares_shortlistedPropertyId_clientId_prop_fkey" FOREIGN KEY ("shortlistedPropertyId", "clientId", "propertyId") REFERENCES "client_shortlisted_properties"("id", "clientId", "propertyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_property_shares" ADD CONSTRAINT "client_property_shares_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_property_share_media" ADD CONSTRAINT "client_property_share_media_shareId_propertyId_fkey" FOREIGN KEY ("shareId", "propertyId") REFERENCES "client_property_shares"("id", "propertyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_property_share_media" ADD CONSTRAINT "client_property_share_media_propertyMediaId_propertyId_fkey" FOREIGN KEY ("propertyMediaId", "propertyId") REFERENCES "property_media"("id", "propertyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_documents" ADD CONSTRAINT "client_documents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_documents" ADD CONSTRAINT "client_documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
