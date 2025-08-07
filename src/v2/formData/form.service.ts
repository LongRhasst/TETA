import { ChannelMessage } from 'mezon-sdk';
import { MezonSendMessage } from '../mezon/type/mezon';
import { MezonService } from './../mezon/mezon.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { generateChannelMessageContent } from '../command/message';

@Injectable()
export class FormService {
  constructor(private readonly mezonService: MezonService) {}

  async handleTomtat(message: ChannelMessage) {
    try {
      console.log('FormService: sending reply...', message.content);
      await this.mezonService.sendChannelMessage({
        type: 'channel',
        clan_id: message.clan_id,
        reply_to_message_id: message.message_id,
        payload: {
          channel_id: message.channel_id,
          message: {
            type: 'optional',
            content: generateChannelMessageContent({
              message: 'Long nguuuuu',
              blockMessage: true,
            }),
          },
        },
      });
      console.log('FormService: message sent.', message.content);
    } catch (error: any) {
      console.log(error);
    }
  }
}
