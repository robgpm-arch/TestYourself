// tools/set-admin.ts
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import * as fs from "fs";

const key = JSON.parse(fs.readFileSync("./service-account.json", "utf8"));
initializeApp({ credential: cert(key) });

async function run() {
  const uid = process.argv[2]; // pass UID as arg
  if (!uid) throw new Error("Usage: ts-node tools/set-admin.ts <UID>");
  await getAuth().setCustomUserClaims(uid, { admin: true });
  console.log(`✅ set admin=true for ${uid}`);
}
run().catch((e) => { console.error(e); process.exit(1); });