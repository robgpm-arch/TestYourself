import { collection, doc, setDoc } from 'firebase/firestore';
import { getDb } from '../lib/firebaseClient';

export async function seedDemo() {
  const db = await getDb();
  await setDoc(doc(collection(db, 'courses'), 'math'), {
    name: 'Mathematics',
    order: 1,
    tagline: 'Numbers, Algebra, Geometry',
  });
}
