-- AlterTable
ALTER TABLE `log_daily` ADD COLUMN `task_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `log_daily` ADD CONSTRAINT `log_daily_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
