/**
 * AI Training Examples - Input/Output pairs for training better AI responses
 * These examples show the AI what good outputs should look like
 */

export const trainingExamples = {
  /**
   * Training Example 1: Weekly Report Generation
   */
  weeklyReportTraining: {
    input: `Generate a weekly report from this data:
[
  {
    "message_id": "1840651253269401600",
    "username": "john.doe",
    "channel_id": "1234567890",
    "clan_id": "0987654321",
    "sender_id": "user_john_123",
    "display_name": "John Doe",
    "sender_username": "john.doe",
    "project_label": "TETA Backend",
    "project_value": "TETA_BE_001",
    "task_label": "Authentication Module",
    "task_value": "AUTH_001",
    "work_type": "Development",
    "default_working_time": 8,
    "date": "2025-08-18",
    "yesterday": "Completed user authentication API, Fixed database connection bug",
    "today": "Implement password reset feature, Write unit tests",
    "block": "Waiting for design approval from UI team",
    "working_time": "8 hours",
    "reply_data": {"content": "Daily report form submitted"},
    "update_data": {"content": "Daily report completed successfully"},
    "is_valid": true,
    "create_time": "2025-08-18T05:02:03.675Z",
    "update_time": "2025-08-18T10:30:00.000Z"
  },
  {
    "message_id": "1840651253290373120",
    "username": "jane.smith",
    "channel_id": "1234567890", 
    "clan_id": "0987654321",
    "sender_id": "user_jane_456",
    "display_name": "Jane Smith",
    "sender_username": "jane.smith",
    "project_label": "TETA Frontend",
    "project_value": "TETA_FE_001",
    "task_label": "User Interface",
    "task_value": "UI_001",
    "work_type": "Development",
    "default_working_time": 8,
    "date": "2025-08-18",
    "yesterday": "Designed login page mockups, Created responsive layout",
    "today": "Code login form, Integrate with backend API",
    "block": "Need API documentation",
    "working_time": "7.5 hours",
    "reply_data": {"content": "Daily report form submitted"},
    "update_data": {"content": "Daily report completed successfully"},
    "is_valid": true,
    "create_time": "2025-08-18T05:26:33.611Z",
    "update_time": "2025-08-18T11:15:00.000Z"
  },
  {
    "message_id": "1840651253311344640",
    "username": "bob.wilson",
    "channel_id": "1234567890",
    "clan_id": "0987654321", 
    "sender_id": "user_bob_789",
    "display_name": "Bob Wilson",
    "sender_username": "bob.wilson",
    "project_label": "TETA QA",
    "project_value": "TETA_QA_001",
    "task_label": "Quality Assurance",
    "task_value": "QA_001",
    "work_type": "Testing",
    "default_working_time": 8,
    "date": "2025-08-18",
    "yesterday": null,
    "today": null,
    "block": null,
    "working_time": null,
    "reply_data": {"content": "Daily report form submitted"},
    "update_data": {"content": "Invalid daily time frame. Please daily at 7h30-17h. not daily 20k/time."},
    "is_valid": true,
    "create_time": "2025-08-18T06:45:12.890Z",
    "update_time": "2025-08-18T12:00:00.000Z"
  }
]`,

    expectedOutput: `# Weekly Team Report
**Period:** August 12-18, 2025
**Team Size:** 3 members
**Report Status:** 100% valid submissions

## 📊 Summary Metrics
- **Total Working Hours:** 15.5 hours
- **Average per Person:** 7.75 hours
- **Completion Rate:** 100%
- **Active Blockers:** 2 items

## 👥 Individual Performance

### John Doe - Backend Developer
**Working Time:** 8 hours
**Yesterday's Achievements:**
- ✅ Completed user authentication API
- ✅ Fixed database connection bug

**Today's Plan:**
- 🎯 Implement password reset feature
- 🎯 Write unit tests

**Current Blockers:**
- ⏳ Waiting for design approval from UI team

**Status:** On track, productive output

### Jane Smith - Frontend Developer  
**Working Time:** 7.5 hours
**Yesterday's Achievements:**
- ✅ Designed login page mockups
- ✅ Created responsive layout

**Today's Plan:**
- 🎯 Code login form
- 🎯 Integrate with backend API

**Current Blockers:**
- ⏳ Need API documentation

**Status:** On track, good design progress

## 🚀 Team Progress
**Completed This Week:**
- User authentication system (Backend)
- Login page design (Frontend)
- Database optimization

**In Progress:**
- Password reset feature
- Frontend integration
- API documentation

## ⚠️ Action Items
1. **UI Team:** Approve design for John's features
2. **Backend:** Provide API documentation for Jane
3. **Team:** Schedule integration planning meeting

## 📈 Recommendations
- Consider daily standup to resolve blockers faster
- Create shared API documentation space
- Set up design approval workflow`
  },

  /**
   * Training Example 2: Data Comparison
   */
//   comparisonTraining: {
//     input: `Compare these two weeks of data:

// Current Week:
// [
//   {"username": "john.doe", "working_time": 8.0, "completed_tasks": 5, "blocked_items": 1},
//   {"username": "jane.smith", "working_time": 7.5, "completed_tasks": 4, "blocked_items": 1}
// ]

// Previous Week:
// [
//   {"username": "john.doe", "working_time": 7.0, "working_time": 3, "blocked_items": 2},
//   {"username": "jane.smith", "working_time": 8.0, "completed_tasks": 3, "blocked_items": 2}
// ]`,

//     expectedOutput: `# Week-over-Week Performance Analysis

// ## 📊 Overall Team Metrics
// | Metric | Previous Week | Current Week | Change |
// |--------|---------------|--------------|---------|
// | Avg Working Time | 7.5h | 7.75h | +0.25h (+3%) |
// | Total Tasks | 6 | 9 | +3 (+50%) |
// | Blocked Items | 4 | 2 | -2 (-50%) |

// ## 👤 Individual Performance Changes

// ### John Doe
// **Working Time:** 7.0h → 8.0h *(+1.0h, +14%)*
// **Completed Tasks:** 3 → 5 *(+2, +67%)*
// **Blocked Items:** 2 → 1 *(-1, -50%)*

// **Analysis:** 
// - 🟢 **Significant improvement** in productivity
// - 🟢 **Better time allocation** with increased hours
// - 🟢 **Reduced blockers** showing better planning

// ### Jane Smith
// **Working Time:** 8.0h → 7.5h *(-0.5h, -6%)*
// **Completed Tasks:** 3 → 4 *(+1, +33%)*
// **Blocked Items:** 2 → 1 *(-1, -50%)*

// **Analysis:**
// - 🟢 **Improved efficiency** - more tasks in less time
// - 🟢 **Better workflow** with fewer blockers
// - 🟢 **Excellent optimization** of working hours

// ## 🎯 Key Insights
// 1. **Team Productivity Up 50%** - Excellent progress
// 2. **Blocker Resolution Improved** - Better team coordination
// 3. **Time Management Optimized** - More effective work patterns

// ## 📋 Recommendations
// 1. **Share John's time management approach** with team
// 2. **Document Jane's efficiency techniques** for others
// 3. **Continue current blocker resolution process**
// 4. **Maintain momentum** with current practices

// ## 🚀 Next Week Focus
// - Keep productivity gains
// - Further reduce blockers
// - Share best practices across team`
//   },

  /**
   * Training Example 3: Invalid Report Analysis
   */
//   invalidReportTraining: {
//     input: `Analyze these invalid reports:
// [
//   {
//     "username": "bob.wilson",
//     "error": "Invalid daily time frame. Please daily at 7h30-17h. not daily 20k/time.",
//     "date": "2025-08-18",
//     "is_valid": false
//   },
//   {
//     "username": "alice.brown", 
//     "error": "Invalid daily time frame. Please daily at 8h00-18h. not daily 20k/time.",
//     "date": "2025-08-18",
//     "is_valid": false
//   }
// ]`,

//     expectedOutput: `# Invalid Reports Analysis & Solutions

// ## 🚨 Issue Summary
// **Date:** August 18, 2025
// **Invalid Reports:** 2 out of X total submissions
// **Success Rate:** Currently impacted by format errors

// ## 📋 Error Details

// ### Bob Wilson - Report ID: Invalid Time Format
// **Error Message:** "not daily 20k/time"
// **Issue Type:** Monetary value instead of time duration
// **Correct Format Should Be:** "8 hours" or "8h"

// ### Alice Brown - Report ID: Invalid Time Format  
// **Error Message:** "not daily 20k/time"
// **Issue Type:** Monetary value instead of time duration
// **Correct Format Should Be:** "6 hours" or "6h"

// ## 🔍 Root Cause Analysis
// **Primary Issue:** Users entering monetary values 20k
// **Pattern:** "20k/time" format suggests confusion about field purpose
// **Likely Cause:** Unclear field labeling or examples in the form

// ## 💡 Immediate Solutions

// ### For Bob Wilson:
// - Change "20k/time" → "8 hours"
// - Provide time format examples
// - Show working hours range: 7h30-17h30

// ### For Alice Brown:
// - Change "15k/time" → "6 hours" 
// - Clarify that this is work duration, not payment
// - Provide format options: "6h", "6 hours", "360 minutes"

// ## 🛠️ System Improvements

// ### Short-term Fixes:
// 1. **Add Input Validation**
//    - Block non-time formats
//    - Suggest correct format on error
//    - Provide dropdown with common values

// 2. **Improve Form Labels**
//    - Change "working time" to "Hours Worked Today"
//    - Add placeholder: "e.g., 8 hours, 8h, 480 min"
//    - Include format examples

// 3. **User Training**
//    - Send correction instructions to affected users
//    - Provide quick tutorial on time entry

// ### Long-term Prevention:
// 1. **Smart Input Field**
//    - Auto-complete for time values
//    - Format conversion (8.5 → "8 hours 30 minutes")
//    - Visual time picker interface

// 2. **Validation Messages**
//    - Clear error messages with examples
//    - Real-time format checking
//    - Success confirmation for correct entries

// ## 📞 Follow-up Actions
// 1. **Contact users** Bob Wilson and Alice Brown with corrections
// 2. **Update form interface** within 24 hours
// 3. **Monitor submission patterns** for improvement
// 4. **Review other time-related fields** for similar issues

// ## 📊 Success Metrics
// - Target: 0% time format errors next week
// - Goal: 100% first-time submission success
// - Monitor: User feedback on new interface`
//   }
};

