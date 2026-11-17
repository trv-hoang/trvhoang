# SEO Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix duplicate content, add JSON-LD about the owner, Turing Factor and posts, generate raster share images, tidy crawling, self-host the font and put the owner's name in every title.

**Architecture:** All changes live in Hugo templates (`layouts/partials/site/head.html` plus new `layouts/partials/seo/*.html`), `hugo.toml` and assets. Tests are Node built-in `node:test` files that run one `hugo build` into a temp dir and assert on the generated HTML/XML.

**Tech Stack:** Hugo v0.168 extended, Tailwind CSS v4 CLI, Node 22 (`node:test`, no new packages), npm.

**Spec:** `docs/superpowers/specs/2026-11-16-seo-design.md`

## Global Constraints

- No new npm dependencies and no Hugo modules.
- `baseURL` stays `https://trvhoang.pages.dev/`; every absolute URL comes from `.Permalink`/`absURL`, never a hard-coded host.
- Structured data must match visible page content; all values come from front matter or `hugo.toml`.
- Person name: `Trần Việt Hoàng`; alternate name `Tran Viet Hoang`.
- Title format: `<Page title> · Trần Việt Hoàng`; home: `Trần Việt Hoàng · <role>`; `og:site_name` = `Trần Việt Hoàng`.
- Share images: PNG or JPEG, exactly 1200×630.
- Tests: run one file at a time while iterating (`node --test tests/<file>.test.mjs`); full suite `npm test` once at the end. Never run two Hugo builds in parallel.
- Every commit: `npm test` for the touched file green; Conventional Commits; end message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- `static/global.css` is committed minified: regenerate with `npx @tailwindcss/cli -i ./assets/css/main.css -o ./static/global.css --minify` only in the task that changes CSS (Task 4).

## Review Focus

1. **Titles with apostrophes or Vietnamese characters** ("Two agents… don't share notes", "Giới thiệu") must produce valid JSON-LD and unescaped-looking meta text → Task 6 asserts `headline` round-trips exactly; Task 1 asserts the Vietnamese home title.
2. **A post whose `coverImage` is an SVG** (two-agents post) must fall back to the generated card, never an SVG `og:image` → Task 5 test.
3. **Long titles on the generated card** must wrap inside 1200×630 rather than run off the edge → Task 5 includes a visual check step on the longest current title.
4. **Shared post opened under `/vi/`** must point canonical, `og:url` and JSON-LD `url` at the English URL, with no hreflang → Task 2 and Task 6 tests.
5. **A page without `description`/`summary`** must still get a non-empty meta description and must not emit an empty JSON-LD `description` key → Task 6 asserts no empty-string values anywhere in the graph.

---

### Task 1: Test harness and page titles

**Files:**

- Modify: `package.json` (add `"test": "node --test --test-concurrency=1 tests/"`)
- Create: `tests/helpers/site.mjs`
- Create: `tests/titles.test.mjs`
- Modify: `layouts/partials/site/head.html:1` and the `og:site_name` line

**Interfaces:**

- Produces (`tests/helpers/site.mjs`, used by every later test):
  - `buildSite(): string` — runs `hugo build --quiet -e production -d <mkdtemp dir>` with `cwd` = repo root, returns the output dir. Call once per test file in `before`.
  - `readOut(dir: string, urlPath: string): string` — reads `<dir><urlPath>index.html` when `urlPath` ends in `/`, else the file itself.
  - `metaContent(html: string, key: string): string | undefined` — value of `<meta name|property="key" content="…">`, HTML entities decoded.
  - `linkTags(html: string, rel: string): Array<{href: string, hreflang?: string, type?: string}>`
  - `jsonLd(html: string): object[]` — every `<script type="application/ld+json">` parsed; flattens `@graph`.
  - `titleOf(html: string): string` — decoded `<title>` text.

- [ ] **Step 1: Write the failing test** `tests/titles.test.mjs`

```js
test('home title is name · role', () => assert.equal(titleOf(readOut(dir, '/')), 'Trần Việt Hoàng · Software Engineer & Co-founder'));
test('vi home title uses vi role', () => assert.equal(titleOf(readOut(dir, '/vi/')), 'Trần Việt Hoàng · Kỹ sư phần mềm & đồng sáng lập'));
test('post title ends with the name', () => assert.equal(titleOf(readOut(dir, '/blog/two-agents-one-guide/')), "Two agents, one user guide, and why they don't share notes · Trần Việt Hoàng"));
test('og:site_name is the name', () => assert.equal(metaContent(readOut(dir, '/blog/'), 'og:site_name'), 'Trần Việt Hoàng'));
```

