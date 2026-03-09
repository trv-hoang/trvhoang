# Hướng dẫn Đăng và Viết Bài Blog Bằng Markdown

Dự án này sử dụng cú pháp **Markdown** tiêu chuẩn của Hugo để quản lý toàn bộ bài viết Blog. Bạn không cần bất kỳ CMS phức tạp nào, chỉ cần tạo file, viết file và Commit code là bài viết sẽ hiển thị.

## 1. Vị trí Lưu trữ Bài viết

Toàn bộ các bài viết được nạp vào đường dẫn `/blog/` phải được đặt tại:
`trhoag/content/blog/`

Mỗi bài viết sẽ tương ứng với một File nhánh (tên file bằng tiếng Anh, viết thường, ngăn cách bằng dấu gạch ngang) có đuôi `.md`

Ví dụ:

- `trhoag/content/blog/first-post.md` (Đường link web hiển thị: `/blog/first-post/`)
- `trhoag/content/blog/my-trip-to-da-lat.md` (Đường link: `/blog/my-trip-to-da-lat/`)

_Ngoài ra, nếu bài blog có chứa nhiều file đa phương tiện (ảnh, video), bạn có thể gộp chúng lại bằng cách tạo một folder `my-trip-to-da-lat/` và bên trong tạo file `index.md` chứa nội dung chữ tĩnh, kèm theo các file ảnh đặt cùng cấp thư mục._

## 2. Phần Header Cấu Hình (Frontmatter)

Đây là thành phần **Bắt buộc** phải ở trên cùng của mọi file `.md`. Nó khai báo các thuộc tính quan trọng cho bài viết nằm giữa hai dòng `---` (cú pháp YAML).

```yaml
---
title: "Tiêu đề của bài viết Blog"
date: 2026-03-08T15:00:00+07:00
draft: false
summary: "Một đoạn văn ngắn không quá 3 dòng giới thiệu tóm tắt về nội dung bài viết này ra ngoài màn hình chính của Blog..."
tags: ["Tech", "Life", "Travel"]
authorName: "Viet Hoang"
readingTime: "5 min"
featured: true
coverImage: "/images/blog/cover-1.jpg"
---
```

**Giải thích thông số:**

- `title`: (Bắt buộc) Tên hiển thị của bài viết.
- `date`: (Bắt buộc) Ngày xuất bản. Cần tuân theo chuẩn ISO gốc `YYYY-MM-DDTHH:MM:SS+07:00` (dành cho múi giờ VN). **Lưu ý: Nếu Date là ngày trong tương lai so với lúc Build, bài viết sẽ tự động chuyển vào hòm Draft!**
- `draft`: `true` nếu bạn đang viết nháp chưa muốn công bố. `false` (hoặc có thể xoá dòng này) khi đã viết xong để đăng công khai.
- `summary`: Mô tả ngắn để hiển thị ở ngoài thẻ ngoài Trang chủ Blog trước khi người dùng bấm vào xem.
- `tags`: Một mảng JSON Array chứa các thẻ Phân loại.
- `authorName`: Mặc định điền là "Viet Hoang" hoặc có thể để trống.
- `readingTime`: Tuỳ chọn, thời gian tự chừng người dùng cần để đọc. (Bạn tự nhập). (Ví dụ: "4 min").
- `featured`: Đặt thành `true` thì bài viết sẽ được đưa vào phần **Ghim nổi bật (Featured)** to đùng ở trên cùng danh sách.
- `coverImage`: Đường dẫn dẫn tới bức ảnh hiển thị bìa. File ảnh nên nằm ở trong `/static/images/blog/`. Mặc định Hugo sẽ coi đường dẫn `/` ngang hàng với thư mục `static/` lúc Build.

## 3. Cách Viết Nội Dung (Thế giới Markdown)

Ngay phía dưới phần `---` thứ hai, bạn bắt đầu soạn thảo nội dung bằng Markdown:

### 3.1 Cấu trúc thẻ Headings

Sử dụng dấu `#` để tạo cấp bậc tiêu đề:

```markdown
# Tiêu đề cực lớn (Đã được CSS thành H1) - nhưng không nên dùng vì H1 mặc định lấy Title của bài

## Tiêu đề nhỏ dần (H2)

### Nhỏ hơn chút nữa (H3)

#### Nhỏ tiếp (H4)
```

