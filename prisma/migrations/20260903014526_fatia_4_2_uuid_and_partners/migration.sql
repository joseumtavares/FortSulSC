-- Legacy CUID (TEXT) -> UUID remapping. The generated Prisma ALTER statements
-- for legacy tables were intentionally removed: CUID values cannot be cast to UUID.
ALTER TABLE "categories" ADD COLUMN "id_new" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "products" ADD COLUMN "id_new" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "product_applications" ADD COLUMN "id_new" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "product_specifications" ADD COLUMN "id_new" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "product_images" ADD COLUMN "id_new" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "product_categories" ADD COLUMN "product_id_new" UUID;
ALTER TABLE "product_categories" ADD COLUMN "category_id_new" UUID;
ALTER TABLE "product_applications" ADD COLUMN "product_id_new" UUID;
ALTER TABLE "product_specifications" ADD COLUMN "product_id_new" UUID;
ALTER TABLE "product_images" ADD COLUMN "product_id_new" UUID;
UPDATE "product_categories" pc SET "product_id_new" = p."id_new" FROM "products" p WHERE p."id" = pc."product_id";
UPDATE "product_categories" pc SET "category_id_new" = c."id_new" FROM "categories" c WHERE c."id" = pc."category_id";
UPDATE "product_applications" pa SET "product_id_new" = p."id_new" FROM "products" p WHERE p."id" = pa."product_id";
UPDATE "product_specifications" ps SET "product_id_new" = p."id_new" FROM "products" p WHERE p."id" = ps."product_id";
UPDATE "product_images" pi SET "product_id_new" = p."id_new" FROM "products" p WHERE p."id" = pi."product_id";
ALTER TABLE "product_categories" ALTER COLUMN "product_id_new" SET NOT NULL;
ALTER TABLE "product_categories" ALTER COLUMN "category_id_new" SET NOT NULL;
ALTER TABLE "product_applications" ALTER COLUMN "product_id_new" SET NOT NULL;
ALTER TABLE "product_specifications" ALTER COLUMN "product_id_new" SET NOT NULL;
ALTER TABLE "product_images" ALTER COLUMN "product_id_new" SET NOT NULL;
ALTER TABLE "product_categories" DROP CONSTRAINT "product_categories_product_id_fkey";
ALTER TABLE "product_categories" DROP CONSTRAINT "product_categories_category_id_fkey";
ALTER TABLE "product_applications" DROP CONSTRAINT "product_applications_product_id_fkey";
ALTER TABLE "product_specifications" DROP CONSTRAINT "product_specifications_product_id_fkey";
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_product_id_fkey";
ALTER TABLE "product_categories" DROP CONSTRAINT "product_categories_pkey";
ALTER TABLE "categories" DROP CONSTRAINT "categories_pkey";
ALTER TABLE "products" DROP CONSTRAINT "products_pkey";
ALTER TABLE "product_applications" DROP CONSTRAINT "product_applications_pkey";
ALTER TABLE "product_specifications" DROP CONSTRAINT "product_specifications_pkey";
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_pkey";
ALTER TABLE "categories" DROP COLUMN "id";
ALTER TABLE "categories" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "products" DROP COLUMN "id";
ALTER TABLE "products" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "product_categories" DROP COLUMN "product_id";
ALTER TABLE "product_categories" DROP COLUMN "category_id";
ALTER TABLE "product_categories" RENAME COLUMN "product_id_new" TO "product_id";
ALTER TABLE "product_categories" RENAME COLUMN "category_id_new" TO "category_id";
ALTER TABLE "product_applications" DROP COLUMN "id";
ALTER TABLE "product_applications" DROP COLUMN "product_id";
ALTER TABLE "product_applications" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "product_applications" RENAME COLUMN "product_id_new" TO "product_id";
ALTER TABLE "product_specifications" DROP COLUMN "id";
ALTER TABLE "product_specifications" DROP COLUMN "product_id";
ALTER TABLE "product_specifications" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "product_specifications" RENAME COLUMN "product_id_new" TO "product_id";
ALTER TABLE "product_images" DROP COLUMN "id";
ALTER TABLE "product_images" DROP COLUMN "product_id";
ALTER TABLE "product_images" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "product_images" RENAME COLUMN "product_id_new" TO "product_id";
ALTER TABLE "categories" ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");
ALTER TABLE "products" ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_pkey" PRIMARY KEY ("product_id", "category_id");
ALTER TABLE "product_applications" ADD CONSTRAINT "product_applications_pkey" PRIMARY KEY ("id");
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_pkey" PRIMARY KEY ("id");
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_pkey" PRIMARY KEY ("id");
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "product_applications" ADD CONSTRAINT "product_applications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "categories" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "products" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "product_applications" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "product_specifications" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "product_images" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

