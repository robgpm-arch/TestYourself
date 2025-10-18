#!/usr/bin/env node
import { db } from "../src/lib/firebase";
import { collection, getDocs, writeBatch, addDoc, query, where } from "firebase/firestore";

export async function migrateCoursesToCatalog() {
  const snap = await getDocs(collection(db, "courses"));
  const seen: Record<string, string> = {}; // name -> catalogId

  for (const d of snap.docs) {
    const c = d.data() as any;
    if (!c.catalogId) {
      if (!seen[c.name]) {
        const ref = await addDoc(collection(db, "course_catalog"), {
          name: c.name,
          slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          createdAt: new Date(),
          updatedAt: new Date()
        });
        seen[c.name] = ref.id;
      }
      const batch = writeBatch(db);
      batch.update(d.ref, { catalogId: seen[c.name] });
      await batch.commit();
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateCoursesToCatalog().catch(console.error);
}