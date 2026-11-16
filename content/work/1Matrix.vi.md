---
title: "Kỹ sư phần mềm tại 1Matrix"
company: "1Matrix"
logo: "/images/company-1matrix.png"
location: "Làm việc tại Hà Nội · Hiệp hội Blockchain Việt Nam"
roles:
  - title: "Kỹ sư phần mềm"
    period: "01/2026 – 08/2026"
    description: "Phát triển CRMatrix, hệ thống quản lý khách hàng nội bộ chạy trên Cloudflare Workers và D1: dashboard doanh số, tìm kiếm toàn văn và thông báo tức thời. Nhóm ba người."
tags: ["TypeScript", "React Router", "Hono", "Cloudflare Workers", "D1", "Durable Objects"]
type: "work"
url: "/vi/about/work/1matrix/"
weight: 2
---

## Tổng quan

Tại 1Matrix (thuộc Hiệp hội Blockchain Việt Nam), tôi phát triển CRMatrix, hệ thống quản lý khách hàng nội bộ theo dõi từ lúc khách còn là đầu mối tiềm năng đến khi chốt giao dịch, chạy trên Cloudflare Workers và D1. Nhóm có ba người, và tôi nhận từng hạng mục, làm trọn từ đặc tả, viết code, kiểm thử đến pull request.

### Công việc chính

- **Dashboard doanh số** Hiển thị các chỉ số chính, phễu bán hàng và tỉ lệ chuyển đổi giữa các giai đoạn cho 4 vai trò. Quyền được kiểm tra trên máy chủ, nên mỗi nhân viên kinh doanh chỉ thấy số liệu của chính mình.
- **Tìm kiếm toàn văn** Chuyển việc tìm liên hệ, đầu mối, giao dịch và công ty từ truy vấn `LIKE` sang SQLite FTS5 có xếp hạng kết quả; chỉ mục được cập nhật mỗi lần ghi dữ liệu.
- **Thông báo tức thời** Mỗi người dùng có một Durable Object riêng đẩy thông báo qua WebSocket, không tốn phí lúc không có hoạt động.
- **Cấu hình không cần sửa code** Giai đoạn bán hàng, loại khách hàng, nguồn khách và trường tuỳ chỉnh do quản trị viên tự thiết lập.
- **Làm việc cùng AI** Viết code cùng AI coding agent và công cụ review CodeRabbit, sau đó tự kiểm tra và kiểm thử lại kết quả.

Xem thêm ở [trang dự án CRMatrix](/vi/project/crmatrix/).
