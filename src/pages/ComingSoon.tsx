import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BellRing, CalendarCheck2, ChevronLeft, Clock, Sparkles, Star } from 'lucide-react';

export interface ComingSoonState {
  subjectName?: string;
  courseOrBoard?: string;
  eta?: string;
  features?: string[];
  backToCoursesPath?: string;
  backToSubjectsPath?: string;
  feedbackPath?: string;
  notifyHandler?: () => Promise<void> | void;
}

interface ComingSoonProps {
  initialState?: ComingSoonState;
  onBack?: () => void;
  onBackToCourses?: () => void;
  onSuggestTopics?: () => void;
  onNotify?: () => Promise<void> | void;
}

const sanitizePath = (value?: string | null) => {
  if (!value) return undefined;
  return value.startsWith('/') ? value : undefined;
};

const defaultFeatures = ['Quizzes', 'Notes', 'Mock Tests'];

const createPattern = (color: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <g fill="${color}" opacity="0.05">
        <text x="16" y="28" font-size="26">★</text>
        <text x="104" y="44" font-size="24">⏰</text>
        <text x="60" y="104" font-size="24">📚</text>
        <text x="118" y="128" font-size="22">★</text>
        <text x="20" y="118" font-size="20">⏳</text>
      </g>
    </svg>
  `;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

const ComingSoon: React.FC<ComingSoonProps> = ({
  initialState,
  onBack,
  onBackToCourses,
  onSuggestTopics,
  onNotify,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state as ComingSoonState | undefined) ?? undefined;
  const state = useMemo(
    () => ({ ...(initialState ?? {}), ...(routeState ?? {}) }),
    [initialState, routeState]
  );
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const subjectName = state.subjectName ?? params.get('subject') ?? 'Mathematics';
  const courseOrBoard = state.courseOrBoard ?? params.get('context') ?? 'CBSE • Class 10';
  const etaLabel = state.eta ?? params.get('eta') ?? 'Next month';

  const features = useMemo(() => {
    if (state.features && state.features.length > 0) {
      return state.features;
    }
    const featuresParam = params.get('features');
    if (featuresParam) {
      return featuresParam
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return defaultFeatures;
  }, [params, state.features]);

  const coursesPath = useMemo(() => {
    const raw = state.backToCoursesPath ?? sanitizePath(params.get('coursesPath'));
    return raw ?? '/';
  }, [params, state.backToCoursesPath]);

  const subjectsPath = useMemo(() => {
    const raw = state.backToSubjectsPath ?? sanitizePath(params.get('subjectsPath'));
    return raw;
  }, [params, state.backToSubjectsPath]);

  const feedbackPath = useMemo(() => {
    const raw = state.feedbackPath ?? sanitizePath(params.get('feedbackPath'));
    return raw ?? '/settings?tab=feedback';
  }, [params, state.feedbackPath]);

  const [notifyStatus, setNotifyStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    if (notifyStatus !== 'success') return;
    const timeout = window.setTimeout(() => setNotifyStatus('idle'), 2800);
    return () => window.clearTimeout(timeout);
  }, [notifyStatus]);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (subjectsPath) {
      navigate(subjectsPath);
      return;
    }
    navigate(-1);
  };

  const handleNotify = async () => {
    if (notifyStatus === 'loading') return;
    setNotifyStatus('loading');
    try {
      if (onNotify) {
        await onNotify();
      } else {
        await state.notifyHandler?.();
      }
      await new Promise((resolve) => setTimeout(resolve, 650));
      setNotifyStatus('success');
    } catch (error) {
      console.error('Notification opt-in failed', error);
      setNotifyStatus('success');
    }
  };

  const handleBackToCourses = () => {
    if (onBackToCourses) {
      onBackToCourses();
      return;
    }
    navigate(coursesPath);
  };

  const handleSuggestTopics = () => {
    if (onSuggestTopics) {
      onSuggestTopics();
      return;
    }
    navigate(feedbackPath);
  };

  const patternLight = useMemo(() => createPattern('#0F172A'), []);
  const patternDark = useMemo(() => createPattern('#F8FAFC'), []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#EEF8FF] to-white text-[15px] text-[color:var(--text-primary,#0F172A)] dark:from-[#0B1220] dark:to-[#020617] dark:text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(180deg, #EEF8FF 0%, #FFFFFF 100%), ${patternLight}`,
          backgroundSize: 'cover, 160px 160px',
          backgroundRepeat: 'no-repeat, repeat',
          mixBlendMode: 'normal',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          backgroundImage: `linear-gradient(180deg, #0B1220 0%, #020617 100%), ${patternDark}`,
          backgroundSize: 'cover, 180px 180px',
          backgroundRepeat: 'no-repeat, repeat',
          opacity: 0.7,
        }}
      />

      <div
        className="relative mx-auto flex min-h-screen w-full flex-col px-5"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 20px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
          maxWidth: '480px',
        }}
      >
        <header className="sticky top-0 z-20 -mt-5 flex items-center justify-between bg-gradient-to-b from-[#EEF8FF]/95 to-white/90 backdrop-blur-sm pb-4 pt-5 dark:from-[#0B1220]/95 dark:to-[#020617]/90">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back to subjects"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow-sm transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring,#10B981)] dark:bg-white/10"
          >
            <ChevronLeft className="h-6 w-6 text-[color:var(--text-primary,#0F172A)] dark:text-slate-100" />
          </button>
          <div className="flex-1 px-4 text-center">
            <h1 className="text-lg font-semibold tracking-tight text-[color:var(--text-primary,#0F172A)] dark:text-white">
              Coming Soon
            </h1>
            <p className="mt-0.5 text-xs font-medium text-[color:var(--text-muted,#64748B)] dark:text-slate-400">
              {subjectName} • {courseOrBoard}
            </p>
          </div>
          <div className="h-12 w-12" aria-hidden />
        </header>

        <main className="flex flex-1 flex-col items-center justify-center gap-8 pb-10 pt-12">
          <section className="relative w-full">
            <div className="relative mx-auto flex h-[240px] w-[260px] items-center justify-center">
              <div className="absolute inset-0 rounded-[36px] border border-white/60 bg-white/70 shadow-xl backdrop-blur-lg dark:border-white/5 dark:bg-white/10" />
              <div className="absolute inset-5 rounded-[30px] border-2 border-dashed border-[#6366F1]/40 bg-white/60 px-6 py-8 text-center shadow-inner dark:border-[#6366F1]/50 dark:bg-white/5">
                <div className="flex flex-col items-center gap-3">
                  <span className="text-5xl" role="img" aria-label="Calendar illustration">
                    📆
                  </span>
                  <p className="text-sm font-semibold text-[color:var(--text-primary,#0F172A)] dark:text-white">
                    Construction in progress
                  </p>
                  <p className="text-xs text-[color:var(--text-muted,#64748B)] dark:text-slate-300">
                    Lottie animation placeholder
                  </p>
                </div>
              </div>

              <motion.div
                className="absolute -left-4 -top-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg dark:bg-white/10"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden
              >
                <Sparkles className="h-6 w-6 text-[#6366F1]" />
              </motion.div>
              <motion.div
                className="absolute -right-5 bottom-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg dark:bg-white/10"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.6, delay: 0.6, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden
              >
                <CalendarCheck2 className="h-5 w-5 text-[#10B981]" />
              </motion.div>
              <motion.div
                className="absolute left-10 -bottom-6 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg dark:bg-white/10"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.2, delay: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden
              >
                <Star className="h-4 w-4 text-[#FBBF24]" />
              </motion.div>
            </div>
          </section>

          <section className="flex w-full flex-col items-center gap-4 text-center">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold leading-tight text-[color:var(--text-primary,#0F172A)] dark:text-white">
                We’re building this for you!
              </h2>
              <p className="text-sm leading-relaxed text-[color:var(--text-muted,#64748B)] dark:text-slate-300">
                {subjectName} content is on the way. You’ll get quizzes, notes, and mock tests here soon.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3">
              <button
                type="button"
                onClick={handleNotify}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--primary,#10B981)] text-base font-semibold text-white shadow-[0_14px_30px_rgba(16,185,129,0.28)] transition hover:shadow-[0_18px_36px_rgba(16,185,129,0.36)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring,#10B981)] active:scale-[0.99] disabled:opacity-70"
                disabled={notifyStatus === 'loading'}
              >
                {notifyStatus === 'loading' ? (
                  <span className="relative flex h-5 w-5 items-center justify-center">
                    <span className="absolute h-5 w-5 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
                  </span>
                ) : (
                  <BellRing className="h-5 w-5" aria-hidden />
                )}
                Notify Me
              </button>

              <button
                type="button"
                onClick={handleBackToCourses}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[color:var(--primary,#10B981)] bg-white/80 text-base font-semibold text-[color:var(--primary,#10B981)] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring,#10B981)] dark:border-[#10B981] dark:bg-transparent dark:text-[#34D399] dark:hover:bg-[#10B981]/10"
              >
                Back to Courses
              </button>
            </div>

            {(etaLabel || features.length > 0) && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-[color:var(--text-muted,#64748B)] dark:text-slate-300">
                {etaLabel && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs shadow-sm ring-1 ring-[color:var(--border,#E2E8F0)] dark:bg-white/5 dark:ring-white/10">
                    <Clock className="h-3.5 w-3.5" />
                    ETA: {etaLabel}
                  </span>
                )}
                {features.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-xs uppercase tracking-wide text-[color:var(--text-muted,#64748B)] shadow-sm ring-1 ring-[color:var(--border,#E2E8F0)] dark:bg-white/5 dark:text-slate-200 dark:ring-white/10"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </section>
        </main>

        <footer className="mt-auto flex flex-col items-center gap-2 text-center text-xs text-[color:var(--text-muted,#64748B)] dark:text-slate-400">
          <button
            type="button"
            onClick={handleSuggestTopics}
            className="text-sm font-semibold text-[#6366F1] underline-offset-4 transition hover:text-[#4F46E5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring,#10B981)] dark:text-[#A5B4FC] dark:hover:text-[#C7D2FE]"
          >
            Suggest topics
          </button>
          <p>We prioritize based on student requests.</p>
        </footer>
      </div>

      <AnimatePresence>
        {notifyStatus === 'success' && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md px-4"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
          >
            <div className="pointer-events-auto rounded-3xl border border-[#0EA47C]/20 bg-white/95 p-5 shadow-[0_18px_45px_rgba(16,185,129,0.25)] backdrop-blur-xl dark:border-[#34D399]/20 dark:bg-[#0F172A]/95">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#10B981]/10 text-[#047857] dark:bg-[#10B981]/20 dark:text-[#34D399]">
                  <BellRing className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[color:var(--text-primary,#0F172A)] dark:text-white">
                    You’ll be the first to know!
                  </p>
                  <p className="text-xs text-[color:var(--text-muted,#64748B)] dark:text-slate-300">
                    We’ll notify you when {subjectName} goes live.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComingSoon;
