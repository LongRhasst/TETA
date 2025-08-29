import { Injectable } from '@nestjs/common';
import { ChannelMessage } from 'mezon-sdk';
import { PrismaService } from '../../../prisma/prisma.service';
import { KomuMessageData } from '../types/komu.types';
import { KomuParserService } from './komu-parser.service';
import { COMMAND_CODES } from '../../constants/command-codes';

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

    // Check validation status based on message content
    const messageContent = (message as any).content;
    const hasInvalidTimeFrame = this.checkForInvalidTimeFrame(messageContent);
    completeData.daily_late = hasInvalidTimeFrame; // true if invalid/late, false if valid/on-time

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
        completeData.member = messageSenderUsername || null;
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
        
        // Check if update data contains invalid time frame (set as late if invalid)
        if (this.checkForInvalidTimeFrame((message as any).content)) {
          completeData.daily_late = true;
        }
      } catch (e) {
        console.log('Could not extract output data from update, continuing...');
        completeData.update_data = (message as any).content;
        
        // Also check validation for error case
        if (this.checkForInvalidTimeFrame((message as any).content)) {
          completeData.daily_late = true;
        }
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

    console.log(`✅ Direct upsert completed for ${messageType} message_id: ${messageId} (late: ${completeData.daily_late})`);
    
    if (completeData.daily_late) {
      console.log(`⚠️  Invalid time frame detected in message_id: ${messageId}`);
    }
  }

  /**
   * Check if report already exists for given time and command code
   */
  async checkReportExists(commandCode: number, startDate: Date, endDate: Date): Promise<any | null> {
    try {
      const existingReport = await this.prisma.report_log.findFirst({
        where: {
          code: commandCode,
          create_time: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          create_time: 'desc'
        }
      });
      return existingReport;
    } catch (error) {
      console.error('Error checking existing report:', error);
      return null;
    }
  }

  /**
   * Get existing report as JSON string
   */
  async getExistingReportAsJson(reportId: number): Promise<string> {
    try {
      const report = await this.prisma.report_log.findUnique({
        where: { id: reportId }
      });
      
      if (!report) {
        throw new Error(`Report not found with id: ${reportId}`);
      }

      // Convert report back to JSON format similar to AI output
      const reportJson = {
        project_name: report.project_name,
        member: report.member,
        progress: report.progress,
        customer_communication: report.customer_communication,
        human_resource: report.human_resource,
        profession: report.profession,
        technical_solution: report.technical_solution,
        testing: report.testing,
        milestone: report.milestone,
        week_goal: report.week_goal,
        issue: report.issue,
        risks: report.risks
      };

      return JSON.stringify(reportJson, null, 2);
    } catch (error) {
      console.error('Error getting existing report:', error);
      throw error;
    }
  }

  /**
   * Save database output report
   */
  async saveProjectReport(reportJson: string, commandCode?: number){
    try {
      // Parse JSON string to object
      const report = JSON.parse(reportJson);
      // Use provided command code or default to WEEKLY_REPORT
      const code = commandCode || COMMAND_CODES.WEEKLY_REPORT;
      
      // Save to report_log table với proper structure
      await this.prisma.report_log.create({
        data: {
          project_name: report.project_name || '',
          member: report.member || '',
          progress: report.progress || '',
          customer_communication: report.customer_communication || '',
          human_resource: report.human_resource || '',
          profession: report.profession || '',
          technical_solution: report.technical_solution || '',
          testing: report.testing || '',
          milestone: report.milestone || '',
          week_goal: report.week_goal || '',
          issue: report.issue || '',
          risks: report.risks || '',
          code: code, // Command type code
        }
      });
    } catch (error) {
      console.error('Error saving project report:', error);
      throw error;
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
      display_name: report.display_name,
      member: report.member,
      daily_late: report.daily_late,
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
  async getAllReportsByTime(time: number) {
    return await this.prisma.data_report.findMany({
      orderBy: { create_time: 'desc' }
    });
  }

  /**
   * Get reports by channel with time filter
   */
  async getReportsByChannelAndTime(channelId: string, timeFilter: any) {
    return await this.prisma.data_report.findMany({
      where: {
        channel_id: channelId,
        ...timeFilter
      },
      orderBy: { create_time: 'desc' }
    });
  }

  /**
   * Get reports by member with time filter
   */
  async getReportsByMemberAndTime(member: string, timeFilter: any) {
    return await this.prisma.data_report.findMany({
      where: {
        member,
        ...timeFilter
      },
      orderBy: { create_time: 'desc' }
    });
  }

  /**
   * Get all reports with time filter
   */
  async getAllReportsWithTimeFilter(timeFilter: any) {
    return await this.prisma.data_report.findMany({
      where: timeFilter,
      orderBy: { create_time: 'desc' }
    });
  }

  /**
   * Get reports by member
   */
  async getReportsByMember(member: string) {
    return await this.prisma.data_report.findMany({
      where: { member },
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
   * Get invalid reports (containing time frame errors)
   */
  async getInvalidReports() {
    return await this.prisma.data_report.findMany({
      where: { daily_late: true },
      orderBy: { create_time: 'desc' }
    });
  }

  /**
   * Get reports by validation status
   */
  async getReportsByValidation(isValid: boolean) {
    return await this.prisma.data_report.findMany({
      where: { daily_late: !isValid }, // daily_late true = invalid, false = valid
      orderBy: { create_time: 'desc' }
    });
  }

  /**
   * Build base data common for all operations - direct assignment without filtering
   */
  private buildBaseData(message: ChannelMessage, messageId: string): KomuMessageData {
    return {
      message_id: messageId,
      channel_id: message.channel_id || '',
      clan_id: message.clan_id || '',
      sender_id: message.sender_id || undefined,
      display_name: message.display_name || undefined,
    };
  }
  /**
   * Query if reports was existed before 
   */
  private async queryReport(commandCode: number, timeFilter: any): Promise<boolean> {
    // Query report_log table instead of data_report since code column is there
    try {
      const existingReport = await this.prisma.report_log.findFirst({
        where: {
          code: commandCode,
          create_time: timeFilter
        }
      });
      return existingReport !== null;
    } catch (error) {
      console.error('Error querying report:', error);
      return false;
    }
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

  /**
   * Check if message contains invalid time frame error
   */
  private checkForInvalidTimeFrame(messageContent: any): boolean {
    if (!messageContent) return false;
    
    // Convert to string for checking
    const contentStr = typeof messageContent === 'string' 
      ? messageContent 
      : JSON.stringify(messageContent);
    
    // Check for the specific error message
    const invalidTimeFramePattern = /Invalid daily time frame.*Please daily at.*not daily.*time/i;
    return invalidTimeFramePattern.test(contentStr);
  }

  /**
   * Clean up old reports and data to free up space
   * @param cutoffDate - Delete data older than this date
   * @returns Number of deleted records
   */
  async cleanupOldReports(cutoffDate: Date): Promise<number> {
    try {
      // Delete old daily reports
      const deletedDataReports = await this.prisma.data_report.deleteMany({
        where: {
          create_time: {
            lt: cutoffDate
          }
        }
      });

      // Delete old weekly reports logs
      const deletedReportLogs = await this.prisma.report_log.deleteMany({
        where: {
          create_time: {
            lt: cutoffDate
          }
        }
      });

      const totalDeleted = deletedDataReports.count + deletedReportLogs.count;
      
      console.log(`Cleanup completed: ${deletedDataReports.count} data reports, ${deletedReportLogs.count} report logs deleted`);
      
      return totalDeleted;
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  }
}
