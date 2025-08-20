import { Injectable } from '@nestjs/common';
import { KomuDatabaseService } from '../../listen/services/komu-database.service';
import { SummarizeReportService } from '../../ai/services/summarize-report.service';
import { ProjectReportService } from '../../ai/services/project-report.service';
import { generateChannelMessageContent } from './message';

@Injectable()
export class WeeklyReportService {
  constructor(
    private readonly databaseService: KomuDatabaseService,
    private readonly summarizeService: SummarizeReportService,
    private readonly projectService: ProjectReportService,
  ) {}

  /**
   * Xử lý command *weeklyUserReport - Báo cáo tổng hợp team (sử dụng summarize prompt)
   */
  async handleWeeklyUserReport(channelId: string) {
    try {
      // Lấy tất cả reports từ channel hiện tại
      const reports = await this.databaseService.getReportsByChannel(channelId);
      
      if (reports.length === 0) {
        return generateChannelMessageContent({
          message: '```\nKhông tìm thấy báo cáo nào trong channel này.\n```',
          blockMessage: true,
        });
      }

      // Sử dụng summarize service để tạo báo cáo
      const reportContent = await this.summarizeService.generateTeamSummaryReport(reports);

      return generateChannelMessageContent({
        message: `\`\`\`\nBÁO CÁO TỔNG HỢP TEAM - TUẦN HIỆN TẠI\n\n${reportContent}\n\`\`\``,
        blockMessage: true,
      });
    } catch (error) {
      console.error('Error generating weekly user report:', error);
      return generateChannelMessageContent({
        message: '```\nCó lỗi xảy ra khi tạo báo cáo tổng hợp team.\n```',
        blockMessage: true,
      });
    }
  }

  /**
   * Xử lý command *weeklyReport - Báo cáo đánh giá dự án (sử dụng project prompt với 12 tiêu chí)
   */
  async handleWeeklyReport(channelId: string) {
    try {
      // Lấy tất cả reports từ channel hiện tại
      const reports = await this.databaseService.getReportsByChannel(channelId);
      
      if (reports.length === 0) {
        return generateChannelMessageContent({
          message: '```\nKhông tìm thấy báo cáo nào trong channel này.\n```',
          blockMessage: true,
        });
      }

      // Sử dụng project service để tạo báo cáo theo 12 tiêu chí
      const reportContent = await this.projectService.generateProjectReport(reports);

      return generateChannelMessageContent({
        message: `\`\`\`\nBÁO CÁO ĐÁNH GIÁ DỰ ÁN - 12 TIÊU CHÍ\n\n${reportContent}\n\`\`\``,
        blockMessage: true,
      });
    } catch (error) {
      console.error('Error generating weekly project report:', error);
      return generateChannelMessageContent({
        message: '```\nCó lỗi xảy ra khi tạo báo cáo đánh giá dự án.\n```',
        blockMessage: true,
      });
    }
  }

  /**
   * Xử lý command *weeklyReportAll - Báo cáo tổng hợp tất cả channels
   */
  async handleWeeklyReportAll() {
    try {
      // Lấy tất cả reports từ database
      const reports = await this.databaseService.getAllReports();
      
      if (reports.length === 0) {
        return generateChannelMessageContent({
          message: '```\nKhông tìm thấy báo cáo nào trong hệ thống.\n```',
          blockMessage: true,
        });
      }

      // Sử dụng summarize service với enhanced training
      const reportContent = await this.summarizeService.generateComprehensiveTeamReport(reports);

      return generateChannelMessageContent({
        message: `\`\`\`\n BÁO CÁO TỔNG HỢP TẤT CẢ DỰ ÁN\n\n${reportContent}\n\`\`\``,
        blockMessage: true,
      });
    } catch (error) {
      console.error('Error generating comprehensive report:', error);
      return generateChannelMessageContent({
        message: '```\n Có lỗi xảy ra khi tạo báo cáo tổng hợp.\n```',
        blockMessage: true,
      });
    }
  }

  /**
   * Xử lý command *reportStats - Thống kê báo cáo
   */
  async handleReportStats(channelId: string) {
    try {
      const reports = await this.databaseService.getReportsByChannel(channelId);
      const validReports = reports.filter(r => !r.daily_late);
      const invalidReports = reports.filter(r => r.daily_late);
      
      const uniqueMembers = new Set(validReports.map(r => r.member)).size;
      const totalHours = validReports.reduce((sum, report) => {
        const hours = this.parseWorkingTime(report.working_time || '0');
        return sum + hours;
      }, 0);

      const projectStats: Record<string, number> = {};
      validReports.forEach(report => {
        if (report.project_label) {
          projectStats[report.project_label] = (projectStats[report.project_label] || 0) + 1;
        }
      });

      const topProjects = Object.entries(projectStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

      let statsMessage = `**THỐNG KÊ BÁO CÁO**\n\n`;
      statsMessage += `**Tổng quan:**\n`;
      statsMessage += `• Số thành viên active: ${uniqueMembers}\n`;
      statsMessage += `• Tổng báo cáo: ${reports.length}\n`;
      statsMessage += `• Báo cáo hợp lệ: ${validReports.length} (${((validReports.length/reports.length)*100).toFixed(1)}%)\n`;
      statsMessage += `• Báo cáo không hợp lệ: ${invalidReports.length}\n`;
      statsMessage += `• Tổng giờ làm việc: ${totalHours} giờ\n\n`;

      if (topProjects.length > 0) {
        statsMessage += `**Top dự án:**\n`;
        topProjects.forEach(([project, count]) => {
          statsMessage += `• ${project}: ${count} báo cáo\n`;
        });
      }

      return generateChannelMessageContent({
        message: `\`\`\`\n${statsMessage}\n\`\`\``,
        blockMessage: true,
      });
    } catch (error) {
      console.error('Error generating report stats:', error);
      return generateChannelMessageContent({
        message: '```\nCó lỗi xảy ra khi tạo thống kê báo cáo.\n```',
        blockMessage: true,
      });
    }
  }

  /**
   * Parse working time string to hours
   */
  private parseWorkingTime(timeStr: string): number {
    if (!timeStr) return 0;
    
    const hourMatch = timeStr.match(/(\d+(?:\.\d+)?)\s*(?:h|hour|giờ)/i);
    if (hourMatch) return parseFloat(hourMatch[1]);
    
    const minMatch = timeStr.match(/(\d+)\s*(?:min|minute|phút)/i);
    if (minMatch) return parseFloat(minMatch[1]) / 60;
    
    const numericMatch = timeStr.match(/^(\d+(?:\.\d+)?)$/);
    if (numericMatch) return parseFloat(numericMatch[1]);
    
    return 0;
  }
}
