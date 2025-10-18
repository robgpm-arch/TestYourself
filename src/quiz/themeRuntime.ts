import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import app from "../config/firebase";

const db = (await import("../config/firebase")).db;

type ThemeDoc = {
  tokens: Record<string, string>;
  images?: Record<string, string>;
};

async function getThemeDoc(themeId: string): Promise<ThemeDoc> {
  const snap = await getDoc(doc(db, "quiz_themes", themeId));
  if (!snap.exists()) throw new Error("Theme not found: " + themeId);
  return snap.data() as ThemeDoc;
}

async function resolveBackgroundUrl(theme: ThemeDoc) {
  const path = theme.images?.background;
  if (!path) return null;
  const url = await getDownloadURL(ref(getStorage(app), path));
  return url;
}

/** Cascade: set → chapter → subject → course → app_settings/ui.defaultQuizThemeId */
export async function resolveQuizThemeId(
  ids: { setId?: string; chapterId?: string; subjectId?: string; courseId?: string; }
) {
  const tryGet = async (col: string, id?: string) => {
    if (!id) return null;
    const snap = await getDoc(doc(db, col, id));
    return snap.exists() ? (snap.data() as any).quizThemeId || null : null;
  };

  return (
    (await tryGet("quiz_sets", ids.setId)) ||
    (await tryGet("chapters", ids.chapterId)) ||
    (await tryGet("subjects", ids.subjectId)) ||
    (await tryGet("courses", ids.courseId)) ||
    ((await getDoc(doc(db, "app_settings", "ui"))).data()?.defaultQuizThemeId) ||
    "oceanLight"
  );
}

/** Apply tokens as CSS variables to a container (e.g., #quiz-root) */
export async function applyQuizTheme(
  container: HTMLElement,
  themeId: string
) {
  const t = await getThemeDoc(themeId);
  const bgUrl = await resolveBackgroundUrl(t);
  const set = (k: string, v: string) => container.style.setProperty(`--${k}`, v);

  Object.entries(t.tokens).forEach(([k, v]) => set(k, v));
  if (bgUrl) set("bg-image", `url("${bgUrl}")`);
  // Compose background with gradient if you like
  const gradient = t.tokens["gradient"] || "none";
  set("bg-composed", `${gradient}${bgUrl ? (gradient !== "none" ? "," : "") + ` var(--bg-image)` : ""}`);
}