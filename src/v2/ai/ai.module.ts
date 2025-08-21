import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AiService } from './ai.service';
import { SummarizeReportService } from './services/summarize-report.service';
import { ProjectReportService } from './services/project-report.service';
import { VertexAIService } from './vertex-ai.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [PrismaModule],
  providers: [
    AiService,
    SummarizeReportService,
    ProjectReportService,
    VertexAIService,
  ],
  exports: [AiService, SummarizeReportService, ProjectReportService, VertexAIService],
})
export class AiModule {}
