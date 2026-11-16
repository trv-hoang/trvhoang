---
title: "Fountainhead"
description: "Nền tảng SaaS nhiều khách thuê (multi-tenant) của Turing Factor, chạy trên Cloudflare Workers. Mọi sản phẩm của Turing đều được xây dựng từ nền tảng này."
status: "In Progress"
tags: ["Cloudflare Workers", "Hono JSX", "Hotwire", "D1", "Drizzle", "SQLite FTS5", "PWA"]
type: "project"
group: "turing"
featured: true
cover: ["/images/projects/fountainhead/cover-overview.jpg", "/images/projects/fountainhead/cover-note.jpg"]
coverType: "web"
highlights: ["Phân quyền theo phạm vi dữ liệu", "Cài như ứng dụng cho từng tổ chức", "Nhật ký cả những lần bị từ chối"]
gallery:
  - src: "/images/projects/fountainhead/01-overview.jpg"
    caption: "Trang tổng quan của một xưởng nội thất, kèm gợi ý cài ứng dụng lên điện thoại."
  - src: "/images/projects/fountainhead/02-notes.jpg"
    caption: "Danh sách công việc với các trường tuỳ chỉnh: khách hàng, giá trị, bộ phận, việc gấp."
  - src: "/images/projects/fountainhead/03-note-detail.jpg"
    caption: "Chi tiết một công việc, kèm bình luận và lịch sử thay đổi."
  - src: "/images/projects/fountainhead/04-roles.jpg"
    caption: "Các vai trò tuỳ chỉnh, mỗi vai trò có màu và quyền riêng."
  - src: "/images/projects/fountainhead/05-role-editor.jpg"
    caption: "Màn hình chỉnh sửa vai trò."
  - src: "/images/projects/fountainhead/06-members.jpg"
    caption: "Thành viên và vai trò của từng người."
weight: 2
role: "Đóng góp chính (full-stack)"
teamSize: "3"
duration: "08/2026 – nay"
platform: "Web & PWA"
---

## Tổng quan

Fountainhead là nền tảng dùng chung cho mọi sản phẩm của Turing Factor. Nền tảng có sẵn những phần mà phần mềm SaaS cho doanh nghiệp nào cũng cần: đăng nhập, quản lý tổ chức, phân quyền, nhật ký hoạt động, thanh toán, tìm kiếm, tác vụ chạy nền, cập nhật tức thời và bộ giao diện chung. Mỗi sản phẩm chỉ cần sao chép (fork) nền tảng rồi viết thêm phần nghiệp vụ riêng. Toàn bộ chạy trên một Cloudflare Worker, giao diện được render phía máy chủ bằng Hono JSX kết hợp Hotwire, dữ liệu lưu trên D1. Hieu Tran, người cùng sáng lập công ty, phụ trách chính nền tảng.

### Phần tôi phụ trách

- **Phân quyền theo phạm vi dữ liệu** Mỗi tổ chức tự tạo vai trò, và mỗi quyền có thể giới hạn ở dữ liệu *của bản thân*, *của nhóm* hoặc *của tất cả*. Phạm vi này được kiểm tra cả khi xét quyền lẫn khi truy vấn dữ liệu. Người không phải chủ sở hữu không thể tự nâng quyền, và không ai tự khoá được quyền của chính mình.
- **Cài như ứng dụng trên điện thoại** Mỗi tổ chức có tên và biểu tượng riêng khi cài lên màn hình chính. Biểu tượng được tạo ngay trên trình duyệt từ logo, vì Workers không có công cụ xử lý ảnh. Service worker có trang dự phòng khi mất mạng và hoạt động đúng với cơ chế chuyển trang của Turbo.
- **Soạn thảo văn bản an toàn hơn** Sửa lỗi một bình luận chỉ khoảng 6 KB làm mọi người mở nó đều gặp lỗi 500, và lỗi ghi chú bị tự thay đổi nội dung dù người dùng không sửa gì. Tôi viết lại bộ hiển thị Markdown: mã hoá ký tự trước, chỉ cho phép những thẻ nằm trong danh sách, và giới hạn độ lồng nhau.
- **Tìm kiếm khi nhiều người cùng ghi** Mỗi tài liệu có số phiên bản, lần ghi chỉ mục nào cũ hơn bản đã lưu sẽ bị bỏ qua. Việc ghi số phiên bản và cập nhật chỉ mục FTS5 diễn ra trong cùng một batch của D1.
- **Ghi lại cả những lần bị từ chối** Mọi lần người dùng bị từ chối quyền ở 3 điểm kiểm tra đều được ghi vào nhật ký, các lần trùng nhau được gộp lại, và phản hồi người dùng nhận được vẫn giữ nguyên.
- **Bảng kanban** Bảng kéo thả cho các bản ghi có quy trình, dùng được bằng chuột, cảm ứng lẫn bàn phím. Máy chủ kiểm tra lại mỗi lần kéo thả, và không cần thêm thư viện nào.
