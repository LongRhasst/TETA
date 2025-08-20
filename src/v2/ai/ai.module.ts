import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AiService } from './ai.service';
import { SummarizeReportService } from './services/summarize-report.service';
import { ProjectReportService } from './services/project-report.service';
import { ConfigService } from '@nestjs/config';
import { ChatDeepSeek } from '@langchain/deepseek';

@Module({
  imports: [PrismaModule],
  providers: [
    AiService,
    SummarizeReportService,
    ProjectReportService,
    {
      provide: 'AI',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new ChatDeepSeek({
          model: configService.get('AI_MODEL'),
          apiKey: configService.get('AI_API_KEY'),
        });
      },
    },
  ],
  exports: [AiService, SummarizeReportService, ProjectReportService],
})
export class AiModule {}
