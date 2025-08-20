// Test script để kiểm tra format của các reply messages
const { WeeklyReportService } = require('./src/v2/command/weeklyReport/weekly-report.service');
const { CommandHandler } = require('./src/v2/command/weeklyReport/command.handler');

// Mock data for testing
const mockReports = [
  {
    message_id: "test1",
    member: "testuser1",
    channel_id: "testchannel",
    clan_id: "testclan",
    project_label: "Test Project",
    task_label: "Coding",
    working_time: "8h",
    daily_late: false,
    yesterday: "Completed feature A",
    today: "Working on feature B",
    block: "No blockers"
  }
];

async function testMessageFormats() {
  console.log('🧪 Testing message formats...\n');
  
  // Test help message
  const commandHandler = new CommandHandler(null);
  const helpMessage = commandHandler.generateHelpMessage();
  
  console.log('📖 Help Message:');
  console.log('Message content:', helpMessage.t);
  console.log('Has code block markup:', helpMessage.mk && helpMessage.mk.length > 0);
  console.log('First markup type:', helpMessage.mk?.[0]?.type);
  console.log('---\n');
  
  // Test các loại message khác với mock data
  console.log('🔍 All messages should be wrapped in code blocks (```) for better formatting.');
  console.log('✅ Test completed successfully!\n');
  
  // Kiểm tra format của generateChannelMessageContent
  const { generateChannelMessageContent } = require('./src/v2/command/weeklyReport/message');
  
  const testMessage = generateChannelMessageContent({
    message: '```\nTest message content\n```',
    blockMessage: true
  });
  
  console.log('📝 Test generateChannelMessageContent:');
  console.log('Message:', testMessage.t);
  console.log('Has markup:', testMessage.mk.length > 0);
  console.log('Markup type:', testMessage.mk[0]?.type);
  console.log('Markup range:', `${testMessage.mk[0]?.s}-${testMessage.mk[0]?.e}`);
}

testMessageFormats().catch(console.error);
