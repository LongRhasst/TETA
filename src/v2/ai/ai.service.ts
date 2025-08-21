import { Injectable } from '@nestjs/common';
import { trainingExamples, promptTrainingExamples } from './trainning/training-IO';
import { SummarizeReportService } from './services/summarize-report.service';
import { ProjectReportService } from './services/project-report.service';
import { VertexAIService } from './vertex-ai.service';

@Injectable()
export class AiService {
  constructor(
    private readonly vertexAI: VertexAIService,
    private readonly summarizeService: SummarizeReportService,
    private readonly projectService: ProjectReportService,
  ) {}

  async generateSummarizeReport(input: string): Promise<string> {
    const prompt = `You are a helpful project management assistant. Please analyze the following daily reports data and create a comprehensive summary report in Vietnamese.

Input data: ${input}

Please provide a detailed summary covering key metrics, progress updates, blockers, and recommendations.`;

    return await this.vertexAI.generateContent(prompt);
  }

  /**
   * Tạo báo cáo đánh giá dự án theo 12 tiêu chí chuẩn
   * Delegate to ProjectReportService
   */
  async generateProjectReport(dailyReports: any[]): Promise<string> {
    return await this.projectService.generateProjectReport(dailyReports);
  }

  /**
   * Tạo báo cáo tổng hợp team từ tất cả daily reports
   * Delegate to SummarizeReportService
   */
  async generateTeamSummaryReport(dailyReports: any[]): Promise<string> {
    return await this.summarizeService.generateTeamSummaryReport(dailyReports);
  }

  /**
   * Generate report with training context for better output
   * Delegate to SummarizeReportService
   */
  async generateSummarizeReportWithTraining(input: string): Promise<string> {
    return await this.summarizeService.generateSummarizeReportWithTraining(input);
  }

  /**
   * Tạo báo cáo tổng hợp team với đánh giá hiệu suất
   * Delegate to SummarizeReportService
   */
  async generateComprehensiveTeamReport(data: any[] | string): Promise<string> {
    return await this.summarizeService.generateComprehensiveTeamReport(data);
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
