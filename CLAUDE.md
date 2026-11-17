# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal site of Trần Việt Hoàng (https://trvhoang.pages.dev/): About page (home), projects, work history, blog, a map of places, contact. Hugo v0.168 extended + Tailwind CSS v4 CLI, deployed by Cloudflare Pages (`npm run build`, output `public/`). Package manager: npm. Docs in `docs/` are in Vietnamese; the numbered ones (`1-architecture-guide.md`, `2-writing-guide.md`, `3-development.md`, `4-seo.md`) are the reference for architecture, writing and SEO. Designs live in `docs/superpowers/specs/`, plans in `docs/superpowers/plans/`.

## Commands

```bash
npm run dev            # hugo server -D on port 1315 + Tailwind watcher (rewrites static/global.css unminified)
npm run build          # minified Tailwind → static/global.css, then hugo --gc --minify → public/
npm test               # all tests: node --test --test-concurrency=1 "tests/*.test.mjs"
node --test tests/jsonld.test.mjs              # one file (one Hugo build)
node --test --test-name-pattern "breadcrumbs" tests/jsonld.test.mjs
hugo build -D -M       # check a build in memory without touching public/ or global.css
npm run place:add -- "<Google Maps link>"     # also place:sync, place:check, place:photo (see scripts/places.mjs header)
npm run map:styles     # regenerate static/map/ styles from data/map.yaml
```

- `static/global.css` is generated but **committed minified**. After `npm run dev` it shows as modified (unminified); don't commit that. Regenerate it with `npx @tailwindcss/cli -i ./assets/css/main.css -o ./static/global.css --minify` only when CSS actually changes.
- Tests (Node 22 `node:test`, no dependencies) build the whole site once per file into a temp dir and assert on the HTML/XML. `tests/helpers/site.mjs` has the parsers; `tests/helpers/png.mjs` decodes share cards. `tests/fixtures/themes/seo-fixtures/` is a test-only Hugo theme (enabled via `HUGO_THEME` in `buildSite(env)`) that adds awkward fixture posts without touching `content/`. Never run two Hugo builds at once (8 GB machine).

## Architecture

**Languages.** English at `/`, Vietnamese at `/vi/`. Pages are translated by file name (`x.md` / `x.vi.md`), except **blog posts and places**: `[module]` mounts in `hugo.toml` put those files into every language, so each post exists at `/blog/x/` and `/vi/blog/x/` with the same English text. Never create a `.vi.md` for a post. The blog section page (`content/blog/_index*.md`) is translated normally. Places (`content/places/*.md`, ~230 files) are data for `/map/`, not rendered as pages.

**SEO layer** (`layouts/partials/seo/`, called from `layouts/partials/site/head.html`; design in `docs/superpowers/specs/2026-11-16-seo-design.md`):

- `is-shared.html` / `canonical.html`: a blog regular page is a shared copy; its `/vi/` copy canonicalizes to the English page (also used for `og:url`, JSON-LD urls, breadcrumbs and the share image). hreflang + `x-default` only on real, indexable translations.
- `og-image.html`: 1200×630 share image. Raster `coverImage` from the page bundle → cropped photo; otherwise a card drawn on `assets/images/og/base.png` with `images.Text` (font `assets/fonts/BeVietnamPro-SemiBold.ttf`, line breaks from `wrap-title.html` / `text-width.html`, which use measured glyph widths); other pages get the avatar site card.
- `jsonld.html` assembles one `@graph` (`person.html`, `organizations.html`, `employers.html`, `breadcrumbs.html`, `compact.html` drops empty values). Stable `@id`s rooted at the English home (`#person`, `#turing-factor`, `#<company>`); translated fields are emitted only in the default language because Google merges nodes by `@id`. Every value comes from front matter or `hugo.toml` (structured data must match the visible page). Current employers are `content/work/*` pages whose role period ends in "Present"/"nay".
- Tag pages get `noindex` and leave the sitemap via `[[cascade]]` in `hugo.toml`; `/vi/` blog copies are excluded from the Vietnamese sitemap the same way.

**CSS.** `assets/css/main.css` is the Tailwind entry (imports `fonts.css`, `tokens.css`, `components.css`, `pages/*.css`…). Templates use token classes (`text-accent-text`, `bg-card`), never raw palette colours; components are CSS classes with a matching partial in `layouts/partials/ui/`. Icons: `partial "ui/icon.html"`. Markdown content uses `class="prose content"`. Be Vietnam Pro is self-hosted in `static/fonts/be-vietnam-pro/`.

**JS.** `assets/js/main.js` is bundled by Hugo's `js.Build`; each module in `assets/js/modules/` finds its own elements and no-ops when absent, so every page shares one bundle.

**Content data.** Home/About data (role, company, stack, education…) lives in the front matter of `content/_index.md` / `_index.vi.md`; socials and author in `hugo.toml` `[params]`; project groups in `data/projects.yaml`; map category colours in `data/map.yaml`. UI strings go through `i18n/en.yaml` / `vi.yaml`.

## Blog posts

Use the `trvhoang-blog` skill. Posts are English only, `content/blog/<slug>.md` or `<slug>/index.md` with images; front matter is `title`, `date` (+07:00), `draft`, `summary`, `tags`, optional `coverImage` (`/blog/<slug>/<file>`). `docs/2-writing-guide.md` is stale about `readingTime`/`featured`, which no layout reads.
