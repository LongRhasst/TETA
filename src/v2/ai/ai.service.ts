import { ChatDeepSeek } from '@langchain/deepseek';
import { Inject, Injectable } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import {
  SUMMARIZE_REPORT_SYSTEM_PROMPT,
  SUMMARIZE_REPORT_USER_PROMPT,
} from './prompts';

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

  // async generateCompare(req: string): Promise<string> {
  //   const prompt = ChatPromptTemplate.fromMessages([
  //     ['system', COMPARE_SYSTEM_PROMPT],
  //     ['user', COMPARE_USER_PROMPT],
  //     ['assistant', COMPARE_ASSISTANT_PROMPT],
  //   ]);

  //   const chain = prompt.pipe(this.ai);
  //   const result = await chain.invoke({ input: req });

  //   return this.formatResponse(result);
  // }

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
