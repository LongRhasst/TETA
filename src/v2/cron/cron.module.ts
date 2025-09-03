import { Module } from '@nestjs/common';
import { CronJobService } from './cron-job.service';
import { CommandModule } from '../command/weeklyReport/command.module';
import { AiModule } from '../ai/ai.module';
import { KomuListenerModule } from '../listen/komu-listener.module';

@Module({
  imports: [
    CommandModule, // For TimeControlService
    AiModule,      // For ProjectReportService
    KomuListenerModule, // For KomuDatabaseService
  ],
  providers: [CronJobService],
  exports: [CronJobService],
})
export class CronModule {}
