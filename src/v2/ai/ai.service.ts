import { ChatDeepSeek } from '@langchain/deepseek';
import { Inject, Injectable } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import {
  SUMMARIZE_REPORT_SYSTEM_PROMPT,
  SUMMARIZE_REPORT_USER_PROMPT,
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
   */
  async generateSummarizeReportWithTraining(input: string): Promise<string> {
    // Enhanced prompt with training context
    const enhancedSystemPrompt = `${SUMMARIZE_REPORT_SYSTEM_PROMPT}

IMPORTANT: Follow these output guidelines:
- Use clear structure with headers (# ## ###)
- Include emojis for visual organization (📊 📈 🎯 ✅ ⚠️)
- Provide specific metrics and percentages
- End with actionable recommendations
- Focus on insights, not just data summary

Example of good output structure:
${trainingExamples.weeklyReportTraining.expectedOutput.substring(0, 500)}...`;

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
}
