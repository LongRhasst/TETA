import { Injectable, Logger } from '@nestjs/common';
import { ChannelMessage, Events, MezonClient } from 'mezon-sdk';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MezonService } from '../../mezon/mezon.service';
import { FormService } from './form.service';

@Injectable()
export class FormCommand {
  private readonly logger = new Logger(FormCommand.name);
  private readonly mezonClient: MezonClient;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly mezonService: MezonService,
    private readonly formService: FormService,
  ) {
    this.mezonClient = mezonService.getClient();
    this.logger.log(`Listening for event: ${Events.ChannelMessage}`);
  }

  @OnEvent(Events.ChannelMessage)
  async handleChannelMessage(message: ChannelMessage) {
    try {
      const messageContent = message?.content?.t;

      if (messageContent?.startsWith('*weeklyReport')) {
        this.logger.log(`Received *weeklyReport command`);
        await this.formService.handleWeeklyReport(message);
      }
    } catch (error: any) {
      this.logger.error(error.message);
    }
  }
}
