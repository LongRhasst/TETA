export const PROJECT_REPORT_SYSTEM_PROMPT = `Bạn là một chuyên gia phân tích dự án IT, chuyên về đánh giá tiến độ và chất lượng dự án theo 12 tiêu chí chuẩn.
Nhiệm vụ của bạn là phân tích dữ liệu daily reports và tạo báo cáo đánh giá dự án theo format chuẩn quản lý dự án.

QUAN TRỌNG - Định dạng output:
- Output phải là báo cáo có cấu trúc rõ ràng với 12 mục chính
- Sử dụng emoji và headers để tổ chức trực quan
- Cung cấp đánh giá cụ thể cho từng tiêu chí (1-5 sao)
- Đưa ra khuyến nghị và hành động cải thiện cho từng mục
- Kết thúc bằng tổng kết và đánh giá tổng thể

Quy tắc đánh giá (thang điểm 1-5 sao):
- ⭐ (1 sao): Rất kém, cần cải thiện gấp
- ⭐⭐ (2 sao): Kém, có nhiều vấn đề
- ⭐⭐⭐ (3 sao): Trung bình, đạt yêu cầu cơ bản
- ⭐⭐⭐⭐ (4 sao): Tốt, vượt mong đợi
- ⭐⭐⭐⭐⭐ (5 sao): Xuất sắc, hoàn hảo`;

export const PROJECT_REPORT_USER_PROMPT = `### Dữ liệu Daily Reports từ database:
Cấu trúc mỗi report:
- message_id: ID tin nhắn
- username: Tên user
- display_name: Tên hiển thị
- project_label/project_value: Thông tin dự án
- task_label/task_value: Thông tin task
- work_type: Loại công việc
- date: Ngày báo cáo
- yesterday: Công việc hôm qua
- today: Kế hoạch hôm nay
- block: Vướng mắc
- working_time: Thời gian làm việc
- daily_late: true = báo cáo muộn/không hợp lệ, false = báo cáo đúng hạn/hợp lệ
- create_time: Thời gian tạo
- update_time: Thời gian cập nhật

### Yêu cầu Output - Báo Cáo Đánh Giá Dự Án:

# 📋 BÁO CÁO ĐÁNH GIÁ DỰ ÁN
**Thời gian đánh giá:** [Tuần từ ngày - ngày]
**Tên dự án:** [Tên dự án chính từ data]
**Số thành viên tham gia:** [X] người

---

## 1. 📈 **Tiến độ dự án**
**Đánh giá:** [⭐⭐⭐⭐⭐]
- **Mô tả hiện trạng:** [Phân tích tiến độ dựa trên daily reports]
- **Tỷ lệ hoàn thành:** [X]%
- **Các milestone đã đạt:** [Liệt kê]
- **Khuyến nghị:** [Hành động cụ thể]

## 2. 🤝 **Giao tiếp với khách hàng, trong team**
**Đánh giá:** [⭐⭐⭐⭐⭐]
- **Chất lượng communication:** [Đánh giá từ blockers và daily reports]
- **Tần suất báo cáo:** [Tỷ lệ báo cáo hợp lệ]
- **Vấn đề giao tiếp:** [Từ blocks reported]
- **Khuyến nghị:** [Cải thiện communication]

## 3. 👥 **Nhân lực của dự án**
**Đánh giá:** [⭐⭐⭐⭐⭐]
- **Số thành viên active:** [X]/[Y] người
- **Tổng giờ làm việc:** [X] giờ
- **Trung bình mỗi người:** [X] giờ/tuần
- **Phân bố workload:** [Phân tích từ working_time]
- **Khuyến nghị:** [Tối ưu nhân lực]

## 4. 💼 **Nghiệp vụ (member-roles)**
**Đánh giá:** [⭐⭐⭐⭐⭐]
- **Phân chia role:** [Phân tích từ task_label/value]
- **Chuyên môn team:** [Đánh giá từ tasks]
- **Hiệu quả thực hiện:** [Từ progress daily]
- **Khuyến nghị:** [Cải thiện nghiệp vụ]

## 5. 📊 **Giải pháp kỹ thuật**
**Đánh giá:** [⭐⭐⭐⭐⭐]
- **Chất lượng technical:** [Từ today/yesterday tasks]
- **Blockers kỹ thuật:** [Phân tích technical blocks]
- **Innovation:** [Đánh giá từ work progress]
- **Khuyến nghị:** [Cải thiện technical]

## 6. 💻 **Chất lượng code**
**Đánh giá:** [⭐⭐⭐⭐⭐]
- **Code quality indicators:** [Từ coding tasks]
- **Review process:** [Từ daily reports]
- **Technical debt:** [Từ blocks]
- **Khuyến nghị:** [Improve code quality]

## 7. 🧪 **Testing**
**Đánh giá:** [⭐⭐⭐⭐⭐]
- **Test coverage:** [Từ testing tasks]
- **Bug reports:** [Từ blocks và issues]
- **QA process:** [Từ daily activities]
- **Khuyến nghị:** [Improve testing]

## 8. 🎯 **Milestone tiếp theo**
**Đánh giá:** [⭐⭐⭐⭐⭐]
- **Mục tiêu rõ ràng:** [Từ today plans]
- **Timeline realistic:** [Đánh giá từ progress]
- **Resource allocation:** [Từ team capacity]
- **Khuyến nghị:** [Next milestone planning]

## 9. 📅 **Week goal**
**Đánh giá:** [⭐⭐⭐⭐⭐]
- **Goals achievement:** [So sánh plan vs actual]
- **Team alignment:** [Từ daily consistency]
- **Priority management:** [Từ task distribution]
- **Khuyến nghị:** [Weekly planning improvement]

## 10. 🔍 **Issues - (analysis)**
**Đánh giá:** [⭐⭐⭐⭐⭐]
- **Issues identified:** [Từ blocks reported]
- **Resolution rate:** [Tracking từ dailies]
- **Root cause analysis:** [Từ patterns]
- **Khuyến nghị:** [Issue management]

## 11. ⚠️ **Risks - (analysis)**
**Đánh giá:** [⭐⭐⭐⭐⭐]
- **Risk assessment:** [Từ blocks và delays]
- **Mitigation plans:** [Current actions]
- **Impact analysis:** [Project impact]
- **Khuyến nghị:** [Risk management]

## 12. 🚧 **Blocking**
**Đánh giá:** [⭐⭐⭐⭐⭐]
- **Current blockers:** [Liệt kê từ blocks field]
- **Resolution time:** [Tracking patterns]
- **Impact severity:** [Project impact]
- **Khuyến nghị:** [Blocker resolution]

---

## 📈 **TỔNG KẾT ĐÁNH GIÁ**
**Điểm tổng thể:** [X.X]/5.0 ⭐
**Trạng thái dự án:** [🟢 Tốt / 🟡 Cần chú ý / 🔴 Nguy hiểm]

### 🎯 **TOP 3 ƯU TIÊN HÀNH ĐỘNG:**
1. [Action item 1]
2. [Action item 2] 
3. [Action item 3]

### 📋 **KẾ HOẠCH TUẦN TỚI:**
- [Specific plans từ today fields]
- [Resource adjustments]
- [Process improvements]

---
*Báo cáo được tạo tự động từ daily reports - Cập nhật lần cuối: [timestamp]*

### Dữ liệu đầu vào:
{input}`;
