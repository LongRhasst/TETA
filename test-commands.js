// Test script for new command functionality
const { PrismaClient } = require('./generated/prisma');

async function testCommands() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing new command functionality...\n');
    
    // Test 1: Check if we have data for testing
    const allReports = await prisma.data_report.findMany({
      orderBy: { create_time: 'desc' },
      take: 10
    });
    
    console.log(`📊 Found ${allReports.length} reports for testing:`);
    allReports.forEach((report, index) => {
      console.log(`${index + 1}. ${report.member || 'Unknown'} - ${report.project_label || 'No project'} - ${report.date ? new Date(report.date).toLocaleDateString() : 'No date'}`);
    });
    
    // Test 2: Check distribution by channel
    const channelStats = {};
    allReports.forEach(report => {
      const channelId = report.channel_id;
      if (!channelStats[channelId]) {
        channelStats[channelId] = 0;
      }
      channelStats[channelId]++;
    });
    
    console.log('\n📈 Reports by channel:');
    Object.entries(channelStats).forEach(([channelId, count]) => {
      console.log(`Channel ${channelId}: ${count} reports`);
    });
    
    // Test 3: Check data quality
    const validReports = allReports.filter(r => !r.daily_late);
    const invalidReports = allReports.filter(r => r.daily_late);
    
    console.log('\n✅ Data quality:');
    console.log(`Valid reports: ${validReports.length}`);
    console.log(`Invalid reports: ${invalidReports.length}`);
    console.log(`Quality rate: ${allReports.length > 0 ? ((validReports.length/allReports.length)*100).toFixed(1) : 0}%`);
    
    // Test 4: Check project distribution
    const projectStats = {};
    validReports.forEach(report => {
      const project = report.project_label || 'Unknown';
      projectStats[project] = (projectStats[project] || 0) + 1;
    });
    
    console.log('\n🎯 Projects:');
    Object.entries(projectStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([project, count]) => {
        console.log(`${project}: ${count} reports`);
      });
    
    // Test 5: Sample data for AI processing
    if (validReports.length > 0) {
      console.log('\n📝 Sample report data:');
      const sample = validReports[0];
      console.log(`Member: ${sample.member}`);
      console.log(`Project: ${sample.project_label}`);
      console.log(`Task: ${sample.task_label}`);
      console.log(`Yesterday: ${sample.yesterday || 'N/A'}`);
      console.log(`Today: ${sample.today || 'N/A'}`);
      console.log(`Working time: ${sample.working_time || 'N/A'}`);
      console.log(`Date: ${sample.date ? new Date(sample.date).toLocaleDateString() : 'N/A'}`);
    }
    
    console.log('\n🚀 Commands available for testing:');
    console.log('*weeklyUserReport - Team summary report (use summarize prompt)');
    console.log('*weeklyReport - Project evaluation report (use project prompt with 12 criteria)');
    console.log('*weeklyReportAll - Comprehensive report (all channels)');
    console.log('*reportStats - Statistics');
    console.log('*help - Show help');
    
  } catch (error) {
    console.error('❌ Error testing commands:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testCommands();
