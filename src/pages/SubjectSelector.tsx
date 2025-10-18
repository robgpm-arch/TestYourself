import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Subject {
  id: string;
  name: string;
  icon: string;
  emoji: string;
  color: string;
  description: string;
  subIcon: string;
}

const subjects: Subject[] = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: '➗',
    emoji: '🔢',
    color: 'from-blue-400 to-blue-600',
    description: 'Numbers, Algebra, Geometry',
    subIcon: '📐',
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    emoji: '⚛️',
    color: 'from-green-400 to-green-600',
    description: 'Physics, Chemistry, Biology',
    subIcon: '🧪',
  },
  {
    id: 'history',
    name: 'History',
    icon: '📜',
    emoji: '🏛️',
    color: 'from-amber-600 to-orange-700',
    description: 'Past Events, Civilizations',
    subIcon: '⚔️',
  },
  {
    id: 'geography',
    name: 'Geography',
    icon: '🌍',
    emoji: '🗺️',
    color: 'from-cyan-400 to-teal-600',
    description: 'Earth, Maps, Climate',
    subIcon: '🧭',
  },
  {
    id: 'english',
    name: 'English',
    icon: '📖',
    emoji: '✍️',
    color: 'from-purple-400 to-purple-600',
    description: 'Language, Literature, Grammar',
    subIcon: '📝',
  },
  {
    id: 'general-knowledge',
    name: 'General Knowledge',
    icon: '🌟',
    emoji: '💡',
    color: 'from-yellow-400 to-yellow-600',
    description: 'Facts, Trivia, Current Events',
    subIcon: '🧠',
  },
  {
    id: 'reasoning',
    name: 'Reasoning',
    icon: '🧩',
    emoji: '🎯',
    color: 'from-orange-400 to-red-500',
    description: 'Logic, Puzzles, Problem Solving',
    subIcon: '⚡',
  },
  {
    id: 'current-affairs',
    name: 'Current Affairs',
    icon: '📰',
    emoji: '📡',
    color: 'from-red-400 to-pink-500',
    description: 'News, Politics, Events',
    subIcon: '📺',
  },
];

interface SubjectSelectorProps {
  onSubjectSelect: (subject: string) => void;
  comingSoonSubjects?: string[];
  onSubjectComingSoon?: (subjectId: string) => void;
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  onSubjectSelect,
  comingSoonSubjects,
  onSubjectComingSoon,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState(false);
  const autoAdvanceRef = useRef<number | null>(null);

  const comingSoonSet = useMemo(() => new Set(comingSoonSubjects ?? []), [comingSoonSubjects]);

  const handleSubjectSelect = (subjectId: string) => {
    const isComingSoon = comingSoonSet.has(subjectId);
    setSelectedSubject(subjectId);

    if (isComingSoon) {
      window.clearTimeout(autoAdvanceRef.current ?? undefined);
      setIsConfirming(false);
      onSubjectComingSoon?.(subjectId);
      return;
    }

    setIsConfirming(true);

    window.clearTimeout(autoAdvanceRef.current ?? undefined);
    autoAdvanceRef.current = window.setTimeout(() => {
      setIsConfirming(false);
    }, 1500);

    window.setTimeout(() => {
      onSubjectSelect(subjectId);
    }, 300);
  };

