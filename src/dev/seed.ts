import { db } from "../lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";

export async function seedDemo() {
  await setDoc(doc(collection(db, "courses"), "math"), {
    name: "Mathematics", order: 1, tagline: "Numbers, Algebra, Geometry"
  });
}