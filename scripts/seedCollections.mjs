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

const seeds = {
  mediums: [{ id:"english", name:"English", slug:"english", enabled:true, order:1 }],
  boards:  [{ id:"cbse",    name:"CBSE",    slug:"cbse",    enabled:true, order:1 }],
  exams:   [{ id:"ssc",     name:"SSC",     slug:"ssc",     enabled:true, order:1 }],
  courses: [{ id:"class-10",name:"Class 10",slug:"class-10",enabled:true, order:1, boardId:"cbse" }],
  subjects:[{ id:"algebra", name:"Algebra", slug:"algebra", enabled:true, order:1, boardId:"cbse" }],
  chapters:[{ id:"algebra-fundamentals", name:"Algebra Fundamentals", slug:"algebra-fundamentals", enabled:true, order:1, subjectId:"algebra" }],
  screens: [{ id:"home", name:"Home", slug:"home", enabled:true, order:1 }],
  themes:  [{ id:"oceanLight", name:"Ocean Light", slug:"ocean-light", enabled:true, order:1 }]
};

async function seedCollections() {
  console.log('🌱 Seeding collections...\n');

  for (const [col, list] of Object.entries(seeds)) {
    console.log(`→ Seeding ${col}...`);
    const batch = db.batch();
    list.forEach(d => {
      batch.set(db.collection(col).doc(d.id), { ...d, isVisible: true }, { merge: true });
    });
    await batch.commit();
    console.log(`  ✅ Seeded ${col}: ${list.length} docs`);
  }

  console.log('\n🎉 All collections seeded! Refresh your admin dashboard.');
}

seedCollections().catch(console.error);