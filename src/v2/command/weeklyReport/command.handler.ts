import { Injectable } from '@nestjs/common';
import { ChannelMessage, ChannelMessageContent } from 'mezon-sdk';
import { WeeklyReportService } from './weekly-report.service';
import { TimeControlService } from './timeControl/time-control.service';
import { MezonService } from '../../mezon/mezon.service';
import { generateChannelMessageContent } from '../message';

@Injectable()
export class CommandHandler {
  constructor(
    private readonly weeklyReportService: WeeklyReportService,
    private readonly timeControlService: TimeControlService,
    private readonly mezonService: MezonService
  ) {}

  /**
   * Xử lý các commands từ message
   */
  async handleCommand(message: ChannelMessage): Promise<ChannelMessageContent | null> {
    const content = this.extractMessageContent(message);
    
    if (!content) return null;

    // Parse command với time parameter
    const commandData = this.timeControlService.validateAndNormalizeCommand(content);
    
    if (!commandData) return null;

    if (!commandData.isValid) {
      return generateChannelMessageContent({
        message: '```\nTime parameter không hợp lệ. Sử dụng 0-12 (0: tuần hiện tại, 1: tuần trước, ..., tối đa 12 tuần = 3 tháng)\n```',
        blockMessage: true,
      });
    }

    const { commandName, time } = commandData;
    const channelId = message.channel_id;
    const clanId = message.clan_id;

    // Tạo thông tin thời gian
    const timeRange = this.timeControlService.calculateTimeRange(time);
    const dateRangeStr = this.timeControlService.formatDateRange(timeRange.startDate, timeRange.endDate);
    const timeDescription = this.timeControlService.getTimeDescription(time);

    // Tạo và gửi thông báo "đang xử lý"
    let processingMessage: any = null;
    try {
      const processingContent = this.generateProcessingMessage(commandName, timeDescription, dateRangeStr);
      
      processingMessage = await this.mezonService.sendChannelMessage({
        type: 'channel',
        clan_id: clanId,
        payload: {
          channel_id: channelId,
          message: {
            type: 'system',
            content: processingContent.t || ''
          }
        }
      });

      console.log(`Đã gửi thông báo xử lý cho ${commandName} - Message ID: ${processingMessage.message_id}`);
    } catch (error) {
      console.error('Lỗi khi gửi thông báo xử lý:', error);
    }

    // Xử lý command và tạo báo cáo
    let finalResult: ChannelMessageContent | null = null;
    
    switch (commandName) {
      case '*weeklyuserreport':
        console.log(`Bắt đầu tạo báo cáo tổng hợp team cho ${timeDescription} (${dateRangeStr})`);
        finalResult = await this.weeklyReportService.handleWeeklyUserReport(channelId, time);
        break;
      
      case '*weeklyreport':
        console.log(`Bắt đầu tạo báo cáo đánh giá dự án cho ${timeDescription} (${dateRangeStr})`);
        finalResult = await this.weeklyReportService.handleWeeklyReport(channelId, time);
        break;
      
      case '*reportstats':
        console.log(`Bắt đầu tạo thống kê báo cáo cho ${timeDescription} (${dateRangeStr})`);
        finalResult = await this.weeklyReportService.handleReportStats(channelId, time);
        break;
      
      case '*help':
        finalResult = this.generateHelpMessage();
        break;

      default:
        return null; // Không phải command được hỗ trợ
    }

    // Update tin nhắn với kết quả cuối cùng
    if (processingMessage && finalResult && commandName !== '*help') {
      try {
        await this.mezonService.updateMessage({
          clan_id: clanId,
          channel_id: channelId,
          message_id: processingMessage.message_id,
          content: {
            type: 'system',
            content: finalResult.t || ''
          }
        });

        console.log(`Đã cập nhật tin nhắn với báo cáo hoàn thành - Message ID: ${processingMessage.message_id}`);
        
        // Return null vì đã update tin nhắn rồi
        return null;
      } catch (error) {
        console.error('Lỗi khi cập nhật tin nhắn:', error);
        // Nếu update lỗi, vẫn return kết quả để gửi tin nhắn mới
        return finalResult;
      }
    }

    return finalResult;
  }

  /**
   * Kiểm tra xem message có phải là command không
   */
  isCommand(message: ChannelMessage): boolean {
    const content = this.extractMessageContent(message);
    return content ? content.trim().startsWith('*') : false;
  }

  /**
   * Extract message content từ các format khác nhau
   */
  private extractMessageContent(message: ChannelMessage): string | null {
    if (typeof (message as any)?.content === 'string') {
      return (message as any).content;
    }
    
    if (message?.content?.t) {
      return message.content.t;
    }
    
    return null;
  }

  /**
   * Tạo thông báo "đang xử lý"
   */
  private generateProcessingMessage(commandName: string, timeDescription: string, dateRangeStr: string): ChannelMessageContent {
    let reportType = '';
    let icon = '';
    
    switch (commandName) {
      case '*weeklyuserreport':
        reportType = 'Báo cáo tổng hợp team';
        break;
      case '*weeklyreport':
        reportType = 'Báo cáo đánh giá dự án';
        break;
      case '*reportstats':
        reportType = 'Thống kê báo cáo';
        break;
      default:
        reportType = 'Báo cáo';
    }

    const processingText = `${icon} ${reportType} đang được tạo...

Đang xử lý dữ liệu cho ${timeDescription}
Thời gian: ${dateRangeStr}

Vui lòng chờ trong giây lát...`;

    return generateChannelMessageContent({
      message: processingText,
      blockMessage: true,
    });
  }

  /**
   * Tạo help message
   */
  private generateHelpMessage(): ChannelMessageContent {
    const helpText = `DANH SÁCH COMMANDS

Báo cáo (với tham số thời gian):
• *weeklyUserReport [time] - Báo cáo tổng hợp team
• *weeklyReport [time] - Báo cáo đánh giá dự án theo 12 tiêu chí  
• *reportStats [time] - Thống kê báo cáo

Hỗ trợ:
• *help - Hiển thị danh sách commands

Tham số thời gian [time]:
• 0 - Tuần hiện tại (mặc định)
• 1 - Tuần trước
• 2 - 2 tuần trước
• ... 
• 12 - 12 tuần trước (tối đa 3 tháng)

Ví dụ:
• *weeklyReport - Báo cáo tuần hiện tại
• *weeklyReport 1 - Báo cáo tuần trước
• *weeklyUserReport 3 - Báo cáo thành viên 3 tuần trước

Tính năng mới:
Thông báo "báo cáo đang được tạo cho [ngày/tháng/năm] đến [ngày/tháng/năm]"
Kiểm tra data theo tuần - nếu không có: "không có dữ liệu trong tuần được đề cập"
Hiển thị khoảng thời gian cụ thể trong tất cả báo cáo
Gửi thông báo "đang xử lý" và cập nhật tin nhắn khi hoàn thành

Lưu ý:
- Commands chỉ hoạt động với dữ liệu daily reports đã được lưu trong hệ thống
- Báo cáo sẽ được tạo dựa trên dữ liệu từ các channel tương ứng
- Sử dụng *weeklyUserReport cho báo cáo tổng hợp team
- Sử dụng *weeklyReport cho báo cáo đánh giá dự án chi tiết
- Giới hạn thời gian tối đa là 3 tháng (12 tuần)
- Tuần tính từ Thứ 2 đến Chủ nhật`;

    return generateChannelMessageContent({
      message: `\n${helpText}\n`,
      blockMessage: true,
    });
  }
}
