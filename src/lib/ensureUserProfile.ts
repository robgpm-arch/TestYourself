// src/lib/ensureUserProfile.ts
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export async function ensureUserProfile() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('No signed-in user');

  const db = getFirestore();
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      displayName: user.displayName ?? null,
      email: user.email ?? null,
      phoneNumber: user.phoneNumber ?? null,
      photoURL: user.photoURL ?? null,

      // onboarding selections (filled later)
      mediumId: null,
      boardId: null,
      examId: null,
      classCourseId: null,
      subjectIds: [],

      onboardingCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}
