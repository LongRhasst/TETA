import { Injectable } from '@nestjs/common';
import { VertexAIService } from '../vertex-ai.service';
import {
  SUMMARIZE_REPORT_SYSTEM_PROMPT,
  SUMMARIZE_REPORT_USER_PROMPT,
} from '../prompts';
import { trainingExamples } from '../trainning/training-IO';

@Injectable()
export class SummarizeReportService {
  constructor(private readonly vertexAI: VertexAIService) {}

  /**
   * Tạo báo cáo tổng hợp team từ tất cả daily reports
   * Format output dạng form message thay vì JSON
   */
  async generateTeamSummaryReport(dailyReports: any[]): Promise<string> {
    // Chuẩn bị dữ liệu đầu vào dưới dạng structured format
    const inputData = this.prepareReportData(dailyReports);
    
    const prompt = `${SUMMARIZE_REPORT_SYSTEM_PROMPT}

User request: ${SUMMARIZE_REPORT_USER_PROMPT}

Data to analyze: ${inputData}`;

    return await this.vertexAI.generateContent(prompt);
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
7. Xử lý riêng các báo cáo không hợp lệ (daily_late = true)

User request: ${SUMMARIZE_REPORT_USER_PROMPT}

Data to analyze: ${input}`;

    return await this.vertexAI.generateContent(enhancedSystemPrompt);
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
      dataString += `--- ${report.display_name || report.member} ---\n`;
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
        dataString += `--- ${report.display_name || report.member} ---\n`;
        dataString += `Lý do: Báo cáo chứa lỗi định dạng thời gian\n`;
        dataString += `Thời gian tạo: ${report.create_time}\n`;
        dataString += `Nội dung update: ${report.update_data}\n\n`;
      });
    }

    return dataString;
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
