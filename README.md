# TETA Bot - Project Management Assistant

TETA Bot là một chatbot tự động hóa việc quản lý dự án, tích hợp với Mezon để thu thập daily reports và tạo báo cáo tổng hợp bằng AI.

## 🚀 Tính năng chính

- **Thu thập Daily Reports**: Tự động parse và lưu trữ daily reports từ Mezon
- **Báo cáo AI**: Sử dụng LM Studio để tạo báo cáo đánh giá dự án theo 12 tiêu chí
- **Cronjob tự động**: Tự động tạo báo cáo tuần vào 0h thứ 2 hàng tuần
- **Cache báo cáo**: Tránh tạo lại báo cáo đã có sẵn
- **Thống kê chi tiết**: Phân tích performance team và dự án

## 📋 Yêu cầu hệ thống

- Node.js >= 18.x
- MySQL 8.0+
- LM Studio với model deepseek/deepseek-r1-0528-qwen3-8b
- Mezon account và bot token

## ⚙️ Cài đặt

### 1. Clone repository
```bash
git clone https://github.com/LongRhasst/TETA.git
cd TETA
```

### 2. Cài đặt dependencies
```bash
npm install
# hoặc
yarn install
```

### 3. Cấu hình môi trường
Tạo file `.env` từ template:
```bash
cp .env.example .env
```

Cập nhật các thông tin trong `.env`:
```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/teta"

# Mezon Configuration
MEZON_TOKEN="your_mezon_bot_token"

# LM Studio Configuration
LM_STUDIO_API_URL=http://127.0.0.1:1234
LM_STUDIO_MODEL=deepseek/deepseek-r1-0528-qwen3-8b
AI_TIMEOUT=120000

# Optional: Default channel for auto reports
DEFAULT_REPORT_CHANNEL_ID="your_default_channel_id"
```

### 4. Thiết lập database
```bash
# Tạo và áp dụng migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 5. Cài đặt LM Studio
1. Tải và cài đặt [LM Studio](https://lmstudio.ai/)
2. Tải model `deepseek/deepseek-r1-0528-qwen3-8b`
3. Khởi động Local Server trên port 1234
4. Load model với context length 4096 tokens

## 🏃 Chạy ứng dụng

### Development mode
```bash
npm run start:dev
```

### Production mode
```bash
npm run build
npm run start:prod
```

### Docker (optional)
```bash
docker-compose up -d
```

## 🤖 Sử dụng Bot trong Mezon

### Lệnh có sẵn

#### 1. `*weeklyReport`
Tạo báo cáo đánh giá dự án theo 12 tiêu chí chuẩn
```
*weeklyReport
```
- Phân tích daily reports của tuần hiện tại
- Tạo báo cáo JSON format theo interface ProjectReport
- Tự động lưu vào database với code = 1
- Cache báo cáo để tránh tạo lại

#### 2. `*weeklyUserReport`
Tạo báo cáo tổng hợp team
```
*weeklyUserReport
```
- Summarize daily reports thành format dễ đọc
- Phân tích performance và insights

#### 3. `*reportStats`
Xem thống kê báo cáo
```
*reportStats
```
- Hiển thị metrics tổng quan
- Thống kê theo dự án và thành viên
- Tỷ lệ báo cáo hợp lệ/không hợp lệ

### Time Filters

Bot hỗ trợ các time filters:
- `1` - Tuần hiện tại
- `2` - Tuần trước
- `3` - Tháng hiện tại
- `4` - Tháng trước

Ví dụ:
```
*weeklyReport 2  // Báo cáo tuần trước
*reportStats 3   // Thống kê tháng hiện tại
```

### Daily Report Format

Bot tự động parse daily reports với format:
```
**Dự án**: [HN2]Training Python - ToaiNC
**Task**: Backend Development
**Loại công việc**: Development

**Ngày**: 23/08/2025
**Hôm qua**: Hoàn thành API user authentication
**Hôm nay**: Phát triển API quản lý tasks
**Blockers**: Chờ design UI từ team UX
**Thời gian làm việc**: 8h
```

## ⏰ Cronjob tự động

Bot có 2 cronjob tự động:

### 1. Weekly Report Auto Generation
- **Lịch**: 0h thứ 2 hàng tuần (`0 0 * * 1`)
- **Múi giờ**: Asia/Ho_Chi_Minh
- **Chức năng**: 
  - Tự động tạo báo cáo tuần cho tuần vừa kết thúc
  - Lưu vào `weekly_reports` với code = 1
  - Kiểm tra duplicate trước khi tạo mới
  - Log chi tiết quá trình xử lý

### 2. Data Cleanup
- **Lịch**: 1h sáng Chủ nhật hàng tuần (`0 1 * * 0`)
- **Chức năng**:
  - Xóa daily reports cũ hơn 3 tháng
  - Giữ weekly_reports không giới hạn thời gian
  - Optimize database performance

### Cấu hình Cronjob

Trong `src/v2/cron/cron-job.service.ts`:
```typescript
@Cron('0 0 * * 1', {
  name: 'weekly-report-auto',
  timeZone: 'Asia/Ho_Chi_Minh',
})
async handleWeeklyReportCron() {
  // Logic tự động tạo báo cáo
}
```

### Logs Cronjob

Theo dõi logs để monitor cronjob:
```bash
# Development
tail -f logs/app.log

# Production với PM2
pm2 logs teta-bot
```

Logs patterns:
```
🕐 Bắt đầu tự động tạo báo cáo tuần...
📊 Đang tạo báo cáo cho tuần: 18/08/2025 - 24/08/2025
📋 Tìm thấy 25 báo cáo để phân tích
✅ Đã tạo và lưu báo cáo tuần thành công
```

## 🗂️ Cấu trúc Database

### Bảng `daily_notess`
Lưu trữ daily reports thô:
```sql
- message_id (PK)
- channel_id, clan_id
- member, display_name
- project_value, task_label
- yesterday, today, block
- working_time, date
- daily_late (boolean)
- create_time, update_time
```

### Bảng `weekly_reports`
Lưu trữ báo cáo AI đã generate:
```sql
- id (PK)
- project_name, member, progress
- customer_communication, human_resource
- profession, technical_solution
- testing, milestone, week_goal
- issue, risks
- code (1=weeklyreport)
- create_time, update_time
```

## 🔧 Command Codes

Hệ thống sử dụng codes để phân biệt loại báo cáo:
```typescript
export const COMMAND_CODES = {
  WEEKLY_REPORT: 1,      // *weeklyreport
  PROJECT_REPORT: 2,     // (reserved)
  TEAM_SUMMARY: 3,       // (reserved)
  DAILY_REPORT: 4,       // (reserved)
} as const;
```

## 🚨 Troubleshooting

### LM Studio Issues
```bash

# Common errors:
- ECONNREFUSED: LM Studio server not running
- Context overflow: Model context limit exceeded (4096 tokens)
- Timeout: Increase AI_TIMEOUT in .env
```

### Database Issues
```bash
# Reset migrations
npx prisma migrate reset

# Check connection
npx prisma db pull

# Debug queries
npx prisma studio
```

## 📊 Performance Optimization

### Context Length Management
- System prompts: ≤500 chars
- User prompts: ≤3000 chars  
- Use chunking for large inputs
- Limit reports to 15 per analysis

### Database Optimization
- Indexed on create_time for time queries
- Regular cleanup of old daily_notess
- Efficient time range filters

### AI Performance
- Cache reports to avoid regeneration
- Use truncation for long content
- Implement retry logic for timeouts


## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod


# TETA
 