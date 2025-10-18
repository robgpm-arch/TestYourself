// src/services/adminCatalogService.ts
import {
  collection, doc, getDoc, getDocs, query, where,
  addDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot, orderBy
} from "firebase/firestore";
import { db } from "../lib/firebase";

export type CatalogEntity = {
  id: string;
  name: string;
  order?: number;
  isVisible?: boolean;
  createdAt?: any;
  updatedAt?: any;
};

export default class AdminCatalogService {
  static async createItem(collectionName: string, data: any, userId?: string) {
    const payload = {
      ...data,
      createdBy: userId,
      updatedBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, collectionName), payload);
    return ref.id;
  }

  static async updateItem(collectionName: string, id: string, data: any, userId?: string) {
    await updateDoc(doc(db, collectionName, id), {
      ...data,
      updatedBy: userId,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteItem(collectionName: string, id: string) {
    await deleteDoc(doc(db, collectionName, id));
  }

  static async duplicateItem(collectionName: string, item: CatalogEntity, userId?: string) {
    const { id, ...data } = item;
    const payload = {
      ...data,
      name: `${data.name} (Copy)`,
      createdBy: userId,
      updatedBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, collectionName), payload);
    return ref.id;
  }

  static async toggleVisibility(collectionName: string, id: string, isVisible: boolean) {
    await updateDoc(doc(db, collectionName, id), {
      isVisible,
      updatedAt: serverTimestamp(),
    });
  }

  static subscribeToCollection<T extends CatalogEntity>(
    collectionName: string,
    callback: (items: T[]) => void
  ) {
    const q = query(collection(db, collectionName), orderBy('order', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      callback(items);
    });
  }
}

// Subject-specific functions
export type SubjectInput = {
  name: string;
  courseId: string;
  mediumId: string;
  boardId?: string | null;
  examId?: string | null;
  order?: number;
  enabled?: boolean;
};

const SUBJECTS_COLL = "subjects";

export async function createSubject(input: SubjectInput) {
  const payload = {
    ...input,
    enabled: input.enabled ?? true,
    order: input.order ?? 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  // Use deterministic id if you prefer: const ref = doc(db, SUBJECTS_COLL, slug)
  const ref = doc(collection(db, SUBJECTS_COLL));
  await setDoc(ref, payload);
  return { id: ref.id, ...payload };
}

export async function updateSubject(id: string, patch: Partial<SubjectInput>) {
  await updateDoc(doc(db, SUBJECTS_COLL, id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSubject(id: string) {
  await deleteDoc(doc(db, SUBJECTS_COLL, id));
}

export async function duplicateSubject(id: string) {
  const snap = await getDoc(doc(db, SUBJECTS_COLL, id));
  if (!snap.exists()) throw new Error("Subject not found");
  const src = snap.data();
  const copy = {
    ...src,
    name: `${src.name} (Copy)`,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, SUBJECTS_COLL), copy);
  return ref.id;
}

export async function toggleSubjectEnabled(id: string, enabled: boolean) {
  await updateDoc(doc(db, SUBJECTS_COLL, id), { enabled, updatedAt: serverTimestamp() });
}
