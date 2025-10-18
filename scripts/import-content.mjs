import { readFile } from "node:fs/promises";
import { join, basename } from "node:path";
import fg from "fast-glob";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

/**
 * 1) Put your Firebase service account key at ./serviceAccountKey.json
 *    (Console → Project settings → Service accounts → Generate new private key)
 * 2) Adjust source and collections as needed.
 */
const args = process.argv.slice(2);
let source = "./content";
let collections = ["mediums", "boards", "exams", "courses", "subjects", "chapters", "screens", "themes", "leaderboard_configs"];
let project = "testyourself-80a10";

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--source') {
    source = args[i + 1];
    i++;
  } else if (args[i] === '--collections') {
    collections = args[i + 1].split(',');
    i++;
  } else if (args[i] === '--project') {
    project = args[i + 1];
    i++;
  }
}

initializeApp({ credential: cert("./serviceAccountKey.json"), projectId: project });
const db = getFirestore();

const now = () => FieldValue.serverTimestamp();

async function upsertDoc(path, data) {
  const ref = db.doc(path);
  await ref.set(
    { ...data, createdAt: now(), updatedAt: now() },
    { merge: true }
  );
  console.log("✔", path);
}

async function importCollections() {
  for (const col of collections) {
    try {
      const p = join(source, `${col}.json`);
      const raw = await readFile(p, "utf8");
      const list = JSON.parse(raw);
      for (const item of list) {
        if (!item.id) continue;
        await upsertDoc(`${col}/${item.id}`, item);
      }
    } catch (e) {
      console.warn(`Import ${col} skipped:`, e.message);
    }
  }
}

(async () => {
  console.log("Seeding from:", source);
  await importCollections();
  console.log("✅ Import complete.");
  process.exit(0);
})();