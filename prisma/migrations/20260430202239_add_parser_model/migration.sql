-- CreateEnum
CREATE TYPE "ParserStatus" AS ENUM ('ONGOING', 'COMPLETED', 'CANCELED');

-- CreateTable
CREATE TABLE "Parser" (
    "id" TEXT NOT NULL,
    "superId" TEXT NOT NULL,
    "status" "ParserStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Parser_superId_idx" ON "Parser"("superId");

-- AddForeignKey
ALTER TABLE "Parser" ADD CONSTRAINT "Parser_superId_fkey" FOREIGN KEY ("superId") REFERENCES "Super"("id") ON DELETE CASCADE ON UPDATE CASCADE;
