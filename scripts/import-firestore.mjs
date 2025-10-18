#!/usr/bin/env node
import fs from "node:fs/promises";
import admin from "firebase-admin";
import path from "node:path";
import config from "./project-sync.config.mjs";

const ROOT = process.cwd();
const args = new Set(process.argv.slice(2)); // --dry --delete
const DRY = args.has("--dry");
const DELETE = args.has("--delete"); // optional: remove docs not present in snapshot

const serviceKeyPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(ROOT, "serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceKeyPath),
  });
}
const db = admin.firestore();

const out = JSON.parse(await fs.readFile(path.join(ROOT, config.outFile), "utf8"));
const colNames = config.collections;

function norm(doc) {
  const now = admin.firestore.FieldValue.serverTimestamp();
  // align common fields
  const active = (doc.active ?? doc.isVisible ?? true) === true;
  return {
    ...doc,
    active,
    isVisible: active,
    order: doc.order ?? config.defaults.order,
    updatedAt: now,
    createdAt: doc.createdAt ?? now
  };
}

async function upsertCollection(label, docs, colName) {
  console.log(`\n→ ${label}  (${docs.length}) → ${colName}`);
  if (docs.length === 0) return;

  const batchSize = 400;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = db.batch();
    for (const item of docs.slice(i, i + batchSize)) {
      const id = item.id || item.code || item.name;
      if (!id) { console.warn("  ! Skipping doc with no id/name:", item); continue; }
      const ref = db.collection(colName).doc(id);
      const payload = norm(item);
      if (DRY) {
        console.log("  (dry) set", colName, id);
      } else {
        batch.set(ref, payload, { merge: true });
      }
    }
    if (!DRY) await batch.commit();
  }

  if (DELETE) {
    // delete any remote docs not present locally (careful!)
    const snap = await db.collection(colName).get();
    const keep = new Set(docs.map(d => d.id || d.code || d.name));
    const toDelete = snap.docs.filter(d => !keep.has(d.id));
    if (toDelete.length) console.log(`  Deleting ${toDelete.length} stale docs…`);
    for (let i = 0; i < toDelete.length; i += 400) {
      const batch = db.batch();
      toDelete.slice(i, i + 400).forEach(d => batch.delete(d.ref));
      if (!DRY) await batch.commit();
    }
  }
}

const c = out.collections || {};
await upsertCollection("Mediums", c.mediums || [], colNames.mediums);
await upsertCollection("Boards", c.boards || [], colNames.boards);
await upsertCollection("Courses", c.courses || [], colNames.courses);
await upsertCollection("Subjects", c.subjects || [], colNames.subjects);
await upsertCollection("Chapters", c.chapters || [], colNames.chapters);
await upsertCollection("Quiz Sets", c.quiz_sets || [], colNames.quiz_sets);
await upsertCollection("Exams", c.exams || [], colNames.exams);
await upsertCollection("Screens", c.screens || [], colNames.screens);
await upsertCollection("Themes", c.themes || [], colNames.themes);

console.log(`\n✓ Import complete${DRY ? " (dry-run)" : ""}`);