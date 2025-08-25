-- AlterTable
ALTER TABLE `report_logs` MODIFY `project_name` VARCHAR(500) NOT NULL,
    MODIFY `member` VARCHAR(500) NOT NULL,
    MODIFY `progress` TEXT NOT NULL,
    MODIFY `customer_communication` TEXT NOT NULL,
    MODIFY `human_resource` TEXT NOT NULL,
    MODIFY `profession` VARCHAR(255) NOT NULL,
    MODIFY `technical_solution` TEXT NOT NULL,
    MODIFY `testing` TEXT NOT NULL,
    MODIFY `milestone` TEXT NOT NULL,
    MODIFY `week_goal` TEXT NOT NULL,
    MODIFY `issue` TEXT NOT NULL,
    MODIFY `risks` TEXT NOT NULL;
