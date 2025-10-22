import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, CheckCircle, Compass, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  illustration: string;
  bgGradient: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Learn in Your Own Language',
    subtitle: 'Multi-language support',
    description:
      'Access educational content in multiple languages and learn at your own pace, anywhere you are.',
    illustration:
      'https://public.youware.com/users-website-assets/prod/a9adc6a9-2f03-4873-86f9-880d7d00e957/0e3834c9efbd4b1193dcc6f5415a2eff.png',
    bgGradient: 'from-blue-500 via-purple-500 to-indigo-600',
  },
  {
    id: 2,
    title: 'Practice Unlimited Quizzes',
    subtitle: 'Covers boards, exams, courses',
    description:
      'Test your knowledge with comprehensive quizzes designed for various educational levels and subjects.',
    illustration:
      'https://public.youware.com/users-website-assets/prod/a9adc6a9-2f03-4873-86f9-880d7d00e957/d42e531386de401180a96c305b4a2b46.jpg',
    bgGradient: 'from-purple-500 via-pink-500 to-red-500',
  },
  {
    id: 3,
    title: 'Challenge Friends & Win Badges',
    subtitle: 'Gamified learning with streaks & coins',
    description:
      'Compete with friends, earn rewards, and maintain learning streaks to make education fun and engaging.',
    illustration:
      'https://public.youware.com/users-website-assets/prod/a9adc6a9-2f03-4873-86f9-880d7d00e957/2037d45bf553420ca63b19a784fe37ed.jpg',
    bgGradient: 'from-orange-500 via-red-500 to-pink-600',
  },
  {
    id: 4,
    title: 'Track Your Progress',
    subtitle: 'Analytics, reports, certificates',
    description:
      'Monitor your learning journey with detailed analytics, progress reports, and earn certificates for achievements.',
    illustration:
      'https://public.youware.com/users-website-assets/prod/a9adc6a9-2f03-4873-86f9-880d7d00e957/4a464c44067246d89ada532e4315cd54.jpg',
    bgGradient: 'from-teal-500 via-green-500 to-blue-600',
  },
  {
    id: 5,
    title: 'Personalise Your Journey',
    subtitle: 'Pick board, class, time goal',
    description:
      'Choose your preferred board, daily time target, and reminder schedule so the app adapts to you from day one.',
    illustration:
      'https://public.youware.com/users-website-assets/prod/a9adc6a9-2f03-4873-86f9-880d7d00e957/4f1acdaa1a5747b8a3d617f1b3b6df0b.png',
    bgGradient: 'from-cyan-500 via-blue-500 to-purple-500',
  },
];

