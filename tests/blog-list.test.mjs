// Post rows on /blog/ (every post after the featured newest one).
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { buildSite, readOut } from './helpers/site.mjs';

let dir;
before(() => { dir = buildSite(); });

const rows = html => [...html.matchAll(/<a [^>]*class="[^"]*\bpost-row\b[^"]*"[\s\S]*?<\/a>/g)].map(m => m[0]);

for (const p of ['/blog/', '/vi/blog/']) {
  test(`${p}: a row is a card with its cover and its date`, () => {
    const [row] = rows(readOut(dir, p));
    assert.ok(row, 'no post row');
    assert.match(row, /class="[^"]*\bcard\b/);
    assert.match(row, /<time [^>]*datetime="2026-11-16"/);
    const src = row.match(/<img [^>]*src="([^"]+)"/)?.[1];
    assert.ok(src, 'no cover image');
    assert.ok(existsSync(join(dir, src)), `missing ${src}`);
    assert.match(src, /\.webp$/, 'photo covers are resized to a small WebP thumbnail');
  });
}
