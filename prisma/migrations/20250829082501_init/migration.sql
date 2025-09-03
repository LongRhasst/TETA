/*
  Warnings:

  - The `time_range` column on the `report_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE `report_logs` DROP COLUMN `time_range`,
    ADD COLUMN `time_range` INTEGER NULL;
