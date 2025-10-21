import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { getDb } from '../lib/firebaseClient';

interface SeoSettings {
  title?: string;
  description?: string;
  ogImage?: string;
  twitterHandle?: string;
  canonical?: string;
  robots?: string;
  sitemapEnabled?: boolean;
}

const DEFAULT_SEO: SeoSettings = {
  title: 'TestYourself – Practice MCQs, Mock Exams & Analytics',
  description:
    'Chapter-wise MCQs and mock exams across boards and subjects. Instant explanations, smart analytics, streaks, and leaderboards.',
  ogImage: '/og-image-1200x630.png',
  twitterHandle: '@testyourselfapp',
  canonical: 'https://testyourself.app/',
  robots: 'index,follow',
  sitemapEnabled: true,
};

export function useSeoSettings() {
  const [seo, setSeo] = useState<SeoSettings>(DEFAULT_SEO);

  useEffect(() => {
    let unsub: any = null;
    (async () => {
      try {
        const db = await getDb();
        unsub = onSnapshot(doc(db, 'app_settings', 'seo'), (snap: any) => {
          if (snap.exists()) {
            setSeo({ ...DEFAULT_SEO, ...snap.data() });
          }
        });
      } catch (e) {
        console.error('useSeoSettings subscription failed', e);
      }
    })();
    return () => unsub?.();
  }, []);

  return seo;
}
