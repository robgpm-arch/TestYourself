import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import ResponsiveGrid from '../components/ResponsiveGrid';

interface AdminSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  highlight: string;
  href: string;
}

const ADMIN_SECTIONS: AdminSection[] = [
  {
    id: 'design',
    title: 'Design System',
    description: '8 prebuilt themes, asset library, and live-editable visual styles for screens.',
    icon: '🎨',
    highlight: '8 themes',
    href: '/admin/dashboard?tab=design'
  },
  {
    id: 'quiz-themes',
    title: 'Quiz Themes',
    description: 'Create, edit, preview, and assign quiz themes with cascading inheritance.',
    icon: '🎨',
    highlight: 'Quiz styling',
    href: '/admin/themes/quiz'
  },
  {
    id: 'screen-themes',
    title: 'Screen Themes',
    description: 'Manage screen design themes, gradients, card variants, and visual tokens.',
    icon: '🎨',
    highlight: 'Screen design',
    href: '/admin/themes/screen'
  },
  {
    id: 'mediums',
    title: 'Mediums',
    description: 'Manage languages, locales, exam mediums, and visibility ordering.',
    icon: '🗣️',
    highlight: 'Language catalog',
    href: '/admin/dashboard?tab=mediums'
  },
  {
    id: 'boards',
    title: 'Boards',
    description: 'Link education boards to mediums with regional metadata and ordering.',
    icon: '🏫',
    highlight: 'Board structure',
    href: '/admin/dashboard?tab=boards'
  },
  {
    id: 'courses',
    title: 'Courses',
    description: 'Curate course tracks, difficulty levels, and hero thumbnails per board.',
    icon: '📚',
    highlight: 'Course catalog',
    href: '/admin/dashboard?tab=courses'
  },
  {
    id: 'subjects',
    title: 'Subjects',
    description: 'Configure subject branding, colors, and icons for each course.',
    icon: '📘',
    highlight: 'Subject styling',
    href: '/admin/dashboard?tab=subjects'
  },
  {
    id: 'chapters',
    title: 'Chapters',
    description: 'Organise lesson order, prerequisites, and pacing for every subject.',
    icon: '🧩',
    highlight: 'Progress map',
    href: '/admin/dashboard?tab=chapters'
  },
  {
    id: 'quizSets',
    title: 'Quiz Sets',
    description: 'Publish assessments, auto-run voices, and timing per chapter.',
    icon: '❓',
    highlight: 'Assessment bank',
    href: '/admin/dashboard?tab=quizSets'
  },
  {
    id: 'screens',
    title: 'App Screens',
    description: 'Toggle feature flags, routes, and role access across the app shell.',
    icon: '🗂️',
    highlight: 'Experience toggles',
    href: '/admin/dashboard?tab=screens'
  },
  {
    id: 'leaderboards',
    title: 'Leaderboards',
    description: 'Define competitive metrics, cadence, and display limits per subject.',
    icon: '🏆',
    highlight: 'Competition rules',
    href: '/admin/dashboard?tab=leaderboards'
  },
  {
    id: 'files',
    title: 'File Manager',
    description: 'Upload PDFs, audio, video, and JSON to Youware storage with presigned URLs.',
    icon: '📁',
    highlight: 'Storage uploads',
    href: '/admin/files'
  }
];

const QUICK_ACTIONS = [
  {
    title: 'Open Full Dashboard',
    description: 'Jump straight into the live catalog workspace with all filters.',
    action: '/admin/dashboard'
  },
  {
    title: 'Manage Storage Files',
    description: 'Upload new study materials, assets, and downloadable resources.',
    action: '/admin/files'
  },
  {
    title: 'Review Firestore Rules',
    description: 'Double-check admin-only access to catalog collections before shipping.',
    action: '/firebase/rules'
  },
  {
    title: 'Sync Mobile Builds',
    description: 'Ensure Capacitor projects stay in sync after catalog updates.',
    action: '/docs/mobile-sync'
  }
];

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();

  const goToSection = (href: string) => {
    navigate(href);
  };

  return (
    <Layout className="bg-slate-900 text-white" showFooter={false}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 opacity-90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.35em] text-blue-300/80">
              Admin Panel
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold text-white">
              Control every learning surface from a single command center.
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-200/80 leading-relaxed">
              Configure mediums, courses, assessments, feature flags, and leaderboard rules before your learners ever see the change. Everything routes into the catalogue-first Admin Dashboard where real-time Firestore updates keep the experience coherent across web and Android builds.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="primary" size="large" onClick={() => navigate('/admin/dashboard')}>
                Launch Admin Dashboard
              </Button>
              <Button variant="outline" size="large" onClick={() => navigate('/admin/files')}>
                Open File Manager
              </Button>
              <Button variant="ghost" size="large" onClick={() => navigate('/')}>Return to App</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
          <div>
            <h2 className="text-2xl font-semibold text-white">Manage Catalog Entities</h2>
            <p className="mt-2 text-slate-300 max-w-3xl">
              Choose a module to open its dedicated workspace. Each workspace streams live Firestore data, supports quick duplication, and preserves audit trails.
            </p>
          </div>

          <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }} gap={6}>
            {ADMIN_SECTIONS.map((section) => (
              <Card
                key={section.id}
                variant="gradient"
                className="h-full hover:ring-2 hover:ring-blue-400/60 transition-all cursor-pointer"
                onClick={() => goToSection(section.href)}
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-4xl">{section.icon}</span>
                  <span className="text-xs uppercase tracking-[0.3em] bg-blue-100/70 text-blue-800 px-3 py-1 rounded-full">
                    {section.highlight}
                  </span>
                </div>
                <h3 className="text-2xl font-semibold text-slate-900">{section.title}</h3>
                <p className="mt-3 text-slate-700 leading-relaxed">{section.description}</p>
                <div className="mt-6">
                  <Button variant="outline" className="text-blue-700 border-blue-500 hover:bg-blue-500 hover:text-white">
                    Open {section.title}
                  </Button>
                </div>
              </Card>
            ))}
          </ResponsiveGrid>
        </div>
      </section>

      <section className="bg-white text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold">Operational Shortcuts</h2>
              <p className="mt-2 text-slate-600 max-w-3xl">
                Keep deployment tidy: review rules, sync mobile artefacts, and verify supporting docs after catalog edits.
              </p>
            </div>
            <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
              View live activity →
            </Button>
          </div>

          <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3, xl: 4 }} gap={5}>
            {QUICK_ACTIONS.map((quick) => (
              <Card key={quick.title} variant="elevated" className="bg-slate-900 text-white">
                <h3 className="text-xl font-semibold">{quick.title}</h3>
                <p className="mt-3 text-slate-200 leading-relaxed">{quick.description}</p>
                <div className="mt-6">
                  <Button variant="outline" className="border-white/40 text-white hover:bg-white hover:text-slate-900" onClick={() => navigate(quick.action)}>
                    Open
                  </Button>
                </div>
              </Card>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    </Layout>
  );
};

export default AdminPanel;
