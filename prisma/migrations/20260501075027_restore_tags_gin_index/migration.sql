-- CreateIndex
CREATE INDEX "NormalizedProduct_tags_idx" ON "NormalizedProduct" USING GIN ("tags");
