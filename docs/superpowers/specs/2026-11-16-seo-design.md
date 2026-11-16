# SEO overhaul — design

Date: 2026-11-16 · Status: approved by the owner

## Intent

Make trvhoang.pages.dev easy to find and easy to understand for anyone searching, above all **recruiters**. The pages that matter most are the **About page** (the home page, `content/_index.md`), the **blog**, and the owner's link to **Turing Factor**, the company he co-founded. "Trần Việt Hoàng" is a common name, so Google must be able to tell *this* person apart and connect him to his work.

Google's current guidance (AI optimization guide, 2026) is that optimizing for AI Overviews and AI Mode "is still SEO": crawlable pages, no duplicate content, good page experience, first-hand content, and valid structured data for rich results. No `llms.txt`, special schema or content chunking is needed.

## Goals

1. **No duplicate content.** Every page has one canonical URL. hreflang only links real translations.
2. **Structured data (JSON-LD)** that tells Google who the owner is, where he works, what he founded and what he writes.
3. **Shareable previews.** Every page has a correct raster `og:image`; each blog post gets its own.
4. **Crawl hygiene.** `robots.txt`, a sitemap without thin pages, an RSS link in `<head>`.
5. **Page speed.** Remove the render-blocking third-party font request.
6. **Owner checklist** for the steps only the owner can do (Search Console, analytics token).

## Non-goals

- Custom domain. The site stays on `trvhoang.pages.dev` for now. Everything is driven by `baseURL`, so a later move needs only a config change plus redirects.
- A Turing Factor website. The company has none, so it is described on this site only.
- Content rewriting, keyword stuffing, `llms.txt`, FAQ/HowTo markup (deprecated by Google).
- Translating blog posts into Vietnamese.

## Anti-goals (would count as failure even if it "works")

