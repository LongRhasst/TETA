import { Injectable } from '@nestjs/common';
import { VertexAIService } from '../vertex-ai.service';
import {
  PROJECT_REPORT_SYSTEM_PROMPT,
  PROJECT_REPORT_USER_PROMPT,
} from '../prompts';

@Injectable()
export class ProjectReportService {
  constructor(private readonly vertexAI: VertexAIService) {}

  /**
   * Tạo báo cáo đánh giá dự án theo 12 tiêu chí chuẩn
   */
  async generateProjectReport(dailyReports: any[]): Promise<string> {
    const inputData = this.prepareProjectReportData(dailyReports);
    
    const prompt = `${PROJECT_REPORT_SYSTEM_PROMPT}

User request: ${PROJECT_REPORT_USER_PROMPT}

Data to analyze: ${inputData}`;

    return await this.vertexAI.generateContent(prompt);
  }

  /**
   * Chuẩn bị dữ liệu cho báo cáo đánh giá dự án 12 tiêu chí
   */
  private prepareProjectReportData(reports: any[]): string {
    const validReports = reports.filter(r => !r.daily_late);
    const invalidReports = reports.filter(r => r.daily_late);
    
    // Phân tích dữ liệu cơ bản
    const analysis = this.analyzeWorkTrends(reports);
    
    // Phân tích blockers và issues
    const blockers = validReports
      .filter(r => r.block && r.block.trim() !== '')
      .map(r => ({ user: r.display_name || r.member, block: r.block }));
    
    // Phân tích task distribution
    const taskDistribution: Record<string, number> = {};
    validReports.forEach(report => {
      if (report.task_label) {
        taskDistribution[report.task_label] = (taskDistribution[report.task_label] || 0) + 1;
      }
    });

    // Phân tích progress theo ngày
    const dailyProgress: Record<string, any[]> = {};
    validReports.forEach(report => {
      const dateKey = report.date ? new Date(report.date).toLocaleDateString() : 'Không xác định';
      if (!dailyProgress[dateKey]) dailyProgress[dateKey] = [];
      dailyProgress[dateKey].push({
        user: report.display_name || report.member,
        yesterday: report.yesterday,
        today: report.today,
        project: report.project_label
      });
    });

    let dataString = `=== THÔNG TIN DỰ ÁN ===\n`;
    dataString += `Thời gian: ${new Date().toLocaleDateString()} - Tuần hiện tại\n`;
    dataString += `Dự án chính: ${analysis.topProjects[0] || 'Đa dự án'}\n`;
    dataString += `Số thành viên: ${new Set(validReports.map(r => r.member)).size} người active\n`;
    dataString += `Tổng báo cáo: ${reports.length} (${validReports.length} hợp lệ, ${invalidReports.length} không hợp lệ)\n\n`;

    dataString += `=== METRICS TỔNG QUAN ===\n`;
    dataString += `Tổng giờ làm việc: ${analysis.totalHours} giờ\n`;
    dataString += `Trung bình mỗi người: ${analysis.averageHours.toFixed(1)} giờ\n`;
    dataString += `Tỷ lệ báo cáo hợp lệ: ${analysis.validRate.toFixed(1)}%\n`;
    dataString += `Số blockers hiện tại: ${analysis.blockerCount}\n`;
    dataString += `Top dự án: ${analysis.topProjects.join(', ')}\n\n`;

    dataString += `=== PHÂN TÍCH TASK DISTRIBUTION ===\n`;
    Object.entries(taskDistribution).forEach(([task, count]) => {
      dataString += `${task}: ${count} reports\n`;
    });
    dataString += '\n';

    dataString += `=== CHI TIẾT BLOCKERS ===\n`;
    blockers.forEach(({ user, block }) => {
      dataString += `${user}: ${block}\n`;
    });
    dataString += '\n';

    dataString += `=== TIẾN ĐỘ THEO NGÀY ===\n`;
    Object.entries(dailyProgress).forEach(([date, activities]) => {
      dataString += `--- ${date} ---\n`;
      activities.forEach(activity => {
        dataString += `${activity.user} (${activity.project}):\n`;
        dataString += `  Completed: ${activity.yesterday || 'Không có thông tin'}\n`;
        dataString += `  Planning: ${activity.today || 'Không có thông tin'}\n`;
      });
      dataString += '\n';
    });

    dataString += `=== CHI TIẾT THÀNH VIÊN ===\n`;
    const userStats: Record<string, any> = {};
    validReports.forEach(report => {
      const userId = report.member;
      if (!userStats[userId]) {
        userStats[userId] = {
          name: report.display_name || report.member,
          totalHours: 0,
          reportCount: 0,
          projects: new Set(),
          tasks: new Set(),
          blockers: []
        };
      }
      
      userStats[userId].totalHours += this.parseWorkingTime(report.working_time || '0');
      userStats[userId].reportCount++;
      if (report.project_label) userStats[userId].projects.add(report.project_label);
      if (report.task_label) userStats[userId].tasks.add(report.task_label);
      if (report.block && report.block.trim() !== '') {
        userStats[userId].blockers.push(report.block);
      }
    });

    Object.values(userStats).forEach((user: any) => {
      dataString += `--- ${user.name} ---\n`;
      dataString += `Tổng giờ: ${user.totalHours} giờ\n`;
      dataString += `Số báo cáo: ${user.reportCount}\n`;
      dataString += `Dự án tham gia: ${Array.from(user.projects).join(', ')}\n`;
      dataString += `Loại task: ${Array.from(user.tasks).join(', ')}\n`;
      dataString += `Blockers: ${user.blockers.length > 0 ? user.blockers.join('; ') : 'Không có'}\n`;
      dataString += '\n';
    });

    return dataString;
  }

  /**
   * Phân tích xu hướng làm việc từ dữ liệu reports
   */
  private analyzeWorkTrends(reports: any[]): {
    totalHours: number;
    averageHours: number;
    validRate: number;
    blockerCount: number;
    topProjects: string[];
  } {
    const validReports = reports.filter(r => !r.daily_late);
    
    const totalHours = validReports.reduce((sum, report) => {
      const hours = this.parseWorkingTime(report.working_time);
      return sum + hours;
    }, 0);

    const averageHours = validReports.length > 0 ? totalHours / validReports.length : 0;
    const validRate = reports.length > 0 ? (validReports.length / reports.length) * 100 : 0;
    
    const blockerCount = validReports.filter(r => r.block && r.block.trim() !== '').length;
    
    const projectCounts: Record<string, number> = {};
    validReports.forEach(report => {
      if (report.project_label) {
        projectCounts[report.project_label] = (projectCounts[report.project_label] || 0) + 1;
      }
    });
    
    const topProjects = Object.entries(projectCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([project]) => project);

    return {
      totalHours,
      averageHours,
      validRate,
      blockerCount,
      topProjects
    };
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
    
    return 0;
  }

  /**
   * Format the AI response to ensure consistent string output
   */
  private formatResponse(result: any): string {
    if (typeof result.content === 'string') {
      return result.content;
    } else if (result.content && typeof result.content === 'object' && 't' in result.content) {
      return (result.content as { t: string }).t;
    } else {
      return JSON.stringify(result.content);
    }
  }
}
