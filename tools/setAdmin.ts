// tools/setAdmin.ts  (run inside functions or admin machine)
import admin from "firebase-admin";
admin.initializeApp({
  credential: admin.credential.applicationDefault(), // or cert(serviceAccount)
});

async function setAdmin(uid: string, isAdmin = true){
  await admin.auth().setCustomUserClaims(uid, { admin: isAdmin });
  console.log(`Set admin=${isAdmin} for ${uid}`);
}

setAdmin(process.argv[2]).catch(e=>console.error(e));