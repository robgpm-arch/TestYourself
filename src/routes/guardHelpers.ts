// src/routes/guardHelpers.ts
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export type UserGate = {
  signedIn: boolean;
  onboarded: boolean;
  isAdmin: boolean;
  courseChosen: boolean;
};

export async function getUserGate(): Promise<UserGate> {
  const user = getAuth().currentUser;
  if (!user) return { signedIn: false, onboarded: false, isAdmin: false, courseChosen: false };

  const token = await user.getIdTokenResult();
  const isAdmin = !!token.claims?.admin;

  const uref = doc(db, "users", user.uid);
  const snap = await getDoc(uref);
  const data = snap.exists() ? snap.data() as any : {};

  return {
    signedIn: true,
    onboarded: !!data.onboarded,
    isAdmin,
    courseChosen: !!data.courseChosen || !!data.selectedCourseId || false,
  };
}

/** Your app's pages that need a course picked */
export function routeNeedsCourse(pathname: string): boolean {
  const needs = ["/home", "/syllabus", "/chapters", "/sets", "/theme", "/quiz"];
  return needs.some(p => pathname.startsWith(p));
}