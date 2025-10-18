import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import app from '../../config/firebase';

const db = (await import('../../config/firebase')).db;

export function listenThemes(cb: (rows: any[], count: number) => void) {
  const q = query(collection(db, 'themes'), orderBy('name'));
  return onSnapshot(q, snap => {
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    cb(rows, rows.length);
  });
}

export async function saveTheme(id: string, patch: any) {
  await setDoc(doc(db, 'themes', id), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
}
