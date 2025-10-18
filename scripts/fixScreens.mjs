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

async function fixScreens() {
  console.log('Fetching screens...');
  const snap = await db.collection('screens').get();

  if (snap.empty) {
    console.log('No screens found.');
    return;
  }

  console.log(`Found ${snap.size} screens. Updating...`);

  const batch = db.batch();
  snap.forEach(d => {
    batch.set(db.collection('screens').doc(d.id), {
      enabled: true,
      isVisible: true
    }, { merge: true });
  });

  await batch.commit();
  console.log(`✅ Updated ${snap.size} screens → enabled:true, isVisible:true`);
}

fixScreens().catch(console.error);