import { Injectable } from '@nestjs/common';
import { ChannelMessage, ChannelMessageContent } from 'mezon-sdk';
import { WeeklyReportService } from './weekly-report.service';
import { generateChannelMessageContent } from './message';

@Injectable()
export class CommandHandler {
  constructor(private readonly weeklyReportService: WeeklyReportService) {}

  /**
   * Xử lý các commands từ message
   */
  async handleCommand(message: ChannelMessage): Promise<ChannelMessageContent | null> {
    const content = this.extractMessageContent(message);
    
    if (!content) return null;

    const command = content.trim().toLowerCase();
    const channelId = message.channel_id;

    switch (command) {
      case '*weeklyuserreport':
        return await this.weeklyReportService.handleWeeklyUserReport(channelId);
      
      case '*weeklyreport':
        return await this.weeklyReportService.handleWeeklyReport(channelId);
      
      case '*weeklyreportall':
        return await this.weeklyReportService.handleWeeklyReportAll();
      
      case '*reportstats':
        return await this.weeklyReportService.handleReportStats(channelId);
      
      case '*help':
      case '*commands':
        return this.generateHelpMessage();
      
      default:
        return null; // Không phải command được hỗ trợ
    }
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
   * Tạo help message
   */
  private generateHelpMessage(): ChannelMessageContent {
    const helpText = `DANH SÁCH COMMANDS

Báo cáo:
• *weeklyUserReport - Báo cáo cho từng thanh viên
• *weeklyReport - Báo cáo đánh giá dự án theo 12 tiêu chí (channel hiện tại)
• *weeklyReportAll - Báo cáo tổng hợp tất cả dự án
• *reportStats - Thống kê báo cáo (channel hiện tại)

Hỗ trợ:
• *help hoặc *commands - Hiển thị danh sách commands

Lưu ý:
- Commands chỉ hoạt động với dữ liệu daily reports đã được lưu trong hệ thống
- Báo cáo sẽ được tạo dựa trên dữ liệu từ các channel tương ứng
- Sử dụng *weeklyUserReport cho báo cáo tổng hợp team
- Sử dụng *weeklyReport cho báo cáo đánh giá dự án chi tiết`;

    return generateChannelMessageContent({
      message: `\`\`\`\n${helpText}\n\`\`\``,
      blockMessage: true,
    });
  }
}
