import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';

export interface ChapterSelectionItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  number: number;
}

export interface ChapterSelectionProps {
  subjectId: string;
  subjectName: string;
  chapters: ChapterSelectionItem[];
  onSelect: (chapter: ChapterSelectionItem) => void;
  onBack: () => void;
}

const difficultyPills: Record<
  ChapterSelectionItem['difficulty'],
  { label: string; color: string }
> = {
  easy: { label: 'Easy', color: 'bg-emerald-100 text-emerald-600' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-600' },
  hard: { label: 'Hard', color: 'bg-rose-100 text-rose-600' },
};

const ChapterSelection: React.FC<ChapterSelectionProps> = ({
  subjectId,
  subjectName,
  chapters,
  onSelect,
  onBack,
}) => {
  const gradientSeed = useMemo(() => {
    const colors: Record<string, string> = {
      mathematics: 'from-blue-600 via-blue-500 to-cyan-500',
      science: 'from-emerald-600 via-teal-500 to-sky-500',
      history: 'from-amber-600 via-orange-500 to-rose-500',
      geography: 'from-cyan-600 via-sky-500 to-indigo-500',
      english: 'from-purple-600 via-indigo-500 to-blue-500',
      reasoning: 'from-orange-600 via-amber-500 to-rose-500',
      'current-affairs': 'from-rose-600 via-pink-500 to-purple-500',
      'general-knowledge': 'from-yellow-500 via-amber-500 to-emerald-500',
    };
    return colors[subjectId] ?? 'from-blue-600 via-teal-500 to-indigo-500';
  }, [subjectId]);

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div
          className={`absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl bg-gradient-to-br ${gradientSeed}`}
        />
        <div className="absolute top-24 left-16 text-7xl opacity-40">📚</div>
        <div className="absolute bottom-24 right-12 text-6xl opacity-30">🧠</div>
        <div className="absolute top-1/2 left-1/3 text-5xl opacity-20">📈</div>
        <div className="absolute top-1/3 right-1/4 text-6xl opacity-25">🧪</div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="flex flex-col gap-6 mb-10">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="text-white border-white/40 hover:bg-white/10"
            >
              ← Subjects
            </Button>
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-300">Select Chapter</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-white">{subjectName}</h1>
            <p className="mt-3 text-base md:text-lg text-slate-300 max-w-2xl">
              Pick a chapter to continue your practice journey. Each chapter contains curated quiz
              sets tailored to its difficulty level.
            </p>
          </div>
        </header>

        <div className="space-y-4">
          {chapters.map((chapter, index) => {
            const difficulty = difficultyPills[chapter.difficulty];
            return (
              <motion.button
                key={chapter.id}
                onClick={() => onSelect(chapter)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-full text-left group"
                type="button"
              >
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-200 group-hover:border-white/40 group-hover:bg-white/10">
                  <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-transparent via-white/60 to-transparent" />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white text-xl font-semibold shadow-inner">
                          {chapter.number.toString().padStart(2, '0')}
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-white leading-tight">
                          {chapter.title}
                        </p>
                        <p className="text-sm text-slate-200 mt-1 max-w-xl">
                          {chapter.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs uppercase tracking-[0.25em] text-slate-300">
                          <span className="flex items-center gap-2">⏱ {chapter.duration}</span>
                          <span
                            className={`rounded-full px-3 py-1 font-semibold tracking-wide ${difficulty.color}`}
                          >
                            {difficulty.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-sm text-slate-200 hidden sm:block">
                        Tap to explore sets
                      </div>
                      <motion.div
                        className="w-10 h-10 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-white text-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        →
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChapterSelection;
