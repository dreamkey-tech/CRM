-- Broker maxDealValue is no longer exposed by Prisma or the API.
-- Keep the legacy column so existing values are not destructively discarded.
CREATE TYPE "OwnerStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TABLE "owners" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "whatsappNumber" TEXT,
  "address" TEXT,
  "primaryContactPartnerId" TEXT,
  "createdById" TEXT NOT NULL,
  "notes" TEXT,
  "status" "OwnerStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "owners_phone_idx" ON "owners"("phone");
CREATE INDEX "owners_status_idx" ON "owners"("status");
CREATE INDEX "owners_primaryContactPartnerId_idx" ON "owners"("primaryContactPartnerId");
CREATE INDEX "owners_createdById_idx" ON "owners"("createdById");
ALTER TABLE "owners" ADD CONSTRAINT "owners_primaryContactPartnerId_fkey" FOREIGN KEY ("primaryContactPartnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "owners" ADD CONSTRAINT "owners_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "properties" ADD COLUMN "ownerId" TEXT;
CREATE INDEX "properties_ownerId_idx" ON "properties"("ownerId");
ALTER TABLE "properties" ADD CONSTRAINT "properties_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
