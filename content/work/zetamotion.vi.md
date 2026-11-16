---
title: "Kỹ sư phần mềm tại Zetamotion"
company: "Zetamotion"
logo: "/images/company-zetamotion.webp"
location: "Làm từ xa · Vương quốc Anh"
roles:
  - title: "Kỹ sư phần mềm"
    period: "07/2025 – nay"
    description: "Phát triển Spectron, hệ thống dùng AI phát hiện lỗi sản phẩm trên dây chuyền nhà máy: xem camera trực tiếp qua WebRTC, gộp hai phiên bản giao diện làm một, và tự dọn báo cáo cũ để máy tại xưởng không bị đầy ổ cứng."
tags: ["WebRTC", "React", "TypeScript", "Python", "Flask", "Computer Vision"]
type: "work"
url: "/vi/about/work/zetamotion/"
weight: 1
---

## Tổng quan

Tại Zetamotion, tôi tham gia phát triển Spectron, hệ thống dùng AI để phát hiện lỗi bề mặt sản phẩm trên dây chuyền nhà máy. Tôi làm cả giao diện React, máy chủ Flask và phần xử lý hình ảnh bằng Python, nhận lỗi cần sửa và tính năng mới từ hệ thống quản lý công việc của nhóm.

### Công việc chính

- **Xem camera trực tiếp** Thay cách tải từng ảnh (khoảng 1 khung hình mỗi giây) bằng luồng video WebRTC liên tục cho từng camera, gồm phần kết nối bằng aiortc trong Flask và một React hook để hiển thị. Hệ thống chạy được trong mạng nội bộ nhà máy.
- **Gộp hai giao diện làm một** Loại bỏ phiên bản giao diện cũ chạy song song: lập kế hoạch chuyển đổi rồi chuyển lần lượt từng màn hình mà không mất tính năng nào.
- **Tránh đầy ổ cứng** Tác vụ định kỳ tự xoá báo cáo cũ theo cấu hình, để máy kiểm tra tại xưởng không bao giờ hết dung lượng.
- **Sửa lỗi trong quy trình kiểm tra** Sửa lỗi kiểm tra hai mặt bị quay lại mặt trước và lỗi ghi chú trên bản đồ lỗi bị lệch giữa các tab báo cáo.
- **Dùng AI soạn tài liệu** Làm thử quy trình hai agent, một viết và một kiểm tra, để soạn hướng dẫn vận hành từ mã nguồn; mọi nội dung đều dẫn về đúng file và dòng code.

Xem thêm ở [trang dự án Spectron](/vi/project/spectron/).
