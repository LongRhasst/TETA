import { ChannelMessage } from 'mezon-sdk';
import { MezonSendMessage } from '../../mezon/type/mezon';
import { MezonService } from '../../mezon/mezon.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { generateChannelMessageContent } from '../message';
import { AiService } from 'src/v2/ai/ai.service';

@Injectable()
export class FormService {
  constructor(
    private readonly mezonService: MezonService,
    private readonly aiService: AiService,
  ) {}

  async handleTomtat(message: ChannelMessage, story: string) {
    try {
      const processingMessage = await this.mezonService.sendChannelMessage({
        type: 'channel',
        clan_id: message.clan_id,
        reply_to_message_id: message.message_id,
        payload: {
          channel_id: message.channel_id,
          message: {
            type: 'normal_text',
            content: 'Đang tóm tắt...',
          },
        },
      });

      if (!processingMessage) return;

      const summary = await this.aiService.generateTomtat(story);

      await this.mezonService.updateMessage({
        clan_id: message.clan_id, // clan_id is now needed for updateMessage
        channel_id: processingMessage.channel_id,
        message_id: processingMessage.message_id,
        content: {
          type: 'optional',
          content: generateChannelMessageContent({
            message: summary,
            blockMessage: true,
          }),
        },
      });

    } catch (error: any) {
      console.log(error);
    }
  }
}
