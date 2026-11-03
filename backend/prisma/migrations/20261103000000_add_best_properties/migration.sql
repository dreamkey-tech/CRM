-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "isBestProperty" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "properties_isBestProperty_idx" ON "properties"("isBestProperty");
