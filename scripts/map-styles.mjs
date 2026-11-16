#!/usr/bin/env node
// Builds the two map styles used on /map/ from OpenFreeMap's open styles,
// with labels in each place's own Latin spelling (Vietnamese with accents in Vietnam).
//
//   npm run map:styles
//
// Writes static/map/light.json (Liberty, its own colours) and static/map/dark.json
// (Dark, recoloured as "Night").
// Tiles, fonts and icons still come from OpenFreeMap: free, worldwide, no key, no logo.
// Change a colour below and run the command again.

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "static", "map");

const PALETTES = {
  // OpenFreeMap Liberty as it is, colourful; only the labels change
  light: {
    base: "https://tiles.openfreemap.org/styles/liberty",
    keepColours: true,
  },
  // "Night": deep blue-black ground, blue water, green parks, amber main roads
  dark: {
    base: "https://tiles.openfreemap.org/styles/dark",
    background: "#0f1115",
    residential: "#13161b",
    park: "#13261b",
    water: "#0f2a3d",
    waterLabel: "#5d8fb0",
    building: "#181b21",
    buildingOutline: "#20242b",
    roadMinor: "#1f232a",
    roadMajor: "#3a2f1d",
    roadMotorway: "#6b4a17",
    roadCasing: "#191c22",
    path: "#1b1e24",
    rail: "#272b33",
    boundary: "#4a4f5a",
    roadLabel: "#9aa3b2",
    placeLabel: "#d9dde5",
    labelHalo: "#0f1115",
  },
};

// Colourful variants, only written with --previews <dir> to compare before adopting one.
const PREVIEWS = {
  "warm-light": {
    base: "https://tiles.openfreemap.org/styles/positron",
    background: "#f6f1e7", residential: "#f1eadc", park: "#cfe3c1", water: "#a9d3e6", waterLabel: "#3f6f86",
    building: "#eadfcd", buildingOutline: "#ddcfb8", roadMinor: "#ffffff", roadMajor: "#fde7b0", roadMotorway: "#f9c97a",
    roadCasing: "#e6d6bb", path: "#ebe3d4", rail: "#d4c7b1", boundary: "#b9a98f", roadLabel: "#6b5a45", placeLabel: "#3b2f22", labelHalo: "#f6f1e7",
  },
  "pastel-light": {
    base: "https://tiles.openfreemap.org/styles/positron",
    background: "#f4f3f8", residential: "#efedf5", park: "#d6ecd9", water: "#bfdcf5", waterLabel: "#4a6d93",
    building: "#e7e4ef", buildingOutline: "#dad6e6", roadMinor: "#ffffff", roadMajor: "#ffe6d1", roadMotorway: "#ffcfa8",
    roadCasing: "#e1dcea", path: "#e9e6f0", rail: "#d2cde0", boundary: "#aaa3bf", roadLabel: "#5e5877", placeLabel: "#2e2a40", labelHalo: "#f4f3f8",
  },
  "night-dark": {
    base: "https://tiles.openfreemap.org/styles/dark",
    background: "#0f1115", residential: "#13161b", park: "#13261b", water: "#0f2a3d", waterLabel: "#5d8fb0",
    building: "#181b21", buildingOutline: "#20242b", roadMinor: "#1f232a", roadMajor: "#3a2f1d", roadMotorway: "#6b4a17",
    roadCasing: "#191c22", path: "#1b1e24", rail: "#272b33", boundary: "#4a4f5a", roadLabel: "#9aa3b2", placeLabel: "#d9dde5", labelHalo: "#0f1115",
  },
  "dusk-dark": {
    base: "https://tiles.openfreemap.org/styles/dark",
    background: "#1a1626", residential: "#1e1a2c", park: "#1d2b25", water: "#1c2c48", waterLabel: "#7d9cd6",
    building: "#231e33", buildingOutline: "#2b253d", roadMinor: "#2a2440", roadMajor: "#4a3352", roadMotorway: "#7a4a5e",
    roadCasing: "#211c31", path: "#262039", rail: "#332c4a", boundary: "#57507a", roadLabel: "#aaa2c8", placeLabel: "#e6e1f5", labelHalo: "#1a1626",
  },
};

