---
title: "Q Booking"
description: "Ứng dụng giúp khách hàng đặt lịch DJ, ca sĩ, MC cho sự kiện. Tôi là lập trình viên chính, phụ trách cả ứng dụng di động, API lẫn trang quản trị. Ứng dụng đã có mặt trên App Store và Google Play, với hơn 500 người dùng trước khi bàn giao."
status: "Live"
tags: ["Expo", "React Native", "TypeScript", "Cloudflare Workers", "Hono", "D1", "Workflows"]
appStore: "https://apps.apple.com/us/app/qbooking-app/id6778668023"
googlePlay: "https://play.google.com/store/apps/details?id=com.vn.qbooking.client"
type: "project"
group: "product"
featured: true
cover: ["/images/projects/q-booking-home.jpg", "/images/projects/q-booking-bookings.jpg"]
highlights: ["500+ người dùng trước khi bàn giao", "App Store & Google Play", "5 Cloudflare Workflows"]
weight: 1
role: "Lập trình viên chính (full-stack)"
teamSize: "2"
duration: "04 – 07/2026"
platform: "iOS, Android & web quản trị"
---

## Tổng quan

Ở Việt Nam, muốn mời DJ, ca sĩ hay MC cho đám cưới hoặc sự kiện công ty, người ta vẫn chủ yếu nhắn tin qua Facebook, Zalo hoặc nhờ người quen giới thiệu. Q Booking gom toàn bộ việc đó vào một ứng dụng: khách tìm nghệ sĩ, gửi yêu cầu, nhận báo giá, chuyển khoản đặt cọc 20% trực tiếp cho nghệ sĩ và đánh giá sau buổi diễn. Nghệ sĩ tự quản lý hồ sơ, lịch diễn và báo giá, còn quản trị viên duyệt căn cước của nghệ sĩ.

Đây là dự án tôi làm cho khách hàng với vai trò lập trình viên chính, dựa trên bộ khung và quy trình CI do một đồng nghiệp dựng sẵn. Bản iOS lên App Store vào tháng 6/2026, sau đó là bản Android trên Google Play. Khi tôi bàn giao cho khách vào tháng 9/2026, ứng dụng đã có hơn 500 người dùng.

### Phần tôi phụ trách

- **Quy trình đặt lịch** Mỗi lượt đặt lịch đi qua các bước gửi yêu cầu, báo giá, đặt cọc, xác nhận, hoàn tất và đánh giá, được xử lý bằng 5 Cloudflare Workflows. Quá hạn ở bước nào thì hệ thống tự từ chối, tự huỷ hoặc tự hoàn tất. Lượt đặt nhiều nghệ sĩ cùng lúc chạy theo mô hình saga: bước nào lỗi thì các bước trước được hoàn tác. Ngoài ra còn có tác vụ định kỳ khôi phục những lượt bị gián đoạn khi triển khai bản mới.
- **Chặn trùng lịch** Từng có hai khách cùng giữ một nghệ sĩ vào cùng một ngày. Tôi lần theo dữ liệu thật thì thấy ngày diễn chỉ bị khoá khi khách đặt cọc. Tôi chuyển việc khoá ngày lên ngay lúc tạo yêu cầu bằng một câu lệnh `INSERT … ON CONFLICT` rồi đọc lại (D1 không hỗ trợ transaction kiểu tương tác), và thêm tác vụ trả lại những ngày bị giữ quá hạn.
- **Bảo vệ ảnh căn cước** Ảnh CCCD là dữ liệu cá nhân theo Nghị định 13/2023. Mỗi ảnh được mã hoá bằng một khoá AES-256-GCM riêng, có thể đổi khoá mà không phải mã hoá lại ảnh cũ. Thông tin EXIF bị xoá trước khi lưu, và quản trị viên chỉ xem được ảnh qua máy chủ trung gian.
- **Trang quản trị** Chuyển sang TanStack Start render phía máy chủ, gọi API qua service binding của Cloudflare. Nhờ vậy không còn API quản trị công khai trên Internet, không cần cấu hình CORS, và token đăng nhập không còn nằm trong JavaScript.
- **Phát hành ứng dụng** Build bằng EAS, cập nhật qua mạng (OTA), nộp ứng dụng lên App Store và xử lý các lần bị từ chối, đổi package của bản Android, cùng công tắc bảo trì bật tắt bằng feature flag.