- [ ] **Step 2: Run** `node --test tests/titles.test.mjs` — Expected: FAIL (titles end in `· trvhoang`).
- [ ] **Step 3: Implement** in `head.html`: `$title` = home ? `printf "%s · %s" site.Params.author.name .Params.role` : `printf "%s · %s" .Title site.Params.author.name`; `og:site_name` = `site.Params.author.name`.
- [ ] **Step 4: Run** `node --test tests/titles.test.mjs` — Expected: PASS (4 tests).
- [ ] **Step 5: Commit** `feat(seo): put the owner's name in every page title` (package.json, tests/, head.html).

---

### Task 2: Canonical, hreflang and locale

**Files:**

- Create: `layouts/partials/seo/canonical.html` (returns the canonical page)
- Modify: `layouts/partials/site/head.html` (canonical, alternates, `og:url`, `og:locale`)
- Modify: `hugo.toml` (`[languages.vi] locale` from `'vi'` to `'vi-vn'`, so `og:locale` can be `vi_VN`; check `/vi/blog/` dates still render in Vietnamese)
- Test: `tests/canonical.test.mjs`

**Interfaces:**

- Produces: `partial "seo/canonical.html" .` → the `Page` whose `.Permalink` is canonical. Rule: if `.IsPage` and `.Section == "blog"` and `.Language.Lang != site.Sites.Default.Language.Lang`, return the default-language translation (from `.AllTranslations`); otherwise return `.`. Later tasks (5, 6) use it for `og:url` and JSON-LD `url`.
- Produces: `partial "seo/is-shared.html" .` → bool, the same blog-page condition regardless of language, used to suppress hreflang on both copies.

- [ ] **Step 1: Write the failing tests**

```js
test('vi copy of a post canonicalizes to English', () => {
  const h = readOut(dir, '/vi/blog/two-agents-one-guide/');
  assert.deepEqual(linkTags(h, 'canonical').map(l => l.href), ['https://trvhoang.pages.dev/blog/two-agents-one-guide/']);
  assert.equal(metaContent(h, 'og:url'), 'https://trvhoang.pages.dev/blog/two-agents-one-guide/');
});
test('posts have no hreflang in either language', () => {
  for (const p of ['/blog/two-agents-one-guide/', '/vi/blog/two-agents-one-guide/'])
    assert.equal(linkTags(readOut(dir, p), 'alternate').filter(l => l.hreflang).length, 0);
});
test('translated page lists en, vi and x-default', () => {
  const alts = linkTags(readOut(dir, '/vi/map/'), 'alternate').filter(l => l.hreflang);
  assert.deepEqual(alts.map(l => `${l.hreflang} ${l.href}`).sort(), [
    'en https://trvhoang.pages.dev/map/', 'vi https://trvhoang.pages.dev/vi/map/', 'x-default https://trvhoang.pages.dev/map/']);
});
test('blog section list is a real translation', () => assert.ok(linkTags(readOut(dir, '/vi/blog/'), 'alternate').some(l => l.hreflang === 'x-default')));
test('og:locale per language', () => {
  assert.equal(metaContent(readOut(dir, '/'), 'og:locale'), 'en_US');
  assert.equal(metaContent(readOut(dir, '/vi/'), 'og:locale'), 'vi_VN');
});
```

- [ ] **Step 2: Run** `node --test tests/canonical.test.mjs` — Expected: FAIL.
- [ ] **Step 3: Implement** both partials and the head changes. `og:locale` = `.Language.Locale` with `-` → `_` and the region upper-cased (`en-us` → `en_US`). Emit `og:locale:alternate` for each other translation only when not shared.
- [ ] **Step 4: Run** `node --test tests/canonical.test.mjs` — Expected: PASS (5 tests). Re-run `tests/titles.test.mjs` — PASS.
- [ ] **Step 5: Commit** `fix(seo): canonicalize shared blog copies and add x-default`.

---

### Task 3: Crawl hygiene and owner checklist

**Files:**

