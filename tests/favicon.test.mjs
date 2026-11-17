import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSite, readOut, linkTags } from './helpers/site.mjs';

let dir;
before(() => { dir = buildSite(); });

const file = href => readFileSync(join(dir, href));

test('head links an SVG icon, an ICO fallback and an apple-touch-icon on every language', () => {
  for (const p of ['/', '/vi/blog/']) {
    const h = readOut(dir, p);
    assert.deepEqual(linkTags(h, 'icon').map(l => l.href).sort(), ['/favicon.ico', '/favicon.svg']);
    assert.deepEqual(linkTags(h, 'apple-touch-icon').map(l => l.href), ['/apple-touch-icon.png']);
  }
});
test('icon files exist in the right formats', () => {
  assert.match(file('/favicon.svg').toString(), /^<svg[^>]+viewBox="0 0 64 64"/);
  assert.deepEqual([...file('/favicon.ico').subarray(0, 4)], [0, 0, 1, 0]);
  const png = file('/apple-touch-icon.png');
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [180, 180]);
});
