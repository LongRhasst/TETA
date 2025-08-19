/*
  Warnings:

  - You are about to drop the column `content_text` on the `data_reports` table. All the data in the column will be lost.
  - Added the required column `block` to the `data_reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `today` to the `data_reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yesterday` to the `data_reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `data_reports` DROP COLUMN `content_text`,
    ADD COLUMN `block` VARCHAR(191) NOT NULL,
    ADD COLUMN `today` VARCHAR(191) NOT NULL,
    ADD COLUMN `yesterday` VARCHAR(191) NOT NULL;
