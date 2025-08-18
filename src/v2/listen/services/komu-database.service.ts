import { Injectable } from '@nestjs/common';
import { ChannelMessage } from 'mezon-sdk';
import { PrismaService } from '../../../prisma/prisma.service';
import { KomuPreferences, KomuOutputData, KomuMessageData } from '../types/komu.types';

@Injectable()
export class KomuDatabaseService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Handle reply message - Insert complete record
   */
  async handleReplyMessage(
    message: ChannelMessage, 
    messageId: string, 
    preferences: KomuPreferences, 
    messageSenderUsername?: string
  ) {
    await this.prisma.data_report.create({
      data: {
        ...this.buildBaseData(message, messageId),
        ...this.buildPreferencesData(preferences),
        ...(messageSenderUsername && { sender_username: messageSenderUsername }),
        reply_data: (message as any).content,
      },
    });

    console.log(`✅ Inserted complete reply record for message_id: ${messageId}`);
    if (messageSenderUsername) {
      console.log(`📝 Captured sender username: ${messageSenderUsername}`);
    }
  }

  /**
   * Handle update message - Override and fill null fields
   */
  async handleUpdateMessage(
    message: ChannelMessage, 
    messageId: string, 
    outputData: KomuOutputData
  ) {
    const currentRecord = await this.prisma.data_report.findUnique({
      where: { message_id: messageId }
    });

    if (currentRecord) {
      await this.updateExistingRecord(message, messageId, outputData, currentRecord);
    } else {
      await this.createRecordFromUpdate(message, messageId, outputData);
    }
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
   * Update existing record with override and null-fill logic
   */
  private async updateExistingRecord(
    message: ChannelMessage, 
    messageId: string, 
    outputData: KomuOutputData, 
    currentRecord: any
  ) {
    const updateFields = {
      ...this.buildOutputData(outputData),
      ...this.buildNullFillData(message, currentRecord),
      update_data: (message as any).content,
    };

    await this.prisma.data_report.update({
      where: { message_id: messageId },
      data: updateFields,
    });

    console.log(`✅ Updated record with override and null-fill for message_id: ${messageId}`);
    if (outputData.date) {
      console.log(`📅 Processed date: ${outputData.date}`);
    }
  }

  /**
   * Create new record from update data only
   */
  private async createRecordFromUpdate(
    message: ChannelMessage, 
    messageId: string, 
    outputData: KomuOutputData
  ) {
    await this.prisma.data_report.create({
      data: {
        ...this.buildBaseData(message, messageId),
        ...this.buildOutputData(outputData),
        update_data: (message as any).content,
      },
    });
    console.log(`✅ Created new record from update data for message_id: ${messageId}`);
  }

  /**
   * Build base data common for all operations
   */
  private buildBaseData(message: ChannelMessage, messageId: string): KomuMessageData {
    return {
      message_id: messageId,
      username: message.username || '',
      channel_id: message.channel_id || '',
      clan_id: message.clan_id || '',
      ...(message.sender_id && { sender_id: message.sender_id }),
      ...(message.display_name && { display_name: message.display_name }),
    };
  }

  /**
   * Build preferences data from reply message
   */
  private buildPreferencesData(preferences: KomuPreferences) {
    return {
      ...(preferences.project?.label && { project_label: preferences.project.label }),
      ...(preferences.project?.value && { project_value: preferences.project.value }),
      ...(preferences.task?.label && { task_label: preferences.task.label }),
      ...(preferences.task?.value && { task_value: preferences.task.value }),
      ...(preferences['type of work']?.label && { work_type: preferences['type of work'].label }),
      ...(preferences['working time'] && { default_working_time: preferences['working time'] }),
    };
  }

  /**
   * Build output data from update message
   */
  private buildOutputData(outputData: KomuOutputData) {
    return {
      ...(outputData.date && { date: outputData.date }),
      ...(outputData.yesterday && { yesterday: outputData.yesterday }),
      ...(outputData.today && { today: outputData.today }),
      ...(outputData.block && { block: outputData.block }),
      ...(outputData['working time'] && { working_time: outputData['working time'] }),
    };
  }

  /**
   * Build data to fill null fields only
   */
  private buildNullFillData(message: ChannelMessage, currentRecord: any) {
    const fillData: any = {};
    
    if (!currentRecord.sender_id && message.sender_id) fillData.sender_id = message.sender_id;
    if (!currentRecord.display_name && message.display_name) fillData.display_name = message.display_name;
    if (!currentRecord.username && message.username) fillData.username = message.username;
    if (!currentRecord.channel_id && message.channel_id) fillData.channel_id = message.channel_id;
    if (!currentRecord.clan_id && message.clan_id) fillData.clan_id = message.clan_id;
    
    return fillData;
  }
}
