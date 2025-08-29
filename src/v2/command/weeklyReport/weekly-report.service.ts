import { Injectable } from '@nestjs/common';
import { KomuDatabaseService } from '../../listen/services/komu-database.service';
import { SummarizeReportService } from '../../ai/services/summarize-report.service';
import { ProjectReportService } from '../../ai/services/project-report.service';
import { TimeControlService } from './timeControl/time-control.service';
import { generateChannelMessageContent } from '../message';
import { COMMAND_CODES } from '../../constants/command-codes';
import { report } from 'process';

@Injectable()
export class WeeklyReportService {
  constructor(
    private readonly databaseService: KomuDatabaseService,
    private readonly summarizeService: SummarizeReportService,
    private readonly projectService: ProjectReportService,
    private readonly timeControlService: TimeControlService,
  ) {}

  /**
   * Xử lý command *weeklyUserReport - Báo cáo tổng hợp team (sử dụng summarize prompt)
   */
  async handleWeeklyUserReport(channelId: string, time: number) {
    try {
      // Tạo time filter và time description
      const timeFilter = this.timeControlService.createPrismaTimeFilter(time);
      const timeDescription = this.timeControlService.getTimeDescription(time);
      const timeRange = this.timeControlService.calculateTimeRange(time);
      const dateRangeStr = this.timeControlService.formatDateRange(timeRange.startDate, timeRange.endDate);
      
      // Thông báo báo cáo đang được tạo
      console.log(`Báo cáo tổng hợp team đang được tạo cho ${dateRangeStr}...`);
      
      // Lấy reports theo channel và time filter
      const reports = await this.databaseService.getReportsByChannelAndTime(channelId, timeFilter);
      
      if (reports.length === 0) {
        return generateChannelMessageContent({
          message: `\`\`\`\nKhông có dữ liệu trong ${timeDescription} được đề cập (${dateRangeStr}).\n\`\`\``,
          blockMessage: true,
        });
      }

      // Sử dụng summarize service để tạo báo cáo
      const reportContent = await this.summarizeService.generateTeamSummaryReport(reports);

      return generateChannelMessageContent({
        message: `\nBÁO CÁO TỔNG HỢP TEAM - ${timeDescription.toUpperCase()}\nThời gian: ${dateRangeStr}\n\n${reportContent}\n`,
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
  async handleWeeklyReport(channelId: string, time: number) {
    try {
      // Tạo time filter và time description
      const timeFilter = this.timeControlService.createPrismaTimeFilter(time);
      const timeDescription = this.timeControlService.getTimeDescription(time);
      const timeRange = this.timeControlService.calculateTimeRange(time);
      const dateRangeStr = this.timeControlService.formatDateRange(timeRange.startDate, timeRange.endDate);
      
      // Thông báo báo cáo đang được tạo
      console.log(`Báo cáo đánh giá dự án đang được tạo cho ${dateRangeStr}...`);
      
      // Kiểm tra xem báo cáo đã tồn tại trong database chưa
      const existingReport = await this.databaseService.checkReportExists(
        COMMAND_CODES.WEEKLY_REPORT,
        timeRange.startDate,
        timeRange.endDate
      );

      if (existingReport) {
        console.log(`📄 Tìm thấy báo cáo có sẵn (ID: ${existingReport.id}) tạo lúc ${existingReport.create_time}`);
        
        // Lấy báo cáo đã có và format lại
        const reportContent = await this.databaseService.getExistingReportAsJson(existingReport.id);
        
        return generateChannelMessageContent({
          message: `\nBÁO CÁO ĐÁNH GIÁ DỰ ÁN - 12 TIÊU CHÍ (Đã tạo)\nThời gian: ${dateRangeStr}\nTạo lúc: ${new Date(existingReport.create_time).toLocaleString('vi-VN')}\n\n${reportContent}\n`,
          blockMessage: true,
        });
      }

      // Nếu chưa có báo cáo, lấy dữ liệu và tạo mới
      console.log(`🔄 Không tìm thấy báo cáo có sẵn, đang tạo báo cáo mới...`);
      
      // Lấy reports theo channel và time filter
      const reports = await this.databaseService.getReportsByChannelAndTime(channelId, timeFilter);
      
      if (reports.length === 0) {
        return generateChannelMessageContent({
          message: `\`\`\`\nKhông có dữ liệu trong ${timeDescription} được đề cập (${dateRangeStr}).\n\`\`\``,
          blockMessage: true,
        });
      }

      // Tạo báo cáo mới bằng AI
      const reportContent = await this.projectService.generateProjectReport(reports);

      // Lưu báo cáo vào database
      await this.databaseService.saveProjectReport(reportContent, COMMAND_CODES.WEEKLY_REPORT, timeRange.endDate);

      console.log(`✅ Đã tạo và lưu báo cáo mới cho ${dateRangeStr}`);

      return generateChannelMessageContent({
        message: `\nBÁO CÁO ĐÁNH GIÁ DỰ ÁN - 12 TIÊU CHÍ (Mới tạo)\nThời gian: ${dateRangeStr}\n\n${reportContent}\n`,
        blockMessage: true,
      });
    } catch (error) {
      console.error('Error generating weekly project report:', error);
      return generateChannelMessageContent({
        message: `\nCó lỗi xảy ra khi tạo báo cáo đánh giá dự án.\n`,
        blockMessage: true,
      });
    }
  }

  /**
   * Xử lý command *reportStats - Thống kê báo cáo
   */
  async handleReportStats(channelId: string, time: number) {
    try {
      // Tạo time filter và time description
      const timeFilter = this.timeControlService.createPrismaTimeFilter(time);
      const timeDescription = this.timeControlService.getTimeDescription(time);
      const timeRange = this.timeControlService.calculateTimeRange(time);
      const dateRangeStr = this.timeControlService.formatDateRange(timeRange.startDate, timeRange.endDate);
      
      // Thông báo thống kê đang được tạo
      console.log(`Thống kê báo cáo đang được tạo cho ${dateRangeStr}...`);
      
      // Lấy reports theo channel và time filter
      const reports = await this.databaseService.getReportsByChannelAndTime(channelId, timeFilter);
      
      if (reports.length === 0) {
        return generateChannelMessageContent({
          message: `\`\`\`\nKhông có dữ liệu trong ${timeDescription} được đề cập (${dateRangeStr}).\n\`\`\``,
          blockMessage: true,
        });
      }
      
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

      const projectEntries = Object.entries(projectStats);

      let statsMessage = `THỐNG KÊ BÁO CÁO - ${timeDescription.toUpperCase()}\nThời gian: ${dateRangeStr}\n\n`;
      statsMessage += `Tổng quan:\n`;
      statsMessage += `• Số thành viên active: ${uniqueMembers}\n`;
      statsMessage += `• Tổng báo cáo: ${reports.length}\n`;
      statsMessage += `• Báo cáo hợp lệ: ${validReports.length} (${((validReports.length/reports.length)*100).toFixed(1)}%)\n`;
      statsMessage += `• Báo cáo không hợp lệ: ${invalidReports.length}\n`;
      statsMessage += `• Tổng giờ làm việc: ${totalHours} giờ\n\n`;
      
      if (projectEntries.length > 0) {
        statsMessage += `• Dự án: ${projectEntries[0][0]} : ${projectEntries[0][1]} báo cáo\n\n`;
      }

      return generateChannelMessageContent({
        message: `\n${statsMessage}\n`,
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
