import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ChannelMessage, Events, TypeMessage } from 'mezon-sdk';
import { promises as fs } from 'fs';
import * as path from 'path';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class KomuReplyListener {
  constructor(private readonly prisma: PrismaService) {}
  @OnEvent(Events.ChannelMessage)
  async handleKomuReply(message: ChannelMessage) {
    const content = typeof (message as any)?.content === 'string'
      ? (message as any).content
      : message?.content?.t ?? '';
    const isKomu =
      message.username?.toUpperCase?.() === 'KOMU' ||
      message.display_name?.toUpperCase?.() === 'KOMU';
    const isReply = Array.isArray(message.references) && message.references.length > 0;
    // Simplify the logic: use code as primary indicator, time difference as secondary
    const isUpdate = message.code === 1;
    const messageType = isReply ? 'reply' : isUpdate ? 'update' : 'unknown';

    // Parse referenced content if present; it may be JSON string like {"t":"*daily"}
    let refText = '';
    if (isReply) {
      const raw = message.references?.[0]?.content ?? '';
      if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          refText = typeof parsed?.t === 'string' ? parsed.t : raw;
        } catch {
          refText = raw;
        }
      }
    }

    const hasDailyInContent = /\*daily\b/i.test(content);
    const looksLikeDailyUpdate = /(daily saved|\bdate:|\byesterday:|\btoday:|\bblock:|\bworking\s*time:)/i.test(content);
    const hasDailyInRef = /\*daily\b/i.test(refText);

    if (isKomu && (hasDailyInContent || looksLikeDailyUpdate || (isReply && hasDailyInRef))) {
      console.log('KOMU daily activity detected:', {
        type: messageType,
        message_id: message.message_id,
        channel_id: message.channel_id,
        clan_id: message.clan_id,
        content,
        references: message.references,
        code: message.code,
      });

      try {
        // Save to database based on message type
        await this.saveToDatabase(message, messageType);
        
        // Also export to JSON for backup/debugging
        await this.exportToJson(message, messageType);
        
        return message.message_id;
      } catch (err) {
        console.error('Failed to save KOMU daily data:', err);
      }
    }
  }

  private async saveToDatabase(message: ChannelMessage, messageType: string) {
    const messageId = message.message_id;
    if (!messageId) return;

    const content = typeof (message as any)?.content === 'string'
      ? (message as any).content
      : message?.content?.t ?? '';

    if (messageType === 'reply') {
      // Extract preferences from reply message
      const preferences = this.extractPreferences(message);
      
      // Create new record with reply data
      await this.prisma.data_report.create({
        data: {
          message_id: messageId,
          username: message.username || '',
          channel_id: message.channel_id || '',
          clan_id: message.clan_id || '',
          ...(message.sender_id && { sender_id: message.sender_id }),
          ...(message.display_name && { display_name: message.display_name }),
          ...(preferences.project?.label && { project_label: preferences.project.label }),
          ...(preferences.project?.value && { project_value: preferences.project.value }),
          ...(preferences.task?.label && { task_label: preferences.task.label }),
          ...(preferences.task?.value && { task_value: preferences.task.value }),
          ...(preferences['type of work']?.label && { work_type: preferences['type of work'].label }),
          ...(preferences['working time'] && { default_working_time: preferences['working time'] }),
          reply_data: (message as any).content,
        },
      });

      console.log(`✅ Saved reply data for message_id: ${messageId}`);

    } else if (messageType === 'update') {
      // Extract output data from update message
      const outputData = this.extractOutputData(content);
      
      // Update the existing record with output data
      try {
        await this.prisma.data_report.update({
          where: { message_id: messageId },
          data: {
            ...(outputData.date && { date: outputData.date }),
            ...(outputData.yesterday && { yesterday: outputData.yesterday }),
            ...(outputData.today && { today: outputData.today }),
            ...(outputData.block && { block: outputData.block }),
            ...(outputData['working time'] && { working_time: outputData['working time'] }),
            update_data: (message as any).content,
          },
        });

        console.log(`✅ Updated record with output data for message_id: ${messageId}`);
      } catch (error) {
        console.error(`❌ Failed to update record for message_id: ${messageId}`, error);
        // If record doesn't exist, create it with update data only
        await this.prisma.data_report.create({
          data: {
            message_id: messageId,
            username: message.username || '',
            channel_id: message.channel_id || '',
            clan_id: message.clan_id || '',
            ...(message.sender_id && { sender_id: message.sender_id }),
            ...(message.display_name && { display_name: message.display_name }),
            ...(outputData.date && { date: outputData.date }),
            ...(outputData.yesterday && { yesterday: outputData.yesterday }),
            ...(outputData.today && { today: outputData.today }),
            ...(outputData.block && { block: outputData.block }),
            ...(outputData['working time'] && { working_time: outputData['working time'] }),
            update_data: (message as any).content,
          },
        });
        console.log(`✅ Created new record with update data for message_id: ${messageId}`);
      }
    }
  }

  private extractPreferences(message: ChannelMessage): any {
    const preferences: any = {};
    
    try {
      const embed = (message as any)?.content?.embed?.[0];
      if (embed?.fields) {
        embed.fields.forEach((field: any) => {
          if (field.inputs) {
            const fieldName = field.name.replace(':', '').toLowerCase().trim();
            if (field.inputs.component?.valueSelected) {
              preferences[fieldName] = {
                label: field.inputs.component.valueSelected.label,
                value: field.inputs.component.valueSelected.value
              };
            } else if (field.inputs.component?.defaultValue !== undefined) {
              preferences[fieldName] = field.inputs.component.defaultValue;
            }
          }
        });
      }
    } catch (error) {
      console.error('Error extracting preferences:', error);
    }
    
    return preferences;
  }

  private extractOutputData(content: string): any {
    const outputData: any = {};
    const lines = content.split('\n');
    
    lines.forEach((line: string) => {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        const key = match[1].toLowerCase().trim();
        const value = match[2].trim();
        outputData[key] = value;
      }
    });
    
    return outputData;
  }

  private async exportToJson(message: ChannelMessage, messageType: string) {
    const content = typeof (message as any)?.content === 'string'
      ? (message as any).content
      : message?.content?.t ?? '';

    const dir = path.resolve(process.cwd(), 'generated', 'komu-samples');
    await fs.mkdir(dir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const file = path.join(
      dir,
      `komu_${messageType}_${ts}_${message.message_id ?? 'unknown'}.json`,
    );
    
    const sample = {
      type: messageType,
      message_id: message.message_id,
      channel_id: message.channel_id,
      clan_id: message.clan_id,
      sender_id: message.sender_id,
      username: message.username,
      display_name: message.display_name,
      code: message.code,
      content_text: content,
      content_raw: (message as any).content,
      references: message.references,
      create_time: (message as any).create_time,
      update_time: (message as any).update_time,
    };
    
    await fs.writeFile(file, JSON.stringify(sample, null, 2), 'utf8');
  }

  async getData(messID: string) {
    // Get data from database by message_id
    const report = await this.prisma.data_report.findUnique({
      where: { message_id: messID }
    });

    if (!report) {
      throw new Error(`No data found for message_id: ${messID}`);
    }

    // Format the response to match the expected structure
    return {
      message_id: report.message_id,
      timestamp: report.create_time,
      channel_id: report.channel_id,
      clan_id: report.clan_id,
      sender_id: report.sender_id,
      username: report.username,
      display_name: report.display_name,
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

  async getAllReports() {
    // Get all reports from database
    return await this.prisma.data_report.findMany({
      orderBy: { create_time: 'desc' }
    });
  }

  async getReportsByUser(username: string) {
    // Get reports by username
    return await this.prisma.data_report.findMany({
      where: { username },
      orderBy: { create_time: 'desc' }
    });
  }

  async getReportsByChannel(channelId: string) {
    // Get reports by channel
    return await this.prisma.data_report.findMany({
      where: { channel_id: channelId },
      orderBy: { create_time: 'desc' }
    });
  }
}