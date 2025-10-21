import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebaseClient';

interface SeoSettings {
  title?: string;
  description?: string;
  ogImage?: string;
  twitterHandle?: string;
  canonical?: string;
  robots?: string;
  sitemapEnabled?: boolean;
  updatedAt?: any;
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

export default function SeoCard() {
  const [seo, setSeo] = useState<SeoSettings>(DEFAULT_SEO);
  const [saving, setSaving] = useState(false);

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
        console.error('seo subscription failed', e);
      }
    })();
    return () => unsub?.();
  }, []);

  async function save() {
    setSaving(true);
    try {
      const db = await getDb();
      await setDoc(
        doc(db, 'app_settings', 'seo'),
        {
          ...seo,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } finally {
      setSaving(false);
    }
  }

  const serpPreview = {
    title: seo.title || DEFAULT_SEO.title,
    url: seo.canonical || DEFAULT_SEO.canonical,
    description: seo.description || DEFAULT_SEO.description,
  };

  return (
    <div className="rounded-xl border p-6 bg-white">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">SEO & Discovery</h3>
        <p className="text-sm text-gray-600">
          Manage meta titles, descriptions, social images, and search engine settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
            <input
              type="text"
              value={seo.title || ''}
              onChange={e => setSeo(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter page title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
            <textarea
              value={seo.description || ''}
              onChange={e => setSeo(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter meta description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OG/Twitter Image URL
            </label>
            <input
              type="text"
              value={seo.ogImage || ''}
              onChange={e => setSeo(prev => ({ ...prev, ogImage: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., /og-image-1200x630.png"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter Handle</label>
              <input
                type="text"
                value={seo.twitterHandle || ''}
                onChange={e => setSeo(prev => ({ ...prev, twitterHandle: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
              <input
                type="text"
                value={seo.canonical || ''}
                onChange={e => setSeo(prev => ({ ...prev, canonical: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Robots Directive
              </label>
              <select
                value={seo.robots || 'index,follow'}
                onChange={e => setSeo(prev => ({ ...prev, robots: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="index,follow">Index & Follow</option>
                <option value="index,nofollow">Index Only</option>
                <option value="noindex,follow">Follow Only</option>
                <option value="noindex,nofollow">No Index/Follow</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={seo.sitemapEnabled !== false}
                  onChange={e => setSeo(prev => ({ ...prev, sitemapEnabled: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Enable Sitemap</span>
              </label>
            </div>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save SEO Settings'}
          </button>
        </div>

        {/* SERP Preview */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Search Result Preview</h4>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="text-blue-600 text-lg hover:underline cursor-pointer mb-1">
              {serpPreview.title}
            </div>
            <div className="text-green-700 text-sm mb-2">{serpPreview.url}</div>
            <div className="text-gray-600 text-sm leading-relaxed">{serpPreview.description}</div>
          </div>

          {seo.ogImage && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Social Preview</h4>
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <img
                  src={seo.ogImage}
                  alt="Social preview"
                  className="w-full h-32 object-cover rounded"
                  onError={e => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="mt-2 text-xs text-gray-500">{seo.ogImage}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
