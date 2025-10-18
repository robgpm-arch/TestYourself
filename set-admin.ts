import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';

const projectId = "testyourself-80a10";          // <-- your project

// Prefer GOOGLE_APPLICATION_CREDENTIALS, otherwise load local key:
let app;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  app = initializeApp({ credential: applicationDefault(), projectId });
} else {
  const key = JSON.parse(fs.readFileSync("./service-account.json", "utf8"));
  app = initializeApp({ credential: cert(key), projectId });
}

async function run() {
  const email = 'robgpm@gmail.com';        // <-- put your account email here
  const user  = await getAuth().getUserByEmail(email);
  await getAuth().setCustomUserClaims(user.uid, { admin: true });
  console.log(`Admin claim set for ${email} (uid: ${user.uid})`);
}

run().catch(console.error);