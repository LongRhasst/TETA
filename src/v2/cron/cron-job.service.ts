import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { KomuDatabaseService } from '../listen/services/komu-database.service';
import { ProjectReportService } from '../ai/services/project-report.service';
import { TimeControlService } from '../command/weeklyReport/timeControl/time-control.service';
import { ConfigService } from '@nestjs/config';
import { COMMAND_CODES } from '../constants/command-codes';

@Injectable()
export class CronJobService {
  private readonly logger = new Logger(CronJobService.name);
  
  constructor(
    private readonly databaseService: KomuDatabaseService,
    private readonly projectReportService: ProjectReportService,
    private readonly timeControlService: TimeControlService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Cronjob tự động tạo báo cáo tuần vào 0h thứ 2 hàng tuần
   * Lấy dữ liệu từ database, tạo báo cáo và lưu vào report_logs
   */
  @Cron('0 0 * * 1', {
    name: 'weekly-report-auto',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleWeeklyReportCron() {
    this.logger.log('🕐 Bắt đầu tự động tạo báo cáo tuần...');
    
    try {
      // Lấy channel ID mặc định từ config
      const defaultChannelId = this.configService.get<string>('DEFAULT_REPORT_CHANNEL_ID');
      
      if (!defaultChannelId) {
        this.logger.warn('⚠️  Không có DEFAULT_REPORT_CHANNEL_ID trong config, sử dụng tất cả channels');
      }

      // time = 1 means "tuần trước" (tuần vừa kết thúc)
      const time = 1; 
      
      // Tạo time filter và time range
      const timeFilter = this.timeControlService.createPrismaTimeFilter(time);
      const timeRange = this.timeControlService.calculateTimeRange(time);
      const dateRangeStr = this.timeControlService.formatDateRange(timeRange.startDate, timeRange.endDate);
      
      this.logger.log(`📊 Đang tạo báo cáo cho tuần: ${dateRangeStr}`);

      // Kiểm tra xem báo cáo đã tồn tại chưa
      const existingReport = await this.databaseService.checkReportExists(
        COMMAND_CODES.WEEKLY_REPORT,
        timeRange.startDate,
        timeRange.endDate
      );

      if (existingReport) {
        this.logger.log(`📄 Báo cáo cho tuần ${dateRangeStr} đã tồn tại (ID: ${existingReport.id})`);
        return;
      }

      // Lấy dữ liệu reports theo time filter
      let reports;
      if (defaultChannelId) {
        reports = await this.databaseService.getReportsByChannelAndTime(defaultChannelId, timeFilter);
      } else {
        // Lấy tất cả reports nếu không có channel cụ thể
        reports = await this.databaseService.getAllReportsWithTimeFilter(timeFilter);
      }
      
      if (reports.length === 0) {
        this.logger.warn(`⚠️  Không có dữ liệu cho tuần ${dateRangeStr}`);
        return;
      }

      this.logger.log(`📋 Tìm thấy ${reports.length} báo cáo để phân tích`);

      // Tạo báo cáo bằng AI
      const reportContent = await this.projectReportService.generateProjectReport(reports);
      
      // Lưu báo cáo vào database
      await this.databaseService.saveProjectReport(reportContent, COMMAND_CODES.WEEKLY_REPORT);
      
      this.logger.log(`✅ Đã tạo và lưu báo cáo tuần thành công cho ${dateRangeStr}`);
      
    } catch (error) {
      this.logger.error('❌ Lỗi khi tự động tạo báo cáo tuần:', error);
    }
  }

  @Cron('0 1 * * 0', {
    name: 'cleanup-old-data',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleCleanupCron() {
    this.logger.log('🧹 Bắt đầu dọn dẹp dữ liệu cũ...');
    
    try {
      // Xóa daily reports cũ hơn 3 tháng
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const deletedCount = await this.databaseService.cleanupOldReports(threeMonthsAgo);
      
      this.logger.log(`✅ Đã xóa ${deletedCount} báo cáo cũ`);
      
    } catch (error) {
      this.logger.error('❌ Lỗi khi dọn dẹp dữ liệu:', error);
    }
  }
}
