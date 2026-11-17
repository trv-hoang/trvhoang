import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSite, readOut, metaContent } from './helpers/site.mjs';

let dir;
before(() => { dir = buildSite(); });

const pngSize = b => [b.readUInt32BE(16), b.readUInt32BE(20)];
// Walk JPEG segments to the first start-of-frame marker (SOF0–SOF3).
const jpgSize = b => {
  for (let i = 2; i < b.length;) {
    const marker = b[i + 1], len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xc3) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    i += 2 + len;
  }
  throw new Error('no SOF marker');
};
const fileFor = url => join(dir, new URL(url).pathname);

test('generated card for a post with an SVG cover', () => {
  const h = readOut(dir, '/blog/two-agents-one-guide/'); const u = metaContent(h, 'og:image');
  assert.match(u, /^https:\/\/trvhoang\.pages\.dev\/.+\.png$/);
  assert.deepEqual(pngSize(readFileSync(fileFor(u))), [1200, 630]);
  assert.equal(metaContent(h, 'twitter:image'), u);
  assert.equal(metaContent(h, 'og:image:alt'), "Two agents, one user guide, and why they don't share notes");
});
test('vi copy of a post shares the English card', () => {
  assert.equal(metaContent(readOut(dir, '/vi/blog/two-agents-one-guide/'), 'og:image'), metaContent(readOut(dir, '/blog/two-agents-one-guide/'), 'og:image'));
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
  assert.equal((h.match(/property="article:tag"/g) || []).length, 2);
  assert.equal(metaContent(readOut(dir, '/map/'), 'article:published_time'), undefined);
});
