import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
interface Claims {
  admin?: boolean;
  [key: string]: any;
}

admin.initializeApp();
const db = admin.firestore();
const bucket = admin.storage().bucket(); // uses default bucket

const SUPPORTED = new Set([
  "mediums","boards","exams","courses","subjects","chapters","screens","themes","leaderboard_configs"
]);

export const runSync = functions.onCall(async (req) => {
  const claims: Claims = req.auth?.token || {};
  if (!claims.admin) throw new functions.HttpsError("permission-denied", "Admin only");
  const { collections = [] } = req.data || {};
  const result: Record<string, number> = {};

  for (const col of collections) {
    if (!SUPPORTED.has(col)) continue;
    const file = bucket.file(`registries/${col}.json`);
    const [buf] = await file.download();
    const items = JSON.parse(buf.toString()) as Array<any>;

    const batch = db.batch();
    items.forEach((doc: any) => {
      const ref = db.collection(col).doc(doc.id);
      batch.set(ref, { ...doc, updatedAt: Date.now() }, { merge: true });
    });
    await batch.commit();
    result[col] = items.length;
  }
  return { ok: true, indexed: result };
});