# Hướng dẫn Phát triển và Triển khai Dự án (Workflow)

Trang Web này được viết bằng Hugo cho tốc độ siêu tĩnh, nhưng trải nghiệm lập trình (DX) lại được thiết lập bằng bộ công cụ NPM mạnh mẽ giống hệt Next.js (chạy Tailwind CSS nền tảng).

## 1. Yêu cầu Hệ thống Môi trường (Pre-requisites)

Để Build và Chạy được dự án trên máy tính Local, bạn cần cài đặt:

- **Hugo (Phiên bản Extended):** Vì bạn xài Mac, chạy lệnh: `brew install hugo` (Xác nhận cài bản extended để biên dịch SASS/SCSS nếu cần sau này).
- **Node.js (>= 20.x):** Cài từ nodejs.org, dùng để chạy gói biên dịch TailwindCSS.

## 2. Các Lệnh Phát Triển Chính

Thay vì phải gõ 2 terminal song song (1 cái chạy Hugo rườm rà, 1 cái chạy Build Tailwind), mọi thứ đã được tích hợp gọn gàng trong file `package.json` theo đúng phong cách quen thuộc của Frontend VN.

_(Luôn đảm bảo bạn đang đứng trong thư mục `trhoag/` trên Terminal trước khi gõ lệnh)._

### 2.1 Cài đặt Package (Chỉ cần làm 1 lần đầu)

```bash
npm install
```

Lệnh này tải gói `@tailwindcss/cli`, plugin `typography`, và thư viện chạy song song `concurrently`.

### 2.2 Chạy Server Local (Dev Mode)

```bash
npm run dev
```

Câu lệnh này sẽ:

1. Gây bão bằng cách gọi `hugo server` ở Port 1313.
2. Cùng lúc bật trình nén Tailwind V4 quét tất tần tật file `.html` trong `layouts/` để build ra file CSS.
3. Khi bạn sửa file (HTML hoặc MD hoặc CSS), trình duyệt sẽ làm mới (Live Reload) trong tích tắc (tầm dưới 50ms nhờ vào sự bá đạo của GoLang).

Truy cập trên Browser: `http://localhost:1313`

### 2.3 Build ra Mã Tĩnh (Production Ready)

```bash
npm run build
```

Lệnh này sẽ xoá sạch cache rồi build bản cứng hoàn thiện. Quá trình hoạt động:

1. Tailwind sẽ dịch từ input sang `static/global.css` (Nén mã Mini lại).
2. Hugo sẽ lấy toàn bộ Markdown và HTML biên dịch trộn lẫn với nhau thành hàng trăm thư mục tĩnh (chứa sẵn HTML) quăng vào folder `public/`.
3. Bạn bây giờ có thể mang nguyên cái folder `public/` này đem quăng lên Vercel, Cloudflare Pages, Github Pages, hoặc Netlify là trang web Online luôn ngay lập tức! (Zero Hosting cost).

## 3. Triển khai lên Mạng Internet (Deploy Cloudflare Pages)

Mô hình tốt nhất cho giao diện tĩnh dạng này hiện tại là **Cloudflare Pages**, vì nó siêu nhanh nhờ Edge Network.

**Khi liên kết Github Repo của dự án này với Cloudflare Pages, bạn thiết lập:**

- Build command: `npm run build`
- Build output directory: `public`
- Node Version: Mặc định ở Settings cấu hình là Node.js v20+

Mỗi khi bạn `git push` một bài Blog mới (dưới dạng file Markdown) lên Github nhánh `main`, Cloudflare sẽ tự bắt tín hiệu tải Hugo về và Build HTML chạy thẳng lên tên miền `trvhoang.me` của bạn trong đúng vài chục giây mà thôi! 🚀
