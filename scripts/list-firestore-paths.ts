import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

(async () => {
  const top = await db.listCollections();
  for (const c of top) {
    console.log("COLLECTION /" + c.id);
    if (c.id === "screens") {
      const docs = await c.listDocuments();
      for (const d of docs) {
        console.log("  DOC /screens/" + d.id);
        const subs = await d.listCollections();
        for (const sc of subs) {
          console.log("    SUBCOL /screens/" + d.id + "/" + sc.id);
          if (sc.id === "components") {
            const compDocs = await sc.listDocuments();
            for (const cd of compDocs) {
              console.log("      COMP /screens/" + d.id + "/components/" + cd.id);
            }
          }
        }
      }
    }
  }
})();