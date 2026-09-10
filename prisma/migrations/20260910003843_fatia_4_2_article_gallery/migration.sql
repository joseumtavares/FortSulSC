-- CreateTable
CREATE TABLE "article_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "article_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "image_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "alt_text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "article_images_article_id_idx" ON "article_images"("article_id");

-- AddForeignKey
ALTER TABLE "article_images" ADD CONSTRAINT "article_images_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Menor privilégio: a role de runtime (fortsul_app) precisa de acesso
-- explícito a cada tabela nova, mesmo padrão usado desde a Fatia 4.3.
GRANT SELECT, INSERT, UPDATE, DELETE ON "article_images" TO fortsul_app;
