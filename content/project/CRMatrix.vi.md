---
title: "CRMatrix"
description: "Hệ thống quản lý khách hàng nội bộ của 1Matrix, theo dõi từ lúc khách còn là đầu mối tiềm năng đến khi chốt giao dịch. Tôi phụ trách dashboard doanh số, tìm kiếm toàn văn và thông báo tức thời."
status: "Completed"
tags: ["TypeScript", "React Router", "Hono", "Cloudflare D1", "SQLite FTS5", "Durable Objects"]
type: "project"
group: "product"
featured: true
cover: ["/images/projects/crmatrix/cover-dashboard.jpg", "/images/projects/crmatrix/cover-deals.jpg"]
coverType: "web"
gallery:
  - src: "/images/projects/crmatrix/01-dashboard.jpg"
    caption: "Dashboard doanh số: các chỉ số chính và tình hình cơ hội, giao dịch."
  - src: "/images/projects/crmatrix/02-dashboard-revenue.jpg"
    caption: "Doanh thu theo nhóm sản phẩm và nhóm khách hàng, so sánh dự kiến với thực tế."
  - src: "/images/projects/crmatrix/03-deals.jpg"
    caption: "Giao dịch xếp theo từng giai đoạn trên bảng kanban."
  - src: "/images/projects/crmatrix/04-leads.jpg"
    caption: "Danh sách cơ hội."
  - src: "/images/projects/crmatrix/05-contacts.jpg"
    caption: "Danh sách liên hệ."
highlights: ["Dashboard cho 4 vai trò", "FTS5 cho 4 loại dữ liệu", "WebSocket cho thông báo tức thời"]
weight: 3
role: "Lập trình viên full-stack"
teamSize: "3"
duration: "01 – 08/2026"
platform: "Web"
---

## Tổng quan

CRMatrix là hệ thống quản lý khách hàng nội bộ của 1Matrix (Hiệp hội Blockchain Việt Nam). Hệ thống theo dõi một khách hàng từ lúc là đầu mối (lead), qua giai đoạn cơ hội, đến khi thành giao dịch. Có báo cáo cho toàn bộ phễu bán hàng và phân quyền cho quản trị viên, quản lý, nhân viên kinh doanh và người xem. Hệ thống chạy trên Cloudflare Workers, dùng D1, Hono và React Router. Nhóm có ba người, và tôi nhận từng hạng mục, làm trọn từ đặc tả, lên kế hoạch, viết code, kiểm thử đến khi mở pull request.

### Phần tôi phụ trách

- **Dashboard doanh số** Hiển thị các chỉ số chính, phễu bán hàng và tỉ lệ chuyển đổi giữa các giai đoạn cho 4 vai trò. Quyền xem được kiểm tra ngay trên máy chủ, nên nhân viên kinh doanh chỉ thấy số liệu của chính mình. Doanh thu của mỗi giao dịch thành công được chia theo nhóm sản phẩm của từng dòng hàng, và vẫn đúng khi lọc dashboard theo một nhóm sản phẩm.
- **Tìm kiếm toàn văn** Thay các câu truy vấn `LIKE '%…%'` bằng tìm kiếm SQLite FTS5 có xếp hạng kết quả cho liên hệ, đầu mối, giao dịch và công ty. Chỉ mục được cập nhật mỗi lần ghi dữ liệu, kể cả khi ghi từ công cụ AI hay nhật ký hoạt động. Khi tên một liên hệ thay đổi, các bản ghi liên quan cũng được đánh chỉ mục lại.
- **Thông báo tức thời** Mỗi người dùng có một Durable Object riêng để đẩy thông báo qua WebSocket. Kết nối không tốn phí lúc không có hoạt động (Hibernation API), và thao tác của người dùng không phải chờ thông báo gửi xong.
- **Cấu hình không cần sửa code** Các giai đoạn bán hàng, loại khách hàng doanh nghiệp, nguồn khách và trường tuỳ chỉnh trên 4 loại dữ liệu giờ do quản trị viên tự thiết lập, không còn viết cứng trong code.
