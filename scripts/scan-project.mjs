#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import config from "./project-sync.config.mjs";

const ROOT = process.cwd();
const outPath = path.join(ROOT, config.outFile);
await fs.mkdir(path.dirname(outPath), { recursive: true });

const readJson = async (p) => {
  try { return JSON.parse(await fs.readFile(p, "utf8")); }
  catch (e) { console.warn("Bad JSON:", p, e.message); return null; }
};

// ---- 1) Collect Content JSON (mediums/courses/subjects/...)
async function collectContent() {
  const buckets = {};
  for (const [key, globOrGlobs] of Object.entries(config.contentRoots)) {
    const globs = Array.isArray(globOrGlobs) ? globOrGlobs : [globOrGlobs];
    const allFiles = [];
    for (const glob of globs) {
      const files = await fg(glob, { cwd: ROOT, absolute: true });
      allFiles.push(...files);
    }
    // Remove duplicates
    const files = [...new Set(allFiles)];

    const docs = [];
    for (const file of files) {
      const j = await readJson(file);
      if (!j) continue;

      // Handle both single objects and arrays
      const items = Array.isArray(j) ? j : [j];
      for (const item of items) {
        // use id from object, or filename (without ext) as fallback
        const id = item.id || path.basename(file).replace(/\.[^.]+$/, "");
        docs.push({
          id,
          ...item,
        });
      }
    }
    buckets[key] = docs;
  }
  return buckets;
}

// ---- 2) Collect Screens
async function collectScreens() {
  const out = [];

  // Preferred path: registry file
  try {
    const registryAbs = path.join(ROOT, config.screens.registryFile);
    const contents = await fs.readFile(registryAbs, "utf8");
    // naive parse: look for SCREENS_REGISTRY = [ ... ]
    const m = contents.match(/SCREENS_REGISTRY\s*:\s*ScreenMeta\[\]\s*=\s*(\[[\s\S]*?\]);/m)
          || contents.match(/SCREENS_REGISTRY\s*=\s*(\[[\s\S]*?\]);/m);

    if (m) {
      // eslint-disable-next-line no-new-func
      const arr = Function(`return ${m[1]}`)();
      arr.forEach((s) => out.push({
        id: s.id,
        route: s.route,
        name: s.name,
        title: s.title ?? s.name,
        description: s.description ?? "",
        category: s.category ?? "public",
        icon: s.icon ?? null,
        order: s.order ?? config.defaults.order,
        active: (s.active ?? config.defaults.active) ? true : false,
        isVisible: (s.active ?? config.defaults.active) ? true : false,
        roles: s.roles ?? []
      }));
      return out;
    }
  } catch (_) {}

  // Fallback: scan for react-router <Route path="...">
  const files = await fg(config.screens.autoDiscoverGlobs, { cwd: ROOT, absolute: true });
  const routeRe = /<Route[^>]*\spath=["']([^"']+)["'][^>]*>/g;
  for (const file of files) {
    const code = await fs.readFile(file, "utf8");
    let m;
    while ((m = routeRe.exec(code))) {
      const route = m[1];
      const id = route.replace(/[^\w]+/g, "_").replace(/^_+|_+$/g, "");
      out.push({
        id,
        route,
        name: id,
        title: id,
        description: "",
        category: "public",
        icon: null,
        order: config.defaults.order,
        active: true,
        isVisible: true,
        roles: []
      });
    }
  }
  // de-dup by id
  const map = new Map();
  out.forEach((s) => map.set(s.id, { ...map.get(s.id), ...s }));
  return [...map.values()];
}

const content = await collectContent();
const screens = await collectScreens();

const snapshot = {
  generatedAt: new Date().toISOString(),
  collections: {
    ...content,
    screens
  }
};

await fs.writeFile(outPath, JSON.stringify(snapshot, null, 2), "utf8");
console.log(`✓ Wrote snapshot → ${config.outFile}`);