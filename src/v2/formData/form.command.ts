import { FormService } from './form.service';
import { MezonSendChannelMessage } from '../mezon/type/mezon';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { ChannelMessage, Events, MezonClient, EMarkdownType } from 'mezon-sdk';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MezonService } from '../mezon/mezon.service';
import { generateChannelMessageContent } from '../command/message';

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
      console.log(`Received message: ${message?.content?.t}`);

      if (message?.content?.t === '*tomtat') {
        this.logger.log('Received *tomtat command');
        await this.formService.handleTomtat(message);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  }
}
