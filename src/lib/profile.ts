import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export async function ensureProfile() {
  const u = auth.currentUser;
  if (!u) return;
  await setDoc(
    doc(db, `users/${u.uid}/profile`, 'info'),
    {
      displayName: u.displayName ?? 'Anonymous',
      photoURL: u.photoURL ?? null,
      phoneVerified: !!u.phoneNumber,
      updatedAt: new Date(),
    },
    { merge: true }
  );
}
