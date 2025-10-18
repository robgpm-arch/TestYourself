import { collection, addDoc, doc, getDoc, setDoc, deleteDoc, onSnapshot, serverTimestamp, writeBatch, query, orderBy } from "firebase/firestore";
import app from "../../../config/firebase";

const db = (await import("../../../config/firebase")).db;

const COLL = "quiz_themes";

export function listenThemes(cb: (rows: any[]) => void) {
  return onSnapshot(query(collection(db, COLL), orderBy("name")), snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function createTheme(seed: any) {
  const ref = await addDoc(collection(db, COLL), { ...seed, updatedAt: serverTimestamp() });
  return ref.id;
}

export async function saveTheme(id: string, patch: any) {
  await setDoc(doc(db, COLL, id), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getTheme(id: string) {
  const snap = await getDoc(doc(db, COLL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function removeTheme(id: string) {
  await deleteDoc(doc(db, COLL, id));
}

export async function setGlobalDefault(themeId: string) {
  await setDoc(doc(db, "app_settings", "ui"), { defaultQuizThemeId: themeId, updatedAt: serverTimestamp() }, { merge: true });
}