---
title: "Turing OMS"
description: "Phần mềm quản lý đơn hàng cho các shop bán qua Facebook, TikTok và Zalo. Tôi phụ trách sản phẩm kiêm lập trình viên chính, đưa sản phẩm từ khảo sát nhu cầu đến bản thiết kế sẵn sàng để phát triển."
status: "In Design"
tags: ["Khảo sát nhu cầu", "PRD", "Bản mẫu", "Cloudflare Workers", "Hono", "D1"]
type: "project"
kind: "turing"
weight: 5
role: "Phụ trách sản phẩm & lập trình viên chính"
teamSize: "3"
duration: "10/2026 – nay"
platform: "Web & PWA"
---

## Tổng quan

Các shop bán hàng online nhỏ thường nhận đơn qua tin nhắn rồi ghi lại bằng Excel, sổ tay hoặc nhớ trong đầu. Vào mùa cao điểm như 20/10 hay Valentine, đơn rất dễ bị sót, nhất là đơn làm theo yêu cầu. Turing OMS gom mọi đơn hàng về một chỗ, từ lúc khách nhắn tin đến lúc thu tiền: ghi đơn nhanh kèm ảnh, quản lý khách hàng, theo dõi trạng thái đơn, sản xuất theo đơn, tồn kho, khuyến mãi, đổi trả và công nợ.

Tôi phụ trách sản phẩm (product owner) và là lập trình viên chính. Chúng tôi làm cùng một cửa hàng hoa lụa để thiết kế sản phẩm sát với thực tế. Sản phẩm đang ở giai đoạn thiết kế, phần lập trình sẽ bắt đầu khi các tính năng nền tảng cần thiết đã sẵn sàng.

### Phần tôi phụ trách

- **Khảo sát và làm bản mẫu** Tìm hiểu cách cửa hàng đối tác đang vận hành, rồi kiểm chứng luồng sử dụng bằng bản mẫu bấm thử được và buổi demo với khách.
- **Một tài liệu yêu cầu duy nhất** Gộp ba bản đặc tả thành một tài liệu yêu cầu sản phẩm (PRD) đã được duyệt. Mỗi user story đều có tiêu chí nghiệm thu kiểm tra được, mỗi quyết định kiến trúc đều được ghi lại thành ADR.
- **Tận dụng nền tảng trước** Đề xuất các tính năng nền tảng mà sản phẩm cần và tự làm những phần cốt lõi, tất cả được merge trong khoảng ba tuần: phân quyền theo phạm vi dữ liệu, ghi kết quả vào nhật ký, bảng quy trình, biểu mẫu chuyển trạng thái và quét mã vạch.
- **Tài liệu luôn rõ ràng** Mỗi quyết định đều được đánh dấu là đã chốt hay còn chờ duyệt, và có công cụ tự kiểm tra báo lỗi khi gặp link hỏng, mã story không tồn tại hoặc phần còn bỏ trống.
