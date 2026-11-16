---
title: "ScreenGuard"
description: "Ứng dụng trên thanh menu của macOS, tự tìm và che thông tin nhạy cảm trong ảnh chụp màn hình. Mọi xử lý đều diễn ra ngay trên máy. Chưa phát hành."
status: "In Progress"
tags: ["Rust", "Tauri", "OCR trên máy", "macOS"]
type: "project"
kind: "side"
weight: 7
role: "Phát triển một mình"
teamSize: "1"
duration: "04 – 07/2026"
platform: "macOS"
---

## Tổng quan

Chúng ta thường gửi ảnh chụp màn hình tin nhắn, terminal hay biểu mẫu, và nhiều khi vô tình để lộ email, số thẻ hoặc API key. ScreenGuard chạy trên thanh menu, nhận ảnh chụp mới từ clipboard hoặc một thư mục, nhận dạng chữ (OCR) ngay trên máy, rồi che những thông tin nhạy cảm trước khi bạn gửi đi. Không dữ liệu nào rời khỏi máy, và ảnh gốc không được lưu lại.

### Phần tôi phụ trách

- **Xử lý hoàn toàn trên máy** Quy trình gồm chụp, nhận dạng chữ, phát hiện, gộp vùng và che, viết bằng Rust với Tauri v2. Các bộ phát hiện chạy song song, và nếu một bước gặp lỗi thì ảnh gốc vẫn được giữ nguyên.
- **11 loại thông tin nhạy cảm** Số thẻ, email, số điện thoại, API key, mật khẩu, số tài khoản ngân hàng, địa chỉ IP, địa chỉ nhà, họ tên và mẫu do người dùng tự định nghĩa. Các loại rủi ro cao đều được kiểm tra thêm, ví dụ thuật toán Luhn cho số thẻ, tiền tố của AWS, Google, GitHub và Slack cho API key.
- **Nhận đúng nhãn tiếng Việt dù OCR mất dấu** OCR hay làm mất dấu tiếng Việt (`KHÁCH` thành `KH?CH`). Tôi cho phép so khớp nhãn với ký tự đại diện, và phân biệt nhãn viết hoa toàn bộ với tên người.
- **Xem lại trước khi che** Có 4 kiểu che (làm mờ, bôi đen, làm vỡ điểm ảnh, phủ hoa văn) và màn hình xem trước để giữ hoặc bỏ từng vùng được phát hiện.
