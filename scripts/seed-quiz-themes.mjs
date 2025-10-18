#!/usr/bin/env node
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import admin from "firebase-admin";
import path from "node:path";

const ROOT = process.cwd();
const serviceKeyPath = path.join(ROOT, "serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceKeyPath),
  });
}

const db = admin.firestore();

const SEED = [
  {
    id: "oceanLight",
    name: "Ocean Light",
    tokens: {
      "bg": "#F3F8FF",
      "gradient": "linear-gradient(135deg,#BEE3FF 0%,#D6E4FF 50%,#EEF2FF 100%)",
      "accent": "#2563eb",
      "text": "#0f172a",
      "muted": "#475569",
      "card.bg": "rgba(255,255,255,.85)",
      "card.radius": "20px",
      "card.shadow": "0 12px 32px rgba(15,23,42,.08)",
      "option.bg": "#ffffff",
      "option.border": "#e5e7eb",
      "correct": "#16a34a",
      "wrong": "#ef4444",
      "timer.track": "#c7d2fe",
      "timer.progress": "#4f46e5"
    },
    images: { "background": "assets/backgrounds/ocean-wave.jpg" }
  },
  {
    id: "midnightContrast",
    name: "Midnight Contrast",
    tokens: {
      "bg": "#0b1220",
      "gradient": "linear-gradient(135deg,#0b1220 0%,#111827 60%,#1f2937 100%)",
      "accent": "#60a5fa",
      "text": "#e5e7eb",
      "muted": "#9ca3af",
      "card.bg": "rgba(17,24,39,.8)",
      "card.radius": "18px",
      "card.shadow": "0 16px 36px rgba(0,0,0,.35)",
      "option.bg": "rgba(31,41,55,.7)",
      "option.border": "#374151",
      "correct": "#22c55e",
      "wrong": "#f87171",
      "timer.track": "#1f2937",
      "timer.progress": "#60a5fa"
    },
    images: {}
  }
];

export async function seedQuizThemes() {
  for (const t of SEED) {
    await db.collection("quiz_themes").doc(t.id).set({
      ...t,
      version: 1,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

  // Admin card
  await db.collection("screens").doc("admin").collection("components").doc("quiz-themes").set({
    type: "card",
    title: "Quiz Themes",
    subtitle: "Create, edit, preview, and assign quiz themes",
    icon: "Palette",
    href: "/admin/themes/quiz",
    group: "catalog",
    enabled: true,
    order: 6,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  // Global default
  await db.collection("app_settings").doc("ui").set({
    defaultQuizThemeId: "oceanLight",
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return true;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedQuizThemes().then(() => {
    console.log("Quiz themes seeded!");
    process.exit(0);
  }).catch(console.error);
}