import * as admin from 'firebase-admin';
admin.initializeApp();

export async function backfillUsersPublic() {
  const db = admin.firestore();
  const users = await db.collection('users').get();
  const batch = db.batch();
  users.forEach(doc => {
    const d = doc.data();
    batch.set(db.doc(`users_public/${doc.id}`), {
      uid: doc.id,
      displayName: d.fullName || 'User',
      avatar: d.photoURL || null,
      state: d.state || null,
      district: d.district || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  });
  await batch.commit();
}