-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "LoginAttemptResult" AS ENUM ('PASSWORD_INVALID', 'CODE_INVALID', 'CODE_EXPIRED', 'SUCCESS', 'BLOCKED');

-- CreateEnum
CREATE TYPE "RateLimitDimension" AS ENUM ('EMAIL', 'IP', 'DEVICE');

-- CreateEnum
CREATE TYPE "RateLimitContext" AS ENUM ('PASSWORD_STEP', 'CODE_STEP', 'CODE_SEND');

-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'EDITOR',
    "password_hash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "token_version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_login_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "admin_user_id" UUID NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_login_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_logins" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "admin_user_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_logins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "admin_user_id" UUID,
    "email" TEXT NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "device_id" TEXT,
    "result" "LoginAttemptResult" NOT NULL,
    "blocked_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_counters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dimension" "RateLimitDimension" NOT NULL,
    "key" TEXT NOT NULL,
    "context" "RateLimitContext" NOT NULL,
    "window_start" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limit_counters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "admin_login_codes_admin_user_id_idx" ON "admin_login_codes"("admin_user_id");

-- CreateIndex
CREATE INDEX "pending_logins_admin_user_id_idx" ON "pending_logins"("admin_user_id");

-- CreateIndex
CREATE INDEX "login_attempts_email_idx" ON "login_attempts"("email");

-- CreateIndex
CREATE INDEX "login_attempts_admin_user_id_idx" ON "login_attempts"("admin_user_id");

-- CreateIndex
CREATE INDEX "login_attempts_ip_hash_idx" ON "login_attempts"("ip_hash");

-- CreateIndex
CREATE INDEX "login_attempts_device_id_idx" ON "login_attempts"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "rate_limit_counters_dimension_key_context_window_start_key" ON "rate_limit_counters"("dimension", "key", "context", "window_start");

-- AddForeignKey
ALTER TABLE "admin_login_codes" ADD CONSTRAINT "admin_login_codes_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_logins" ADD CONSTRAINT "pending_logins_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Fatia 4.3 — menor privilégio + RLS deny-by-default (proposta §4/§5).
-- Assume que a role executando esta migração pode criar role (padrão no
-- Postgres local via Docker Compose). Em produção, confirmar se o provedor
-- de Postgres permite CREATE ROLE pela conexão de migração disponível —
-- ver proposta §4, verificação manual pendente do Jose.
-- Esta migração cria a role SEM senha de propósito (nenhum segredo neste
-- arquivo versionado). Depois de aplicar, rode manualmente, fora do
-- controle de versão:
--   ALTER ROLE fortsul_app WITH PASSWORD '<gerar e guardar só como variável de ambiente>';
-- e aponte DATABASE_URL da aplicação (runtime) para essa role — nunca para
-- a role dona/migradora.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'fortsul_app') THEN
    CREATE ROLE fortsul_app LOGIN;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO fortsul_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  "categories", "products", "product_categories", "product_applications",
  "product_specifications", "product_images",
  "regions", "states", "municipalities", "commercial_areas",
  "commercial_area_municipalities", "partners", "partner_private",
  "partner_commercial_areas",
  "admin_users", "admin_login_codes", "pending_logins", "login_attempts",
  "rate_limit_counters"
TO fortsul_app;

-- RLS deny-by-default nas tabelas de maior sensibilidade. Sem policy, o
-- Postgres nega tudo por padrão — inclusive à role dona do schema, que por
-- isso nunca deve ser a role usada em runtime pela aplicação.
ALTER TABLE "admin_users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_users" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "admin_users" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "admin_login_codes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_login_codes" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "admin_login_codes" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "pending_logins" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pending_logins" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "pending_logins" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "login_attempts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "login_attempts" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "login_attempts" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "rate_limit_counters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rate_limit_counters" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "rate_limit_counters" TO fortsul_app USING (true) WITH CHECK (true);

ALTER TABLE "partner_private" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "partner_private" FORCE ROW LEVEL SECURITY;
CREATE POLICY fortsul_app_full_access ON "partner_private" TO fortsul_app USING (true) WITH CHECK (true);
