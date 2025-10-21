import { Timestamp, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, getDb } from '@/lib/firebaseClient';

export type UserProfileForm = {
  fullName: string;
  gender?: 'male' | 'female' | 'other' | null;
  caste?: string | null;
  phc?: boolean;
  exService?: boolean;
  state?: string | null;
  district?: string | null;
  stateZone?: string | null;
  centralZone?: string | null;
  dob?: Date | null;
  age?: number | null;
};

export async function saveUserProfile(form: UserProfileForm) {
  const auth = await getAuth();
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  const db = await getDb();

  await setDoc(
    doc(db, 'users', uid),
    {
      uid,
      fullName: form.fullName,
      fullNameLc: form.fullName.trim().toLowerCase(),
      gender: form.gender ?? null,
      caste: form.caste ?? null,
      phc: !!form.phc,
      exService: !!form.exService,
      state: form.state ?? null,
      district: form.district ?? null,
      stateZone: form.stateZone ?? null,
      centralZone: form.centralZone ?? null,
      dob: form.dob ? Timestamp.fromDate(form.dob) : null,
      age: typeof form.age === 'number' ? form.age : null,
      onboarded: true,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}