- Modify: `hugo.toml` (`enableRobotsTXT = true`; `params.googleSiteVerification = ''`; two `[[cascade]]` blocks below)
- Create: `layouts/robots.txt`
- Modify: `layouts/partials/site/head.html` (robots meta, RSS link, verification meta)
- Create: `docs/4-seo.md` (Vietnamese owner checklist from spec §6; note the analytics template already skips the placeholder token)
- Test: `tests/crawl.test.mjs`

**Interfaces:**

- Produces: page param `noindex` (bool) set by cascade; head emits `<meta name="robots" content="noindex, follow">` when true.
- `hugo.toml` cascades (verify keys against the build; the tests are the proof):
  - target `kind = '{taxonomy,term}'` → `params.noindex = true`, `sitemap.disable = true`
  - target `path = '/blog/**'`, `kind = 'page'`, `sites.matrix.languages = 'vi'` → `sitemap.disable = true`

- [ ] **Step 1: Write the failing tests**

```js
test('robots.txt allows all and lists the sitemap', () => {
  const t = readFileSync(join(dir, 'robots.txt'), 'utf8');
  assert.match(t, /^User-agent: \*$/m); assert.match(t, /^Allow: \/$/m);
  assert.match(t, /^Sitemap: https:\/\/trvhoang\.pages\.dev\/sitemap\.xml$/m);
});
test('tag pages are noindex, follow', () => {
  for (const p of ['/tags/', '/tags/coffee/', '/vi/tags/coffee/'])
    assert.equal(metaContent(readOut(dir, p), 'robots'), 'noindex, follow');
});
test('normal pages have no robots meta', () => assert.equal(metaContent(readOut(dir, '/blog/coffee-camping-ecopark/'), 'robots'), undefined));
test('sitemaps hold no tag pages and no vi blog posts', () => {
  const en = readFileSync(join(dir, 'en/sitemap.xml'), 'utf8'), vi = readFileSync(join(dir, 'vi/sitemap.xml'), 'utf8');
  assert.doesNotMatch(en + vi, /\/tags\//);
  assert.doesNotMatch(vi, /\/vi\/blog\/[^<]+\/<\/loc>/);
  assert.match(en, /\/blog\/two-agents-one-guide\/<\/loc>/);
  assert.match(vi, /\/vi\/blog\/<\/loc>/);
});
test('RSS link in head', () => assert.ok(linkTags(readOut(dir, '/'), 'alternate').some(l => l.type === 'application/rss+xml')));
test('no verification meta while the param is empty', () => assert.equal(metaContent(readOut(dir, '/'), 'google-site-verification'), undefined));
```

- [ ] **Step 2: Run** `node --test tests/crawl.test.mjs` — Expected: FAIL.
- [ ] **Step 3: Implement** config, `robots.txt` (`User-agent: *`, `Allow: /`, `Sitemap: {{ "sitemap.xml" | absURL }}`), head tags, and `docs/4-seo.md`.
- [ ] **Step 4: Run** `node --test tests/crawl.test.mjs` — Expected: PASS (6 tests).
- [ ] **Step 5: Commit** `feat(seo): add robots.txt, noindex tag pages and tidy sitemaps` (include `docs/4-seo.md`).

---

### Task 4: Self-hosted Be Vietnam Pro

**Files:**

- Create: `static/fonts/be-vietnam-pro/*.woff2` and `static/fonts/be-vietnam-pro/OFL.txt`
- Create: `assets/fonts/BeVietnamPro-SemiBold.ttf` (for Task 5 card text)
- Create: `assets/css/fonts.css`; Modify: `assets/css/main.css` (import it before `tokens.css`)
- Modify: `layouts/partials/site/head.html` (remove the three Google Fonts tags; add one preload)
- Modify: `static/global.css` (regenerated, minified)
- Test: `tests/fonts.test.mjs`

**Interfaces:**

- Produces: `assets/fonts/BeVietnamPro-SemiBold.ttf` — Task 5 loads it with `resources.Get "fonts/BeVietnamPro-SemiBold.ttf"`.

- [ ] **Step 1: Write the failing tests**

