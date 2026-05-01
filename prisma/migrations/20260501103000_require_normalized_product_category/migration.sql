-- Backfill any rows missing categoryId (e.g. legacy data) before NOT NULL.
DO $$
DECLARE
  cat_id TEXT;
BEGIN
  SELECT "id" INTO cat_id FROM "Category" WHERE "name" = 'Uncategorized' LIMIT 1;
  IF cat_id IS NULL THEN
    cat_id := gen_random_uuid()::text;
    INSERT INTO "Category" ("id", "name", "createdAt", "updatedAt")
    VALUES (cat_id, 'Uncategorized', NOW(), NOW());
  END IF;
  UPDATE "NormalizedProduct" SET "categoryId" = cat_id WHERE "categoryId" IS NULL;
END $$;

-- Enforce required category on every product row (parser must always set one).
ALTER TABLE "NormalizedProduct" ALTER COLUMN "categoryId" SET NOT NULL;

-- Replace SET NULL with RESTRICT: categories in use cannot be deleted accidentally.
ALTER TABLE "NormalizedProduct" DROP CONSTRAINT IF EXISTS "NormalizedProduct_categoryId_fkey";
ALTER TABLE "NormalizedProduct"
ADD CONSTRAINT "NormalizedProduct_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
