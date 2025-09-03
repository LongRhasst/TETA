/*
  Warnings:

  - You are about to drop the column `update_data` on the `daily_notes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `daily_notes` DROP COLUMN `update_data`;
ALTER TABLE `daily_notes` DROP COLUMN `reply_data`;
ALTER TABLE `daily_notes` DROP COLUMN `task_value`;
ALTER TABLE `daily_notes` DROP COLUMN `task_label`;
