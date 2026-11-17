import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSite, readOut, linkTags } from './helpers/site.mjs';

let dir;
before(() => { dir = buildSite(); });

test('no Google Fonts requests', () => assert.doesNotMatch(readOut(dir, '/'), /fonts\.(googleapis|gstatic)\.com/));
test('preloads a local woff2 that exists', () => {
  const pre = linkTags(readOut(dir, '/'), 'preload');
  assert.equal(pre.length, 1); assert.match(pre[0].href, /^\/fonts\/be-vietnam-pro\/.+\.woff2$/);
  assert.ok(existsSync(join(dir, pre[0].href)));
});
test('global.css declares the font faces', () => {
  const css = readFileSync(join(dir, 'global.css'), 'utf8');
  // Whitespace-tolerant: the dev watcher writes unminified CSS.
  for (const w of ['400', '500', '600', '700']) assert.match(css, new RegExp(`font-family:\\s*"?Be Vietnam Pro"?;[^}]*font-weight:\\s*${w}`));
  assert.match(css, /font-display:\s*swap/);
});
