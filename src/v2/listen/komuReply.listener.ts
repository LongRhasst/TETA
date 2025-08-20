import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ChannelMessage, Events } from 'mezon-sdk';
import { KomuParserService } from './services/komu-parser.service';
import { KomuDatabaseService } from './services/komu-database.service';
import { number } from 'joi';

@Injectable()
export class KomuReplyListener {
  constructor(
    private readonly parserService: KomuParserService,
    private readonly databaseService: KomuDatabaseService,
  ) {}

  @OnEvent(Events.ChannelMessage)
  async handleKomuReply(message: ChannelMessage) {
    // Check if this is a KOMU daily activity
    if (!this.parserService.isKomuDailyActivity(message)) {
      return;
    }

    const messageType = this.parserService.determineMessageType(message);
    
    console.log('KOMU daily activity detected:', {
      type: messageType,
      message_id: message.message_id,
      username: message.username,
      display_name: message.display_name,
      channel_id: message.channel_id,
      clan_id: message.clan_id,
      content: this.parserService.getMessageContent(message),
      references: message.references,
      code: message.code,
    });

    try {
      // Save to database
      await this.saveToDatabase(message, messageType);
      
      return message.message_id;
    } catch (err) {
      console.error('Failed to save daily data:', err);
    }
  }

  /**
   * Save message data to database using direct upsert
   */
  private async saveToDatabase(message: ChannelMessage, messageType: string) {
    const messageId = message.message_id;
    if (!messageId) return;

    // Direct upsert without any conditions
    await this.databaseService.upsertDirectly(message, messageId, messageType);
  }

  // Delegate methods to database service
  async getData(messID: string) {
    return this.databaseService.getData(messID);
  }

  async getReportsByMember(member: string) {
    return this.databaseService.getReportsByMember(member);
  }

  async getReportsByChannel(channelId: string) {
    return this.databaseService.getReportsByChannel(channelId);
  }
}