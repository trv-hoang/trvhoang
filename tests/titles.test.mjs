import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { buildSite, readOut, titleOf, metaContent } from './helpers/site.mjs';

let dir;
before(() => { dir = buildSite(); });

test('home title is name · role', () => assert.equal(titleOf(readOut(dir, '/')), 'Trần Việt Hoàng · Software Engineer & Co-founder'));
test('vi home title uses vi role', () => assert.equal(titleOf(readOut(dir, '/vi/')), 'Trần Việt Hoàng · Kỹ sư phần mềm & đồng sáng lập'));
test('post title ends with the name', () => assert.equal(titleOf(readOut(dir, '/blog/two-agents-one-guide/')), "Two agents, one user guide, and why they don't share notes · Trần Việt Hoàng"));
test('og:site_name is the name', () => assert.equal(metaContent(readOut(dir, '/blog/'), 'og:site_name'), 'Trần Việt Hoàng'));
