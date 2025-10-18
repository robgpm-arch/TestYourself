import admin from 'firebase-admin';
import fs from 'fs';

const projectId = "testyourself-80a10";

// Initialize Firebase Admin
const key = JSON.parse(fs.readFileSync("./service-account.json", "utf8"));
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(key),
    projectId
  });
}
const db = admin.firestore();

const collections = ["screens", "mediums", "boards", "exams", "courses", "subjects", "chapters", "quiz_sets", "themes"];

async function fixCollection(colName) {
  console.log(`\n→ Fixing ${colName}...`);
  const snap = await db.collection(colName).get();

  if (snap.empty) {
    console.log(`  No documents in ${colName}`);
    return 0;
  }

  const batch = db.batch();
  snap.forEach(d => {
    batch.set(db.collection(colName).doc(d.id), {
      enabled: true,
      isVisible: true
    }, { merge: true });
  });

  await batch.commit();
  console.log(`  ✅ Updated ${snap.size} docs in ${colName} → enabled:true, isVisible:true`);
  return snap.size;
}

async function fixAllCollections() {
  console.log('🔧 Batch-fixing all dashboard collections...\n');

  let totalUpdated = 0;
  for (const col of collections) {
    const count = await fixCollection(col);
    totalUpdated += count;
  }

  console.log(`\n🎉 Done! Updated ${totalUpdated} documents across ${collections.length} collections.`);
  console.log('Refresh your admin dashboard to see the updated counts.');
}

fixAllCollections().catch(console.error);