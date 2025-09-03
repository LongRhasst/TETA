-- CreateTable
CREATE TABLE `daily_notes` (
    `message_id` VARCHAR(191) NOT NULL,
    `channel_id` VARCHAR(191) NOT NULL,
    `clan_id` VARCHAR(191) NOT NULL,
    `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_time` DATETIME(3) NULL,
    `block` VARCHAR(191) NULL,
    `today` VARCHAR(191) NULL,
    `yesterday` VARCHAR(191) NULL,
    `date` DATE NULL,
    `project_value` VARCHAR(191) NULL,
    `sender_id` VARCHAR(191) NULL,
    `task_label` VARCHAR(191) NULL,
    `task_value` VARCHAR(191) NULL,
    `reply_data` JSON NULL,
    `update_data` JSON NULL,
    `work_type` VARCHAR(191) NULL,
    `working_time` VARCHAR(191) NULL,
    `daily_late` BOOLEAN NOT NULL DEFAULT false,
    `member` VARCHAR(191) NULL,

    INDEX `daily_notes_date_idx`(`date`),
    INDEX `daily_notes_channel_id_idx`(`channel_id`),
    PRIMARY KEY (`message_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weekly_reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_name` VARCHAR(500) NOT NULL,
    `member` VARCHAR(500) NOT NULL,
    `progress` TEXT NOT NULL,
    `customer_communication` TEXT NOT NULL,
    `human_resource` TEXT NOT NULL,
    `profession` VARCHAR(255) NOT NULL,
    `technical_solution` TEXT NOT NULL,
    `testing` TEXT NOT NULL,
    `milestone` TEXT NOT NULL,
    `week_goal` TEXT NOT NULL,
    `issue` TEXT NOT NULL,
    `risks` TEXT NOT NULL,
    `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_log` DATETIME(3) NOT NULL,
    `code_log` INTEGER NOT NULL,

    INDEX `weekly_reports_date_log_idx`(`date_log`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
