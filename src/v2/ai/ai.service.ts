import { ChatDeepSeek } from '@langchain/deepseek';
import { Inject, Injectable } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class AiService {
  constructor(@Inject('AI') private readonly ai: ChatDeepSeek) {}

    async generateCompare() {
      const prompt = ChatPromptTemplate.fromMessages([
        [
          'system',
          '### You are a Data Engineer in an IT team which is comparing the work-daily report and timesheet working report day by day of each team member for a weekly report.'
        ]
      ]);
    }

    async generateSummarizeReport(req: string): Promise<string> {
      const prompt = ChatPromptTemplate.fromMessages([
        [
          'system',
          `You are a helpful assistant for a Project Manager in an IT team. 
          Your task is to merge and summarize two related daily work reports:
          1. The Daily Report
          2. The Timesheet
          
          Follow these rules strictly:
          - Identify matching records by Project ID and Date.
          - Remove duplicate content (case-insensitive, ignore minor wording differences).
          - Merge complementary details from both reports without losing any unique information.
          - If conflicting data appears, prefer Timesheet details for task-specific info, 
            and Daily Report details for high-level progress.
          - If any field is missing, output null for that field.
          - Output only valid JSON, without extra commentary or formatting.
          `
        ],
        [
          'user',
          `### Daily Report format:
          - *daily {date}*
          Project: <Project id>
          Yesterday: <Summary of yesterday's work>
          Today: <Summary of today's work>
          Block: <List of blocks encountered>
          
          ### Timesheet format:
          - Timesheet {date}
          Project: <Project id>
          Task: <Task id>
          Note: <Description of the task worked on that day>
          Time: <Working time for the task>
          Type: <'normal' or 'overtime'>
          
          ### Output Requirements:
          Return JSON in the following structure:
          {
            "project_id": "<Project id>",
            "date": "<date>",
            "summary": {
              "yesterday": "<Summary of yesterday's work>",
              "today": "<Summary of today's work>"
            },
            "blocks": ["<List of blocks encountered>"],
            "timesheet": [
              {
                "task_id": "<Task id>",
                "note": "<Description of the task worked on that day>",
                "time": "<Working time for the task>",
                "type": "<'normal' or 'overtime'>"
              }
            ]
          }
          
          ### Additional instructions:
          - Ensure no duplicate tasks or notes in the final output.
          - Keep summaries concise but informative.
          - If there are multiple projects in the input, return an array of JSON objects, one per project.
          
          ### Input data:
          {input}
          `
        ]
      ]);

    const chain = prompt.pipe(this.ai);
    const result = await chain.invoke({ input: req });

    if (typeof result.content === 'string') {
      return result.content;
    } else if (result.content && typeof result.content === 'object' && 't' in result.content) {
      return (result.content as { t: string }).t;
    } else {
      return JSON.stringify(result.content);
    }
  }
}
