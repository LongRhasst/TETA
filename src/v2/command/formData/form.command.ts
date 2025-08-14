import { FormService } from './form.service';
import { MezonSendChannelMessage } from '../../mezon/type/mezon';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { ChannelMessage, Events, MezonClient, EMarkdownType } from 'mezon-sdk';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MezonService } from '../../mezon/mezon.service';
import { generateChannelMessageContent } from '../message';

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
      
      if (messageContent && messageContent.startsWith('*tomtat ')) {
        const storyToSummarize = messageContent.substring('*tomtat '.length).trim();
        this.logger.log(`Received *tomtat command for: ${storyToSummarize}`);
        if (storyToSummarize) {
          await this.formService.handleTomtat(message, storyToSummarize);
        } else {
          await this.mezonService.sendChannelMessage({
            type: 'channel',
            clan_id: message.clan_id, 
            reply_to_message_id: message.message_id,
            payload: {
              channel_id: message.channel_id,
              message: {
                type: 'optional',
                content: generateChannelMessageContent({
                  message: 'Vui lòng cung cấp nội dung cần tóm tắt sau lệnh *tomtat.',
                  blockMessage: true,
                }),
              },
            },
          });
        }
      }
    } catch (error: any) {
      console.log(error.message);
    }
  }
}
