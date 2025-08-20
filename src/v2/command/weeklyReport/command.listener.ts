import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ChannelMessage, Events } from 'mezon-sdk';
import { CommandHandler } from './command.handler';
import { MezonService } from '../../mezon/mezon.service';

@Injectable()
export class CommandListener {
  constructor(
    private readonly mezonService: MezonService,
    private readonly commandHandler: CommandHandler,
  ) {}

  @OnEvent(Events.ChannelMessage)
  async handleChannelMessage(message: ChannelMessage) {
    try {
      // Chỉ xử lý commands, không phải từ bot
      if (message.username === 'KOMU') return;
      
      // Kiểm tra xem có phải command không
      if (!this.commandHandler.isCommand(message)) return;

      console.log(`Processing command from ${message.username}: ${this.extractMessageContent(message)}`);
      
      // Xử lý command
      const response = await this.commandHandler.handleCommand(message);
      
      if (response) {
        // Gửi response về channel sử dụng MezonService
        await this.mezonService.sendChannelMessage({
          type: 'channel',
          clan_id: message.clan_id,
          payload: {
            channel_id: message.channel_id,
            message: {
              type: 'optional',
              content: response
            }
          }
        });
        
        console.log(`Command processed successfully for ${message.username}`);
      }
    } catch (error) {
      console.error(' Error processing command:', error);
      
      // Gửi error message
      try {
        await this.mezonService.sendChannelMessage({
          type: 'channel',
          clan_id: message.clan_id,
          payload: {
            channel_id: message.channel_id,
            message: {
              type: 'system',
              content: ' Có lỗi xảy ra khi xử lý command. Vui lòng thử lại sau.'
            }
          }
        });
      } catch (sendError) {
        console.error('Failed to send error message:', sendError);
      }
    }
  }

  /**
   * Extract message content để log
   */
  private extractMessageContent(message: ChannelMessage): string {
    if (typeof (message as any)?.content === 'string') {
      return (message as any).content;
    }
    
    if (message?.content?.t) {
      return message.content.t;
    }
    
    return 'Unknown content format';
  }
}
