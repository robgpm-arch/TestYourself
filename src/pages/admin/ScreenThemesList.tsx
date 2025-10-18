import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ResponsiveGrid from '../../components/ResponsiveGrid';
import { listenThemes, saveTheme } from '../../admin/design/themesApi';
import { seedDesignThemes } from '../../admin/design/seedThemes';
import { doc, deleteDoc, getFirestore } from 'firebase/firestore';
import app from '../../config/firebase';

type ThemeDoc = {
  id: string;
  tokens: Record<string, string>;
  gradients: Record<string, string>;
  cardVariants: Record<string, any>;
  images: Record<string, string>;
};

const ScreenThemesList: React.FC = () => {
  const navigate = useNavigate();
  const [themes, setThemes] = useState<ThemeDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenThemes((rows) => {
      setThemes(rows);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleDelete = async (themeId: string) => {
    if (window.confirm('Delete this theme? This cannot be undone.')) {
      try {
        const db = getFirestore(app);
        await deleteDoc(doc(db, 'themes', themeId));
        alert('Theme deleted successfully');
      } catch (error) {
        console.error('Failed to delete theme', error);
        alert('Failed to delete theme');
      }
    }
  };

  const handleSetDefault = async (themeId: string) => {
    try {
      await saveTheme('default', { defaultScreenThemeId: themeId });
      alert('Set as global default');
    } catch (error) {
      console.error('Failed to set default', error);
      alert('Failed to set default');
    }
  };

  if (loading) {
    return (
      <Layout showHeader={false} showFooter={false}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div>Loading themes...</div>
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
                <h1 className="text-3xl font-bold text-gray-900">Screen Themes</h1>
                <p className="text-gray-500 mt-1">Manage screen design themes and visual styles</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate('/admin')}>
                  Back to Admin
                </Button>
                <Button variant="secondary" onClick={async () => {
                  try {
                    const count = await seedDesignThemes();
                    alert(`Seeded ${count} themes!`);
                    window.location.reload();
                  } catch (error) {
                    alert('Failed to seed themes');
                  }
                }}>
                  Seed 8 Themes
                </Button>
                <Button variant="primary" onClick={() => navigate('/admin/themes/screen/new')}>
                  Create Theme
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <ResponsiveGrid cols={{ default: 1, md: 2, xl: 3 }} gap={6}>
            {themes.map((theme) => (
              <Card key={theme.id} variant="elevated" className="relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => handleSetDefault(theme.id)}
                  >
                    Set Default
                  </Button>
                </div>

                <div className="pr-32">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    🎨 {theme.id === 'default' ? 'Default Theme' : theme.id}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-600">
                      Gradients: {Object.keys(theme.gradients).length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Card Variants: {Object.keys(theme.cardVariants).length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Tokens: {Object.keys(theme.tokens).length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Images: {Object.keys(theme.images).length}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => navigate(`/admin/themes/screen/${theme.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleDelete(theme.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </ResponsiveGrid>
        </div>
      </div>
    </Layout>
  );
};

export default ScreenThemesList;