// Vietnamese with its accents in Vietnam, a Latin spelling everywhere else
const LABEL = ["coalesce", ["get", "name:latin"], ["get", "name"]];

function relabel(layer) {
  if (layer.type !== "symbol" || !layer.layout?.["text-field"]) return;
  if (JSON.stringify(layer.layout["text-field"]).includes('"ref"')) return;
  layer.layout["text-field"] = LABEL;
}

function recolour(layer, c) {
  if (c.keepColours) return relabel(layer);
  const id = layer.id;
  const p = (layer.paint ||= {});
  // only paint properties that belong to this layer's type (fill-, line-, background-)
  const set = (key, value) => {
    if (key.startsWith(`${layer.type}-`)) p[key] = value;
  };

  if (layer.type !== "symbol") {

  if (layer.type === "background") set("background-color", c.background);
  else if (/^water$|^waterway$/.test(id)) {
    set(layer.type === "fill" ? "fill-color" : "line-color", c.water);
  } else if (/park|wood|grass/.test(id)) set("fill-color", c.park);
  else if (/residential/.test(id)) set("fill-color", c.residential);
  else if (/^building/.test(id)) {
    set("fill-color", c.building);
    set("fill-outline-color", c.buildingOutline);
  } else if (/casing/.test(id)) set("line-color", c.roadCasing);
  else if (/motorway/.test(id) && layer.type === "line") set("line-color", c.roadMotorway);
  else if (/major/.test(id) && layer.type === "line") set("line-color", c.roadMajor);
  else if (/minor|road_pier|road_area/.test(id)) set(layer.type === "fill" ? "fill-color" : "line-color", c.roadMinor);
  else if (/path/.test(id)) set("line-color", c.path);
  else if (/railway/.test(id) && !/dash/.test(id)) set("line-color", c.rail);
  else if (/railway.*dash/.test(id)) set("line-color", c.background);
  else if (/boundary/.test(id)) set("line-color", c.boundary);
  }

  if (layer.type === "symbol" && layer.layout?.["text-field"]) {
    const isRef = JSON.stringify(layer.layout["text-field"]).includes('"ref"');
    if (!isRef) layer.layout["text-field"] = LABEL;
    const isWater = /water/.test(id);
    const isRoad = /highway|road|transportation/.test(id) || layer["source-layer"] === "transportation_name";
    p["text-color"] = isWater ? c.waterLabel : isRoad ? c.roadLabel : c.placeLabel;
    p["text-halo-color"] = c.labelHalo;
    p["text-halo-width"] = 1.2;
  }
}

const previewDir = process.argv.includes("--previews") ? process.argv[process.argv.indexOf("--previews") + 1] : null;
const targets = previewDir ? PREVIEWS : PALETTES;
const outDir = previewDir || OUT;

mkdirSync(outDir, { recursive: true });
for (const [name, c] of Object.entries(targets)) {
  const style = await fetch(c.base).then((r) => {
    if (!r.ok) throw new Error(`${c.base}: ${r.status}`);
    return r.json();
  });
  style.name = `trvhoang ${name}`;
  // the shaded-relief raster only matters at world zoom and muddies the palette
  if (!c.keepColours) {
    style.layers = style.layers.filter((l) => l.source !== "ne2_shaded");
    delete style.sources.ne2_shaded;
  }
  style.layers.forEach((l) => recolour(l, c));
  writeFileSync(join(outDir, `${name}.json`), JSON.stringify(style));
  console.log(`${join(outDir, `${name}.json`)}  (${style.layers.length} layers, from ${c.base})`);
}
