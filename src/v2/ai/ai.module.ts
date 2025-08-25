import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AiService } from './ai.service';
import { SummarizeReportService } from './services/summarize-report.service';
import { ProjectReportService } from './services/project-report.service';
import { LMStudioService } from './lmstudio.service';

@Module({
  imports: [PrismaModule],
  providers: [
    LMStudioService,
    AiService,
    SummarizeReportService,
    ProjectReportService,
  ],
  exports: [AiService, SummarizeReportService, ProjectReportService, LMStudioService],
})
export class AiModule {}
