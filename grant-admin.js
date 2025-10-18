import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert('./service-account.json'),
  projectId: 'testyourself-80a10'
});

const email = "robgpm@gmail.com"; // the user who should be admin

async function main() {
  const user = (await admin.auth().getUserByEmail(email));
  await admin.auth().setCustomUserClaims(user.uid, { admin: true });
  console.log("✅ admin claim set for", email);
}
main().catch(console.error);