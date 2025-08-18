/*
  Warnings:

  - You are about to alter the column `date` on the `data_reports` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Date`.

*/
-- AlterTable
ALTER TABLE `data_reports` MODIFY `date` DATE NULL;

-- CreateIndex
CREATE INDEX `data_reports_create_time_idx` ON `data_reports`(`create_time`);
