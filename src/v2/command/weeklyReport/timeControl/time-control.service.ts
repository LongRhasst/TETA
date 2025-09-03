import { Injectable } from '@nestjs/common';

@Injectable()
export class TimeControlService {
  /**
   * Tính toán khoảng thời gian dựa trên time parameter
   * @param time Số tuần trước (0: tuần hiện tại, 1: tuần trước, ...)
   * @returns Object chứa startDate và endDate
   */
  calculateTimeRange(time: number): { startDate: Date; endDate: Date } {
    // Giới hạn tối đa 3 tháng (12 tuần)
    const maxWeeks = 12;
    const validTime = Math.max(0, Math.min(time, maxWeeks));
    
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...
    
    // Tính toán ngày đầu tuần (Thứ 2) của tuần hiện tại
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1; // Nếu là Chủ nhật thì lùi 6 ngày
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - daysToMonday);
    currentWeekStart.setHours(0, 0, 0, 0);
    
    // Tính toán tuần cần lấy dữ liệu
    const targetWeekStart = new Date(currentWeekStart);
    targetWeekStart.setDate(currentWeekStart.getDate() - (validTime * 7));
    
    const targetWeekEnd = new Date(targetWeekStart);
    targetWeekEnd.setDate(targetWeekStart.getDate() + 6);
    targetWeekEnd.setHours(23, 59, 59, 999);
    
    return {
      startDate: targetWeekStart,
      endDate: targetWeekEnd
    };
  }

  /**
   * Parse time parameter từ command string
   * @param command Command string như "*weeklyReport 2"
   * @returns Object chứa command name và time parameter
   */
  parseCommand(command: string): { commandName: string; time: number } {
    const trimmedCommand = command.trim();
    const parts = trimmedCommand.split(/\s+/);
    
    const commandName = parts[0].toLowerCase();
    const timeParam = parts[1] ? parseInt(parts[1]) : 0;
    
    // Đảm bảo time parameter hợp lệ (0-12)
    const validTime = Math.max(0, Math.min(timeParam, 12));
    
    return {
      commandName,
      time: validTime
    };
  }

  /**
   * Kiểm tra time parameter có hợp lệ không
   * @param time Time parameter
   * @returns true nếu hợp lệ
   */
  isValidTime(time: number): boolean {
    return Number.isInteger(time) && time >= 0 && time <= 12;
  }

  /**
   * Tạo description cho time range
   * @param time Time parameter
   * @returns String mô tả khoảng thời gian
   */
  getTimeDescription(time: number): string {
    if (!this.isValidTime(time)) {
      return 'Thời gian không hợp lệ';
    }

    if (time === 0) {
      return 'Tuần hiện tại';
    } else if (time === 1) {
      return 'Tuần trước';
    } else {
      return `${time} tuần trước`;
    }
  }

  /**
   * Format date range cho hiển thị
   * @param startDate Ngày bắt đầu
   * @param endDate Ngày kết thúc
   * @returns String formatted date range
   */
  formatDateRange(startDate: Date, endDate: Date): string {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  /**
   * Kiểm tra một date có nằm trong time range không
   * @param date Date cần kiểm tra
   * @param timeRange Time range object
   * @returns true nếu date nằm trong range
   */
  isDateInRange(date: Date, timeRange: { startDate: Date; endDate: Date }): boolean {
    return date >= timeRange.startDate && date <= timeRange.endDate;
  }

  /**
   * Tạo filter condition cho Prisma query
   * @param time Time parameter
   * @returns Prisma where condition object
   */
  createPrismaTimeFilter(time: number) {
    const timeRange = this.calculateTimeRange(time);
    
    return {
      date: {
        gte: timeRange.startDate,
        lte: timeRange.endDate
      }
    };
  }

  /**
   * Validate và normalize command input
   * @param input Raw command input
   * @returns Normalized command object hoặc null nếu không hợp lệ
   */
  validateAndNormalizeCommand(input: string): { commandName: string; time: number; isValid: boolean } | null {
    if (!input || typeof input !== 'string') {
      return null;
    }

    try {
      const parsed = this.parseCommand(input);
      const isValid = this.isValidTime(parsed.time);
      
      return {
        ...parsed,
        isValid
      };
    } catch (error) {
      return null;
    }
  }
}
