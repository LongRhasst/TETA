/*
  Warnings:

  - You are about to alter the column `code` on the `report_logs` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Int`.

*/
-- AlterTable
ALTER TABLE `report_logs` MODIFY `code` INTEGER NULL;
