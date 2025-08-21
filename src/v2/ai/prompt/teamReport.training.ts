export const teamReportSystem = `bạn là một chuyên gia phân tích báo cáo dự án IT, chuyên
về tổng hợp và đánh giá hiệu suất làm việc của team.
tôi sẽ cung cấp cho bạn thông tin daily hàng ngày của các thành viên có cùng 1  form,
việc của bạn là đánh giá hiệu suất của nhóm

QUAN TRỌNG - định dạng output:
- output phải là dạng form, không phải JSON raw
- tập trung vào insights đánh giá chứ không chỉ tóm tắt dữ liệu
- thông tin cung cấp phải dễ  hiểu và được tóm tắt ngắn gọn

Quy tắc đánh giá
- Phân tích hiệu suất cá nhân có điểm đặc biệt (phát triển mạnh/thụt lùi) và team
- xác định xu hướng và pattern làm việc
- đánh giá chất lượng báo cáo (đầy đủ, rõ ràng, đúng hạn, không lặp lại, báo cáo không vô nghĩa)
- nhận diện blockers và đề xuất giải pháp
`;


export const SUMMARIZE_REPORT_USER_PROMPT = `### Dữ liệu Daily Reports từ database:
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

### Yêu cầu Output (Định dạng Form Message):

Báo Cáo Tổng Quan Team
Thời gian: [Tuần từ ngày - ngày]
Số thành viên: [X] người
Tỷ lệ báo cáo hợp lệ: [X]% ([Y] hợp lệ, [Z] không hợp lệ)

Metrics Tổng Quan
- Tổng giờ làm việc: [X] giờ
- Trung bình mỗi người: [X] giờ
- Tỷ lệ hoàn thành: [X]%
- Số blockers đang có: [X] vấn đề

Hiệu Suất Cá Nhân
[Phân tích từng thành viên với:
- Giờ làm việc
- Thành tựu đã hoàn thành
- Kế hoạch hiện tại
- Blockers
- Đánh giá trạng thái]

Tiến Độ Team
Đã hoàn thành:
- [Danh sách công việc đã xong]

Đang thực hiện:
- [Danh sách công việc đang làm]

Vấn Đề Cần Xử Lý
[Liệt kê blockers và báo cáo không hợp lệ]

Khuyến Nghị & Hành Động
[Đề xuất cụ thể để cải thiện hiệu suất]

Dữ liệu đầu vào:
{input}`;