import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ResponsiveGrid from '../../components/ResponsiveGrid';
import { listenThemes, removeTheme, setGlobalDefault } from '../../admin/themes/quiz/api';

type ThemeDoc = {
  id: string;
  name: string;
  tokens: Record<string, string>;
  images?: Record<string, string>;
  updatedAt?: any;
};

const QuizThemesList: React.FC = () => {
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
        await removeTheme(themeId);
      } catch (error) {
        alert('Failed to delete theme');
      }
    }
  };

  const handleSetDefault = async (themeId: string) => {
    try {
      await setGlobalDefault(themeId);
      alert('Set as global default');
    } catch (error) {
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
                <h1 className="text-3xl font-bold text-gray-900">Quiz Themes</h1>
                <p className="text-gray-500 mt-1">Manage quiz visual themes and styling</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate('/admin')}>
                  Back to Admin
                </Button>
                <Button variant="primary" onClick={() => navigate('/admin/themes/quiz/new')}>
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
                    🎨 {theme.name}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: theme.tokens.accent || '#2563eb' }}
                      />
                      <span className="text-sm text-gray-600">Accent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: theme.tokens.correct || '#16a34a' }}
                      />
                      <span className="text-sm text-gray-600">Correct</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: theme.tokens.wrong || '#ef4444' }}
                      />
                      <span className="text-sm text-gray-600">Wrong</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Updated: {theme.updatedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => navigate(`/admin/themes/quiz/${theme.id}`)}
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

export default QuizThemesList;