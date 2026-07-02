ALTER TABLE "Class"
ADD COLUMN "classDate" TIMESTAMP(3);

CREATE INDEX "Class_classDate_idx" ON "Class"("classDate");
