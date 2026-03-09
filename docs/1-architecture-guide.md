# Kiến trúc Dự án (Project Architecture)

Dự án này sử dụng Static Site Generator (Hugo) kết hợp với Tailwind CSS v4. Khác với kiến trúc Hugo truyền thống, dự án này đã được tinh chỉnh cấu trúc thư mục để ưu tiên tính gọn gàng, tính đóng gói (encapsulation), và sự thuận tiện trong việc phát triển giao diện (UI).

## 1. Cấu trúc Thư mục Chính

```text
trhoag/
├── assets/
│   └── css/
│       └── global.css        <-- CSS toàn cục và config Tailwind (Theme variables)
├── content/                  <-- Nơi chứa nội dung cho các trang (Markdown)
│   ├── blog/                 <-- Thư mục chứa các bài viết Blog
│   ├── work/                 <-- Thư mục chứa kinh nghiệm làm việc (Timeline)
│   ├── about.md              <-- File định tuyến cho trang About
│   ├── projects.md           <-- File định tuyến cho trang Projects
│   └── ...
├── layouts/                  <-- **LINH HỒN CỦA GIAO DIỆN (HTML & CSS)**
│   ├── _default/
│   │   ├── baseof.html       <-- Khung xương HTML chung (Navbar, Footer, JS, Meta tags)
│   │   ├── list.html         <-- Trình bày danh sách chung
│   │   └── single.html       <-- Trình bày bài viết chung
│   ├── about/
│   │   ├── single.html       <-- Giao diện riêng cho trang About
│   │   └── style.css         <-- CSS đặc thù riêng cho trang About
│   ├── blog/
│   │   ├── list.html         <-- Giao diện trang danh sách Blog
│   │   ├── single.html       <-- Giao diện cho một bài viết Blog
│   │   └── style.css         <-- CSS đặc thù riêng cho Blog (nếu có)
│   ├── work/
│   │   ├── single.html       <-- Giao diện hiển thị chi tiết Công ty / Công việc
│   ├── partials/             <-- Các khối giao diện dùng chung (Component)
│   │   ├── blog-card.html    <-- Thành phần thẻ bài viết Blog
│   │   └── comments.html     <-- Thành phần bình luận Giscus
│   └── ...
├── public/                   <-- Kết quả sau khi Build (không chỉnh sửa folder này)
├── static/                   <-- Chứa ảnh, font, và các tệp tĩnh (sẽ được copy y nguyên vào public/)
├── hugo.toml                 <-- File cấu hình chính của Hugo
└── package.json              <-- Chứa Scripts chạy dự án (dev, build, npm packages)
```

## 2. Triết lý Thiết kế: "Giao diện đóng gói theo Thư mục Layout"

Thay vì nhét toàn bộ CSS của mọi trang vào một file `style.css` khổng lồ, hoặc phải phân cấp CSS phức tạp, dự án này áp dụng mô hình "Mỗi trang là một folder (Module)":

Ví dụ về trang About:
Khi Hugo render trang `/about`, cơ chế hoạt động như sau:

1. Nó tải khung xương chung từ `layouts/_default/baseof.html` (có chứa Navbar và Footer).
2. Nó kiểm tra xem trong `layouts/about/` có file `style.css` hay không. Nếu có, đoạn CSS đó sẽ được tiêm trực tiếp vào cặp `<style>` trong Header (Inline CSS).
3. Hugo nạp phần code HTML nằm tại `layouts/about/single.html` vào phần `{{ block "main" . }}` của `baseof.html`.

**Lợi ích:**

- **Code HTML và CSS gắn liền với nhau:** Nếu bạn muốn đổi màu nền cho một nút chỉ ở trang About, bạn mở `layouts/about/style.css` và viết code vào đó.
- **Không gây xung đột (No Conflict):** Các class CSS tuỳ chỉnh được định nghĩa trong `layouts/about/style.css` sẽ chỉ xuất hiện khi khách truy cập vào trang About. Không lo việc CSS bị rò rỉ (leak) sang trang Projects hay Blog.
- **Dễ xoá, dễ sửa:** Khi bạn muốn đập đi xây lại một trang, hoặc xoá bỏ nó, bạn chỉ cần xoá nguyên folder đó trong `layouts/` là xong, không để lại rác CSS.

## 3. Dark Mode và Tailwind CSS v4

- Dự án sử dụng **Tailwind CSS v4** mới nhất.
- Mọi utility classes đều được biên dịch tự động mỗi khi bạn ấn Ctrl+S (Save file).
- **Dark Mode đã được tinh chỉnh chuyên sâu:**
  - CSS toàn cục nương tựa vào các Variables như `bg-background` thay vì fix cứng `bg-white / bg-zinc-950`. Các biến chuẩn mực này được đặt tại `assets/css/global.css`.
  - Javascript điều khiển Đen/Trắng nằm ngay trên `baseof.html`, ghi nhớ trạng thái người dùng vào Local Storage (`localStorage.theme`).

## 4. Cách tạo một trang Giao diện tĩnh (Static UI Page) mới

Giả sử bạn muốn tạo một trang mới tinh tên là `/uses` (để liệt kê các Món đồ công nghệ bạn hay dùng):

1. Tạo file nội dung rỗng (Chỉ để đăng ký dường dẫn với Hugo):
   Tạo file `content/uses.md` kèm đoạn mở đầu:

   ```yaml
   ---
   title: "Uses"
   type: "uses" # Từ khoá quan trọng để Hugo ánh xạ đúng thư mục Layout
   ---
   ```

2. Tạo thư mục giao diện:
   Tạo thư mục `layouts/uses/`

3. Xây dựng giao diện:
   Tạo file `layouts/uses/single.html`

   ```html
   {{ define "main" }}
   <div class="uses-wrapper text-foreground p-10">
     <h1>Đồ tôi hay dùng</h1>
     <!-- Code HTML / Tailwind cho trang Uses -->
   </div>
   {{ end }}
   ```

4. Viết CSS riêng biệt cho trang đó (nếu bạn thấy class Tailwind là chưa đủ hoặc quá dài):
   Tạo file `layouts/uses/style.css`
   ```css
   .uses-wrapper h1 {
     font-size: 3rem;
     background: linear-gradient(to right, #ff7e5f, #feb47b);
     -webkit-background-clip: text;
     color: transparent;
   }
   ```
   _Hugo sẽ tự động nhận diện và đính file CSS trực tiếp khi tải trang `/uses` theo đúng cơ chế thông minh đã thiết lập!_
