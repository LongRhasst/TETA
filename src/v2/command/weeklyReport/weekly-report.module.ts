import { Module } from '@nestjs/common';
import { WeeklyReportService } from './weekly-report.service';
import { AiModule } from '../../ai/ai.module';
import { KomuListenerModule } from '../../listen/komu-listener.module';

@Module({
  imports: [AiModule, KomuListenerModule],
  providers: [WeeklyReportService],
  exports: [WeeklyReportService],
})
export class WeeklyReportModule {}
