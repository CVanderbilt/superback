-- CreateEnum
CREATE TYPE "MeasurementType" AS ENUM ('KG', 'L', 'UNIT');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryAlias" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NormalizedProduct" (
    "id" TEXT NOT NULL,
    "superId" TEXT NOT NULL,
    "rawName" TEXT NOT NULL,
    "rawData" JSONB NOT NULL,
    "name" TEXT NOT NULL,
    "searchName" TEXT NOT NULL,
    "measurementType" "MeasurementType" NOT NULL,
    "measurementValue" DECIMAL(10,3) NOT NULL,
    "categoryId" TEXT,
    "url" TEXT,
    "description" TEXT,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "normalizationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NormalizedProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "CategoryAlias_name_idx" ON "CategoryAlias"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryAlias_name_key" ON "CategoryAlias"("name");

-- CreateIndex
CREATE INDEX "NormalizedProduct_superId_idx" ON "NormalizedProduct"("superId");

-- CreateIndex
CREATE INDEX "NormalizedProduct_categoryId_idx" ON "NormalizedProduct"("categoryId");

-- CreateIndex
CREATE INDEX "NormalizedProduct_searchName_idx" ON "NormalizedProduct"("searchName");

-- CreateIndex
CREATE INDEX "NormalizedProduct_tags_gin_idx" ON "NormalizedProduct" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "NormalizedProduct_weighted_search_gin_idx" ON "NormalizedProduct"
USING GIN (
  (
    setweight(to_tsvector('spanish', coalesce("name", '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce("description", '')), 'B')
  )
);

-- AddForeignKey
ALTER TABLE "CategoryAlias" ADD CONSTRAINT "CategoryAlias_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NormalizedProduct" ADD CONSTRAINT "NormalizedProduct_superId_fkey" FOREIGN KEY ("superId") REFERENCES "Super"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NormalizedProduct" ADD CONSTRAINT "NormalizedProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddConstraint
ALTER TABLE "NormalizedProduct"
ADD CONSTRAINT "NormalizedProduct_normalization_complete_chk"
CHECK (
  "normalizationDate" IS NULL OR (
    "name" IS NOT NULL AND
    "searchName" IS NOT NULL AND
    "measurementType" IS NOT NULL AND
    "measurementValue" IS NOT NULL AND
    "tags" IS NOT NULL
  )
);
