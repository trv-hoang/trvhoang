import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSite, readOut, metaContent, linkTags } from './helpers/site.mjs';

let dir;
before(() => { dir = buildSite(); });

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
test('noindex tag pages carry no hreflang', () => {
  for (const p of ['/tags/', '/vi/tags/coffee/'])
    assert.equal(linkTags(readOut(dir, p), 'alternate').filter(l => l.hreflang).length, 0);
});
test('sitemap alternates skip shared posts and noindex pages, keep real translations', () => {
  const en = readFileSync(join(dir, 'en/sitemap.xml'), 'utf8');
  assert.doesNotMatch(en, /href="[^"]*\/vi\/blog\/[^"]+\/"/);
  assert.doesNotMatch(en, /href="[^"]*\/tags\//);
  assert.match(en, /hreflang="[^"]*" href="https:\/\/trvhoang\.pages\.dev\/vi\/map\/"/);
});
