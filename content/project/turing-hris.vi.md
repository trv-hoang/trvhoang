---
title: "Turing HRIS"
description: "Phần mềm quản lý nhân sự Turing Factor đang bán cho doanh nghiệp Việt Nam. Tôi làm ứng dụng xin nghỉ phép cho nhân viên, chức năng duyệt phép cập nhật tức thời và lịch nghỉ lễ tính theo âm lịch."
status: "In Progress"
tags: ["Cloudflare Workers", "Hono", "Hotwire", "D1", "Durable Objects", "PWA"]
type: "project"
group: "turing"
cover: ["/images/projects/turing-hris/cover-approvals.jpg", "/images/projects/turing-hris/cover-holidays.jpg"]
coverType: "web"
gallery:
  - src: "/images/projects/turing-hris/01-approvals.jpg"
    caption: "Duyệt nghỉ phép: quản lý duyệt trước, sau đó đến bộ phận nhân sự."
  - src: "/images/projects/turing-hris/02-holidays.jpg"
    caption: "Ngày lễ được tạo từ quy tắc hằng năm, kể cả ngày tính theo âm lịch như Tết."
  - src: "/images/projects/turing-hris/03-chart.jpg"
    caption: "Sơ đồ tổ chức."
  - src: "/images/projects/turing-hris/04-report-leave.jpg"
    caption: "Số ngày phép còn lại theo loại phép và theo phòng ban."
  - src: "/images/projects/turing-hris/05-employees.jpg"
    caption: "Danh sách nhân viên."
weight: 4
role: "Lập trình viên full-stack"
teamSize: "3"
duration: "06 – 10/2026"
platform: "Web & PWA"
---

## Tổng quan

Turing HRIS là phần mềm quản lý nhân sự mà Turing Factor đang bán: hồ sơ nhân viên, lịch làm việc, chấm công, nghỉ phép và ngày lễ, được thiết kế theo đúng cách các doanh nghiệp Việt Nam vận hành. Sản phẩm bắt đầu từ một module chấm công, đã chạy thực tế từ giữa năm 2026 với dữ liệu văn phòng của khách hàng đầu tiên, và hiện đang được xây dựng lại trên nền tảng Fountainhead.

### Phần tôi phụ trách

- **Ứng dụng cho nhân viên** Ứng dụng cài trên điện thoại để nhân viên xin nghỉ và quản lý duyệt đơn; bấm vào thông báo là mở đúng đơn cần xem. Hiệu ứng chuyển trang, danh sách, màn hình chờ tải và thao tác kéo xuống để tải lại đều chạy tốt trên iOS, nên ứng dụng dùng mượt như ứng dụng gốc mà không cần thư viện hiệu ứng.
- **Duyệt phép tức thời** Trước đây phải tải lại trang mới thấy đơn mới hoặc kết quả duyệt. Giờ một Durable Object dùng WebSocket gửi cập nhật ngay đến những người liên quan đang mở trang.
- **Ngày lễ theo âm lịch** Tết, Giỗ Tổ và Trung thu rơi vào ngày dương lịch khác nhau mỗi năm. Tôi đưa thuật toán lịch âm của Hồ Ngọc Đức vào hệ thống và xây bộ quy tắc *đề xuất* ngày nghỉ lễ hằng năm để bộ phận nhân sự xác nhận. Kết quả đã được đối chiếu với ngày Tết chính thức từ 2024 đến 2028.
- **Ngày phép theo luật** Số ngày phép tối thiểu theo Bộ luật Lao động (Điều 113, 114) giờ chỉ có thể tăng, không thể giảm. Trước đó quản trị viên có thể hạ phép năm của người làm công việc nặng nhọc từ 16 xuống 12 ngày.
- **Sửa lỗi cho bộ phận nhân sự** Đợt nghỉ lễ dài hơn 16 ngày từng không lưu được vì D1 giới hạn 100 tham số mỗi câu lệnh; giờ dữ liệu được chia nhỏ và lưu trong cùng một batch. Lịch sử duyệt đơn được dựng lại từ nhật ký hoạt động, nên đơn đã huỷ không còn hiện nhầm là đã chuyển cho nhân sự.