  const selectedSubjectData = subjects.find(subject => subject.id === selectedSubject);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-300 to-white relative overflow-hidden">
      {/* Decorative background subject icons */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-16 left-16 text-8xl transform rotate-12">📚</div>
        <div className="absolute top-32 right-24 text-6xl transform -rotate-6">🔬</div>
        <div className="absolute bottom-32 left-32 text-7xl transform rotate-45">🌍</div>
        <div className="absolute bottom-16 right-16 text-5xl transform -rotate-12">📐</div>
        <div className="absolute top-1/2 left-1/6 text-4xl transform rotate-90">📖</div>
        <div className="absolute top-1/4 right-1/3 text-6xl transform -rotate-30">🧩</div>
        <div className="absolute bottom-1/3 left-2/3 text-5xl transform rotate-15">💡</div>
        <div className="absolute top-2/3 right-1/4 text-4xl transform -rotate-45">📰</div>
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-12 sm:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Choose a Subject
          </h1>
          <p className="text-teal-100 text-lg md:text-xl font-medium">
            Select your favorite topic to start learning
          </p>
        </motion.div>

        {/* Subject Cards Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 w-full max-w-5xl mb-10 place-items-center"
        >
          {subjects.map((subject, index) => (
            <motion.button
              key={subject.id}
              type="button"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.3 + index * 0.1,
                type: 'spring',
                stiffness: 100,
              }}
              whileHover={{
                scale: 1.05,
                y: -5,
                transition: { duration: 0.2 },
              }}
              whileTap={{
                scale: comingSoonSet.has(subject.id) ? 1 : 0.98,
                transition: { duration: 0.1 },
              }}
              onClick={() => handleSubjectSelect(subject.id)}
              aria-pressed={selectedSubject === subject.id}
              aria-label={
                comingSoonSet.has(subject.id)
                  ? `${subject.name} coming soon`
                  : `Select ${subject.name}`
              }
              className={`
                relative cursor-pointer rounded-2xl p-4 sm:p-5 lg:p-6 aspect-[4/5]
                bg-gradient-to-br ${subject.color} text-white w-full max-w-[150px] sm:max-w-[180px] lg:max-w-[220px]
                shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70
                ${
                  selectedSubject === subject.id
                    ? 'ring-2 ring-white ring-opacity-50 shadow-2xl scale-105'
                    : ''
                }
                ${comingSoonSet.has(subject.id) ? 'opacity-90' : ''}
              `}
            >
              {/* Glowing border effect for selected */}
              {selectedSubject === subject.id && !comingSoonSet.has(subject.id) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-3xl bg-white opacity-20 blur-sm"
                />
              )}

              <div className="relative z-10 text-center h-full flex flex-col justify-center">
                {/* Coming soon badge */}
                {comingSoonSet.has(subject.id) && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-white/85 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-wide text-gray-900 shadow">
                      Coming Soon
                    </span>
                  </div>
                )}

                {/* Main Icon */}
                <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3">{subject.icon}</div>

                {/* Subject Name */}
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 leading-tight">
                  {subject.name}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed mb-2 sm:mb-3">
                  {subject.description}
                </p>

                {/* Sub Icon */}
                <div className="text-xl sm:text-2xl md:text-3xl opacity-80">{subject.subIcon}</div>

                {/* Selection indicator */}
                {selectedSubject === subject.id && !comingSoonSet.has(subject.id) && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute -top-2 -right-2 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <svg className="w-6 h-6 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.div>
                )}

                {/* Hover overlay */}
                <motion.div className="absolute inset-0 rounded-3xl bg-white opacity-0 hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
              </div>

              {/* Card expansion effect */}
              {selectedSubject === subject.id && !comingSoonSet.has(subject.id) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 rounded-3xl border-4 border-white opacity-30"
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {isConfirming && selectedSubjectData && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="mb-6 px-6 py-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{selectedSubjectData.icon}</span>
                <p className="text-teal-700 font-semibold text-sm sm:text-base">
                  {selectedSubjectData.name} selected! Loading the next step…
                </p>
                <span className="text-xl">{selectedSubjectData.emoji}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedSubject && comingSoonSet.has(selectedSubject) && selectedSubjectData && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mb-6 px-6 py-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg text-center"
            >
              <p className="text-teal-700 font-semibold text-sm sm:text-base">
                {selectedSubjectData.name} is coming soon. We’ll notify you once it goes live!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fun motivational text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-6 text-center"
        >
          <p className="text-teal-100 text-sm md:text-base font-medium">
            🚀 Ready to explore and learn something amazing?
          </p>
        </motion.div>

        {/* Progress indicator */}
        <div className="flex space-x-2 mt-8">
          {[1, 2, 3, 4, 5, 6, 7].map((step, index) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                index === 6 ? 'bg-teal-500' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubjectSelector;
