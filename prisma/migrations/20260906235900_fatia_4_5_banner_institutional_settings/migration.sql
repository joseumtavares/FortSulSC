-- CreateEnum
ALTER TYPE "AuditEntityType" ADD VALUE IF NOT EXISTS 'BANNER';

-- CreateTable
CREATE TABLE "banners" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "link_url" TEXT,
    "image_url" TEXT NOT NULL,
    "image_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "alt_text" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "start_at" TIMESTAMP(3),
    "end_at" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutional_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "singleton_key" INTEGER NOT NULL DEFAULT 1,
    "whatsapp" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "cnpj" TEXT,
    "address" TEXT,
    "social_links" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutional_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "banners_active_start_at_end_at_idx" ON "banners"("active", "start_at", "end_at");

-- CreateIndex
CREATE UNIQUE INDEX "institutional_settings_singleton_key_key" ON "institutional_settings"("singleton_key");

-- AddCheckConstraint
ALTER TABLE "institutional_settings"
  ADD CONSTRAINT "institutional_settings_singleton_key_check"
  CHECK ("singleton_key" = 1);

-- Grant privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON "banners", "institutional_settings" TO fortsul_app;
