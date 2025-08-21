import { Module } from '@nestjs/common';
import { VertexAIService } from './vertex-ai.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	providers: [
    VertexAIService
  ],
	exports: [VertexAIService],
})
export class AiModule {}
