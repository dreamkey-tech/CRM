-- AlterTable
ALTER TABLE "audit_logs" 
ADD COLUMN IF NOT EXISTS "changes" JSONB,
ADD COLUMN IF NOT EXISTS "deviceType" TEXT,
ADD COLUMN IF NOT EXISTS "deviceName" TEXT,
ADD COLUMN IF NOT EXISTS "city" TEXT,
ADD COLUMN IF NOT EXISTS "country" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "audit_logs_deviceType_idx" ON "audit_logs"("deviceType");
