import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = getFirestore();

type Entity =
  | "mediums" | "boards" | "exams"
  | "courses" | "subjects" | "chapters" | "quiz_sets" | "themes";

function assertAdmin(req: CallableRequest) {
  if (!req.auth || req.auth.token?.admin !== true) {
    throw new HttpsError("permission-denied", "Admins only.");
  }
}

async function readRegistryFromFirestore(collection: string): Promise<any[]> {
  const doc = await db.collection("registries").doc(collection).get();
  if (!doc.exists) return [];

  const data = doc.data();

  // Check if this collection uses chunked storage
  if (data?.chunks && data?.chunks > 1) {
    // Read from multiple chunk documents
    const allItems: any[] = [];
    for (let i = 0; i < data.chunks; i++) {
      const chunkDoc = await db.collection("registries").doc(`${collection}_chunk_${i}`).get();
      if (chunkDoc.exists) {
        const chunkData = chunkDoc.data();
        if (chunkData?.items) {
          allItems.push(...chunkData.items);
        }
      }
    }
    return allItems;
  } else {
    // Single document storage
    return data?.items || [];
  }
}

async function upsert(col: string, docs: any[]) {
  if (!docs?.length) return { upserted: 0 };

  const BATCH_SIZE = 400; // Firestore limit is 500, leaving some buffer
  let totalUpserted = 0;

  // Process documents in batches
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const batchDocs = docs.slice(i, i + BATCH_SIZE);

    for (const d of batchDocs) {
      if (!d.id) continue; // require id in registry docs
      batch.set(db.collection(col).doc(d.id), d, { merge: true });
    }

    await batch.commit();
    totalUpserted += batchDocs.length;
  }

  return { upserted: totalUpserted };
}

export const registrySync = onCall({
  region: "us-central1",
  timeoutSeconds: 540,
  memory: "1GiB"
}, async (req) => {
  assertAdmin(req);

  const entities = (req.data?.entities ?? []) as Entity[];
  const dryRun = !!req.data?.dryRun;

  if (!Array.isArray(entities) || entities.length === 0) {
    throw new HttpsError("invalid-argument", "Pass {entities: [...]}");
  }

  const results: Record<string, any> = {};
  for (const e of entities) {
    const items = await readRegistryFromFirestore(e);
    if (dryRun) {
      results[e] = { dryRun: true, count: items.length };
      continue;
    }
    results[e] = await upsert(e, items);
  }

  return { ok: true, results };
});