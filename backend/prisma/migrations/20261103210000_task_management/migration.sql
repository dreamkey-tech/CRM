-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskPriority') THEN
        CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskCategory') THEN
        CREATE TYPE "TaskCategory" AS ENUM ('CLIENT_MEETING', 'SITE_VISIT', 'DOCUMENT_WORK', 'ADMIN', 'OTHER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskStatus') THEN
        CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED');
    END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "category" "TaskCategory" NOT NULL DEFAULT 'OTHER',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "createdById" TEXT NOT NULL,
    "completedById" TEXT,
    "completedAt" TIMESTAMP(3),
    "clientId" TEXT,
    "propertyId" TEXT,
    "googleEventId" TEXT,
    "googleSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "task_assignees" (
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reminderSentAt" TIMESTAMP(3),

    CONSTRAINT "task_assignees_pkey" PRIMARY KEY ("taskId", "userId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "organization_calendar_configs" (
    "id" TEXT NOT NULL DEFAULT 'dreamkey-master',
    "connectedEmail" TEXT NOT NULL DEFAULT 'info@dreamkeykol.com',
    "calendarId" TEXT NOT NULL DEFAULT 'primary',
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "masterFeedToken" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_calendar_configs_pkey" PRIMARY KEY ("id")
);

-- Unique Index for masterFeedToken
CREATE UNIQUE INDEX IF NOT EXISTS "organization_calendar_configs_masterFeedToken_key" ON "organization_calendar_configs"("masterFeedToken");

-- Indexes on tasks
CREATE INDEX IF NOT EXISTS "tasks_status_idx" ON "tasks"("status");
CREATE INDEX IF NOT EXISTS "tasks_dueDate_idx" ON "tasks"("dueDate");
CREATE INDEX IF NOT EXISTS "tasks_priority_idx" ON "tasks"("priority");
CREATE INDEX IF NOT EXISTS "tasks_category_idx" ON "tasks"("category");
CREATE INDEX IF NOT EXISTS "tasks_createdById_idx" ON "tasks"("createdById");
CREATE INDEX IF NOT EXISTS "tasks_completedAt_idx" ON "tasks"("completedAt");
CREATE INDEX IF NOT EXISTS "tasks_clientId_idx" ON "tasks"("clientId");
CREATE INDEX IF NOT EXISTS "tasks_propertyId_idx" ON "tasks"("propertyId");
CREATE INDEX IF NOT EXISTS "tasks_googleEventId_idx" ON "tasks"("googleEventId");

-- Indexes on task_assignees
CREATE INDEX IF NOT EXISTS "task_assignees_userId_taskId_idx" ON "task_assignees"("userId", "taskId");
CREATE INDEX IF NOT EXISTS "task_assignees_reminderSentAt_idx" ON "task_assignees"("reminderSentAt");

-- Foreign Keys
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_createdById_fkey') THEN
        ALTER TABLE "tasks" ADD CONSTRAINT "tasks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_completedById_fkey') THEN
        ALTER TABLE "tasks" ADD CONSTRAINT "tasks_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_clientId_fkey') THEN
        ALTER TABLE "tasks" ADD CONSTRAINT "tasks_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_propertyId_fkey') THEN
        ALTER TABLE "tasks" ADD CONSTRAINT "tasks_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'task_assignees_taskId_fkey') THEN
        ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'task_assignees_userId_fkey') THEN
        ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
