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
exports.registrySync = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = (0, firestore_1.getFirestore)();
function assertAdmin(req) {
    var _a;
    if (!req.auth || ((_a = req.auth.token) === null || _a === void 0 ? void 0 : _a.admin) !== true) {
        throw new https_1.HttpsError("permission-denied", "Admins only.");
    }
}
async function readRegistryFromFirestore(collection) {
    const doc = await db.collection("registries").doc(collection).get();
    if (!doc.exists)
        return [];
    const data = doc.data();
    // Check if this collection uses chunked storage
    if ((data === null || data === void 0 ? void 0 : data.chunks) && (data === null || data === void 0 ? void 0 : data.chunks) > 1) {
        // Read from multiple chunk documents
        const allItems = [];
        for (let i = 0; i < data.chunks; i++) {
            const chunkDoc = await db.collection("registries").doc(`${collection}_chunk_${i}`).get();
            if (chunkDoc.exists) {
                const chunkData = chunkDoc.data();
                if (chunkData === null || chunkData === void 0 ? void 0 : chunkData.items) {
                    allItems.push(...chunkData.items);
                }
            }
        }
        return allItems;
    }
    else {
        // Single document storage
        return (data === null || data === void 0 ? void 0 : data.items) || [];
    }
}
async function upsert(col, docs) {
    if (!(docs === null || docs === void 0 ? void 0 : docs.length))
        return { upserted: 0 };
    const BATCH_SIZE = 400; // Firestore limit is 500, leaving some buffer
    let totalUpserted = 0;
    // Process documents in batches
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        const batch = db.batch();
        const batchDocs = docs.slice(i, i + BATCH_SIZE);
        for (const d of batchDocs) {
            if (!d.id)
                continue; // require id in registry docs
            batch.set(db.collection(col).doc(d.id), d, { merge: true });
        }
        await batch.commit();
        totalUpserted += batchDocs.length;
    }
    return { upserted: totalUpserted };
}
exports.registrySync = (0, https_1.onCall)({
    region: "us-central1",
    timeoutSeconds: 540,
    memory: "1GiB"
}, async (req) => {
    var _a, _b, _c;
    assertAdmin(req);
    const entities = ((_b = (_a = req.data) === null || _a === void 0 ? void 0 : _a.entities) !== null && _b !== void 0 ? _b : []);
    const dryRun = !!((_c = req.data) === null || _c === void 0 ? void 0 : _c.dryRun);
    if (!Array.isArray(entities) || entities.length === 0) {
        throw new https_1.HttpsError("invalid-argument", "Pass {entities: [...]}");
    }
    const results = {};
    for (const e of entities) {
        const items = await readRegistryFromFirestore(e);
        if (dryRun) {
            results[e] = { dryRun: true, count: items.length };
            continue;
        }
        results[e] = await upsert(e, items);
    }
    return { ok: true, results };
});
//# sourceMappingURL=registrySync.js.map