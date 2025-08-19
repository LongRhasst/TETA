/*
  Warnings:

  - You are about to drop the column `sender_username` on the `data_reports` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `data_reports` table. All the data in the column will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Timesheet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TimesheetSub` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `source_task` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `TimesheetSub` DROP FOREIGN KEY `TimesheetSub_timesheetId_fkey`;

-- DropForeignKey
ALTER TABLE `TimesheetSub` DROP FOREIGN KEY `TimesheetSub_userId_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `source_task` DROP FOREIGN KEY `source_task_projectId_fkey`;

-- AlterTable
ALTER TABLE `data_reports` DROP COLUMN `sender_username`,
    DROP COLUMN `username`,
    ADD COLUMN `member` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `Project`;

-- DropTable
DROP TABLE `Timesheet`;

-- DropTable
DROP TABLE `TimesheetSub`;

-- DropTable
DROP TABLE `User`;

-- DropTable
DROP TABLE `source_task`;
