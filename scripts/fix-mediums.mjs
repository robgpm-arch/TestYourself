import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
const serviceAccount = JSON.parse(fs.readFileSync("../serviceAccountKey.json", "utf8"));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function fixMediums() {
  const snap = await db.collection("mediums").get();
  for (const doc of snap.docs) {
    const data = doc.data();
    const patch = {};
    if (data.name && !data.title) patch.title = data.name;
    if ("isVisible" in data && !("active" in data)) patch.active = !!data.isVisible;

    if (Object.keys(patch).length) {
      await doc.ref.update(patch);
      console.log("✔ Updated", doc.id, "→", patch);
    }
  }
  console.log("✅ Finished");
}

fixMediums();