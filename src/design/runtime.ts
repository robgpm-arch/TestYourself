import { getDoc, doc } from "firebase/firestore";
import { getDownloadURL, ref, getStorage } from "firebase/storage";
import app from "../config/firebase";

const db = (await import("../config/firebase")).db;

export async function loadTheme(themeId: string) {
  const snap = await getDoc(doc(db, "themes", themeId));
  if (!snap.exists()) throw new Error("Theme not found");
  return snap.data() as any;
}

export async function applyThemeToRoot(themeId: string, el: HTMLElement) {
  const t = await loadTheme(themeId);
  const set = (k: string, v: string) => el.style.setProperty(`--${k}`, v);

  Object.entries(t.tokens).forEach(([k, v]) => set(k as string, v as string));

  const bgPath = t.images?.background;
  if (bgPath) {
    const url = await getDownloadURL(ref(getStorage(app), bgPath));
    el.style.background = `${t.tokens["gradient"] || "none"}${t.tokens["gradient"] ? "," : ""} url("${url}")`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
  } else {
    el.style.background = t.tokens["gradient"] || t.tokens["bg"] || "#fff";
  }
}