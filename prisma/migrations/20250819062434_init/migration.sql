/*
  Warnings:

  - You are about to drop the column `is_valid` on the `data_reports` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `data_reports` DROP COLUMN `is_valid`,
    ADD COLUMN `daily_late` BOOLEAN NOT NULL DEFAULT false;
