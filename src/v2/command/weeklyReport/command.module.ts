import { Module } from '@nestjs/common';
import { CommandHandler } from './command.handler';
import { CommandListener } from './command.listener';
import { TimeControlService } from './timeControl/time-control.service';
import { WeeklyReportModule } from './weekly-report.module';
import { MezonModule } from '../../mezon/mezon.module';

@Module({
  imports: [WeeklyReportModule, MezonModule],
  providers: [CommandHandler, CommandListener, TimeControlService],
  exports: [CommandHandler, CommandListener, TimeControlService],
})
export class CommandModule {}
