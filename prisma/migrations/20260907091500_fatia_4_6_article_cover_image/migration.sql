-- Fatia 4.6 — imagem de capa para Article e regra de publicação.

ALTER TABLE "articles"
  ADD COLUMN "cover_image_url" TEXT,
  ADD COLUMN "cover_image_key" TEXT,
  ADD COLUMN "cover_image_mime" TEXT,
  ADD COLUMN "cover_image_size" INTEGER,
  ADD COLUMN "cover_image_alt" TEXT;

ALTER TABLE "articles"
  ADD CONSTRAINT "articles_publish_requires_cover_image_check"
  CHECK (
    "status" <> 'PUBLISHED'
    OR ("cover_image_url" IS NOT NULL AND "cover_image_alt" IS NOT NULL)
  );
