import { MezonSendChannelMessage } from '../mezon/type/mezon';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { ChannelMessage, Events, MezonClient } from 'mezon-sdk';
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
    this.logger.log(`Listening for event: ${Events.ChannelMessage}`);
  }

  @OnEvent(Events.ChannelMessage)
  async handleChannelMessage(message: ChannelMessage) {
    this.logger.log(`Received message: ${message?.content?.t}`);
    
    if (message?.content?.t === '*tomtat') {
      this.logger.log('Received *tomtat command');

      let responseMessage = 'Dữ liệu tóm tắt:';
      this.formData.forEach((item, index) => {
        responseMessage += `\n${index + 1}. Username: ${item.username}, Data: ${item.data}`;
      });

      try {
        const data: MezonSendChannelMessage = {
          type: 'channel',
          clan_id: message.clan_id,
          payload: {
            channel_id: message.channel_id,
            message: {
              type: 'normal_text',
              content: responseMessage
            }
          }
        };
        
        this.logger.log('Sending response message...');
        await this.mezonService.sendChannelMessage(data);
        this.logger.log('Response message sent successfully');
      } catch (error) {
        this.logger.error('Error sending message:', error);
      }
    }  
  }
}
