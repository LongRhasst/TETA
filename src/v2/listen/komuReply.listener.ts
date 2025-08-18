import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ChannelMessage, Events } from 'mezon-sdk';
import { KomuParserService } from './services/komu-parser.service';
import { KomuDatabaseService } from './services/komu-database.service';
import { KomuExportService } from './services/komu-export.service';

@Injectable()
export class KomuReplyListener {
  constructor(
    private readonly parserService: KomuParserService,
    private readonly databaseService: KomuDatabaseService,
    private readonly exportService: KomuExportService,
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
      channel_id: message.channel_id,
      clan_id: message.clan_id,
      content: this.parserService.getMessageContent(message),
      references: message.references,
      code: message.code,
    });

    try {
      // Save to database
      await this.saveToDatabase(message, messageType);
      
      // Export to JSON for backup/debugging
      // await this.exportService.exportToJson(message, messageType);
      
      return message.message_id;
    } catch (err) {
      console.error('Failed to save KOMU daily data:', err);
    }
  }

  /**
   * Save message data to database based on message type
   */
  private async saveToDatabase(message: ChannelMessage, messageType: string) {
    const messageId = message.message_id;
    if (!messageId) return;

    if (messageType === 'reply') {
      const preferences = this.parserService.extractPreferences(message);
      const messageSenderUsername = this.parserService.extractSenderUsername(message);
      
      await this.databaseService.handleReplyMessage(
        message, 
        messageId, 
        preferences, 
        messageSenderUsername
      );
    } else if (messageType === 'update') {
      const content = this.parserService.getMessageContent(message);
      const outputData = this.parserService.extractOutputData(content);
      
      await this.databaseService.handleUpdateMessage(message, messageId, outputData);
    }
  }

  // Delegate methods to database service
  async getData(messID: string) {
    return this.databaseService.getData(messID);
  }

  async getAllReports() {
    return this.databaseService.getAllReports();
  }

  async getReportsByUser(username: string) {
    return this.databaseService.getReportsByUser(username);
  }

  async getReportsByChannel(channelId: string) {
    return this.databaseService.getReportsByChannel(channelId);
  }
}