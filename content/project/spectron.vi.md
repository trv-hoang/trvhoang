---
title: "Spectron"
description: "Hệ thống dùng AI phát hiện lỗi bề mặt sản phẩm trên dây chuyền sản xuất của ZetaMotion. Tôi phát triển cả ba phần: giao diện React, máy chủ Flask và phần xử lý hình ảnh bằng Python."
status: "Live"
tags: ["React", "TypeScript", "Python", "Flask", "WebRTC", "OpenCV"]
type: "project"
group: "product"
highlights: ["WebRTC cho camera trực tiếp", "Một giao diện thay cho hai", "Tự dọn báo cáo cũ"]
weight: 6
role: "Kỹ sư phần mềm (full-stack)"
duration: "07/2025 – nay"
platform: "Web & máy tính tại xưởng"
---

## Tổng quan

Spectron phát hiện lỗi bề mặt của sản phẩm ngay trên dây chuyền nhà máy. Camera công nghiệp chụp từng sản phẩm, mô hình AI chạy trên máy tính đặt tại xưởng sẽ tìm lỗi, còn người vận hành chạy lượt kiểm tra, xem camera trực tiếp và xem báo cáo trên giao diện web. Tôi tham gia cả ba phần của hệ thống: giao diện React, máy chủ Flask và phần xử lý hình ảnh viết bằng Python.

### Phần tôi phụ trách

- **Xem camera trực tiếp** Trước đây giao diện tải từng ảnh một, khoảng 1 khung hình mỗi giây. Tôi thay bằng luồng video WebRTC liên tục cho từng camera (cấu hình 10 khung hình mỗi giây): viết phần kết nối bằng aiortc và luồng video riêng trong máy chủ Flask, cùng một React hook để hiển thị. Hệ thống chạy được hoàn toàn trong mạng nội bộ nhà máy, không cần máy chủ STUN hay TURN.
- **Gộp hai giao diện làm một** Loại bỏ phiên bản giao diện cũ đang chạy song song. Tôi lập kế hoạch chuyển đổi từng thành phần rồi chuyển lần lượt từng màn hình, có kiểm tra kiểu dữ liệu sau mỗi bước, không mất tính năng nào.
- **Tránh đầy ổ cứng** Tác vụ định kỳ tự xoá báo cáo cũ, chỉ giữ lại số báo cáo gần nhất theo cấu hình. Thay đổi cấu hình có hiệu lực ngay mà không cần khởi động lại.
- **Sửa lỗi trong quy trình kiểm tra** Sửa lỗi kiểm tra hai mặt bị quay lại mặt trước, và lỗi ghi chú trên bản đồ lỗi bị lệch khi chuyển giữa các tab báo cáo, bằng cách tìm đúng nguyên nhân gốc.
- **Dùng AI soạn tài liệu hướng dẫn** Làm thử quy trình gồm một agent viết và một agent kiểm tra độc lập để soạn hướng dẫn sử dụng từ mã nguồn. Mỗi nội dung đều dẫn về đúng file và dòng code, chỗ nào chưa rõ thì để trống cho người bổ sung.
