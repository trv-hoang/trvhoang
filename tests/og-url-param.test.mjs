// hugo.toml documents ogImage as "a path in assets/ … or a full URL";
// a full URL must not break the build and must still yield a 1200x630 card.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSite, readOut, metaContent } from './helpers/site.mjs';

let dir;
before(() => { dir = buildSite({ HUGO_PARAMS_OGIMAGE: 'https://example.com/me.jpg' }); });

test('site card still built when ogImage is a full URL', () => {
  const u = metaContent(readOut(dir, '/'), 'og:image');
  assert.match(u, /^https:\/\/trvhoang\.pages\.dev\/.+\.png$/);
  const b = readFileSync(join(dir, new URL(u).pathname));
  assert.deepEqual([b.readUInt32BE(16), b.readUInt32BE(20)], [1200, 630]);
});
