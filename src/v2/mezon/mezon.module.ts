import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MezonClient } from 'mezon-sdk';
import { MezonService } from './mezon.service';
import { BotGateway } from '../bot/bot.gateway';
import { KomuReplyListener } from '../listen/komuReply.listener';

@Module({
  imports: [EventEmitterModule],
  providers: [
    Logger,
    {
      provide: 'MEZON',
      useFactory: async (configService: ConfigService, logger: Logger) => {
        const client = new MezonClient(
          configService.get<string>('MEZON_TOKEN'),
        );
        await client.login();
        logger.warn(`Mezon client initialized ${client.clientId}`);
        return client;
      },
      inject: [ConfigService, Logger],
    },
    BotGateway,
    KomuReplyListener,
    {
      provide: 'BOT_GATEWAY_INIT',
      useFactory: async (botGateway: BotGateway) => {
        await botGateway.initEvent();
        return botGateway;
      },
      inject: [BotGateway],
    },
    MezonService,
  ],
  exports: ['MEZON', MezonService, BotGateway],
})
export class MezonModule {}