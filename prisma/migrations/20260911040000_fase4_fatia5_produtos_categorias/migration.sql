-- CreateEnum
CREATE TYPE "TestimonialPlatform" AS ENUM ('TIKTOK', 'FACEBOOK', 'INSTAGRAM');

-- AlterTable
ALTER TABLE "categories" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "products" ADD COLUMN "code" TEXT NOT NULL,
ADD COLUMN "whatsapp_message_template" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");

-- CreateTable
CREATE TABLE "product_testimonials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "platform" "TestimonialPlatform" NOT NULL,
    "url" TEXT NOT NULL,
    "author_name" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_testimonials_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "product_testimonials" ADD CONSTRAINT "product_testimonials_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Fatia 4.3 já concede SELECT/INSERT/UPDATE/DELETE em "products"/"categories"
-- à role restrita fortsul_app; a tabela nova precisa do mesmo grant.
GRANT SELECT, INSERT, UPDATE, DELETE ON "product_testimonials" TO fortsul_app;

-- RLS deny-by-default (mesmo padrão da Fatia 4.3 para admin_users/login_attempts/
-- audit_logs/partner_private): sem isto, o Supabase expõe a tabela por padrão via
-- PostgREST para as roles anon/authenticated. FORCE garante que nem a role dona
-- do schema (usada só em migrations) fica isenta — a aplicação em runtime usa
-- exclusivamente fortsul_app, nunca a role proprietária.
ALTER TABLE "product_testimonials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_testimonials" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "product_testimonials" TO fortsul_app USING (true) WITH CHECK (true);
