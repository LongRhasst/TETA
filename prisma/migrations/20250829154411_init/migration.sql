/*
  Warnings:

  - You are about to drop the column `code` on the `report_logs` table. All the data in the column will be lost.
  - You are about to drop the column `update_time` on the `report_logs` table. All the data in the column will be lost.
  - Added the required column `code_log` to the `report_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_log` to the `report_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `report_logs` DROP COLUMN `code`,
    DROP COLUMN `update_time`,
    ADD COLUMN `code_log` INTEGER NOT NULL,
    ADD COLUMN `date_log` DATETIME(3) NOT NULL;
