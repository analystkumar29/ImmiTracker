-- AlterTable
ALTER TABLE "milestone_templates" ADD COLUMN     "canonicalId" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isDeprecated" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "milestone_templates_category_idx" ON "milestone_templates"("category");
