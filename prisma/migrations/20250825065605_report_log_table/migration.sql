-- CreateTable
CREATE TABLE `report_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_name` VARCHAR(191) NOT NULL,
    `member` VARCHAR(191) NOT NULL,
    `progress` VARCHAR(191) NOT NULL,
    `customer_communication` VARCHAR(191) NOT NULL,
    `human_resource` VARCHAR(191) NOT NULL,
    `profession` VARCHAR(191) NOT NULL,
    `technical_solution` VARCHAR(191) NOT NULL,
    `testing` VARCHAR(191) NOT NULL,
    `milestone` VARCHAR(191) NOT NULL,
    `week_goal` VARCHAR(191) NOT NULL,
    `issue` VARCHAR(191) NOT NULL,
    `risks` VARCHAR(191) NOT NULL,
    `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_time` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
