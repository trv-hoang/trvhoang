---
title: "NOAA Weather Analytics"
description: "Đồ án môn Dữ liệu lớn: thống kê nhiệt độ hằng năm cho từng trạm khí tượng của NOAA, tính bằng Hadoop MapReduce và lưu trên HBase."
status: "Completed"
tags: ["Java", "Hadoop", "MapReduce", "HBase", "Python", "Docker"]
github: "https://github.com/kimson99/big-data-noaa"
type: "project"
kind: "study"
weight: 11
role: "MapReduce & HBase"
teamSize: "3"
duration: "3 tháng"
platform: "CLI"
---

## Tổng quan

Đồ án môn Dữ liệu lớn tại UIT, nhóm ba người. Hệ thống xử lý dữ liệu khí hậu GHCN-Daily của NOAA để xem nhiệt độ tại từng trạm thay đổi thế nào theo thời gian.

### Phần tôi thực hiện

- **Job MapReduce** Lọc nhiệt độ cao nhất, thấp nhất trong ngày theo cờ chất lượng, rồi tính nhiệt độ cao nhất, thấp nhất và trung bình mỗi năm cho từng trạm, dùng khoá `StationID#Year`.
- **Lưu vào HBase** Ghi kết quả vào HBase để công cụ dòng lệnh và biểu đồ xu hướng của nhóm sử dụng.
