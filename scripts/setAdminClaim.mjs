import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";

const projectId = "testyourself-80a10";          // <-- your project
const uid = "y5maADNY4BbK7Y3KW90sHuWOyT32";     // <-- admin user UID

// Prefer GOOGLE_APPLICATION_CREDENTIALS, otherwise load local key:
let app;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  app = initializeApp({ credential: applicationDefault(), projectId });
} else {
  const key = JSON.parse(fs.readFileSync("./service-account.json", "utf8"));
  app = initializeApp({ credential: cert(key), projectId });
}

await getAuth().setCustomUserClaims(uid, { admin: true });
console.log(`✅ Set admin=true for UID ${uid}`);
process.exit(0);