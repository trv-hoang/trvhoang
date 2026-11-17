// Shared helpers for the SEO tests: one Hugo build per test file, then plain
// string parsing of the output (no DOM library, to keep the repo dependency-free).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Not --quiet: with it Hugo prints nothing on failure, so errors would be lost.
// env: extra variables, e.g. HUGO_PARAMS_OGIMAGE to override a site param.
export function buildSite(env = {}) {
  const out = mkdtempSync(join(tmpdir(), 'trvhoang-test-'));
  try {
    execFileSync('hugo', ['build', '-e', 'production', '-d', out], { cwd: root, stdio: 'pipe', env: { ...process.env, ...env } });
  } catch (err) {
    throw new Error(`hugo build failed:\n${err.stdout}${err.stderr}`);
  }
  return out;
}

export function readOut(dir, urlPath) {
  return readFileSync(join(dir, urlPath.endsWith('/') ? urlPath + 'index.html' : urlPath), 'utf8');
}

const decode = s => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([a-zA-Z:-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) out[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? '');
  return out;
}

const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\s[^>]*>`, 'gi'))].map(m => attrs(m[0].slice(name.length + 1)));

export function metaContent(html, key) {
  const t = tags(html, 'meta').find(a => a.name === key || a.property === key);
  return t?.content;
}

export function linkTags(html, rel) {
  return tags(html, 'link').filter(a => a.rel === rel);
}

export function jsonLd(html) {
  const nodes = [];
  for (const m of html.matchAll(/<script type="?application\/ld\+json"?>([\s\S]*?)<\/script>/g)) {
    const data = JSON.parse(m[1]);
    nodes.push(...(data['@graph'] ?? [data]));
  }
  return nodes;
}

export function titleOf(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/);
  return m ? decode(m[1]).trim() : undefined;
}
