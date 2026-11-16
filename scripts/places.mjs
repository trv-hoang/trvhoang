#!/usr/bin/env node
// Tools for the places on /map/ (content/places/*.md). Node 22+, no dependencies.
//
//   npm run place:add -- "<Google Maps link>" [--category cafe] [--description "..."] [--dry-run]
//   npm run place:sync [-- --write] [--only file.md]
//   npm run place:check
//   npm run place:photo -- <slug> <photo> [more photos…]
//
// place:add   takes a link from Google Maps (the Share button gives a maps.app.goo.gl
//             link; one copied from the address bar works too), looks the place up and
//             writes content/places/<slug>.md with its name, position, address and city.
// place:sync  looks every place up again from its link and corrects position, address,
//             city and status (closed / temporarily closed). It only reports until you
//             add --write.
// place:check reports what is missing or looks wrong in every place file.
// place:photo copies your photos to assets/images/places/<slug>/ (iPhone HEIC becomes
//             JPEG). Hugo resizes them to WebP and drops their metadata, GPS included,
//             when it builds the site. They show in the popup in file-name order.
//
// The lookup reads the public Google Maps page for the link, the same data a browser
// gets. It is not an official API: it can change without notice, so the commands
// fall back to what the link itself contains, and they wait between requests.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { extname } from "node:path";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PLACES = join(ROOT, "content", "places");
const VIETNAM = { lat: [8, 24], lng: [102, 110] };
const NEAR_METRES = 25;
const CITY_RADIUS_KM = 40;

// ── small helpers ────────────────────────────────────────────────────

const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) out[key] = true;
      else out[key] = argv[++i];
    } else out._.push(a);
  }
  return out;
}

// reads the simple front matter these files use: key: value, key: "value"
function readFrontMatter(file) {
  const text = readFileSync(file, "utf8");
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const data = {};
  if (!m) return { data, text };
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (/^".*"$/.test(v)) v = v.slice(1, -1).replace(/\\"/g, '"');
    data[kv[1]] = v;
  }
  return { data, text };
}

