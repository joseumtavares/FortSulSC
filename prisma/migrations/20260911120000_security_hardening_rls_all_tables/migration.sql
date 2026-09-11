-- Achado do Supabase Advisor (security lint "rls_disabled_in_public"): 18 tabelas
-- do schema public nunca tiveram Row Level Security habilitado desde a criação do
-- projeto. As roles "anon" e "authenticated" do Supabase recebem, por padrão em
-- toda tabela nova, privilégios completos (SELECT/INSERT/UPDATE/DELETE/TRUNCATE)
-- via PostgREST — ou seja, qualquer requisição usando a chave pública anon podia
-- ler ou alterar diretamente essas tabelas, contornando a aplicação inteira.
--
-- A role "postgres" (usada em migrations, seed e Prisma CLI) tem rolbypassrls=true,
-- então FORCE ROW LEVEL SECURITY não afeta migrations/seed em nenhum ambiente.
-- A role "fortsul_app" (usada em runtime pela aplicação) recebe uma política
-- permissiva, no mesmo padrão já usado na Fatia 4.3 para admin_users/login_attempts/
-- audit_logs/partner_private e na Fatia 4.5 para product_testimonials.

ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "categories" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "products" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "product_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_categories" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "product_categories" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "product_applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_applications" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "product_applications" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "product_specifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_specifications" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "product_specifications" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "product_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_images" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "product_images" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "regions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "regions" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "regions" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "states" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "states" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "states" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "municipalities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "municipalities" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "municipalities" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "commercial_areas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commercial_areas" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "commercial_areas" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "commercial_area_municipalities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commercial_area_municipalities" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "commercial_area_municipalities" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "partners" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "partners" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "partners" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "partner_commercial_areas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "partner_commercial_areas" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "partner_commercial_areas" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "articles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "articles" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "articles" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "article_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "article_images" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "article_images" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "banners" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "banners" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "banners" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "institutional_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "institutional_settings" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "institutional_settings" TO fortsul_app USING (true) WITH CHECK (true);

-- Tabela interna do Prisma: nenhuma role de runtime (fortsul_app) precisa acessá-la,
-- só a role proprietária via CLI de migrations (que sempre ignora RLS via BYPASSRLS).
-- RLS sem nenhuma política = acesso negado por padrão para anon/authenticated/fortsul_app.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" FORCE ROW LEVEL SECURITY;
