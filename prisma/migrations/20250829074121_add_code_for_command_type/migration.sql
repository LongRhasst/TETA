/*
  Warnings:

  - Made the column `code` on table `report_logs` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `report_logs` MODIFY `code` INTEGER NOT NULL DEFAULT 1;
