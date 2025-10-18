// Run with:  npx ts-node tools/import-mcqs.ts path/to/mcqs.json
import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue, WriteBatch } from "firebase-admin/firestore";

// 1) Use a service account JSON (Project Settings → Service accounts → Generate key)
initializeApp({ credential: cert("./service-account.json") });
const db = getFirestore();

type MCQ = {
  id: string; text: string; options: string[]; answerIndex: number;
  explanation?: string; difficulty?: "L1"|"L2"|"L3"; tags?: string[];
};
type SetDoc = {
  courseId: string; subjectId: string; chapterId: string;
  setId: string; title: string; paid?: boolean; order?: number;
  questions: MCQ[];
};

async function run(path: string) {
  const raw = JSON.parse(readFileSync(path, "utf8")) as SetDoc[];
  for (const s of raw) {
    const setRef = db.doc(`courses/${s.courseId}/subjects/${s.subjectId}/chapters/${s.chapterId}/sets/${s.setId}`);
    const meta = { title: s.title, paid: !!s.paid, order: s.order ?? 1, questionCount: s.questions.length, updatedAt: FieldValue.serverTimestamp() };
    await setRef.set(meta, { merge: true });

    // batch write questions (500 per batch)
    let batch: WriteBatch = db.batch(); let i = 0; let count = 0;
    for (const q of s.questions) {
      const qRef = setRef.collection("questions").doc(q.id);
      batch.set(qRef, q); i++; count++;
      if (i === 450) { await batch.commit(); batch = db.batch(); i = 0; }
    }
    if (i > 0) await batch.commit();
    console.log(`Imported ${count} questions → ${s.courseId}/${s.subjectId}/${s.chapterId}/${s.setId}`);
  }
}
run(process.argv[2]).catch(e=>{ console.error(e); process.exit(1); });