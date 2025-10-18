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
exports.runSync = void 0;
const functions = __importStar(require("firebase-functions/v2/https"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
const bucket = admin.storage().bucket(); // uses default bucket
const SUPPORTED = new Set([
    "mediums", "boards", "exams", "courses", "subjects", "chapters", "screens", "themes", "leaderboard_configs"
]);
exports.runSync = functions.onCall(async (req) => {
    var _a;
    const claims = ((_a = req.auth) === null || _a === void 0 ? void 0 : _a.token) || {};
    if (!claims.admin)
        throw new functions.HttpsError("permission-denied", "Admin only");
    const { collections = [] } = req.data || {};
    const result = {};
    for (const col of collections) {
        if (!SUPPORTED.has(col))
            continue;
        const file = bucket.file(`registries/${col}.json`);
        const [buf] = await file.download();
        const items = JSON.parse(buf.toString());
        const batch = db.batch();
        items.forEach((doc) => {
            const ref = db.collection(col).doc(doc.id);
            batch.set(ref, { ...doc, updatedAt: Date.now() }, { merge: true });
        });
        await batch.commit();
        result[col] = items.length;
    }
    return { ok: true, indexed: result };
});
//# sourceMappingURL=runSync.js.map