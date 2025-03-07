-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "appTypeId" TEXT;

-- AlterTable
ALTER TABLE "milestone_templates" ADD COLUMN     "flagCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "application_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "normalizedName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "flagCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "application_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FlaggedMilestones" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_FlaggedAppTypes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "application_types_normalizedName_idx" ON "application_types"("normalizedName");

-- CreateIndex
CREATE INDEX "application_types_category_idx" ON "application_types"("category");

-- CreateIndex
CREATE UNIQUE INDEX "application_types_normalizedName_category_key" ON "application_types"("normalizedName", "category");

-- CreateIndex
CREATE UNIQUE INDEX "_FlaggedMilestones_AB_unique" ON "_FlaggedMilestones"("A", "B");

-- CreateIndex
CREATE INDEX "_FlaggedMilestones_B_index" ON "_FlaggedMilestones"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FlaggedAppTypes_AB_unique" ON "_FlaggedAppTypes"("A", "B");

-- CreateIndex
CREATE INDEX "_FlaggedAppTypes_B_index" ON "_FlaggedAppTypes"("B");

-- CreateIndex
CREATE INDEX "milestone_templates_programType_idx" ON "milestone_templates"("programType");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_appTypeId_fkey" FOREIGN KEY ("appTypeId") REFERENCES "application_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_types" ADD CONSTRAINT "application_types_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FlaggedMilestones" ADD CONSTRAINT "_FlaggedMilestones_A_fkey" FOREIGN KEY ("A") REFERENCES "milestone_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FlaggedMilestones" ADD CONSTRAINT "_FlaggedMilestones_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FlaggedAppTypes" ADD CONSTRAINT "_FlaggedAppTypes_A_fkey" FOREIGN KEY ("A") REFERENCES "application_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FlaggedAppTypes" ADD CONSTRAINT "_FlaggedAppTypes_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
