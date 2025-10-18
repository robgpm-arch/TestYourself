// scripts/upload-registry.mjs
// Upload registry JSON files to Firestore 'registries' collection
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import admin from 'firebase-admin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const REG_DIR = './registry';

// Initialize Firebase Admin SDK
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadRegistry() {
  const collections = [
    'mediums.json',
    'boards.json',
    'courses.json',
    'subjects.json',
    'chapters.json',
    'quiz_sets.json'
  ];

  console.log('Uploading registry to Firestore...');

  for (const filename of collections) {
    const filePath = join(REG_DIR, filename);
    const collectionName = filename.replace('.json', '');

    try {
      const content = await readFile(filePath, 'utf8');
      const items = JSON.parse(content);

      // Split large datasets into chunks to avoid Firestore 1MB limit
      if (collectionName === 'chapters' || collectionName === 'quiz_sets') {
        await uploadInChunks(collectionName, items);
      } else {
        await db.collection('registries').doc(collectionName).set({ items });
        console.log(`✅ Uploaded ${collectionName}: ${items.length} items`);
      }
    } catch (error) {
      console.error(`❌ Failed to upload ${collectionName}:`, error.message);
    }
  }

  console.log('Registry upload complete!');
}

async function uploadInChunks(collectionName, items) {
  const CHUNK_SIZE = 500; // Smaller chunks to stay well under 1MB limit
  const chunks = [];

  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    chunks.push(items.slice(i, i + CHUNK_SIZE));
  }

  console.log(`📦 Splitting ${collectionName} into ${chunks.length} chunks...`);

  // Upload metadata document
  await db.collection('registries').doc(collectionName).set({
    totalItems: items.length,
    chunks: chunks.length,
    chunkSize: CHUNK_SIZE
  });

  // Upload each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunkDocName = `${collectionName}_chunk_${i}`;
    await db.collection('registries').doc(chunkDocName).set({
      items: chunks[i],
      chunkIndex: i,
      totalChunks: chunks.length
    });
    console.log(`✅ Uploaded ${chunkDocName}: ${chunks[i].length} items`);
  }

  console.log(`✅ Completed ${collectionName}: ${items.length} items in ${chunks.length} chunks`);
}

uploadRegistry().catch(console.error);