import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import app from '../../config/firebase';

const db = (await import('../../config/firebase')).db;

const THEMES = [
  {
    id: 'oceanLight',
    name: 'Ocean Light',
    tokens: {
      bg: '#F3F8FF',
      gradient: 'linear-gradient(135deg,#BEE3FF 0%,#D6E4FF 50%,#EEF2FF 100%)',
      text: '#0f172a',
      muted: '#475569',
      accent: '#2563eb',
      'card.bg': 'rgba(255,255,255,.85)',
      'card.radius': '20px',
      'card.shadow': '0 12px 32px rgba(15,23,42,.08)',
      'chip.bg': 'rgba(255,255,255,.6)',
      'chip.border': '#e5e7eb',
      'cta.bg': '#2563eb',
      'cta.text': '#ffffff',
    },
    gradients: {
      panel: 'linear-gradient(180deg,rgba(255,255,255,.9) 0%,rgba(255,255,255,.7) 100%)',
    },
    images: { background: 'assets/backgrounds/ocean-wave.jpg', dots: 'assets/overlays/dots.png' },
  },
  {
    id: 'midnightContrast',
    name: 'Midnight Contrast',
    tokens: {
      bg: '#0b1220',
      gradient: 'linear-gradient(135deg,#0b1220 0%,#111827 60%,#1f2937 100%)',
      text: '#e5e7eb',
      muted: '#9ca3af',
      accent: '#60a5fa',
      'card.bg': 'rgba(17,24,39,.82)',
      'card.radius': '18px',
      'card.shadow': '0 16px 36px rgba(0,0,0,.35)',
      'chip.bg': 'rgba(31,41,55,.7)',
      'chip.border': '#374151',
      'cta.bg': '#60a5fa',
      'cta.text': '#0b1220',
    },
    gradients: { panel: 'linear-gradient(180deg,rgba(31,41,55,.9) 0%,rgba(31,41,55,.6) 100%)' },
    images: {},
  },
  {
    id: 'pastelAurora',
    name: 'Pastel Aurora',
    tokens: {
      bg: '#fff8fb',
      gradient: 'linear-gradient(135deg,#ffe1f0 0%,#e7f0ff 50%,#e7fff8 100%)',
      text: '#1f2937',
      muted: '#6b7280',
      accent: '#8b5cf6',
      'card.bg': 'rgba(255,255,255,.9)',
      'card.radius': '22px',
      'card.shadow': '0 10px 30px rgba(139,92,246,.18)',
      'chip.bg': 'rgba(139,92,246,.12)',
      'chip.border': 'rgba(139,92,246,.25)',
      'cta.bg': '#8b5cf6',
      'cta.text': '#ffffff',
    },
    gradients: {
      panel: 'linear-gradient(180deg,rgba(255,255,255,.95) 0%,rgba(255,255,255,.75) 100%)',
    },
    images: { background: 'assets/backgrounds/soft-aurora.jpg' },
  },
  {
    id: 'sunsetGlass',
    name: 'Sunset Glass',
    tokens: {
      bg: '#fff7f3',
      gradient: 'linear-gradient(135deg,#ffd1a1 0%,#ffc1c1 50%,#ffd9e8 100%)',
      text: '#111827',
      muted: '#6b7280',
      accent: '#f97316',
      'card.bg': 'rgba(255,255,255,.7)',
      'card.radius': '20px',
      'card.shadow': '0 16px 40px rgba(249,115,22,.2)',
      'chip.bg': 'rgba(249,115,22,.08)',
      'chip.border': 'rgba(249,115,22,.25)',
      'cta.bg': '#f97316',
      'cta.text': '#ffffff',
    },
    gradients: {
      panel: 'linear-gradient(180deg,rgba(255,255,255,.85) 0%,rgba(255,255,255,.6) 100%)',
    },
    images: { background: 'assets/backgrounds/sunset-haze.jpg' },
  },
  {
    id: 'emeraldMinimal',
    name: 'Emerald Minimal',
    tokens: {
      bg: '#f4fff8',
      gradient: 'linear-gradient(135deg,#d9ffe8 0%,#e9fff3 50%,#f6fffb 100%)',
      text: '#052e16',
      muted: '#166534',
      accent: '#10b981',
      'card.bg': '#ffffff',
      'card.radius': '18px',
      'card.shadow': '0 12px 28px rgba(16,185,129,.14)',
      'chip.bg': 'rgba(16,185,129,.1)',
      'chip.border': 'rgba(16,185,129,.25)',
      'cta.bg': '#10b981',
      'cta.text': '#ffffff',
    },
    gradients: {
      panel: 'linear-gradient(180deg,rgba(255,255,255,1) 0%,rgba(255,255,255,.8) 100%)',
    },
    images: {},
  },
  {
    id: 'paperMono',
    name: 'Paper Mono',
    tokens: {
      bg: '#f7f7f5',
      gradient: 'none',
      text: '#1f2937',
      muted: '#6b7280',
      accent: '#111827',
      'card.bg': '#ffffff',
      'card.radius': '14px',
      'card.shadow': '0 8px 24px rgba(0,0,0,.06)',
      'chip.bg': '#f3f4f6',
      'chip.border': '#e5e7eb',
      'cta.bg': '#111827',
      'cta.text': '#ffffff',
    },
    gradients: { panel: 'none' },
    images: { background: 'assets/backgrounds/paper-fiber.jpg' },
  },
  {
    id: 'neonGrid',
    name: 'Neon Grid',
    tokens: {
      bg: '#0a0a0a',
      gradient:
        'radial-gradient(500px 300px at 10% 10%, rgba(0,255,200,.2) 0%, transparent 60%), radial-gradient(500px 300px at 90% 90%, rgba(255,0,255,.2) 0%, transparent 60%)',
      text: '#e5e7eb',
      muted: '#a3a3a3',
      accent: '#22d3ee',
      'card.bg': 'rgba(10,10,10,.85)',
      'card.radius': '16px',
      'card.shadow': '0 12px 30px rgba(0,0,0,.6)',
      'chip.bg': 'rgba(34,211,238,.12)',
      'chip.border': 'rgba(34,211,238,.3)',
      'cta.bg': '#22d3ee',
      'cta.text': '#0a0a0a',
    },
    gradients: { panel: 'none' },
    images: { background: 'assets/overlays/grid-dark.png' },
  },
  {
    id: 'warmSand',
    name: 'Warm Sand',
    tokens: {
      bg: '#fffaf3',
      gradient: 'linear-gradient(180deg,#fff4e5 0%,#fffaf3 100%)',
      text: '#3f3f46',
      muted: '#71717a',
      accent: '#d97706',
      'card.bg': '#ffffff',
      'card.radius': '18px',
      'card.shadow': '0 12px 28px rgba(217,119,6,.12)',
      'chip.bg': 'rgba(217,119,6,.09)',
      'chip.border': 'rgba(217,119,6,.22)',
      'cta.bg': '#d97706',
      'cta.text': '#ffffff',
    },
    gradients: { panel: 'none' },
    images: {},
  },
];

export async function seedDesignThemes() {
  for (const t of THEMES) {
    await setDoc(doc(db, 'themes', t.id), { ...t, updatedAt: serverTimestamp() }, { merge: true });
  }
  await setDoc(
    doc(db, 'app_settings', 'ui'),
    { currentThemeId: 'oceanLight', updatedAt: serverTimestamp() },
    { merge: true }
  );
  return THEMES.length;
}
