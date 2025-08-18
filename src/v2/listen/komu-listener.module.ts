import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { KomuReplyListener } from './komuReply.listener';
import { KomuParserService } from './services/komu-parser.service';
import { KomuDatabaseService } from './services/komu-database.service';
import { KomuExportService } from './services/komu-export.service';

@Module({
  imports: [PrismaModule],
  providers: [
    KomuReplyListener,
    KomuParserService,
    KomuDatabaseService,
    KomuExportService,
  ],
  exports: [
    KomuReplyListener,
    KomuParserService,
    KomuDatabaseService,
    KomuExportService,
  ],
})
export class KomuListenerModule {}