interface OnboardingTutorialProps {
  onComplete?: () => void;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showGuidance, setShowGuidance] = useState(false);
  const [onboardingPrefs, setOnboardingPrefs] = useState({
    language: 'English',
    board: '',
    dailyGoal: '10 minutes',
  });
  const slidesContainerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedPrefs = localStorage.getItem('onboarding_prefs');
    if (savedPrefs) {
      try {
        setOnboardingPrefs(JSON.parse(savedPrefs));
      } catch (error) {
        console.warn('Failed to parse onboarding prefs', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('onboarding_prefs', JSON.stringify(onboardingPrefs));
  }, [onboardingPrefs]);

  const scrollToSlide = useCallback((index: number) => {
    const target = slidesContainerRef.current?.querySelector<HTMLDivElement>(
      `[data-slide="${index}"]`
    );
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      const next = currentSlide + 1;
      setCurrentSlide(next);
      scrollToSlide(next);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      const prev = currentSlide - 1;
      setCurrentSlide(prev);
      scrollToSlide(prev);
    }
  };

  const skipOnboarding = () => {
    if (onComplete) {
      onComplete();
    } else {
      navigate('/flow/mediumPicker', { replace: true });
    }
  };

  const openGuidance = () => {
    setShowGuidance(true);
  };

  const closeGuidance = () => {
    setShowGuidance(false);
  };

  const getStarted = async () => {
    try {
      const auth = await import('../lib/firebaseClient').then(m => m.getAuth());
      const db = await import('../lib/firebaseClient').then(m => m.getDb());
      const uid = auth.currentUser?.uid;
      if (uid) {
        await setDoc(
          doc(db, 'users', uid),
          { onboarded: true, updatedAt: serverTimestamp() },
          { merge: true }
        );
        navigate('/flow/mediumPicker', { replace: true });
        return;
      }
    } catch (e) {
      // non‑blocking; fall through
    }
    if (onComplete) return onComplete();
    navigate('/flow/mediumPicker', { replace: true });
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    scrollToSlide(index);
  };

  const guidanceItems = [
    {
      icon: <Compass className="w-5 h-5" />,
      title: 'Pick your language',
      description: 'Start by selecting the language you’re most comfortable with.',
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: 'Explore quizzes',
      description: 'Browse chapters or use search to jump into a practice set.',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Track progress',
      description: 'Visit Dashboard → Analytics to review your accuracy, streaks, and badges.',
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: 'Join the community',
      description: 'Challenge friends via Lobby and share invite links to earn bonus coins.',
    },
  ];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      <div className="absolute inset-y-1/2 left-4 z-10 hidden md:flex flex-col gap-2">
        <button
          onClick={() => nextSlide()}
          className="bg-white/15 text-white rounded-full p-2 shadow-lg hover:bg-white/25 transition"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>
        <button
          onClick={() => prevSlide()}
          className="bg-white/15 text-white rounded-full p-2 shadow-lg hover:bg-white/25 transition"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
      <div
        ref={slidesContainerRef}
        className="h-full overflow-y-auto snap-y snap-mandatory"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        <AnimatePresence mode="wait" custom={currentSlide}>
          <motion.div
            key={currentSlide}
            data-slide={currentSlide}
            custom={currentSlide}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                nextSlide();
              } else if (swipe > swipeConfidenceThreshold) {
                prevSlide();
              }
            }}
            className={`min-h-screen flex flex-col items-center justify-center px-6 py-8 bg-gradient-to-br ${slides[currentSlide].bgGradient}`}
          >
            {/* Skip Button */}
            <div className="absolute top-8 right-6 z-10">
              <button
                onClick={skipOnboarding}
                className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                Skip
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto text-center">
              <motion.button
                type="button"
                onClick={openGuidance}
                className="absolute top-8 left-6 text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> How onboarding works
              </motion.button>

              {/* Illustration */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8"
              >
                <img
                  src={slides[currentSlide].illustration}
                  alt={slides[currentSlide].title}
                  className="w-64 h-48 object-contain rounded-lg shadow-lg"
                />
              </motion.div>

              {currentSlide === slides.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="w-full max-w-sm bg-white/10 border border-white/20 rounded-2xl p-4 mb-8 text-left"
                >
                  <h3 className="text-white font-semibold text-sm uppercase tracking-[0.3em] mb-3">
                    Personalise your plan
                  </h3>
                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-white/80 text-sm mb-1 block">Preferred language</span>
                      <select
                        value={onboardingPrefs.language}
                        onChange={event =>
                          setOnboardingPrefs(prev => ({ ...prev, language: event.target.value }))
                        }
                        className="w-full bg-white/15 border border-white/20 text-white rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
                      >
                        <option className="text-slate-900">English</option>
                        <option className="text-slate-900">हिन्दी</option>
                        <option className="text-slate-900">தமிழ்</option>
                        <option className="text-slate-900">తెలుగు</option>
                        <option className="text-slate-900">मराठी</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-white/80 text-sm mb-1 block">Board / Goal</span>
                      <input
                        value={onboardingPrefs.board}
                        onChange={event =>
                          setOnboardingPrefs(prev => ({ ...prev, board: event.target.value }))
                        }
                        placeholder="e.g. CBSE Class 10"
                        className="w-full bg-white/15 border border-white/20 text-white rounded-xl py-2 px-3 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
                      />
                    </label>
                    <label className="block">
                      <span className="text-white/80 text-sm mb-1 block">
                        Daily practice target
                      </span>
                      <select
                        value={onboardingPrefs.dailyGoal}
                        onChange={event =>
                          setOnboardingPrefs(prev => ({ ...prev, dailyGoal: event.target.value }))
                        }
                        className="w-full bg-white/15 border border-white/20 text-white rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
                      >
                        <option className="text-slate-900">10 minutes</option>
                        <option className="text-slate-900">20 minutes</option>
                        <option className="text-slate-900">30 minutes</option>
                        <option className="text-slate-900">45 minutes</option>
                      </select>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Title */}
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight"
              >
                {slides[currentSlide].title}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-white/90 text-lg font-medium mb-4"
              >
                {slides[currentSlide].subtitle}
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-white/80 text-base leading-relaxed max-w-sm"
              >
                {slides[currentSlide].description}
              </motion.p>
            </div>

            {/* Bottom Navigation */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="w-full max-w-md mx-auto"
            >
              {/* Progress Dots */}
              <div className="flex justify-center items-center mb-8 space-x-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'bg-white scale-125'
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                {/* Previous Button */}
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    currentSlide === 0
                      ? 'text-white/50 cursor-not-allowed'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <ChevronLeft size={20} />
                  <span className="font-medium">Back</span>
                </button>

                {/* Next/Get Started Button */}
                {currentSlide === slides.length - 1 ? (
                  <Button
                    onClick={getStarted}
                    className="bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Get Started
                  </Button>
                ) : (
                  <button
                    onClick={nextSlide}
                    className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  >
                    <span>Next</span>
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showGuidance && (
          <motion.div
            className="onboarding-guidance-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="onboarding-guidance-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="onboarding-guidance-header">
                <h2>
                  <Sparkles className="w-5 h-5" />
                  Quick Start Guide
                </h2>
                <button
                  onClick={closeGuidance}
                  className="text-sm font-medium text-cyan-200/80 hover:text-cyan-100 transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="onboarding-guidance-list">
                {guidanceItems.map((item, index) => (
                  <div key={index} className="onboarding-guidance-item">
                    <div className="onboarding-guidance-icon">{item.icon}</div>
                    <div>
                      <h3>{item.title}</h3>
                      <p className="text-sm text-slate-200/80 leading-snug">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="onboarding-guidance-footer">
                <button type="button" onClick={closeGuidance}>
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingTutorial;