### 3.2 Nhấn Mạnh

```markdown
_In nghiêng nè_ hoặc _In nghiêng nữa nè_
**In đậm đà luôn**
~~Gạch ngang bỏ qua~~
```

### 3.3 Chèn Tiêu Điểm Link hoặc Hình Ảnh

```markdown
[Đây là một đường dẫn ra Google](https://google.com)

**Cách chèn Ảnh:**
Cú pháp giống link nhưng thêm `!` đằng trước.
Tuy nhiên, vì bạn dùng Hugo nên hãy ném ảnh vào trong folder `/static/images/` rồi trỏ code như sau:

![Ảnh đi du lịch Đà Lạt](/images/da-lat-photo-1.jpg "Caption của bức ảnh nè")
```

### 3.4 Tạo khối Trích dẫn (Blockquote)

```markdown
> Học, học nữa, học mãi.
> Đọc tài liệu AI xịn hơn người tự học.
```

### 3.5 Các Danh Sách Dòng Mệnh Danh Thiết Yếu

Danh sách không có số thứ tự:

```markdown
- Mua Cà rốt
- Mua Súp lơ
- Mua Xíu mại
```

Danh sách có thứ tự ưu tiên:

```markdown
1. Chạy code thử
2. Sửa Lỗi báo vàng
3. Code mới chạy lại
```

### 3.6 Đưa Đoạn Script Lập trình

Thêm đoạn code với hiệu ứng hightlight thần thánh sử dụng cặp dấu ``` (3 cái Backticks):

```python
# Chú ý chữ định nghĩa ngôn ngữ cho khối Code (ví dụ 'python' hoặc 'js')
def say_hello():
    print("AI chào bạn Hoàng")
```

(Dự án đã tích hợp Tailwind Typography tự động làm đẹp cái này mà không bị phô phang đâu).

## 4. Kiểm tra trước khi Live

Sử dụng câu lệnh chạy môi trường test ở Local trước khi Push code lên Internet:
Sau đó vào địa chỉ `localhost:1313/blog/[ten-bai-viet]` để soi xét lỗi thiết kế.

## 5. Hướng dẫn Thêm Kinh nghiệm Làm việc (Work History)

Mục Work History trên trang About được thiết kế theo dạng Dòng thời gian (Timeline) thăng tiến nội bộ (Career Path) giống như LinkedIn.

Để thêm một công ty mới, bạn thao tác như sau:

1. Trỏ vào thư mục `trhoag/content/work/`
2. Tạo file Markdown mang tên công ty. Ví dụ: `google.md`
3. Dán đoạn cấu hình (Frontmatter) mẫu sau lên đầu:

```yaml
---
title: "Software Engineer at Google"
company: "Google"
location: "USA"
roles:
  - title: "Senior Software Engineer"
    period: "January 2026 — Present"
    description: "Dẫn dắt team phát triển lõi AI."
  - title: "Software Engineer"
    period: "March 2024 — December 2025"
    description: "Tham gia bảo trì và tối ưu hệ thống Search."
tags: ["Go", "Python", "Kubernetes"]
type: "work"
url: "/about/work/google/"
weight: 3
---
```

**Lưu ý cực kỳ quan trọng:**

- `roles`: Là một **Mảng (Array)** chứa 1 điểm nút trên thanh cuộn thời gian. Bạn có thể kéo dãn mảng này khai báo từ chức vụ Intern lên làm Giám đốc tùy thích. Hệ thống sẽ tự vẽ ra đường kẻ Timeline trên thẻ thông tin.
- `weight`: Dùng để **sắp xếp thứ tự** công ty hiển thị ngoài trang About. Số càng nhỏ càng nổi lên trên cùng (`weight: 1` sẽ đè lên `weight: 2`).
- `url`: Tuân thủ cấu trúc `/about/work/[tên-công-ty]/` để Hugo ánh xạ đúng đường link SEO chuẩn mực.
- Dưới hai vạch `---`, bạn viết chi tiết lịch sử làm việc bằng Markdown hệt như cách viết Blog ở **Chương 3**.
