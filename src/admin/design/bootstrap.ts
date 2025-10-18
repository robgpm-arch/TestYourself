// Use Admin SDK for server-side operations
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Admin SDK
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error('GOOGLE_APPLICATION_CREDENTIALS not set');
}
const app = initializeApp({ credential: applicationDefault() });
const db = getFirestore(app);

// Paste the screen ids you reported:
export const SCREEN_IDS = [
  'achievement_celebration',
  'admin_dashboard',
  'admin_files',
  'admin_panel',
  'challenge_result',
  'chapter_sets',
  'chat_messaging',
  'daily_challenges',
  'detailed_analytics',
  'exam_mode',
  'friends_social',
  'home',
  'invite_friends',
  'leaderboards',
  'motivational_hub',
  'multiplayer_battle',
  'multiplayer_lobby',
  'profile',
  'quiz_instructions',
  'quiz_player_comprehension',
  'quiz_player_numerical',
  'results_celebration',
  'settings',
  'syllabus_browser',
  'theme_picker',
];

// Small helper to add a component
async function putComponent(screenId: string, compId: string, payload: any) {
  await db
    .collection('screens')
    .doc(screenId)
    .collection('components')
    .doc(compId)
    .set(
      {
        ...payload,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
}

// Idempotent seeder: creates a minimal, editable layout for each screen
export async function seedScreenComponents(targets = SCREEN_IDS, force = false) {
  console.log(`Seeding components for ${targets.length} screens...`);
  for (const id of targets) {
    console.log(`Processing screen: ${id}`);
    // If components already exist, skip seeding (keeps it idempotent)
    if (!force) {
      const snap = await db.collection('screens').doc(id).collection('components').get();
      if (!snap.empty) {
        console.log(`  Skipping ${id} - components already exist`);
        continue;
      }
    }

    console.log(`  Creating components for ${id}`);
    await putComponent(id, 'header', {
      type: 'header',
      order: 0,
      enabled: true,
      props: {
        title: id.replace(/_/g, ' ').replace(/\b\w/g, s => s.toUpperCase()),
        subtitle: 'Editable from Admin → Screens → Components',
        icon: 'Palette',
      },
      style: { cardVariant: 'elevated' },
    });

    await putComponent(id, 'cards-section', {
      type: 'card-section',
      order: 1,
      enabled: true,
      props: { columns: 2, gap: 20 },
    });

    await putComponent(id, 'info-1', {
      type: 'card',
      order: 2,
      enabled: true,
      props: {
        title: 'Info',
        text: 'You can change layout, gradient, background, and card style here.',
        icon: 'Info',
      },
      style: {},
    });

    await putComponent(id, 'action-1', {
      type: 'card',
      order: 3,
      enabled: true,
      props: { title: 'Primary Action', icon: 'Play', route: '/' },
      style: {},
    });
  }
  console.log('Component seeding complete');
  return true;
}

// Set per-screen visual style / theme (backgrounds, gradients, container)
export async function setScreenStyle(
  screenId: string,
  style: {
    theme?: string; // e.g., "oceanLight"
    gradient?: string | null; // key from /themes/{id}.gradients or raw CSS
    bgImage?: string | null; // key from /themes/{id}.images, e.g., "background"
    bgMode?: 'cover' | 'contain';
    bgBlend?: 'normal' | 'overlay' | 'multiply' | 'screen';
    overlay?: string | null;
    cardVariant?: string; // from theme.cardVariants if you add them later
    container?: { maxWidth?: number; padding?: number; gap?: number };
  }
) {
  // Merge into /screens/{id}.style
  await db.collection('screens').doc(screenId).set(
    {
      style,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}

export async function setGlobalTheme(themeId: string) {
  await db.collection('app_settings').doc('ui').set(
    {
      currentThemeId: themeId,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}

// Quick presets to apply now
export async function applyNiceDefaults() {
  for (const id of SCREEN_IDS) {
    await setScreenStyle(id, {
      theme: 'oceanLight',
      gradient: 'panel', // see seedThemes gradients.panel
      bgImage: 'background', // points to the theme.images.background if present
      bgMode: 'cover',
      bgBlend: 'overlay',
      overlay: 'rgba(255,255,255,.35)',
      container: { maxWidth: 1120, padding: 24, gap: 24 },
    });
  }
}
