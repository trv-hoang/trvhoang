import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { buildSite, readOut, metaContent, linkTags } from './helpers/site.mjs';

let dir;
before(() => { dir = buildSite(); });

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
