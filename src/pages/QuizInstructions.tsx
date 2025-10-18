import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { ChapterInfo, MCQQuestion, QuizSet } from './ChapterSets';
import { useMotivationPersonality } from '../hooks/useMotivationPersonality';

interface QuizInstructionsProps {
  session?: {
    set: QuizSet;
    questions: MCQQuestion[];
    chapterInfo: ChapterInfo;
  };
  isSubscriber?: boolean;
  onStartQuiz?: () => void;
  onAutoRun?: () => void;
  onBack?: () => void;
  onUnlockSubscriber?: () => void;
}

const QuizInstructions: React.FC<QuizInstructionsProps> = ({
  session,
  isSubscriber = false,
  onStartQuiz,
  onAutoRun,
  onBack,
  onUnlockSubscriber
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAutoRunRequesting, setIsAutoRunRequesting] = useState(false);
  const [showPersonalitySelector, setShowPersonalitySelector] = useState(false);
  const { personalities, selectedPersonality, selectPersonality } = useMotivationPersonality();

  const runtimeSession = session ?? (location.state as QuizInstructionsProps['session']);

  if (!runtimeSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-blue-200 to-white">
        <div className="text-center space-y-4">
          <p className="text-xl text-gray-700">No quiz selected.</p>
          <Button onClick={() => navigate('/chapter-sets')} variant="primary">
            Back to chapter sets
          </Button>
        </div>
      </div>
    );
  }

  const autoRunConfig = runtimeSession.set.autoRunConfig;
  const autoRunEnabled = autoRunConfig?.enabled ?? false;
  const autoRunRequiresSubscriber = autoRunConfig?.subscriberOnly ?? false;
  const autoRunAccessible = autoRunEnabled && (!autoRunRequiresSubscriber || isSubscriber);
  const autoRunLockedMessage = !autoRunEnabled
    ? 'Auto run preview is disabled for this set.'
    : autoRunRequiresSubscriber && !isSubscriber
      ? 'Auto run preview is a subscriber-only perk.'
      : '';

  const totalQuestions = runtimeSession.questions.length;
  const durationMinutes = runtimeSession.set.timeEstimate
    ? Number.parseInt(runtimeSession.set.timeEstimate, 10)
    : runtimeSession.set.totalQuestions ?? totalQuestions;

  const instructionCards = useMemo(
    () => [
      {
        id: 'time',
        icon: '⏱️',
        title: 'Time Limit',
        description: `Recommended time ~${runtimeSession.set.timeEstimate || `${Math.max(totalQuestions, 20)} min`}.`
      },
      {
        id: 'questions',
        icon: '❓',
        title: 'Questions',
        description: `${totalQuestions} curated multiple choice questions.`
      },
      {
        id: 'scoring',
        icon: '🏆',
        title: 'Scoring',
        description: '+1 for correct, 0 for wrong, 0 for skipped.'
      },
      {
        id: 'navigation',
        icon: '🔄',
        title: 'Navigation',
        description: 'You can skip and return before submitting.'
      },
      {
        id: 'integrity',
        icon: '📶',
        title: 'Integrity',
        description: 'Do not switch apps during exam mode.'
      }
    ],
    [runtimeSession, totalQuestions]
  );

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.12,
        duration: 0.5,
        type: 'spring',
        stiffness: 110,
        damping: 14
      }
    })
  };

  const buttonPulse = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(-1);
  };

  const handleStartQuiz = () => {
    if (onStartQuiz) {
      onStartQuiz();
      return;
    }
    navigate('/theme-picker', { state: runtimeSession });
  };

  const handleAutoRun = () => {
    if (!autoRunAccessible) {
      return;
    }

    if (onAutoRun) {
      onAutoRun();
      return;
    }

    setIsAutoRunRequesting(true);
    setTimeout(() => {
      setIsAutoRunRequesting(false);
      navigate('/quiz/auto-run', { state: runtimeSession });
    }, 600);
  };

  const headline = `${runtimeSession.chapterInfo.subject} · ${runtimeSession.chapterInfo.chapter}`;
  const subtitle = `Set ${runtimeSession.set.name} • Difficulty: ${runtimeSession.set.difficulty.toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-200 to-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl">📄</div>
        <div className="absolute top-20 right-20 text-4xl">⏱️</div>
        <div className="absolute bottom-20 left-20 text-5xl">📄</div>
        <div className="absolute bottom-10 right-10 text-3xl">⏱️</div>
        <div className="absolute top-1/2 left-1/4 text-4xl">📄</div>
        <div className="absolute top-1/3 right-1/4 text-5xl">⏱️</div>
        <div className="absolute top-2/3 left-1/2 text-3xl">📄</div>
        <div className="absolute top-1/4 right-1/2 text-4xl">⏱️</div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-8 px-4"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            {onBack && (
              <button
                onClick={handleBack}
                className="hidden sm:inline-flex items-center justify-center px-3 py-2 rounded-full bg-white/70 text-blue-600 shadow"
              >
                ← Back
              </button>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{headline}</h1>
              <p className="text-gray-600 text-lg">{subtitle}</p>
            </div>
          </div>

          {runtimeSession && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <Card variant="elevated" className="bg-white/80 backdrop-blur-sm border border-white/40">
                <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-blue-500 font-semibold">Chapter Overview</p>
                    <h2 className="text-2xl font-bold text-gray-800">{runtimeSession.set.description}</h2>
                  </div>
                  <div className="flex flex-wrap gap-4 sm:gap-8 text-sm text-gray-600">
                    <div className="text-center">
                      <p className="font-semibold text-gray-800 text-lg">{totalQuestions}</p>
                      <p>Questions</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-800 text-lg">
                        {typeof durationMinutes === 'number' && !Number.isNaN(durationMinutes)
                          ? `${durationMinutes}`
                          : runtimeSession.set.timeEstimate}
                      </p>
                      <p>Minutes</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-800 text-lg capitalize">{runtimeSession.set.difficulty}</p>
                      <p>Difficulty</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>

        <div className="flex-1 px-4 pb-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {instructionCards.map((instruction, index) => (
                <motion.div
                  key={instruction.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  className="h-full"
                >
                  <Card
                    variant="elevated"
                    className="h-full flex flex-col justify-center text-center p-6 hover:shadow-xl transition-shadow duration-300"
                    hover
                  >
                    <div className="mb-4">
                      <div className="text-4xl mb-3">{instruction.icon}</div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{instruction.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{instruction.description}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-10"
            >
              <Card variant="elevated" className="p-6 sm:p-8 border border-white/40 bg-white/85">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">🎭</span>
                      <div>
                        <p className="text-sm uppercase tracking-wide text-blue-500 font-semibold">Motivational companion</p>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {selectedPersonality.name}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Choose who celebrates you after each quiz. Your selected personality plays a themed GIF and voice message automatically when results load.
                    </p>
                    {autoRunConfig && autoRunRequiresSubscriber && !autoRunAccessible && (
                      <p className="mt-3 text-xs text-gray-500">
                        Auto-run narration needs an active subscription. You can still preview your chosen motivator after upgrading.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white shadow">
                      <img
                        src={selectedPersonality.previewGif}
                        alt={`${selectedPersonality.name} preview`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <Button
                      onClick={() => setShowPersonalitySelector(true)}
                      variant="outline"
                      size="small"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      Change voice
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {!autoRunConfig && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mt-8"
              >
                <Card variant="gradient" className="text-center p-6">
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-3xl mr-3">💡</span>
                    <h3 className="text-lg font-semibold text-gray-800">Pro Tip</h3>
                  </div>
                  <p className="text-gray-700">
                    Read each question carefully and take your time. You can always review your answers before final submission.
                  </p>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="bg-white/85 backdrop-blur-sm border-t border-gray-200 p-6"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleBack}
                variant="outline"
                size="large"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 min-w-[120px]"
              >
                ← Back
              </Button>

              <Button
                onClick={handleAutoRun}
                variant="secondary"
                size="large"
                disabled={!autoRunAccessible || isAutoRunRequesting}
                className={`min-w-[180px] relative ${
                  autoRunAccessible
                    ? 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200'
                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                }`}
              >
                {isAutoRunRequesting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full mr-2" />
                    Preparing...
                  </>
                ) : (
                  <>
                    🤖 Auto Run Preview
                  </>
                )}
              </Button>

              <motion.div animate={buttonPulse}>
                <Button
                  onClick={handleStartQuiz}
                  variant="primary"
                  size="large"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg min-w-[180px] relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10 flex items-center justify-center">
                    Start Quiz 🚀
                  </span>
                </Button>
              </motion.div>
            </div>

            {autoRunLockedMessage && (
              <div className="text-center text-sm text-gray-500 mt-4">
                {autoRunLockedMessage}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="text-center mt-6"
            >
              <p className="text-sm text-gray-500">
                Need help? Contact support or review our{' '}
                <button className="text-blue-600 hover:text-blue-800 underline">
                  quiz guidelines
                </button>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showPersonalitySelector ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={`fixed inset-0 z-50 flex items-center justify-center px-4 ${showPersonalitySelector ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm ${showPersonalitySelector ? '' : 'hidden'}`}
          onClick={() => setShowPersonalitySelector(false)}
        />
        {showPersonalitySelector && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Choose your motivational voice</h3>
                <p className="text-sm text-gray-500">Pick the personality that celebrates you after each quiz.</p>
              </div>
              <button
                onClick={() => setShowPersonalitySelector(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
              {personalities.map((personality) => {
                const isSelected = personality.id === selectedPersonality.id;
                return (
                  <div
                    key={personality.id}
                    className={`border rounded-2xl overflow-hidden transition-all duration-200 bg-white shadow-sm hover:shadow-md ${isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200'}`}
                  >
                    <div className="relative h-44">
                      <img
                        src={personality.previewGif}
                        alt={`${personality.name} preview`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                          Selected
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-blue-500">{personality.title}</p>
                        <p className="text-lg font-semibold text-gray-900">{personality.name}</p>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {personality.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {personality.traits.map((trait) => (
                          <span key={trait} className="text-[11px] uppercase tracking-wide bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                            {trait}
                          </span>
                        ))}
                      </div>
                      <Button
                        onClick={() => {
                          selectPersonality(personality.id);
                          setShowPersonalitySelector(false);
                        }}
                        variant={isSelected ? 'secondary' : 'primary'}
                        size="small"
                        fullWidth
                        className={isSelected ? '' : 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'}
                      >
                        {isSelected ? 'Currently selected' : 'Use this motivator'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default QuizInstructions;