// the category names that have a colour in data/map.yaml
function knownCategories() {
  const yaml = readFileSync(join(ROOT, "data", "map.yaml"), "utf8");
  const block = yaml.split(/\n(?=\S)/).find((b) => b.startsWith("colours:")) || "";
  return new Set(
    block
      .split("\n")
      .slice(1)
      .map((l) => l.match(/^\s+([^:#]+):/)?.[1].trim())
      .filter(Boolean),
  );
}

function slugify(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function distanceMetres(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function loadPlaces() {
  return readdirSync(PLACES)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => ({ file: f, ...readFrontMatter(join(PLACES, f)) }));
}

const yamlString = (s) => `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

// ── Google Maps links ───────────────────────────────────────────────

async function resolveLink(url) {
  // short links (maps.app.goo.gl, goo.gl/maps) redirect to the full one
  let current = url;
  for (let i = 0; i < 5; i++) {
    if (/google\.[a-z.]+\/maps/.test(current) && !/goo\.gl/.test(current)) return current;
    const res = await fetch(current, { redirect: "manual", headers: { "user-agent": "Mozilla/5.0" } });
    const next = res.headers.get("location");
    if (!next) return current;
    current = new URL(next, current).href;
  }
  return current;
}

export function parseGoogleMapsUrl(url) {
  const decoded = decodeURIComponent(url.replace(/\+/g, " "));
  const name = decoded.match(/\/maps\/place\/([^/@?]+)/)?.[1]?.trim();
  // !3d…!4d… is the place itself; @lat,lng is only where the view was centred
  const pin = decoded.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  const view = decoded.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  const query = decoded.match(/[?&]q=(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
  const hit = pin || query || view;
  return {
    name,
    lat: hit ? Number(hit[1]) : undefined,
    lng: hit ? Number(hit[2]) : undefined,
    exact: Boolean(pin || query),
  };
}

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36";
const sleepMs = (ms) => new Promise((r) => setTimeout(r, ms));

// "Hà Nội 100000, Vietnam" → "Hà Nội"; "Thành phố Huế, Thừa Thiên Huế, Vietnam" → "Huế"
function cityFromAddress(parts) {
  const last = [...parts].reverse().find((p) => !/^vietnam$/i.test(p.trim())) || "";
  return last
    .replace(/,?\s*(Vietnam|Việt Nam)$/i, "")
    .replace(/\s*\d{5,6}$/, "")
    .replace(/^(Thành phố|TP\.?)\s+/i, "")
    .trim();
}

// Google sometimes answers with a compressed body that fetch cannot decode, which
// breaks the JSON parse at random; asking for an uncompressed body avoids it.
const GOOGLE_HEADERS = { "user-agent": UA, "accept-language": "en", "accept-encoding": "identity" };

// Looks a Google Maps link up: name, exact position, address, city and Google's categories.
export async function lookupGooglePlace(link) {
  const full = await resolveLink(link);
  const page = await fetch(full, { headers: GOOGLE_HEADERS }).then((r) => r.text());
  const preview = page.match(/preview\/place\?[^"']+/)?.[0]?.replace(/&amp;/g, "&").replace(/\\u0026/g, "&").replace(/\\u003d/g, "=");
  if (!preview) return null;
  const raw = await fetch(`https://www.google.com/maps/${preview}`, { headers: GOOGLE_HEADERS }).then((r) => r.text());
  const json = JSON.parse(raw.slice(raw.indexOf("\n") + 1));
  const place = json?.[6];
  const pos = place?.[9];
  if (!place || !pos?.[2] || !pos?.[3]) return null;
  return {
    name: place[11],
    lat: Number(pos[2].toFixed(6)),
    lng: Number(pos[3].toFixed(6)),
    address: place[39] ? String(place[39]).replace(/,\s*(Vietnam|Việt Nam)$/i, "") : "",
    city: Array.isArray(place[2]) ? cityFromAddress(place[2]) : "",
    types: place[13] || [],
    // Google marks a closed business with these flags; the page shows them as
    // "Permanently closed" and "Temporarily closed"
    status: place[23] === 1 ? "closed" : place[160]?.[0] === 1 ? "temporarily closed" : "",
    full,
  };
}

// Google's place types → our categories (data/map.yaml)
function categoryFromTypes(types) {
  const t = types.join(" ").toLowerCase();
  if (/specialty coffee|coffee roast/.test(t)) return "specialty coffee";
  if (/matcha/.test(t)) return "matcha";
  if (/tea|bubble/.test(t)) return "tea";
  if (/caf|coffee/.test(t)) return "cafe";
  if (/bakery|pastry|dessert|donut|cake/.test(t)) return "pastry";
  if (/shopping mall|mall/.test(t)) return "mall";
  if (/convenience/.test(t)) return "convenience store";
  if (/store|shop/.test(t)) return "shop";
  if (/restaurant|food|eatery|noodle|pho|bar|pub/.test(t)) return "restaurant";
  if (/park|lake|garden|natural feature|scenic|viewpoint/.test(t)) return "scenic";
  if (/museum|tourist attraction|landmark|historical|monument|exhibition/.test(t)) return "landmark";
  return undefined;
}

// guesses the city from the places already on the map
function guessCity(point, places) {
  const byCity = new Map();
  for (const p of places) {
    const lat = Number(p.data.lat);
    const lng = Number(p.data.lng);
    if (!p.data.city || !lat || !lng) continue;
    const c = byCity.get(p.data.city) || { lat: 0, lng: 0, n: 0 };
    c.lat += lat;
    c.lng += lng;
    c.n++;
    byCity.set(p.data.city, c);
  }
  let best;
  for (const [city, c] of byCity) {
    const d = distanceMetres(point, { lat: c.lat / c.n, lng: c.lng / c.n });
    if (d < CITY_RADIUS_KM * 1000 && (!best || d < best.d)) best = { city, d };
  }
  return best?.city;
}

// ── commands ────────────────────────────────────────────────────────

async function add(args) {
  const link = args._[1];
  if (!link) {
    console.log('Usage: npm run place:add -- "<Google Maps link>" [--category cafe] [--description "..."]');
    process.exit(1);
  }

  let found = null;
  try {
    found = await lookupGooglePlace(link);
  } catch (e) {
    console.warn(yellow(`Could not look the place up (${e.message}); using what the link contains.`));
  }
  const fromUrl = parseGoogleMapsUrl(found?.full || (await resolveLink(link).catch(() => link)));

  const name = args.name || found?.name || fromUrl.name;
  const lat = args.lat ? Number(args.lat) : found?.lat ?? fromUrl.lat;
  const lng = args.lng ? Number(args.lng) : found?.lng ?? fromUrl.lng;

  if (!name) {
    console.error(red('The link has no place name. Add one with --name "...".'));
    process.exit(1);
  }
  if (lat === undefined || lng === undefined) {
    console.error(red("Could not find the position of this place."));
    console.error('Pass it yourself: --lat 21.0285 --lng 105.8542 (right-click the place in Google Maps to copy it).');
    process.exit(1);
  }
  if (!found && !fromUrl.exact && !args.lat) console.warn(yellow("Using the map's centre, not the pin. Check the position on /map/ after adding."));

  const places = loadPlaces();
  const category = args.category || categoryFromTypes(found?.types || []) || "restaurant";
  const city = args.city || found?.city || guessCity({ lat, lng }, places) || "";
  const address = args.address || found?.address || "";
  const status = args.status || found?.status || "";
  const slug = args.slug || slugify(name);
  const file = join(PLACES, `${slug}.md`);

  const near = places.find((p) => p.data.lat && distanceMetres({ lat, lng }, { lat: Number(p.data.lat), lng: Number(p.data.lng) }) < NEAR_METRES);
  if (near) console.warn(yellow(`Careful: ${near.file} is less than ${NEAR_METRES} m away. Same place?`));
  if (existsSync(file)) {
    console.error(red(`content/places/${slug}.md already exists. Pick another name with --slug.`));
    process.exit(1);
  }
  if (!knownCategories().has(category)) console.warn(yellow(`"${category}" has no colour in data/map.yaml yet; it will use the default.`));

  const today = new Date().toISOString().slice(0, 10);
  const body = `---
title: ${yamlString(name)}
date: ${today}
lat: ${lat}
lng: ${lng}
category: ${yamlString(category)}
city: ${yamlString(city)}
address: ${yamlString(address)}
link: ${yamlString(link)}
${status ? `status: ${yamlString(status)}\n` : ""}description: ${yamlString(args.description || "")}
# Optional, shown in the popup when set:
# image: "/images/places/${slug}.jpg"
# dishes: ["..."]
# price: "50k–100k VND"
# hours: "7:00–22:00"
build:
  render: "never"
  list: "always"
---
`;

  if (args["dry-run"]) {
    console.log(dim(`(dry run) content/places/${slug}.md\n`) + body);
    return;
  }
  writeFileSync(file, body);
  console.log(green(`Added content/places/${slug}.md`));
  console.log(`  ${name} · ${category}${city ? ` · ${city}` : ""}`);
  console.log(`  ${address || "(no address)"} · ${lat}, ${lng}`);
  if (status) console.log(yellow(`  Google lists it as ${status}.`));
  console.log(dim("  Write a line in description: and it shows in the popup."));
}

// replaces one `key: value` line of the front matter (or adds it before build:)
function setField(text, key, value) {
  const line = `${key}: ${typeof value === "number" ? value : yamlString(value)}`;
  const re = new RegExp(`^${key}:.*$`, "m");
  return re.test(text) ? text.replace(re, line) : text.replace(/^build:/m, `${line}\nbuild:`);
}

function removeField(text, key) {
  return text.replace(new RegExp(`^${key}:.*\\n`, "m"), "");
}

async function sync(args) {
  const write = Boolean(args.write);
  const places = loadPlaces().filter((p) => p.data.link && (!args.only || p.file === args.only));
  let moved = 0;
  let failed = 0;
  console.log(dim(`Looking up ${places.length} places${write ? "" : " (report only; add --write to save)"}…`));

  for (const [i, p] of places.entries()) {
    let found = null;
    try {
      found = await lookupGooglePlace(p.data.link);
    } catch {}
    if (!found) {
      failed++;
      console.log(yellow(`  ? ${p.file}: not found`));
    } else {
      const before = { lat: Number(p.data.lat), lng: Number(p.data.lng) };
      const d = before.lat ? distanceMetres(before, found) : Infinity;
      const changes = [];
      if (!(d < 30)) changes.push(Number.isFinite(d) ? `moved ${d < 1000 ? Math.round(d) + " m" : (d / 1000).toFixed(1) + " km"}` : "position added");
      if (found.address && found.address !== p.data.address) changes.push("address");
      if (found.city && found.city !== p.data.city) changes.push(`city ${p.data.city || "-"} → ${found.city}`);
      if (found.status !== (p.data.status || "")) changes.push(`status ${p.data.status || "open"} → ${found.status || "open"}`);
      if (changes.length) {
        moved++;
        console.log(`  ${write ? green("✓") : "•"} ${p.file}: ${changes.join(", ")}`);
        if (write) {
          let text = p.text;
          text = setField(text, "lat", found.lat);
          text = setField(text, "lng", found.lng);
          if (found.address) text = setField(text, "address", found.address);
          if (found.city) text = setField(text, "city", found.city);
          text = found.status ? setField(text, "status", found.status) : removeField(text, "status");
          writeFileSync(join(PLACES, p.file), text);
        }
      }
    }
    if (i < places.length - 1) await sleepMs(900 + Math.random() * 600);
  }
  console.log(`\n${moved} place(s) ${write ? "updated" : "would change"}, ${failed} not found, ${places.length - moved - failed} already right.`);
}

function check() {
  const places = loadPlaces();
  const categories = knownCategories();
  const errors = [];
  const warnings = [];
  const err = (file, msg) => errors.push(`${file}: ${msg}`);
  const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

  const seenNames = new Map();
  for (const p of places) {
    const { data, text, file } = p;
    if (!data.title) err(file, "no title");
    const lat = Number(data.lat);
    const lng = Number(data.lng);
    if (!data.lat || !data.lng || Number.isNaN(lat) || Number.isNaN(lng)) err(file, "no coordinates (lat, lng)");
    else if (lat < VIETNAM.lat[0] || lat > VIETNAM.lat[1] || lng < VIETNAM.lng[0] || lng > VIETNAM.lng[1])
      warn(file, `coordinates ${lat}, ${lng} are outside Vietnam; are lat and lng swapped?`);
    if (!data.category) warn(file, "no category; it shows as food");
    else if (!categories.has(data.category)) err(file, `category "${data.category}" is not in data/map.yaml (typo?)`);
    if (!data.city) warn(file, "no city");
    if (!data.address) warn(file, "no address");
    if (data.link && !/google\.[a-z.]+\/maps|goo\.gl/.test(data.link)) warn(file, "link is not a Google Maps link");
    if (/^_build:/m.test(text)) err(file, "uses _build: (Hugo now needs build:)");

    const key = slugify(data.title || "");
    if (key) {
      if (seenNames.has(key)) err(file, `same name as ${seenNames.get(key)}`);
      else seenNames.set(key, file);
    }
  }

  // places almost on top of each other
  const located = places.filter((p) => Number(p.data.lat) && Number(p.data.lng));
  for (let i = 0; i < located.length; i++) {
    for (let j = i + 1; j < located.length; j++) {
      const a = located[i];
      const b = located[j];
      const d = distanceMetres({ lat: Number(a.data.lat), lng: Number(a.data.lng) }, { lat: Number(b.data.lat), lng: Number(b.data.lng) });
      if (d < 1) err(a.file, `same position as ${b.file}; probably a default, run npm run place:sync`);
      else if (d < NEAR_METRES) warn(a.file, `${Math.round(d)} m from ${b.file}; same place?`);
    }
  }

  const missing = (k) => places.filter((p) => !p.data[k]).length;
  console.log(`${places.length} places · ${missing("description")} without a description · ${missing("address")} without an address`);
  if (warnings.length) {
    console.log(yellow(`\n${warnings.length} warning(s)`));
    warnings.forEach((w) => console.log("  " + w));
  }
  if (errors.length) {
    console.log(red(`\n${errors.length} error(s)`));
    errors.forEach((e) => console.log("  " + e));
    process.exit(1);
  }
  console.log(green("\nNo errors."));
}

const PHOTOS = join(ROOT, "assets", "images", "places");
const PHOTO_TYPES = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function photo(args) {
  const [, slug, ...files] = args._;
  if (!slug || !files.length) {
    console.log("Usage: npm run place:photo -- <slug> <photo> [more photos…]");
    console.log(dim("The slug is the file name in content/places/ without .md, e.g. banh-gio-miss-beo"));
    process.exit(1);
  }
  if (!existsSync(join(PLACES, `${slug}.md`))) {
    const close = loadPlaces().map((p) => p.file.replace(/\.md$/, "")).filter((n) => slug.split("-").filter((t) => t.length > 2).some((t) => n.includes(t))).slice(0, 5);
    console.error(red(`content/places/${slug}.md does not exist.`));
    if (close.length) console.error(`Did you mean: ${close.join(", ")}?`);
    process.exit(1);
  }

  const dest = join(PHOTOS, slug);
  mkdirSync(dest, { recursive: true });
  let n = readdirSync(dest).filter((f) => PHOTO_TYPES.has(extname(f).toLowerCase())).length;

  for (const file of files) {
    if (!existsSync(file)) {
      console.warn(yellow(`  skipped ${file}: not found`));
      continue;
    }
    const ext = extname(file).toLowerCase();
    const name = String(++n).padStart(2, "0");
    if (ext === ".heic" || ext === ".heif") {
      if (process.platform !== "darwin") {
        console.warn(yellow(`  skipped ${file}: convert HEIC to JPEG first (only macOS can do it here)`));
        n--;
        continue;
      }
      execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "85", file, "--out", join(dest, `${name}.jpg`)], { stdio: "ignore" });
      console.log(green(`  ✓ ${file} → ${name}.jpg`));
    } else if (PHOTO_TYPES.has(ext)) {
      copyFileSync(file, join(dest, `${name}${ext === ".jpeg" ? ".jpg" : ext}`));
      console.log(green(`  ✓ ${file} → ${name}${ext === ".jpeg" ? ".jpg" : ext}`));
    } else {
      console.warn(yellow(`  skipped ${file}: use JPEG, PNG, WebP or HEIC`));
      n--;
    }
  }
  console.log(`assets/images/places/${slug}/ now has ${n} photo(s). The first one leads the popup.`);
}

// ── main ────────────────────────────────────────────────────────────

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];
  if (command === "add") await add(args);
  else if (command === "sync") await sync(args);
  else if (command === "check") check();
  else if (command === "photo") photo(args);
  else {
    console.log("Commands: add <Google Maps link>, sync [--write], check, photo <slug> <files…>");
    process.exit(1);
  }
}
