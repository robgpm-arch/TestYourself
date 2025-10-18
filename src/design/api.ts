import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import app from "../config/firebase";
import { ThemeDoc } from "./types";

export async function loadTheme(id: string): Promise<ThemeDoc> {
  const db = getFirestore(app);
  const snap = await getDoc(doc(db, "themes", id));
  if (!snap.exists()) throw new Error("Theme not found: " + id);
  return snap.data() as ThemeDoc;
}

export async function resolveImage(theme: ThemeDoc, logical: string | null): Promise<string | null> {
  if (!logical) return null;
  const path = theme.images[logical];
  if (!path) return null;
  const storage = getStorage(app);
  try {
    return await getDownloadURL(ref(storage, path));
  } catch (error) {
    console.warn("Failed to resolve image:", logical, error);
    return null;
  }
}

export async function uploadAsset(file: File, path: string): Promise<string> {
  const { getStorage, ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
  const storage = getStorage(app);
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}