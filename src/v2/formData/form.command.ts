/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { ChannelMessage, Events, MezonClient, ChannelMessageContent, EMarkdownType } from 'mezon-sdk';
// Import EButtonMessageStyle, EMessageComponentType if needed for interactive forms later
// import { EButtonMessageStyle, EMessageComponentType } from 'mezon-sdk';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MezonService } from '../mezon/mezon.service';

export interface FormDataProps {
  username: string;
  data: string;
}

@Injectable()
export class FormCommand {
  private readonly logger = new Logger(FormCommand.name);
  private readonly client: MezonClient;

  private formData: FormDataProps[] = [
    {
      username: 'Hieu',
      data: 'Hom nay deo lam duoc gi !',
    },
    {
      username: 'Long',
      data: 'Hom nay giong thang o tren!',
    },
    {
      username: 'Luc',
      data: 'Hom nay cung the deo lam duoc gi !',
    },
  ];

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly mezonService: MezonService,
  ) {
    this.client = mezonService.getClient();
  }

  @OnEvent(Events.ChannelMessage)
  async handleChannelMessage(message: ChannelMessage) {
    if (message.content.t === '*tomtat') {
      this.logger.log('Received *tomtat command');

      let responseMessage = 'Dữ liệu tóm tắt:';
      this.formData.forEach((item, index) => {
        responseMessage += `\n${index + 1}. Username: ${item.username}, Data: ${item.data}`;
      });

      const messageContent: ChannelMessageContent = {
        t: responseMessage,
        mk: [
          { type: EMarkdownType.TRIPLE, s: 0, e: 'Dữ liệu tóm tắt:'.length },
        ],
      };

      try {
        await this.mezonService.sendChannelMessage(message.channel_id, messageContent, message.message_id);
      } catch (error) {
        this.logger.error('Error sending message:', error);
      }
    }  
  }
}
