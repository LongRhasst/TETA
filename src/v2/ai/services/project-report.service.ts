import { Injectable } from '@nestjs/common';
import {
  PROJECT_REPORT_SYSTEM_PROMPT,
  PROJECT_REPORT_USER_PROMPT,
} from '../prompts';
import { LMStudioService } from '../lmstudio.service';
import { ProjectReport } from '../interface/project.report';

@Injectable()
export class ProjectReportService {
  constructor(private readonly lmStudioService: LMStudioService) {}

  /**
   * Tạo báo cáo đánh giá dự án theo 12 tiêu chí chuẩn
   * Trả về JSON format theo interface ProjectReport
   */
  async generateProjectReport(dailyReports: any[]): Promise<string> {
    const inputData = this.prepareProjectReportData(dailyReports);
    
    // Phân tích dữ liệu cơ bản để tạo report structure
    const analysis = this.analyzeWorkTrends(dailyReports);
    const validReports = dailyReports.filter(r => !r.daily_late);
    
    // Tạo base structure cho ProjectReport
    const projectReport: ProjectReport = {
      project_name: analysis.topProjects[0] || "Multiple Projects",
      member: `${new Set(validReports.map(r => r.member)).size} active members`,
      progress: `${analysis.validRate.toFixed(1)}% completion rate with ${analysis.totalHours}h total work`,
      customer_communication: "Pending AI analysis",
      human_resource: `${validReports.length} team members contributing`,
      profession: "Software Development Team",
      technical_solution: "Pending AI analysis", 
      testing: "Pending AI analysis",
      milestone: "Weekly milestone assessment",
      week_goal: "Pending AI analysis",
      issue: `${analysis.blockerCount} active blockers identified`,
      risks: "Pending AI analysis"
    };

    // Gọi AI để phân tích chi tiết và cập nhật các field
    const systemPrompt = `${PROJECT_REPORT_SYSTEM_PROMPT}

You must respond with a valid JSON object that matches this exact structure:
{
  "project_name": "string",
  "member": "string", 
  "progress": "string",
  "customer_communication": "string",
  "human_resource": "string",
  "profession": "string",
  "technical_solution": "string",
  "testing": "string", 
  "milestone": "string",
  "week_goal": "string",
  "issue": "string",
  "risks": "string"
}

Analyze the provided data and fill each field with meaningful insights in Vietnamese.`;

    const userPrompt = PROJECT_REPORT_USER_PROMPT.replace('{input}', inputData);

    const aiResponse = await this.lmStudioService.generateContentWithChunking(systemPrompt, userPrompt);
    
    try {
      // Thử parse AI response thành JSON
      const aiReport = JSON.parse(aiResponse);
      
      // Merge với base structure
      const finalReport: ProjectReport = {
        ...projectReport,
        ...aiReport
      };
      
      return JSON.stringify(finalReport, null, 2);
    } catch (error) {
      // Nếu AI không trả về JSON hợp lệ, trả về base structure với AI response
      projectReport.customer_communication = aiResponse.substring(0, 200) + "...";
      return JSON.stringify(projectReport, null, 2);
    }
  }

  /**
   * Chuẩn bị dữ liệu cho báo cáo đánh giá dự án 12 tiêu chí
   * Tối ưu để tránh context overflow (giới hạn 4096 tokens)
   */
  private prepareProjectReportData(reports: any[]): string {
    // Giới hạn reports để tránh context overflow
    const limitedReports = reports.slice(0, 15);
    const validReports = limitedReports.filter(r => !r.daily_late);
    const invalidReports = limitedReports.filter(r => r.daily_late);
    
    // Phân tích dữ liệu cơ bản
    const analysis = this.analyzeWorkTrends(limitedReports);
    
    // Phân tích blockers (chỉ lấy 5 blockers đầu)
    const blockers = validReports
      .filter(r => r.block && r.block.trim() !== '')
      .slice(0, 5)
      .map(r => ({ user: r.display_name || r.member, block: r.block.substring(0, 100) }));
    
    let dataString = `=== DỰ ÁN TUẦN ===\n`;
    dataString += `Thành viên: ${new Set(validReports.map(r => r.member)).size}, `;
    dataString += `Reports: ${limitedReports.length} (${validReports.length} OK)\n`;
    dataString += `Giờ làm: ${analysis.totalHours}h (TB: ${analysis.averageHours.toFixed(1)}h/người)\n`;
    dataString += `Blockers: ${analysis.blockerCount}\n\n`;

    dataString += `=== TOP THÀNH VIÊN ===\n`;
    const userStats: Record<string, any> = {};
    validReports.slice(0, 8).forEach(report => {
      const userId = report.member;
      if (!userStats[userId]) {
        userStats[userId] = {
          name: report.display_name || report.member,
          hours: 0,
          projects: new Set(),
          hasBlocker: false
        };
      }
      
      userStats[userId].hours += this.parseWorkingTime(report.working_time || '0');
      if (report.project_label) userStats[userId].projects.add(report.project_label);
      if (report.block && report.block.trim() !== '') {
        userStats[userId].hasBlocker = true;
      }
    });

    Object.values(userStats).forEach((user: any) => {
      dataString += `${user.name}: ${user.hours}h, ${Array.from(user.projects).join('/')}, ${user.hasBlocker ? '🚫' : '✅'}\n`;
    });

    dataString += `\n=== BLOCKERS ===\n`;
    blockers.forEach(({ user, block }) => {
      dataString += `${user}: ${block}\n`;
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
}
