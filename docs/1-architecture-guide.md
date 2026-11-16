# Kiến trúc Dự án (Project Architecture)

Site dùng Hugo (bản extended) cho HTML tĩnh, Tailwind CSS v4 (qua CLI) cho CSS, và esbuild có sẵn trong Hugo (`js.Build`) để đóng gói JavaScript. Mọi màu sắc, cỡ chữ và chuyển động đi qua một bộ token chung, nên giao diện sáng và tối luôn đồng bộ.

## 1. Cấu trúc thư mục

```text
trvhoang/
├── hugo.toml                 Cấu hình: menu, thông tin tác giả, mạng xã hội, khóa bản đồ
├── data/
│   ├── map.yaml              Màu của từng loại địa điểm, style bản đồ
│   └── projects.yaml         Nhóm dự án cho bộ lọc /projects/
├── assets/
│   ├── images/mascots/      21 mascot cáo cho popup, nút gợi ý, trạng thái trống, 404 (Hugo chuyển sang WebP khi build)
│   ├── images/places/<slug>/ ảnh tự chụp của từng quán
│   ├── css/
│   │   ├── main.css          Entry cho Tailwind CLI (import các file bên dưới)
│   │   ├── tokens.css        Token màu cho light và dark, font
│   │   ├── base.css          Reset, chữ, focus, scrollbar
│   │   ├── motion.css        Thời gian, page transition, reveal, đổi theme
│   │   ├── components.css    card, chip, badge, button, filter, nav, footer, timeline…
│   │   ├── prose.css         Nội dung Markdown (.prose.content)
│   │   └── pages/map.css     CSS riêng cho trang /map/
│   └── js/
│       ├── main.js           Entry, gọi init của từng module
│       └── modules/
│           ├── theme.js          Nút đổi theme, hiệu ứng vòng tròn, sự kiện "themechange"
│           ├── nav.js            Menu mobile
│           ├── constellation.js  Nền chòm sao
│           ├── reveal.js         Hiện dần khi cuộn ([data-reveal])
│           ├── filter.js         Lọc tại chỗ cho Projects và Blog (?kind=, ?tag=)
│           ├── contact.js        Copy email, giờ Hà Nội
│           ├── map.js            Bản đồ MapLibre, gom nhóm ghim, bộ lọc, phân trang
│           └── giscus.js         Đồng bộ theme cho bình luận
├── layouts/
│   ├── _default/baseof.html  Khung trang, chỉ gọi các partial site/*
│   ├── _default/list.html    Danh sách mặc định cho section chưa có layout riêng
│   ├── index.html            Trang chủ (About), nội dung ở content/_index.md
│   ├── 404.html
│   ├── blog/ contact/ map/ project/ projects/ tags/ work/
│   └── partials/
│       ├── site/             head, nav, footer, scripts, background (chòm sao)
│       ├── ui/               icon, chips, status-badge, back-link, section-heading,
│       │                     page-header, social-links, mascot, empty-state
│       ├── about/ blog/ projects/
│       └── map/              map (bộ lọc + dữ liệu), popup, place-card
├── content/                  Markdown của từng trang
├── scripts/                  places.mjs (place:add, place:sync, place:check), map-styles.mjs
├── static/                   Ảnh, map/ (style bản đồ) và global.css (file sinh ra, đừng sửa tay)
└── docs/
```

## 2. Nguyên tắc

- **Không dùng màu thô trong template.** Viết `text-accent-text`, `bg-card`, `border-border`… thay vì `text-amber-400`. Token nằm ở `assets/css/tokens.css`, mỗi token có giá trị cho `:root` (sáng) và `.dark` (tối).
- **Component trước, utility sau.** Card, chip, badge, button, filter… là class trong `components.css`, có partial tương ứng trong `layouts/partials/ui/`. Tailwind utility chỉ dùng cho bố cục (grid, gap, flex).
- **Icon ở một chỗ.** `{{ partial "ui/icon.html" "github" }}` hoặc `(dict "name" "arrow-right" "class" "nudge" "size" 18)`. Thêm icon mới bằng cách thêm một dòng vào `layouts/partials/ui/icon.html`.
- **Nội dung Markdown dùng `class="prose content"`.** Không dùng `prose-invert`; `prose.css` đã nối màu của plugin typography vào token.
- **JavaScript là module.** Mỗi module tự tìm phần tử của nó và không làm gì nếu không có, nên mọi trang dùng chung một bundle.

## 3. Light, dark và chuyển động

- Theme được chọn trước khi trang hiện (script inline trong `partials/site/head.html`): lựa chọn đã lưu, nếu không có thì theo hệ điều hành. Thêm `?theme=light` hoặc `?theme=dark` vào URL để xem thử mà không lưu.
- Đổi theme phát sự kiện `themechange` trên `window`; bản đồ, nền chòm sao và Giscus nghe sự kiện này.
- Chuyển trang dùng View Transitions API của trình duyệt (`@view-transition` trong `motion.css`), không cần JS. Pill trên nav có `view-transition-name`, nên nó trượt từ tab cũ sang tab mới.
- Hiện dần khi cuộn: thêm `data-reveal` (và `style="--i: 2"` để trễ theo thứ tự). Hiện lúc tải trang: `data-intro`.
- Mọi chuyển động tắt khi người dùng bật "giảm chuyển động".

## 4. Thêm một trang mới

Ví dụ trang `/uses/`:

1. `content/uses.md`:

   ```yaml
   ---
   title: "Uses"
   type: "uses"
   description: "Đồ tôi dùng hằng ngày."
   ---
   ```

2. `layouts/uses/single.html`:

   ```html
   {{ define "main" }}
   {{ partial "ui/page-header.html" (dict "title" .Title "lede" .Params.description) }}
   <div class="prose content" data-reveal>{{ .Content }}</div>
   {{ end }}
   ```

3. Muốn trang có trên thanh menu thì thêm một mục `[[menus.main]]` trong `hugo.toml`.

4. Cần CSS riêng thì tạo `assets/css/pages/uses.css` và thêm `@import "./pages/uses.css";` vào `assets/css/main.css`.
