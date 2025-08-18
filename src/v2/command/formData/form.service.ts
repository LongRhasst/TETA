import { Injectable } from '@nestjs/common';
import { ChannelMessage } from 'mezon-sdk';
import { MezonService } from '../../mezon/mezon.service';
import { KomuReplyListener } from '../../listen/komuReply.listener';
import { AiService } from '../../ai/ai.service';
import { generateChannelMessageContent } from '../message';

@Injectable()
export class FormService {
  constructor(
    private readonly mezonService: MezonService,
    private readonly komuListener: KomuReplyListener,
    private readonly aiService: AiService,
  ) {}

  /**
   * Xử lý command *weeklyReport
   */
  async handleWeeklyReport(message: ChannelMessage) {
    try {
      const currentWeekData = await this.getCurrentWeekData();

      if (!currentWeekData.length) {
        await this.mezonService.sendChannelMessage({
          type: 'channel',
          clan_id: message.clan_id,
          reply_to_message_id: message.message_id,
          payload: {
            channel_id: message.channel_id,
            message: {
              type: 'normal_text',
              content: 'Không có dữ liệu daily nào trong tuần này để tóm tắt.',
            },
          },
        });
        return;
      }

      const formattedData = this.formatDataForWeeklyReport(currentWeekData);
      const summary =
        await this.aiService.generateSummarizeReport(formattedData);

      await this.mezonService.sendChannelMessage({
        type: 'channel',
        clan_id: message.clan_id,
        reply_to_message_id: message.message_id,
        payload: {
          channel_id: message.channel_id,
          message: {
            type: 'normal_text',
            content: summary,
          },
        },
      });
    } catch (error) {
      console.error('Error generating weekly report:', error);
      await this.mezonService.sendChannelMessage({
        type: 'channel',
        clan_id: message.clan_id,
        reply_to_message_id: message.message_id,
        payload: {
          channel_id: message.channel_id,
          message: {
            type: 'normal_text',
            content:
              'Có lỗi xảy ra khi tạo báo cáo tuần. Vui lòng thử lại sau.',
          },
        },
      });
    }
  }

  /**
   * Lấy dữ liệu trong tuần hiện tại từ Komu
   */
  private async getCurrentWeekData() {
    const allReports = await this.komuListener.getAllReports();
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Chủ nhật là đầu tuần
    startOfWeek.setHours(0, 0, 0, 0);

    return allReports.filter((report) => {
      const reportDate = new Date(report.create_time);
      return reportDate >= startOfWeek && reportDate <= now;
    });
  }

  /**
   * Format dữ liệu để gửi cho AI
   */
  private formatDataForWeeklyReport(reports: any[]): string {
    let formattedData = '';

    reports.forEach((report) => {
      if (report.date && report.yesterday && report.today) {
        formattedData += `- *daily ${report.date}*\n`;
        formattedData += `Project: ${report.project_value || 'N/A'}\n`;
        formattedData += `Yesterday: ${report.yesterday}\n`;
        formattedData += `Today: ${report.today}\n`;
        if (report.block) {
          formattedData += `Block: ${report.block}\n`;
        }
        formattedData += '\n';
      }

      if (report.working_time) {
        formattedData += `- Timesheet ${report.date || 'N/A'}\n`;
        formattedData += `Project: ${report.project_value || 'N/A'}\n`;
        formattedData += `Task: ${report.task_value || 'N/A'}\n`;
        formattedData += `Note: ${report.today || 'Daily work'}\n`;
        formattedData += `Time: ${report.working_time}\n`;
        formattedData += `Type: normal\n\n`;
      }
    });

    return formattedData;
  }
}
