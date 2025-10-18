"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindDevice = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
/**
 * Callable: bindDevice({ deviceId, force? })
 * Behavior:
 *  - If already bound to a different device and !force => throw ACTIVE_ON_ANOTHER_DEVICE
 *  - Otherwise, set users/{uid}.session.current and custom claim deviceId, then revoke others
 */
exports.bindDevice = (0, https_1.onCall)(async (request) => {
    var _a, _b;
    const uid = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!uid)
        throw new https_1.HttpsError('unauthenticated', 'Login required');
    const { deviceId, force } = request.data || {};
    if (!deviceId || typeof deviceId !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'deviceId required');
    }
    const sessRef = db.doc(`users/${uid}/session/current`);
    const snap = await sessRef.get();
    const existing = snap.exists ? (_b = snap.data()) === null || _b === void 0 ? void 0 : _b.deviceId : null;
    if (existing && existing !== deviceId && !force) {
        // Already in use elsewhere – block unless the user confirms "Move to this device"
        throw new https_1.HttpsError('failed-precondition', 'ACTIVE_ON_ANOTHER_DEVICE');
    }
    await sessRef.set({
        deviceId,
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
        userAgent: request.rawRequest.get('user-agent') || null,
        ip: request.rawRequest.ip || null,
    }, { merge: true });
    // Set custom claim and force all tokens to refresh
    const admin = await Promise.resolve().then(() => __importStar(require('firebase-admin')));
    await admin.auth().setCustomUserClaims(uid, { deviceId });
    await admin.auth().revokeRefreshTokens(uid);
    return { ok: true };
});
//# sourceMappingURL=bindDevice.js.map