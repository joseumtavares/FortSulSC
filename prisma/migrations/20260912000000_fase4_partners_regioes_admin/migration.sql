-- AlterEnum
ALTER TYPE "AuditEntityType" ADD VALUE 'COMMERCIAL_AREA';

-- AlterTable
ALTER TABLE "partners" ADD COLUMN "logo_key" TEXT;