export const promptTrainingExamples = {
  /**
   * System prompt training - How AI should behave
   */
  systemPromptBehavior: {
    role: "You are an expert project management analyst specializing in team productivity reports.",
    
    guidelines: [
      "Always structure responses with clear headers and sections",
      "Use emojis for visual organization (📊 📈 🎯 ✅ ⚠️)",
      "Provide specific, actionable recommendations",
      "Include metrics and percentages when possible",
      "Maintain professional but friendly tone",
      "Focus on insights, not just data summary",
      "Always end with clear next steps or action items"
    ],
    
    outputFormat: {
      structure: "# Title, ## Sections, ### Subsections",
      metrics: "Use tables, bullet points, and progress indicators",
      recommendations: "Numbered action items with priorities",
      insights: "Highlight key trends and patterns"
    }
  },

  /**
   * Response quality examples
   */
  qualityExamples: {
    good: {
      characteristics: [
        "Specific metrics with context",
        "Clear action items",
        "Visual organization with emojis/symbols", 
        "Professional insights",
        "Forward-looking recommendations"
      ],
      
      example: "🟢 **Improved efficiency** - Jane completed 4 tasks in 7.5h (0.53 tasks/hour) vs 3 tasks in 8h last week (0.375 tasks/hour), showing 41% productivity increase."
    },

    poor: {
      characteristics: [
        "Generic statements without data",
        "No specific recommendations", 
        "Poor formatting/structure",
        "Just restating input data",
        "No insights or analysis"
      ],
      
      example: "Jane did good work this week. She completed some tasks. Everything looks fine."
    }
  }
};

export default { trainingExamples, promptTrainingExamples };
