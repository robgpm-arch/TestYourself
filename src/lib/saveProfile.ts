import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

/**
 * Writes/merges the signed-in user's profile at /users/{uid}.
 * Safely refreshes the ID token right after OTP/linking to avoid races.
 */
export async function saveUserProfile(profile: Record<string, any>) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');

  try {
    await user.getIdToken(true);
  } catch {
    try {
      await user.reload();
      await new Promise(r => setTimeout(r, 250));
      await user.getIdToken(true);
    } catch {}
  }

  const uid = user.uid;
  await setDoc(
    doc(db, 'users', uid),
    {
      ...profile,
      phone: user.phoneNumber ?? null,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(), // harmless on merge
    },
    { merge: true }
  );
}

