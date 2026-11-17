import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { buildSite, readOut, metaContent, jsonLd } from './helpers/site.mjs';

let dir;
before(() => { dir = buildSite(); });

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
  assert.equal(byType(g, 'Organization').find(o => o['@id'] === 'https://trvhoang.pages.dev/#zetamotion').name, 'Zetamotion');
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
test('vi copy of a post has English breadcrumbs', () => {
  const [bc] = byType(jsonLd(readOut(dir, '/vi/blog/two-agents-one-guide/')), 'BreadcrumbList');
  assert.deepEqual(bc.itemListElement.map(i => i.item), ['https://trvhoang.pages.dev/', 'https://trvhoang.pages.dev/blog/', 'https://trvhoang.pages.dev/blog/two-agents-one-guide/']);
});
// One @id must not carry English values on / and Vietnamese ones on /vi/:
// Google merges nodes by @id. Localized fields appear only in the default
// language; each language site gets its own WebSite node.
test('vi pages give shared @ids only language-neutral values', () => {
  const g = jsonLd(readOut(dir, '/vi/'));
  assert.equal(byType(g, 'WebSite')[0]['@id'], 'https://trvhoang.pages.dev/vi/#website');
  const [p] = byType(g, 'Person');
  for (const k of ['jobTitle', 'description', 'homeLocation', 'knowsAbout', 'alumniOf']) assert.equal(p[k], undefined, k);
  assert.equal(p.name, 'Trần Việt Hoàng'); assert.ok(p.sameAs.length);
  const tf = byType(g, 'Organization').find(o => o['@id'] === 'https://trvhoang.pages.dev/#turing-factor');
  assert.equal(tf.description, undefined); assert.equal(tf.foundingDate, '2026-07');
});
test('English pages keep the full Person and the root WebSite', () => {
  const g = jsonLd(readOut(dir, '/map/'));
  assert.equal(byType(g, 'WebSite')[0]['@id'], 'https://trvhoang.pages.dev/#website');
  assert.equal(byType(g, 'Person')[0].jobTitle, 'Software Engineer & Co-founder');
});
