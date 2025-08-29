/**
 * Command codes để phân biệt các loại lệnh trong database
 */
export const COMMAND_CODES = {
  WEEKLY_REPORT: 1,      // *weeklyreport
  PROJECT_REPORT: 2,     // (reserved for future use)
  TEAM_SUMMARY: 3,       // (reserved for future use)
  DAILY_REPORT: 4,       // (reserved for future use)
} as const;

export type CommandCode = typeof COMMAND_CODES[keyof typeof COMMAND_CODES];

/**
 * Mapping từ command code về tên command
 */
export const COMMAND_NAMES = {
  [COMMAND_CODES.WEEKLY_REPORT]: '*weeklyreport',
  [COMMAND_CODES.PROJECT_REPORT]: '*projectreport',
  [COMMAND_CODES.TEAM_SUMMARY]: '*teamsummary',
  [COMMAND_CODES.DAILY_REPORT]: '*dailyreport',
} as const;