```js
test('no Google Fonts requests', () => assert.doesNotMatch(readOut(dir, '/'), /fonts\.(googleapis|gstatic)\.com/));
test('preloads a local woff2 that exists', () => {
  const pre = linkTags(readOut(dir, '/'), 'preload');
  assert.equal(pre.length, 1); assert.match(pre[0].href, /^\/fonts\/be-vietnam-pro\/.+\.woff2$/);
  assert.ok(existsSync(join(dir, pre[0].href)));
});
test('global.css declares the font faces', () => {
  const css = readFileSync(join(dir, 'global.css'), 'utf8');
  for (const w of ['400', '500', '600', '700']) assert.match(css, new RegExp(`font-family:"?Be Vietnam Pro"?;[^}]*font-weight:${w}`));
  assert.match(css, /font-display:swap/);
});
```

- [ ] **Step 2: Run** `node --test tests/fonts.test.mjs` — Expected: FAIL.
- [ ] **Step 3: Fetch fonts.** Download the CSS from `https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap` with a current Chrome `User-Agent` (so it returns woff2). Keep only the `vietnamese`, `latin-ext` and `latin` blocks, download each woff2 into `static/fonts/be-vietnam-pro/` with a readable name (`<weight>[-italic]-<subset>.woff2`), and rewrite `src` to those local paths in `assets/css/fonts.css`, keeping each block's `unicode-range`. Download `OFL.txt` and `BeVietnamPro-SemiBold.ttf` from `https://github.com/google/fonts/tree/main/ofl/bevietnampro`.
- [ ] **Step 4: Edit head and rebuild CSS.** Preload = the 400 `latin` file (`crossorigin` attribute required). Run the minified Tailwind command from Global Constraints.
- [ ] **Step 5: Run** `node --test tests/fonts.test.mjs` — Expected: PASS (3 tests). Open one page with `hugo server` and confirm Vietnamese text (e.g. `/vi/`) renders in Be Vietnam Pro, then stop the server.
- [ ] **Step 6: Commit** `perf(fonts): self-host Be Vietnam Pro` (fonts, css, head, global.css).

---

### Task 5: Raster share images

**Files:**

- Create: `assets/images/og/base.png` (1200×630; dark stone `#1c1917` background, 12 px amber `#f59e0b` bar on the left edge; make it once with ImageMagick and commit it)
- Create: `layouts/partials/seo/og-image.html`
- Modify: `layouts/partials/site/head.html` (all `og:image*`, `twitter:image`, `article:*` tags)
- Test: `tests/og.test.mjs`

**Interfaces:**

- Consumes: `partial "seo/canonical.html"` (Task 2), `assets/fonts/BeVietnamPro-SemiBold.ttf` (Task 4).
- Produces: `partial "seo/og-image.html" .` → `dict "url" <absolute permalink> "width" 1200 "height" 630 "alt" <string>`. Task 6 uses `.url` as the BlogPosting `image`. Rules, first match wins:
  1. Blog post whose `coverImage` basename is a raster page resource (`jpg|jpeg|png|webp`): `.Fill "1200x630 Smart q82"` of that resource; alt = post title.
  2. Any other blog post: `base.png` with `images.Text` of the post title (white, SemiBold, size 64, left-aligned at x=96, wrapped) plus the site name in amber at the bottom-left (size 30); alt = post title.
  3. Every other page: the site card — `base.png` with the avatar `Fill "360x360"` placed via `images.Overlay` at (96,135), name (size 64) and the home page's `role` (size 34, amber) to its right; alt = `Trần Việt Hoàng`. Use the current language's home `role`.

- [ ] **Step 1: Write the failing tests**

```js
const pngSize = b => [b.readUInt32BE(16), b.readUInt32BE(20)];
const jpgSize = b => { /* scan SOF0/SOF2 marker, return [w, h] */ };
const fileFor = url => join(dir, new URL(url).pathname);
test('generated card for a post with an SVG cover', () => {
  const h = readOut(dir, '/blog/two-agents-one-guide/'); const u = metaContent(h, 'og:image');
  assert.match(u, /^https:\/\/trvhoang\.pages\.dev\/.+\.png$/);
  assert.deepEqual(pngSize(readFileSync(fileFor(u))), [1200, 630]);
  assert.equal(metaContent(h, 'twitter:image'), u);
  assert.equal(metaContent(h, 'og:image:alt'), "Two agents, one user guide, and why they don't share notes");
});
test('photo cover is cropped to 1200x630 jpeg', () => {
  const u = metaContent(readOut(dir, '/blog/coffee-camping-ecopark/'), 'og:image');
  assert.match(u, /\.jpe?g$/); assert.deepEqual(jpgSize(readFileSync(fileFor(u))), [1200, 630]);
});
test('site card on home and map', () => {
  for (const p of ['/', '/map/', '/vi/']) {
    const h = readOut(dir, p); assert.equal(metaContent(h, 'og:image:width'), '1200'); assert.equal(metaContent(h, 'og:image:height'), '630');
    assert.deepEqual(pngSize(readFileSync(fileFor(metaContent(h, 'og:image')))), [1200, 630]);
  }
});
test('article times and tags on posts only', () => {
  const h = readOut(dir, '/blog/two-agents-one-guide/');
  assert.equal(metaContent(h, 'article:published_time'), '2026-11-16T17:00:00+07:00');
  assert.ok(metaContent(h, 'article:modified_time'));
  assert.equal(metaContent(readOut(dir, '/map/'), 'article:published_time'), undefined);
});
```

