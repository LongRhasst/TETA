export const SUMMARIZE_REPORT_SYSTEM_PROMPT = `You are a Data Engineer in an IT team which is comparing the work-daily report and timesheet working report day by day of each team member for a weekly report.
your task is to summarize the 7 days daily report of each member get from database report into a single JSON object.
Follow these rules strictly:`;

export const SUMMARIZE_REPORT_USER_PROMPT = `### Daily Report format:
- *daily {{date}}*
Project: <Project id>
Yesterday: <Summary of yesterday's work>
Today: <Summary of today's work>
Block: <List of blocks encountered>

### Timesheet format:
- Timesheet {{date}}
Project: <Project id>
Task: <Task id>
Note: <Description of the task worked on that day>
Time: <Working time for the task>
Type: <'normal' or 'overtime'>

### Output Requirements:
Return JSON in the following structure:
{{
  "project_id": "<Project id>",
  "date": "<date>",
  "summary": {{
    "yesterday": "<Summary of yesterday's work>",
    "today": "<Summary of today's work>"
  }},
  "blocks": ["<List of blocks encountered>"],
  "timesheet": [
    {{
      "task_id": "<Task id>",
      "note": "<Description of the task worked on that day>",
      "time": "<Working time for the task>",
      "type": "<'normal' or 'overtime'>"
    }}
  ]
}}

### Additional instructions:
- Ensure no duplicate tasks or notes in the final output.
- Keep summaries concise but informative.
- If there are multiple projects in the input, return an array of JSON objects, one per project.

### Input data:
{input}`;
