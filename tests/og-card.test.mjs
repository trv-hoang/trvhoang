// Pixel checks on generated share cards for awkward titles (fixture posts from
// the test-only theme in tests/fixtures/themes/seo-fixtures).
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSite, readOut, metaContent } from './helpers/site.mjs';
import { decodePng, inkRows, bands } from './helpers/png.mjs';

let dir;
before(() => { dir = buildSite({ HUGO_THEME: 'seo-fixtures', HUGO_THEMESDIR: join(import.meta.dirname, 'fixtures', 'themes') }); });

const card = slug => decodePng(readFileSync(join(dir, new URL(metaContent(readOut(dir, `/blog/${slug}/`), 'og:image')).pathname)));
// Title block: below the top margin, above the name line at y=520.
const titleLines = img => bands(inkRows(img, { x0: 96, x1: 1188, y0: 60, y1: 500 }));
// Nothing may be drawn in the right margin (mirrors the 96px left margin).
const rightMarginInk = img => inkRows(img, { x0: 1104, x1: 1200, y0: 0, y1: 630 }).length;

test('Vietnamese title wraps by characters, not bytes', () => assert.equal(titleLines(card('fixture-vi-title')), 3));
test('a word too long for one line stays inside the card', () => assert.equal(rightMarginInk(card('fixture-long-word')), 0));
// 8 words of ~5 wide capitals: three fit per line by real glyph width, so 3 lines.
test('wide capitals wrap by glyph width', () => {
  const img = card('fixture-wide-caps');
  assert.equal(titleLines(img), 3); assert.equal(rightMarginInk(img), 0);
});
test('a title over four lines is cut to four, inside the card', () => {
  const img = card('fixture-very-long');
  assert.equal(titleLines(img), 4); assert.equal(rightMarginInk(img), 0);
});
test('real post card keeps two lines inside the card', () => {
  const img = card('two-agents-one-guide');
  assert.equal(titleLines(img), 2); assert.equal(rightMarginInk(img), 0);
});