`article:tag` is emitted once per tag (a repeated property); the helper returns the first, so no assertion on it beyond presence by regex: `assert.equal((h.match(/property="article:tag"/g) || []).length, 2)`.

- [ ] **Step 2: Run** `node --test tests/og.test.mjs` — Expected: FAIL.
- [ ] **Step 3: Create `base.png`** with `magick -size 1200x630 xc:'#1c1917' -fill '#f59e0b' -draw 'rectangle 0,0 11,629' assets/images/og/base.png`.
- [ ] **Step 4: Implement** `seo/og-image.html` and the head tags. `images.Text` has no width option: wrap the title yourself into lines of at most 30 characters on word boundaries and join with `\n`; cap at 4 lines (truncate the last with `…`).
- [ ] **Step 5: Run** `node --test tests/og.test.mjs` — Expected: PASS.
- [ ] **Step 6: Visual check.** Open the generated PNG for the two-agents post and the home site card (paths from the build output) and confirm text sits inside the frame, Vietnamese diacritics render, and the avatar is not distorted. Fix sizes if not.
- [ ] **Step 7: Commit** `feat(seo): generate 1200x630 share images`.

---

### Task 6: JSON-LD structured data

**Files:**

- Modify: `content/_index.md` and `content/_index.vi.md` (add `company.founded: "2026-07"`)
- Create: `layouts/partials/seo/jsonld.html` (assembles and prints the graph)
- Create: `layouts/partials/seo/person.html`, `layouts/partials/seo/organizations.html`, `layouts/partials/seo/breadcrumbs.html` (each returns a dict or slice of dicts)
- Modify: `layouts/partials/site/head.html` (one `{{ partial "seo/jsonld.html" . }}`)
- Test: `tests/jsonld.test.mjs`

**Interfaces:**

- Consumes: `seo/canonical.html` (Task 2) for every `url`; `seo/og-image.html` (Task 5) for `BlogPosting.image`.
- IDs (absolute, from `site.Home.Permalink` of the default language): `#website`, `#person`, `#turing-factor`, `#zetamotion`.
- Output: one `<script type="application/ld+json">` whose body is `dict "@context" "https://schema.org" "@graph" $nodes | jsonify | safeJS`. Drop any key whose value is empty before adding a node.
- Node content per spec §2. Data sources: Person from `site.Params.author.name`, `site.Params.socials` (`url`s except `id = "email"`), the current language's home page (`role` → `jobTitle`, `description`, `location`, `stack[].items` → `knowsAbout`, `education[].school` → `alumniOf`), `resources.Get "images/avatar.jpg" | .Fill "700x700"` → `image`. Turing Factor and ProfilePage only on the home page; WebSite + Person (full) on every page; BlogPosting on blog regular pages; BreadcrumbList on every non-home page (Home → section list page → page; skip the middle item when the page is the section itself).

- [ ] **Step 1: Write the failing tests**

