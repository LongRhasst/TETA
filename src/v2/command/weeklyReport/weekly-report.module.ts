import { Module } from '@nestjs/common';
import { WeeklyReportService } from './weekly-report.service';
import { TimeControlService } from './timeControl/time-control.service';
import { CommandHandler } from './command.handler';
import { AiModule } from '../../ai/ai.module';
import { KomuListenerModule } from '../../listen/komu-listener.module';
import { MezonModule } from '../../mezon/mezon.module';

@Module({
  imports: [AiModule, KomuListenerModule, MezonModule],
  providers: [WeeklyReportService, TimeControlService, CommandHandler],
  exports: [WeeklyReportService, TimeControlService, CommandHandler],
})
export class WeeklyReportModule {}
