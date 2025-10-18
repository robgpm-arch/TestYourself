import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { createTheme, saveTheme, getTheme } from '../../admin/themes/quiz/api';
import { applyQuizTheme } from '../../quiz/themeRuntime';

type ThemeDoc = {
  id?: string;
  name: string;
  tokens: Record<string, string>;
  images?: Record<string, string>;
};

const DEFAULT_THEME: ThemeDoc = {
  name: '',
  tokens: {
    bg: '#F3F8FF',
    gradient: 'linear-gradient(135deg,#BEE3FF 0%,#D6E4FF 50%,#EEF2FF 100%)',
    accent: '#2563eb',
    text: '#0f172a',
    muted: '#475569',
    'card.bg': 'rgba(255,255,255,.85)',
    'card.radius': '20px',
    'card.shadow': '0 12px 32px rgba(15,23,42,.08)',
    'option.bg': '#ffffff',
    'option.border': '#e5e7eb',
    correct: '#16a34a',
    wrong: '#ef4444',
    'timer.track': '#c7d2fe',
    'timer.progress': '#4f46e5'
  },
  images: {}
};

const QuizThemeEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === 'new' || !id;

  const [theme, setTheme] = useState<ThemeDoc>(DEFAULT_THEME);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      getTheme(id).then((existingTheme) => {
        if (existingTheme) {
          setTheme(existingTheme as ThemeDoc);
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    // Apply theme to preview container
    const previewEl = document.getElementById('theme-preview');
    if (previewEl && theme.tokens) {
      // Apply tokens directly for preview
      Object.entries(theme.tokens).forEach(([key, value]) => {
        previewEl.style.setProperty(`--${key}`, value);
      });
    }
  }, [theme]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNew) {
        const newId = await createTheme(theme);
        navigate(`/admin/themes/quiz/${newId}`);
      } else {
        await saveTheme(id!, theme);
      }
      alert('Theme saved successfully!');
    } catch (error) {
      alert('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const updateToken = (key: string, value: string) => {
    setTheme(prev => ({
      ...prev,
      tokens: { ...prev.tokens, [key]: value }
    }));
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
                  {isNew ? 'Create Quiz Theme' : `Edit ${theme.name}`}
                </h1>
                <p className="text-gray-500 mt-1">Customize quiz appearance and colors</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate('/admin/themes/quiz')}>
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
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Editor */}
            <div className="space-y-6">
              <Card variant="elevated" className="p-6">
                <h3 className="text-lg font-semibold mb-4">Basic Info</h3>
                <div className="space-y-4">
                  <Input
                    label="Theme Name"
                    value={theme.name}
                    onChange={(e) => setTheme(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
              </Card>

              <Card variant="elevated" className="p-6">
                <h3 className="text-lg font-semibold mb-4">Colors</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Background"
                    value={theme.tokens.bg}
                    onChange={(e) => updateToken('bg', e.target.value)}
                    placeholder="#F3F8FF"
                  />
                  <Input
                    label="Accent"
                    value={theme.tokens.accent}
                    onChange={(e) => updateToken('accent', e.target.value)}
                    placeholder="#2563eb"
                  />
                  <Input
                    label="Text"
                    value={theme.tokens.text}
                    onChange={(e) => updateToken('text', e.target.value)}
                    placeholder="#0f172a"
                  />
                  <Input
                    label="Muted Text"
                    value={theme.tokens.muted}
                    onChange={(e) => updateToken('muted', e.target.value)}
                    placeholder="#475569"
                  />
                  <Input
                    label="Correct Answer"
                    value={theme.tokens.correct}
                    onChange={(e) => updateToken('correct', e.target.value)}
                    placeholder="#16a34a"
                  />
                  <Input
                    label="Wrong Answer"
                    value={theme.tokens.wrong}
                    onChange={(e) => updateToken('wrong', e.target.value)}
                    placeholder="#ef4444"
                  />
                </div>
              </Card>

              <Card variant="elevated" className="p-6">
                <h3 className="text-lg font-semibold mb-4">Background</h3>
                <div className="space-y-4">
                  <Input
                    label="Gradient CSS"
                    value={theme.tokens.gradient}
                    onChange={(e) => updateToken('gradient', e.target.value)}
                    placeholder="linear-gradient(...)"
                  />
                </div>
              </Card>
            </div>

            {/* Preview */}
            <div className="space-y-6">
              <Card variant="elevated" className="p-6">
                <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
                <div
                  id="theme-preview"
                  className="rounded-lg p-6 min-h-[400px] border"
                  style={{ background: theme.tokens.bg }}
                >
                  <div className="space-y-4">
                    <div
                      className="p-4 rounded-lg shadow-sm"
                      style={{
                        background: theme.tokens['card.bg'],
                        borderRadius: theme.tokens['card.radius'],
                        boxShadow: theme.tokens['card.shadow']
                      }}
                    >
                      <h4 style={{ color: theme.tokens.text }}>Sample Question</h4>
                      <p style={{ color: theme.tokens.muted }}>What is 2 + 2?</p>
                    </div>

                    <div className="grid gap-2">
                      {['4', '5', '6', '22'].map((option, i) => (
                        <button
                          key={i}
                          className="p-3 rounded border text-left"
                          style={{
                            background: theme.tokens['option.bg'],
                            borderColor: theme.tokens['option.border'],
                            color: theme.tokens.text
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuizThemeEditor;