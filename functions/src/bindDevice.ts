import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

/**
 * Callable: bindDevice({ deviceId, force? })
 * Behavior:
 *  - If already bound to a different device and !force => throw ACTIVE_ON_ANOTHER_DEVICE
 *  - Otherwise, set users/{uid}.session.current and custom claim deviceId, then revoke others
 */
export const bindDevice = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Login required');

  const { deviceId, force } = request.data || {};
  if (!deviceId || typeof deviceId !== 'string') {
    throw new HttpsError('invalid-argument', 'deviceId required');
  }

  const sessRef = db.doc(`users/${uid}/session/current`);
  const snap = await sessRef.get();
  const existing = snap.exists ? snap.data()?.deviceId : null;

  if (existing && existing !== deviceId && !force) {
    // Already in use elsewhere – block unless the user confirms "Move to this device"
    throw new HttpsError('failed-precondition', 'ACTIVE_ON_ANOTHER_DEVICE');
  }

  await sessRef.set({
    deviceId,
    updatedAt: FieldValue.serverTimestamp(),
    userAgent: request.rawRequest.get('user-agent') || null,
    ip: request.rawRequest.ip || null,
  }, { merge: true });

  // Set custom claim and force all tokens to refresh
  const admin = await import('firebase-admin');
  await admin.auth().setCustomUserClaims(uid, { deviceId });
  await admin.auth().revokeRefreshTokens(uid);

  return { ok: true };
});