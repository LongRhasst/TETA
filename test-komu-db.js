// Test script to demonstrate querying KOMU daily data from database
const { PrismaClient } = require('./generated/prisma');

async function testKomuDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing KOMU database functionality...\n');
    
    // Get all reports
    const allReports = await prisma.data_report.findMany({
      orderBy: { create_time: 'desc' },
      take: 5 // Get latest 5 reports
    });
    
    console.log(`📊 Found ${allReports.length} KOMU daily reports:`);
    allReports.forEach((report, index) => {
      console.log(`\n${index + 1}. Message ID: ${report.message_id}`);
      console.log(`   User: ${report.username}`);
      console.log(`   Date: ${report.date || 'N/A'}`);
      console.log(`   Project: ${report.project_label || 'N/A'}`);
      console.log(`   Task: ${report.task_label || 'N/A'}`);
      console.log(`   Working Time: ${report.working_time || report.default_working_time || 'N/A'}`);
      console.log(`   Has Reply Data: ${report.reply_data ? 'Yes' : 'No'}`);
      console.log(`   Has Update Data: ${report.update_data ? 'Yes' : 'No'}`);
    });
    
    if (allReports.length === 0) {
      console.log('   No reports found yet. Try sending a *daily command in Mezon!');
    }
    
  } catch (error) {
    console.error('❌ Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testKomuDatabase();