/*

  - The primary key for the `categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `product_applications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `product_categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `product_images` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `product_specifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `categories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `product_applications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `product_id` on the `product_applications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `product_id` on the `product_categories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `category_id` on the `product_categories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `product_images` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `product_id` on the `product_images` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `product_specifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `product_id` on the `product_specifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `products` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('REPRESENTATIVE', 'RESELLER');

-- CreateTable
CREATE TABLE "regions" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ibge_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "states" (
    "id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "uf" VARCHAR(2) NOT NULL,
    "slug" TEXT NOT NULL,
    "ibge_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municipalities" (
    "id" UUID NOT NULL,
    "state_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ibge_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "municipalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commercial_areas" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commercial_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commercial_area_municipalities" (
    "commercial_area_id" UUID NOT NULL,
    "municipality_id" UUID NOT NULL,

    CONSTRAINT "commercial_area_municipalities_pkey" PRIMARY KEY ("commercial_area_id","municipality_id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" UUID NOT NULL,
    "type" "PartnerType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "whatsapp" TEXT NOT NULL,
    "social_links" JSONB,
    "website_url" TEXT,
    "logo_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "approximate_lat" DOUBLE PRECISION,
    "approximate_lng" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_private" (
    "id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "document" TEXT,
    "consent_given_at" TIMESTAMP(3) NOT NULL,
    "consent_revoked_at" TIMESTAMP(3),
    "consent_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_private_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_commercial_areas" (
    "partner_id" UUID NOT NULL,
    "commercial_area_id" UUID NOT NULL,

    CONSTRAINT "partner_commercial_areas_pkey" PRIMARY KEY ("partner_id","commercial_area_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "regions_slug_key" ON "regions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "regions_ibge_code_key" ON "regions"("ibge_code");

-- CreateIndex
CREATE UNIQUE INDEX "states_uf_key" ON "states"("uf");

-- CreateIndex
CREATE UNIQUE INDEX "states_slug_key" ON "states"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "states_ibge_code_key" ON "states"("ibge_code");

-- CreateIndex
CREATE INDEX "states_region_id_idx" ON "states"("region_id");

-- CreateIndex
CREATE UNIQUE INDEX "municipalities_ibge_code_key" ON "municipalities"("ibge_code");

-- CreateIndex
CREATE INDEX "municipalities_state_id_idx" ON "municipalities"("state_id");

-- CreateIndex
CREATE UNIQUE INDEX "municipalities_state_id_slug_key" ON "municipalities"("state_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "commercial_areas_slug_key" ON "commercial_areas"("slug");

-- CreateIndex
CREATE INDEX "partners_type_idx" ON "partners"("type");

-- CreateIndex
CREATE UNIQUE INDEX "partner_private_partner_id_key" ON "partner_private"("partner_id");

-- AddForeignKey
ALTER TABLE "states" ADD CONSTRAINT "states_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municipalities" ADD CONSTRAINT "municipalities_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commercial_area_municipalities" ADD CONSTRAINT "commercial_area_municipalities_commercial_area_id_fkey" FOREIGN KEY ("commercial_area_id") REFERENCES "commercial_areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commercial_area_municipalities" ADD CONSTRAINT "commercial_area_municipalities_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "municipalities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_private" ADD CONSTRAINT "partner_private_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_commercial_areas" ADD CONSTRAINT "partner_commercial_areas_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_commercial_areas" ADD CONSTRAINT "partner_commercial_areas_commercial_area_id_fkey" FOREIGN KEY ("commercial_area_id") REFERENCES "commercial_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
