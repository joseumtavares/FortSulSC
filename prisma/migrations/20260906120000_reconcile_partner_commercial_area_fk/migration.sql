-- Reconcilia bancos criados antes da migration da Fatia 4.2.
-- A verificação torna a migration segura para ambientes que já possuem a FK.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'partner_commercial_areas_commercial_area_id_fkey'
      AND conrelid = 'partner_commercial_areas'::regclass
  ) THEN
    ALTER TABLE "partner_commercial_areas"
      ADD CONSTRAINT "partner_commercial_areas_commercial_area_id_fkey"
      FOREIGN KEY ("commercial_area_id")
      REFERENCES "commercial_areas"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE;
  END IF;
END $$;
