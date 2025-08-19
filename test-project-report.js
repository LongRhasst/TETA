// Test script để thử nghiệm báo cáo đánh giá dự án 12 tiêu chí
const { PrismaClient } = require('./generated/prisma');

async function testProjectReport() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing Project Report Generation...\n');
    
    // Lấy dữ liệu báo cáo từ database
    const reports = await prisma.data_report.findMany({
      orderBy: { create_time: 'desc' },
      take: 10 // Lấy 10 báo cáo gần nhất
    });
    
    if (reports.length === 0) {
      console.log('❌ Không có dữ liệu báo cáo để test');
      return;
    }
    
    console.log(`📊 Found ${reports.length} reports for testing`);
    
    // Hiển thị sample data structure
    console.log('\n=== SAMPLE DATA STRUCTURE ===');
    const sampleReport = reports[0];
    console.log('Sample report fields:');
    console.log('- message_id:', sampleReport.message_id);
    console.log('- username:', sampleReport.username);
    console.log('- project_label:', sampleReport.project_label);
    console.log('- task_label:', sampleReport.task_label);
    console.log('- date:', sampleReport.date);
    console.log('- working_time:', sampleReport.working_time);
    console.log('- daily_late:', sampleReport.daily_late);
    console.log('- blockers:', sampleReport.block);
    
    // Phân tích cơ bản
    const validReports = reports.filter(r => !r.daily_late);
    const invalidReports = reports.filter(r => r.daily_late);
    const uniqueUsers = new Set(reports.map(r => r.username)).size;
    const uniqueProjects = new Set(reports.map(r => r.project_label).filter(Boolean));
    
    console.log('\n=== BASIC ANALYSIS ===');
    console.log(`Total reports: ${reports.length}`);
    console.log(`Valid reports: ${validReports.length}`);
    console.log(`Invalid reports: ${invalidReports.length}`);
    console.log(`Unique users: ${uniqueUsers}`);
    console.log(`Unique projects: ${Array.from(uniqueProjects).join(', ')}`);
    
    // Phân tích blockers
    const blockersCount = validReports.filter(r => r.block && r.block.trim() !== '').length;
    console.log(`Reports with blockers: ${blockersCount}`);
    
    // Phân tích working time
    const workingTimes = validReports
      .map(r => r.working_time)
      .filter(Boolean)
      .map(time => {
        const match = String(time).match(/(\\d+(?:\\.\\d+)?)\\s*(?:h|hour|giờ)/i);
        return match ? parseFloat(match[1]) : 0;
      });
    
    const totalHours = workingTimes.reduce((sum, hours) => sum + hours, 0);
    const avgHours = workingTimes.length > 0 ? totalHours / workingTimes.length : 0;
    
    console.log(`Total working hours: ${totalHours}`);
    console.log(`Average hours per report: ${avgHours.toFixed(1)}`);
    
    console.log('\\n✅ Data analysis completed. Ready for AI report generation!');
    console.log('\\nTo generate the actual AI report, run:');
    console.log('yarn start:dev and call the generateProjectReport API endpoint');
    
  } catch (error) {
    console.error('❌ Error testing project report:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testProjectReport();
