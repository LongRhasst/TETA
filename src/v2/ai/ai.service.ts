import { ChatDeepSeek } from '@langchain/deepseek';
import { Inject, Injectable } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import {
  SUMMARIZE_REPORT_SYSTEM_PROMPT,
  SUMMARIZE_REPORT_USER_PROMPT,
  PROJECT_REPORT_SYSTEM_PROMPT,
  PROJECT_REPORT_USER_PROMPT,
} from './prompts';
import { trainingExamples, promptTrainingExamples } from './trainning/training-IO';

@Injectable()
export class AiService {
  constructor(@Inject('AI') private readonly ai: ChatDeepSeek) {}

  async generateSummarizeReport(input: string): Promise<string> {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', SUMMARIZE_REPORT_SYSTEM_PROMPT],
      ['user', SUMMARIZE_REPORT_USER_PROMPT],
    ]);

    const chain = prompt.pipe(this.ai);
    const result = await chain.invoke({ input });

    return this.formatResponse(result);
  }

  /**
   * Tạo báo cáo đánh giá dự án theo 12 tiêu chí chuẩn
   */
  async generateProjectReport(dailyReports: any[]): Promise<string> {
    const inputData = this.prepareProjectReportData(dailyReports);
    
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', PROJECT_REPORT_SYSTEM_PROMPT],
      ['user', PROJECT_REPORT_USER_PROMPT],
    ]);

    const chain = prompt.pipe(this.ai);
    const result = await chain.invoke({ input: inputData });

    return this.formatResponse(result);
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
      .map(r => ({ user: r.display_name || r.username, block: r.block }));
    
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
        user: report.display_name || report.username,
        yesterday: report.yesterday,
        today: report.today,
        project: report.project_label
      });
    });

    let dataString = `=== THÔNG TIN DỰ ÁN ===\n`;
    dataString += `Thời gian: ${new Date().toLocaleDateString()} - Tuần hiện tại\n`;
    dataString += `Dự án chính: ${analysis.topProjects[0] || 'Đa dự án'}\n`;
    dataString += `Số thành viên: ${new Set(validReports.map(r => r.username)).size} người active\n`;
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
      const userId = report.username;
      if (!userStats[userId]) {
        userStats[userId] = {
          name: report.display_name || report.username,
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
   * Tổng hợp báo cáo team từ tất cả daily reports
   * Format output dạng form message thay vì JSON
   */
  async generateTeamSummaryReport(dailyReports: any[]): Promise<string> {
    // Chuẩn bị dữ liệu đầu vào dưới dạng structured format
    const inputData = this.prepareReportData(dailyReports);
    
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', SUMMARIZE_REPORT_SYSTEM_PROMPT],
      ['user', SUMMARIZE_REPORT_USER_PROMPT],
    ]);

    const chain = prompt.pipe(this.ai);
    const result = await chain.invoke({ input: inputData });

    return this.formatResponse(result);
  }

  /**
   * Chuẩn bị dữ liệu daily reports thành format phù hợp cho AI
   */
  private prepareReportData(reports: any[]): string {
    const validReports = reports.filter(r => !r.daily_late);
    const invalidReports = reports.filter(r => r.daily_late);
    
    let dataString = `=== THỐNG KÊ TỔNG QUAN ===\n`;
    dataString += `Tổng số báo cáo: ${reports.length}\n`;
    dataString += `Báo cáo hợp lệ: ${validReports.length}\n`;
    dataString += `Báo cáo không hợp lệ: ${invalidReports.length}\n\n`;

    dataString += `=== CHI TIẾT BÁO CÁO HỢP LỆ ===\n`;
    validReports.forEach(report => {
      dataString += `--- ${report.display_name || report.username} ---\n`;
      dataString += `Dự án: ${report.project_label || 'Không xác định'}\n`;
      dataString += `Task: ${report.task_label || 'Không xác định'}\n`;
      dataString += `Loại công việc: ${report.work_type || 'Không xác định'}\n`;
      dataString += `Ngày: ${report.date || 'Không xác định'}\n`;
      dataString += `Công việc hôm qua: ${report.yesterday || 'Không có thông tin'}\n`;
      dataString += `Kế hoạch hôm nay: ${report.today || 'Không có thông tin'}\n`;
      dataString += `Blockers: ${report.block || 'Không có'}\n`;
      dataString += `Thời gian làm việc: ${report.working_time || 'Không xác định'}\n`;
      dataString += `Thời gian tạo: ${report.create_time}\n\n`;
    });

    if (invalidReports.length > 0) {
      dataString += `=== BÁO CÁO KHÔNG HỢP LỆ ===\n`;
      invalidReports.forEach(report => {
        dataString += `--- ${report.display_name || report.username} ---\n`;
        dataString += `Lý do: Báo cáo chứa lỗi định dạng thời gian\n`;
        dataString += `Thời gian tạo: ${report.create_time}\n`;
        dataString += `Nội dung update: ${report.update_data}\n\n`;
      });
    }

    return dataString;
  }

  /**
   * Get training examples for improving AI responses
   */
  getTrainingExamples() {
    return trainingExamples;
  }

  /**
   * Get prompt training guidelines
   */
  getPromptTrainingGuidelines() {
    return promptTrainingExamples;
  }

  /**
   * Generate report with training context for better output
   * Sử dụng training examples để cải thiện chất lượng output
   */
  async generateSummarizeReportWithTraining(input: string): Promise<string> {
    // Enhanced prompt với training context
    const enhancedSystemPrompt = `${SUMMARIZE_REPORT_SYSTEM_PROMPT}

=== VÍ DỤ OUTPUT CHUẨN ===
${trainingExamples.weeklyReportTraining.expectedOutput.substring(0, 800)}...

=== QUY TẮC BỔ SUNG ===
1. Luôn sử dụng tiếng Việt trong báo cáo
2. Format dạng form message, KHÔNG bao giờ trả về JSON raw
3. Bao gồm emoji để dễ đọc: 📊 📈 🎯 ✅ ⚠️ 👥 🚀
4. Đưa ra metrics cụ thể và phần trăm
5. Phân tích insights thay vì chỉ tóm tắt data
6. Kết thúc bằng action items cụ thể
7. Xử lý riêng các báo cáo không hợp lệ (daily_late = true)`;

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', enhancedSystemPrompt],
      ['user', SUMMARIZE_REPORT_USER_PROMPT],
    ]);

    const chain = prompt.pipe(this.ai);
    const result = await chain.invoke({ input });

    return this.formatResponse(result);
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

  /**
   * Tạo báo cáo tổng hợp team với đánh giá hiệu suất
   * Đầu vào có thể là array reports hoặc string data
   */
  async generateComprehensiveTeamReport(data: any[] | string): Promise<string> {
    let inputData: string;
    
    if (Array.isArray(data)) {
      inputData = this.prepareReportData(data);
    } else {
      inputData = data;
    }

    return await this.generateSummarizeReportWithTraining(inputData);
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
}