```js
const byType = (g, t) => g.filter(n => [].concat(n['@type']).includes(t));
test('home: ProfilePage → Person with sameAs, worksFor, alumniOf', () => {
  const g = jsonLd(readOut(dir, '/'));
  const [pp] = byType(g, 'ProfilePage'); assert.equal(pp.mainEntity['@id'], 'https://trvhoang.pages.dev/#person');
  const [p] = byType(g, 'Person');
  assert.equal(p.name, 'Trần Việt Hoàng'); assert.equal(p.alternateName, 'Tran Viet Hoang');
  assert.deepEqual(p.sameAs, ['https://github.com/trv-hoang', 'https://www.linkedin.com/in/trvhoag', 'https://www.facebook.com/trvhoag']);
  assert.equal(p.worksFor['@id'], 'https://trvhoang.pages.dev/#zetamotion');
  assert.deepEqual(p.alumniOf.map(a => a.name), ['University of Information Technology, VNU-HCM', 'Trade Union University']);
  assert.match(p.image, /^https:\/\/trvhoang\.pages\.dev\/.+\.jpg$/);
});
test('home: Turing Factor founded by the person', () => {
  const [tf] = byType(jsonLd(readOut(dir, '/')), 'Organization').filter(o => o.name === 'Turing Factor');
  assert.equal(tf['@id'], 'https://trvhoang.pages.dev/#turing-factor');
  assert.equal(tf.founder['@id'], 'https://trvhoang.pages.dev/#person');
  assert.equal(tf.foundingDate, '2026-07'); assert.equal(tf.url, undefined);
});
test('post: BlogPosting with exact headline, dates, author, image', () => {
  const h = readOut(dir, '/blog/two-agents-one-guide/'); const [b] = byType(jsonLd(h), 'BlogPosting');
  assert.equal(b.headline, "Two agents, one user guide, and why they don't share notes");
  assert.equal(b.datePublished, '2026-11-16T17:00:00+07:00');
  assert.equal(b.author['@id'], 'https://trvhoang.pages.dev/#person');
  assert.equal(b.image, metaContent(h, 'og:image'));
  assert.deepEqual(b.keywords, ['tech', 'ai']); assert.equal(b.inLanguage, 'en');
});
test('vi copy of a post points to the English URL', () => {
  const [b] = byType(jsonLd(readOut(dir, '/vi/blog/two-agents-one-guide/')), 'BlogPosting');
  assert.equal(b.url, 'https://trvhoang.pages.dev/blog/two-agents-one-guide/');
});
test('breadcrumbs on a post', () => {
  const [bc] = byType(jsonLd(readOut(dir, '/blog/coffee-camping-ecopark/')), 'BreadcrumbList');
  assert.deepEqual(bc.itemListElement.map(i => i.position), [1, 2, 3]);
  assert.equal(bc.itemListElement[2].item, 'https://trvhoang.pages.dev/blog/coffee-camping-ecopark/');
});
test('vi home is in Vietnamese and every page has WebSite', () => {
  const g = jsonLd(readOut(dir, '/vi/')); assert.equal(byType(g, 'WebSite')[0].inLanguage, 'vi');
  for (const p of ['/map/', '/projects/', '/contact/']) assert.equal(byType(jsonLd(readOut(dir, p)), 'WebSite').length, 1);
});
test('no empty values anywhere', () => {
  const walk = v => { if (v === '' || (Array.isArray(v) && !v.length)) assert.fail('empty value'); if (v && typeof v === 'object') Object.values(v).forEach(walk); };
  for (const p of ['/', '/vi/', '/blog/', '/map/', '/blog/coffee-camping-ecopark/', '/project/spectron/']) jsonLd(readOut(dir, p)).forEach(walk);
});
```

- [ ] **Step 2: Run** `node --test tests/jsonld.test.mjs` — Expected: FAIL.
- [ ] **Step 3: Add** `company.founded: "2026-07"` to both home files.
- [ ] **Step 4: Implement** the four partials and the head include.
- [ ] **Step 5: Run** `node --test tests/jsonld.test.mjs` — Expected: PASS (7 tests).
- [ ] **Step 6: Commit** `feat(seo): add JSON-LD for the owner, Turing Factor and posts`.

---

### Task 7: Full verification

- [ ] **Step 1:** Stop any `hugo server` / Tailwind watcher you started. Run `npm test` (concurrency 1). Expected: all test files PASS; record the counts.
- [ ] **Step 2:** `npm run build` then `git status`: only expected files changed; if `static/global.css` changed, it must still be minified and match Task 4's output (rebuild produces identical bytes) — otherwise restore it.
- [ ] **Step 3:** Paste the JSON-LD of `/` and one post into <https://validator.schema.org> (manual, from the build output) and note any warnings for the owner. Google's Rich Results Test needs the deployed URL; leave it on the owner checklist.
- [ ] **Step 4:** Report to the owner: tests run and results, anything skipped, the checklist in `docs/4-seo.md`. Ask before pushing.