- Structured data that does not match what is visible on the page (Google's guidelines forbid it).
- Breaking the existing `/vi/` browsing experience: Vietnamese visitors can still open blog posts inside the Vietnamese site.
- Adding a runtime dependency or a Hugo module.

## Constraints

- Hugo v0.168 extended, Tailwind v4 CLI, Cloudflare Pages. npm (`package-lock.json`).
- Blog posts and places are mounted into both languages (`[module]` in `hugo.toml`), so every post renders at `/blog/x/` and `/vi/blog/x/` with the same English content.
- 8 GB machine: tests must be light (one Hugo build per test run).

## Approaches considered

| Option | Approach | Trade-off |
| --- | --- | --- |
| **A (chosen)** | Hand-written Hugo partials and templates, no dependencies | Full control and fits the shared-blog setup; more to write and test |
| B | A third-party Hugo SEO module | Faster start, but doesn't understand the shared blog, so the duplicate fix is still manual; adds a dependency |
| C | Fix bugs only (duplicates, robots, OG image) | Fastest, but drops the structured data that serves recruiters and Turing Factor |

The owner chose **A** because structured data about him and Turing Factor is the part that serves his main goal.

## Design

### 1. Canonical and hreflang (`layouts/partials/site/head.html`)

- A page is a **shared copy** when it is a regular page (`.IsPage`) in the `blog` section: those files are mounted into every language. Places are never rendered, so they need nothing. Every other page with translations, including the blog section list (`_index.vi.md`), is a **real translation**.
- **Shared blog posts under `/vi/`**: `<link rel="canonical">` points to the English URL (`/blog/x/`). No hreflang tags on either copy. The `/vi/` copy stays browsable but is not indexed separately.
- **Real translations**: canonical to self, hreflang for each language, plus `hreflang="x-default"` pointing to the English version.
- `og:url` follows the canonical URL.

### 2. Structured data (new `layouts/partials/seo/*.html`, one JSON-LD `<script>` per page, built with Hugo dicts and `jsonify` so escaping is automatic)

One `@graph` per page with stable `@id`s so entities link across pages:

- **WebSite** (`{baseURL}#website`) on every page: `name`, `url`, `inLanguage`, `publisher` → Person.
- **Person** (`{baseURL}#person`) on every page (referenced, full data on the About page):
  `name` "Trần Việt Hoàng", `alternateName` "Tran Viet Hoang", `url`, `image` (avatar), `jobTitle` (from `role`), `description`, `address` (Hanoi, VN), `sameAs` (GitHub, LinkedIn, Facebook from `params.socials`, excluding email), `worksFor` → Zetamotion, `knowsAbout` (from `stack` items), `alumniOf` (from `education`, if the data has an institution name).
- **Organization Turing Factor** (`{baseURL}#turing-factor`), emitted on the About page: `name`, `description` (from `company.about`), `founder` → Person, `foundingDate` "2026-07" (from `company.period`), `areaServed` "VN". No `url`, because the company has no website. Products are not marked up.
- **Organization Zetamotion** (`{baseURL}#zetamotion`): `name` only; the site has no company URL for it.
- `alumniOf`: one `CollegeOrUniversity` per `education` entry, using its `school` field.
- **ProfilePage** on the home/About page: `mainEntity` → Person, `dateModified` from the page's `.Lastmod`.
- **BlogPosting** on each blog post: `headline`, `description` (summary), `datePublished`, `dateModified`, `author` → Person (name + url), `image` (the post's OG image, raster), `inLanguage` "en", `mainEntityOfPage`, `keywords` (tags).
- **BreadcrumbList** on non-home pages: Home › Section › Page.

Every value comes from front matter or `hugo.toml`, so the data always matches the visible page.

### 3. Open Graph and social previews

- `og:image` priority: post `coverImage` if raster (jpg/png/webp) → generated card → site avatar.
- **Generated cards** for blog posts without a raster cover: Hugo image processing draws the post title onto a 1200×630 base image (`images.Text` with the self-hosted Be Vietnam Pro TTF, which supports Vietnamese). Output is PNG, so Facebook/LinkedIn/X can show it. The base image is a simple branded background in `assets/images/og/base.png` (my call: dark stone background with the amber accent, matching the site).
- Also emit `og:image:width`/`height`, `og:image:alt`, `og:locale` (+ `og:locale:alternate` for real translations), `article:published_time`, `article:modified_time`, `article:tag`, and `twitter:image`.
- Every other page (home/About, projects, map, contact…) gets one site card: 1200×630 with the avatar (source is 700×700), name and role, generated the same way. Today the avatar is cropped to 600×600, which `summary_large_image` crops again.

### 4. Crawl hygiene

- `enableRobotsTXT = true` with `layouts/robots.txt`: allow all, `Sitemap: {baseURL}sitemap.xml`.
- **Tag pages** (59 of 85 sitemap URLs, most with one entry): `<meta name="robots" content="noindex, follow">` and removed from the sitemap. Links on them are still followed. (My call; the blog's own `?tag=` filter is unaffected.)
- `/vi/blog/x/` copies are excluded from the Vietnamese sitemap (they canonicalize to English).
- `<link rel="alternate" type="application/rss+xml">` in `<head>` for the site feed.
- The `/en/` alias page Hugo generates already has a canonical + refresh to `/`; leave it.

### 5. Page speed

- Self-host Be Vietnam Pro (400, 500, 600, 700, 400 italic; Latin + Vietnamese subsets) as WOFF2 in `static/fonts/`, `@font-face` with `font-display: swap`, `<link rel="preload">` for the 400 weight. Remove the Google Fonts `<link>`s. The TTF of one weight is kept in `assets/fonts/` for OG card text.
- Font files come from the official Google Fonts repository (SIL OFL); the licence file is committed beside them.

### 6. Owner checklist (written to `docs/4-seo.md`, Vietnamese like the other docs)

1. Add the property `https://trvhoang.pages.dev/` in Google Search Console (HTML-tag verification: owner pastes the token into `params.googleSiteVerification`, the head partial emits the meta tag only when set). Submit `sitemap.xml`.
2. Replace `cloudflareAnalyticsToken = 'YOUR_TOKEN_HERE'` with the real token (and the template must not emit the beacon while the placeholder is set).
3. After deploy: run Google's Rich Results Test on the home page and one post; check the Search Console "Enhancements" and "Generative AI" reports after a few weeks.
4. Keep LinkedIn and GitHub profiles linking back to the site (helps Google tie the `sameAs` profiles to this Person).

## Testing (my call)

TDD with Node's built-in test runner, no new dependencies:

- `tests/seo.test.mjs` runs one `hugo build` into a temp directory (`before` hook), then asserts on the generated HTML/XML: canonical and hreflang per page type, JSON-LD parses and contains the expected `@type`s and values, `og:image` is a raster URL that exists in the output, `robots.txt` content, tag pages carry `noindex` and are absent from sitemaps, no Google Fonts request in `<head>`.
- `npm test` → `node --test tests/`. Each red/green loop runs this one file.

## Left to the builder

- Exact partial file split and naming under `layouts/partials/seo/`.
- Card typography (size, wrapping long titles) within 1200×630.
- Whether BreadcrumbList uses section titles from `_index.md` or i18n strings.

### 7. Page titles (decided by the owner)

- Every page: `<Page title> · Trần Việt Hoàng` (was `<Page title> · trvhoang`), so his name shows on every search result.
- Home/About: `Trần Việt Hoàng · <role>`, with `role` from the home page's front matter in each language (my call on including the role).
- `og:site_name` becomes "Trần Việt Hoàng".
