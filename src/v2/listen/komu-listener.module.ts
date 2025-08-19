import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { KomuReplyListener } from './komuReply.listener';
import { KomuParserService } from './services/komu-parser.service';
import { KomuDatabaseService } from './services/komu-database.service';

@Module({
  imports: [PrismaModule],
  providers: [
    KomuReplyListener,
    KomuParserService,
    KomuDatabaseService,
  ],
  exports: [
    KomuReplyListener,
    KomuParserService,
    KomuDatabaseService,
  ],
})
export class KomuListenerModule {}
