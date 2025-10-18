import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { loadTheme } from '../../design/api';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import app from '../../config/firebase';

import type { ThemeDoc } from '../../design/types';

const DEFAULT_THEME: ThemeDoc = {
  id: 'default',
  name: 'Default Theme',
  tokens: {
    'radius.xs': '8px',
    'radius.md': '16px',
    'radius.lg': '24px',
    'shadow.card': '0 10px 30px rgba(0,0,0,.08)',
    'spacing.card.p': '24px',
    'color.text': '#0f172a',
    'color.muted': '#475569',
  },
  gradients: {
    blueGlass: 'linear-gradient(135deg, #9bd2ff 0%, #adc8ff 50%, #e3e8ff 100%)',
    sunset: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  },
  cardVariants: {
    elevated: {
      radius: 'var(radius.lg)',
      shadow: 'var(shadow.card)',
      bg: 'rgba(255,255,255,.75)',
      backdropBlur: '8px',
    },
    flat: {
      radius: 'var(radius.md)',
      shadow: 'none',
      bg: '#ffffff',
      backdropBlur: '0px',
    },
  },
  images: {},
};

const ScreenThemeEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === 'new' || !id;

  const [theme, setTheme] = useState<ThemeDoc>(DEFAULT_THEME);
  const [themeJson, setThemeJson] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      loadTheme(id)
        .then(existingTheme => {
          setTheme(existingTheme);
          setThemeJson(JSON.stringify(existingTheme, null, 2));
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setThemeJson(JSON.stringify(DEFAULT_THEME, null, 2));
      setLoading(false);
    }
  }, [id, isNew]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const parsed = JSON.parse(themeJson);
      const db = getFirestore(app);
      const themeId = isNew ? 'new-theme' : id; // For now, only edit default
      await updateDoc(doc(db, 'themes', themeId), parsed);
      alert('Theme saved successfully!');
      if (isNew) {
        navigate('/admin/themes/screen');
      }
    } catch (error) {
      alert('Invalid JSON or save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout showHeader={false} showFooter={false}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div>Loading theme...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={false} showFooter={false}>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isNew ? 'Create Screen Theme' : `Edit ${id} Theme`}
                </h1>
                <p className="text-gray-500 mt-1">Edit theme JSON for screen design system</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate('/admin/themes/screen')}>
                  Back to Themes
                </Button>
                <Button variant="primary" onClick={handleSave} loading={saving}>
                  {isNew ? 'Create Theme' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Card variant="elevated" className="p-6">
            <h3 className="text-lg font-semibold mb-4">Theme Configuration</h3>
            <p className="text-sm text-gray-600 mb-4">
              Edit the theme JSON structure containing tokens, gradients, card variants, and images.
            </p>
            <textarea
              value={themeJson}
              onChange={e => setThemeJson(e.target.value)}
              className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder="Theme JSON..."
            />
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ScreenThemeEditor;
