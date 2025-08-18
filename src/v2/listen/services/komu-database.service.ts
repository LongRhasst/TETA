import { Injectable } from '@nestjs/common';
import { ChannelMessage } from 'mezon-sdk';
import { PrismaService } from '../../../prisma/prisma.service';
import { KomuMessageData } from '../types/komu.types';
import { KomuParserService } from './komu-parser.service';

@Injectable()
export class KomuDatabaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parserService: KomuParserService
  ) {}

  /**
   * Direct upsert without any conditions - simple and straightforward
   */
  async upsertDirectly(
    message: ChannelMessage, 
    messageId: string, 
    messageType: string
  ) {
    // Start with base data
    const completeData: any = {
      ...this.buildBaseData(message, messageId),
    };

    // Add message type specific data and raw content
    if (messageType === 'reply') {
      try {
        const preferences = this.parserService.extractPreferences(message);
        const messageSenderUsername = this.parserService.extractSenderUsername(message);
        
        // Add preferences data directly
        completeData.project_label = preferences.project?.label || null;
        completeData.project_value = preferences.project?.value || null;
        completeData.task_label = preferences.task?.label || null;
        completeData.task_value = preferences.task?.value || null;
        completeData.work_type = preferences['type of work']?.label || null;
        completeData.default_working_time = preferences['working time'] || null;
        completeData.sender_username = messageSenderUsername || null;
        completeData.reply_data = (message as any).content;
      } catch (e) {
        console.log('Could not extract preferences from reply, continuing...');
        completeData.reply_data = (message as any).content;
      }
    } else if (messageType === 'update') {
      try {
        const content = this.parserService.getMessageContent(message);
        const outputData = this.parserService.extractOutputData(content);
        
        // Add output data directly
        completeData.date = outputData.date || null;
        completeData.yesterday = outputData.yesterday || null;
        completeData.today = outputData.today || null;
        completeData.block = outputData.block || null;
        completeData.working_time = outputData['working time'] || null;
        completeData.update_data = (message as any).content;
      } catch (e) {
        console.log('Could not extract output data from update, continuing...');
        completeData.update_data = (message as any).content;
      }
    }

    // Filter out null/undefined values for update operation
    const updateData = this.filterNullValues(completeData);

    // Upsert with filtered data for update, complete data for create
    await this.prisma.data_report.upsert({
      where: { message_id: messageId },
      update: updateData, // Only non-null values for update
      create: completeData, // All data for create
    });

    console.log(`✅ Direct upsert completed for ${messageType} message_id: ${messageId}`);
  }

  /**
   * Get data by message ID
   */
  async getData(messID: string) {
    const report = await this.prisma.data_report.findUnique({
      where: { message_id: messID }
    });

    if (!report) {
      throw new Error(`No data found for message_id: ${messID}`);
    }

    return {
      message_id: report.message_id,
      timestamp: report.create_time,
      channel_id: report.channel_id,
      clan_id: report.clan_id,
      sender_id: report.sender_id,
      username: report.username,
      display_name: report.display_name,
      sender_username: report.sender_username,
      preferences: {
        project: report.project_label && report.project_value ? {
          label: report.project_label,
          value: report.project_value
        } : null,
        task: report.task_label && report.task_value ? {
          label: report.task_label,
          value: report.task_value
        } : null,
        'working time': report.default_working_time,
        'type of work': report.work_type
      },
      output: {
        date: report.date,
        yesterday: report.yesterday,
        today: report.today,
        block: report.block,
        'working time': report.working_time
      },
      raw_data: {
        reply: report.reply_data,
        update: report.update_data
      }
    };
  }

  /**
   * Get all reports from database
   */
  async getAllReports() {
    return await this.prisma.data_report.findMany({
      orderBy: { create_time: 'desc' }
    });
  }

  /**
   * Get reports by username
   */
  async getReportsByUser(username: string) {
    return await this.prisma.data_report.findMany({
      where: { username },
      orderBy: { create_time: 'desc' }
    });
  }

  /**
   * Get reports by channel
   */
  async getReportsByChannel(channelId: string) {
    return await this.prisma.data_report.findMany({
      where: { channel_id: channelId },
      orderBy: { create_time: 'desc' }
    });
  }

  /**
   * Build base data common for all operations - direct assignment without filtering
   */
  private buildBaseData(message: ChannelMessage, messageId: string): KomuMessageData {
    return {
      message_id: messageId,
      username: message.username || '',
      channel_id: message.channel_id || '',
      clan_id: message.clan_id || '',
      sender_id: message.sender_id || undefined,
      display_name: message.display_name || undefined,
    };
  }

  /**
   * Filter out null, undefined, and empty string values from object
   */
  private filterNullValues(obj: any): any {
    const filtered: any = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== null && value !== undefined && value !== '') {
        filtered[key] = value;
      }
    });
    return filtered;
  }
}
