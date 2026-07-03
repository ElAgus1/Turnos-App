-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_trainerId_fkey";

-- DropIndex
DROP INDEX "Class_classDate_idx";

-- AlterTable
ALTER TABLE "Activity" ALTER COLUMN "trainerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "recurrenceIntervalWeeks" INTEGER;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
