---
title: "trvhoang.pages.dev"
description: "Chính trang web này: hồ sơ cá nhân song ngữ, blog và bản đồ những quán tôi từng ăn uống, làm bằng Hugo và Tailwind CSS, chạy trên Cloudflare Pages."
status: "Live"
tags: ["Hugo", "Tailwind CSS", "MapLibre", "Cloudflare Pages"]
github: "https://github.com/trv-hoang/trvhoang"
liveUrl: "https://trvhoang.pages.dev"
type: "project"
kind: "side"
weight: 9
role: "Phát triển một mình"
teamSize: "1"
duration: "03/2026 – nay"
platform: "Web"
---

## Tổng quan

Đây là nơi tôi giới thiệu bản thân, các dự án đã làm, những bài viết, và bản đồ mọi quán ăn, quán cà phê tôi từng ghé. Trang được dựng tĩnh bằng Hugo và Tailwind CSS, chạy trên Cloudflare Pages, có cả tiếng Việt lẫn tiếng Anh. Tôi làm trang này cùng các AI coding agent và tự kiểm tra lại mọi đoạn code chúng viết.

### Phần tôi thực hiện

- **Nhẹ và tải nhanh** Không dùng framework giao diện. Ảnh được thu nhỏ đúng kích thước hiển thị và chuyển sang WebP, nên trang chủ chỉ khoảng 120 KB.
- **Hiệu ứng vừa đủ** Chuyển trang mượt bằng View Transitions API, chuyển giao diện sáng tối bằng hiệu ứng lan toả, các phần tử hiện dần khi cuộn và tự tắt nếu người dùng chọn giảm chuyển động.
- **Bản đồ quán ăn** Hơn 230 quán trên bản đồ MapLibre, có bộ lọc, điểm và nhận xét của tôi kèm ảnh, cùng nút "Hôm nay ăn gì?" gợi ý một quán được chấm điểm cao ở gần bạn.
- **Công cụ quản lý quán** Các script thêm quán từ link Google Maps, kiểm tra lại vị trí và trạng thái mở cửa của mọi quán, và gắn ảnh.
