import { Injectable } from '@nestjs/common';
import {
  SUMMARIZE_REPORT_SYSTEM_PROMPT,
  SUMMARIZE_REPORT_USER_PROMPT,
} from '../prompts';
import { LMStudioService } from '../lmstudio.service';

@Injectable()
export class SummarizeReportService {
  constructor(private readonly lmStudioService: LMStudioService) {}

  /**
   * Tạo báo cáo tổng hợp team từ tất cả daily reports
   * Format output dạng form message thay vì JSON
   */
  async generateTeamSummaryReport(dailyReports: any[]): Promise<string> {
    // Chuẩn bị dữ liệu đầu vào dưới dạng structured format
    const inputData = this.prepareReportData(dailyReports);
    
    const systemPrompt = SUMMARIZE_REPORT_SYSTEM_PROMPT;
    const userPrompt = SUMMARIZE_REPORT_USER_PROMPT.replace('{input}', inputData);

    const result = await this.lmStudioService.generateContentWithChunking(systemPrompt, userPrompt);
    return result;
  }

  /**
   * Generate report with training context for better output
   * Sử dụng enhanced prompt để cải thiện chất lượng output
   */
  async generateSummarizeReportWithTraining(input: string): Promise<string> {
    // Enhanced prompt với training context
    const enhancedSystemPrompt = `${SUMMARIZE_REPORT_SYSTEM_PROMPT}

=== QUY TẮC BỔ SUNG ===
1. Luôn sử dụng tiếng Việt trong báo cáo
2. Format dạng form message, KHÔNG bao giờ trả về JSON raw
3. Bao gồm emoji để dễ đọc: 📊 📈 🎯 ✅ ⚠️ 👥 🚀
4. Đưa ra metrics cụ thể và phần trăm
5. Phân tích insights thay vì chỉ tóm tắt data
6. Kết thúc bằng action items cụ thể
7. Xử lý riêng các báo cáo không hợp lệ (daily_late = true)`;

    const userPrompt = SUMMARIZE_REPORT_USER_PROMPT.replace('{input}', input);

    const result = await this.lmStudioService.generateContentWithChunking(enhancedSystemPrompt, userPrompt);
    return result;
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
   * Giảm kích thước để tránh context overflow
   */
  private prepareReportData(reports: any[]): string {
    // Chỉ lấy tối đa 8 reports để tránh context overflow
    const limitedReports = reports.slice(0, 8);
    const validReports = limitedReports.filter(r => !r.daily_late);
    const invalidReports = limitedReports.filter(r => r.daily_late);
    
    let dataString = `=== THỐNG KÊ ===\n`;
    dataString += `Tổng: ${limitedReports.length}, Hợp lệ: ${validReports.length}, Không hợp lệ: ${invalidReports.length}\n\n`;

    dataString += `=== CHI TIẾT (TOP ${validReports.length}) ===\n`;
    validReports.forEach(report => {
      dataString += `${report.display_name || report.member}: `;
      dataString += `${(report.yesterday || '').substring(0, 50)}... | `;
      dataString += `${(report.today || '').substring(0, 50)}... | `;
      dataString += `${report.block || 'OK'}\n`;
    });

    return dataString;
  }
}
