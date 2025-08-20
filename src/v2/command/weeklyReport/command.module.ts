import { Module } from '@nestjs/common';
import { CommandHandler } from './command.handler';
import { CommandListener } from './command.listener';
import { WeeklyReportModule } from './weekly-report.module';
import { MezonModule } from '../../mezon/mezon.module';

@Module({
  imports: [WeeklyReportModule, MezonModule],
  providers: [CommandHandler, CommandListener],
  exports: [CommandHandler, CommandListener],
})
export class CommandModule {}
