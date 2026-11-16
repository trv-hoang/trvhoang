---
title: "EADF: Phân tích bảo mật khi nâng cấp hợp đồng thông minh"
description: "Khoá luận tốt nghiệp của tôi tại UIT: công cụ phân tích tĩnh so sánh hai phiên bản của một hợp đồng thông minh có thể nâng cấp, để tìm ra lỗ hổng phát sinh từ chính lần nâng cấp đó."
status: "Completed"
tags: ["Python", "Slither", "Solidity", "Foundry", "Security"]
github: "https://github.com/trv-hoang/USC-Project"
type: "project"
group: "study"
weight: 8
role: "Thực hiện một mình"
teamSize: "1"
duration: "10/2025 – 06/2026"
platform: "CLI & web demo"
---

## Tổng quan

Hợp đồng thông minh có thể nâng cấp giữ nguyên địa chỉ và dữ liệu, chỉ thay phần mã xử lý thông qua một proxy. Mỗi lần nâng cấp có thể phát sinh lỗ hổng mới mà các công cụ chỉ phân tích một phiên bản không nhận ra là do nâng cấp gây ra, chẳng hạn bố cục lưu trữ của hai phiên bản chồng lên nhau, hàm nâng cấp ai cũng gọi được, hay phần mã xử lý chưa được khởi tạo. Khoá luận của tôi, do TS. Phan Thế Duy hướng dẫn, mô hình hoá sự thay đổi về bảo mật qua từng phiên bản và xây dựng EADF, công cụ phát hiện các rủi ro này.

### Phần tôi thực hiện

- **Công cụ EADF** Viết bằng Python trên nền Slither, so sánh bố cục lưu trữ, cây cú pháp và kết quả phân tích của phiên bản cũ với phiên bản mới, kèm 3 bộ phát hiện dành riêng cho lỗi giữa hai phiên bản.
- **Kết quả** Trên bộ dữ liệu 18 cặp hợp đồng do tôi tự xây dựng, EADF phát hiện đủ 15 lỗi đặc thù của việc nâng cấp, trong khi Slither không phát hiện được lỗi nào. Công cụ cũng phân loại đúng kiểu nâng cấp ở 18/18 cặp (Slither: 7/18). Bộ dữ liệu nhỏ và mang tính mô phỏng, nên tôi xem đây là kết quả trong điều kiện thuận lợi nhất.
- **Bộ đánh giá** Có tệp đáp án chuẩn và lệnh `eadf evaluate` để tính precision, recall, F1 và độ chính xác so với công cụ đối chứng.
- **Tấn công và chi phí** Dựng lại các kịch bản ghi đè vùng lưu trữ, chiếm quyền phần mã chưa khởi tạo và nâng cấp trái phép bằng Foundry; đo được proxy UUPS an toàn tốn khoảng 2,1 lần phí gas triển khai so với proxy thông thường.
