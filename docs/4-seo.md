# SEO: những việc chủ site tự làm

Phần kỹ thuật (canonical, hreflang, JSON-LD, ảnh chia sẻ, `robots.txt`, sitemap) đã nằm trong template và được kiểm tra bằng `npm test`. Thiết kế chi tiết ở `docs/superpowers/specs/2026-11-16-seo-design.md`.

Những bước dưới đây cần tài khoản của bạn nên template không tự làm được.

## 1. Google Search Console

1. Vào [Search Console](https://search.google.com/search-console), thêm property loại **URL prefix**: `https://trvhoang.pages.dev/`.
2. Chọn cách xác minh **HTML tag**. Google đưa một thẻ dạng `<meta name="google-site-verification" content="ABC123…">`.
3. Chép **chỉ giá trị `content`** vào `hugo.toml`:

   ```toml
   [params]
     googleSiteVerification = 'ABC123…'
   ```

   Khi giá trị rỗng, template không in thẻ này.
4. Deploy, rồi bấm **Verify** trong Search Console.
5. Vào mục **Sitemaps**, gửi `sitemap.xml`.

## 2. Cloudflare Web Analytics

Thay `cloudflareAnalyticsToken = 'YOUR_TOKEN_HERE'` trong `hugo.toml` bằng token thật lấy từ Cloudflare dashboard. Khi token còn là placeholder, `layouts/partials/site/scripts.html` không chèn beacon, nên để nguyên cũng không lỗi.

## 3. Kiểm tra sau khi deploy

- Chạy [Rich Results Test](https://search.google.com/test/rich-results) cho trang chủ và một bài blog. Trang chủ phải nhận ra **ProfilePage**, bài viết phải nhận ra **Article** (BlogPosting) và **Breadcrumb**.
- Dán link một bài vào [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) và [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) để xem ảnh xem trước 1200×630.
- Vài tuần sau, xem các báo cáo **Enhancements** và **Generative AI** trong Search Console.

## 4. Giữ liên kết hai chiều

Trong LinkedIn và GitHub, để link về `https://trvhoang.pages.dev/`. JSON-LD của site đã khai các hồ sơ này trong `sameAs`; link ngược lại giúp Google chắc rằng chúng là cùng một người.

## 5. Khi chuyển sang tên miền riêng

Mọi URL tuyệt đối đều sinh từ `baseURL`. Đổi `baseURL` trong `hugo.toml`, thêm redirect 301 từ `pages.dev` sang tên miền mới, rồi thêm property mới trong Search Console và dùng công cụ **Change of address**.
