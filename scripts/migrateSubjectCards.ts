#!/usr/bin/env node
import { getFirestore, getDocs, collection, writeBatch, doc } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Firebase config (same as your app)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ1234567",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "testyourself-dev.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "testyourself-dev",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "testyourself-dev.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456789012",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function defaultSubjectCards() {
  console.log("Applying default card styles to existing subjects...");

  const snap = await getDocs(collection(db, "subjects"));
  const batch = writeBatch(db);
  let count = 0;

  snap.forEach(d => {
    const s = d.data() as any;
    if (!s.cardKind || !s.cardSize) {
      batch.update(doc(db, "subjects", d.id), {
        cardKind: "grid",
        cardSize: "large"
      });
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`✅ Applied defaults to ${count} subjects`);
  } else {
    console.log("ℹ️  All subjects already have card styles");
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  defaultSubjectCards().catch(console.error);
}