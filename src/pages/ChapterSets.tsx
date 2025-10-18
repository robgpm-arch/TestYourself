import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, PlayIcon, CheckCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';

export interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface AutoRunConfig {
  enabled: boolean;
  readCorrectAnswer?: boolean;
  readExplanation?: boolean;
  delaySeconds?: number;
  voice?: string;
  subscriberOnly?: boolean;
}

export interface QuizSet {
  id: number;
  name: string;
  description: string;
  totalQuestions: number;
  completed: boolean;
  locked: boolean;
  progress: number;
  timeEstimate: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions?: MCQQuestion[];
  autoRunConfig?: AutoRunConfig;
}

export interface ChapterInfo {
  subject: string;
  chapter: string;
  chapterNumber: number;
}

type ChapterSetsProps = {
  onBack?: () => void;
  onSetStart?: (payload: {
    set: QuizSet;
    questions: MCQQuestion[];
    chapterInfo: ChapterInfo;
  }) => void;
  onContinueToTheme?: () => void;
  initialChapterInfo?: ChapterInfo;
};

const ChapterSets: React.FC<ChapterSetsProps> = ({
  onBack,
  onSetStart,
  onContinueToTheme,
  initialChapterInfo,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [chapterInfo, setChapterInfo] = useState<ChapterInfo>(
    initialChapterInfo ?? {
      subject: 'Mathematics',
      chapter: 'Algebra Fundamentals',
      chapterNumber: 1,
    }
  );
  const [sets, setSets] = useState<QuizSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSet, setSelectedSet] = useState<QuizSet | null>(null);

  // Mock data for sets - in real app, this would come from API or local storage
  const mockSets: QuizSet[] = [
    {
      id: 1,
      name: 'SET 1',
      description: 'Basic concepts and fundamental problems',
      totalQuestions: 20,
      completed: false,
      locked: false,
      progress: 0,
      timeEstimate: '15 min',
      difficulty: 'easy',
      autoRunConfig: {
        enabled: true,
        readCorrectAnswer: true,
        delaySeconds: 4,
        subscriberOnly: false,
        voice: 'default'
      }
    },
    {
      id: 2,
      name: 'SET 2',
      description: 'Intermediate level practice problems',
      totalQuestions: 25,
      completed: false,
      locked: false,
      progress: 0,
      timeEstimate: '20 min',
      difficulty: 'medium',
      autoRunConfig: {
        enabled: true,
        readCorrectAnswer: true,
        readExplanation: true,
        delaySeconds: 6,
        subscriberOnly: true,
        voice: 'default'
      }
    },
    {
      id: 3,
      name: 'SET 3',
      description: 'Advanced problems and applications',
      totalQuestions: 30,
      completed: false,
      locked: false,
      progress: 0,
      timeEstimate: '25 min',
      difficulty: 'hard',
      autoRunConfig: {
        enabled: false
      }
    }
  ];

  useEffect(() => {
    // Get chapter info from navigation state or URL params
    if (location.state) {
      setChapterInfo(location.state as ChapterInfo);
    } else if (initialChapterInfo) {
      setChapterInfo(initialChapterInfo);
    }

    // Load sets data
    loadSetsData();
  }, [location, initialChapterInfo]);

  const loadSetsData = async () => {
    setLoading(true);
    
    try {
      // In a real app, this would load from JSON files based on subject/chapter
      // For now, using mock data with simulated loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load progress from localStorage
      const savedProgress = localStorage.getItem(`chapter_${chapterInfo.chapterNumber}_progress`);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        const updatedSets = mockSets.map(set => ({
          ...set,
          completed: progress[set.id]?.completed || false,
          progress: progress[set.id]?.progress || 0
        }));
        setSets(updatedSets);
      } else {
        setSets(mockSets);
      }
    } catch (error) {
      console.error('Error loading sets data:', error);
      setSets(mockSets);
    } finally {
      setLoading(false);
    }
  };

  const loadMCQsFromJSON = async (setId: number): Promise<MCQQuestion[]> => {
    try {
      // In a real app, this would load from actual JSON files
      // File naming convention: /data/mcqs/{subject}/{chapter}/set{setId}.json
      const fileName = `/data/mcqs/${chapterInfo.subject.toLowerCase()}/${chapterInfo.chapter.toLowerCase().replace(/\s+/g, '-')}/set${setId}.json`;
      
      // For demo purposes, return mock data
      const mockQuestions: MCQQuestion[] = Array.from({ length: sets.find(s => s.id === setId)?.totalQuestions || 20 }, (_, index) => ({
        id: index + 1,
        question: `Question ${index + 1}: This is a sample MCQ question for ${chapterInfo.chapter} - Set ${setId}?`,
        options: [
          'Option A: First possible answer',
          'Option B: Second possible answer',
          'Option C: Third possible answer',
          'Option D: Fourth possible answer'
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: `This is the explanation for question ${index + 1} in Set ${setId}.`,
        difficulty: sets.find(s => s.id === setId)?.difficulty || 'medium'
      }));

      return mockQuestions;
    } catch (error) {
      console.error(`Error loading MCQs for set ${setId}:`, error);
      throw error;
    }
  };

  const handleSetSelect = async (set: QuizSet) => {
    if (set.locked) return;

    setSelectedSet(set);

    try {
      // Load MCQs for the selected set
      const questions = await loadMCQsFromJSON(set.id);

      if (onSetStart) {
        onSetStart({
          set,
          questions,
          chapterInfo,
        });
        return;
      }

      // Navigate to quiz player with the loaded questions
      navigate('/quiz-player', {
        state: {
          questions,
          setInfo: {
            ...set,
            chapterInfo,
          },
        },
      });
    } catch (error) {
      console.error('Failed to load quiz questions:', error);
      // Show error message to user
      alert('Failed to load quiz questions. Please try again.');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      {/* Header */}
      <div className="pt-12 pb-6 px-6">
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                navigate(-1);
              }
            }}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </motion.button>

          {onContinueToTheme && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onContinueToTheme}
              className="px-4 py-2 rounded-full bg-white/20 text-white text-sm font-semibold backdrop-blur-sm border border-white/30 shadow-lg"
            >
              Customize Theme
            </motion.button>
          )}
        </div>

        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <h2 className="text-lg text-blue-100 font-medium">{chapterInfo.subject}</h2>
            <h1 className="text-3xl font-bold text-white mb-2">{chapterInfo.chapter}</h1>
            <p className="text-blue-100">Choose a practice set to begin</p>
          </motion.div>
        </div>
      </div>

      {/* Sets Grid */}
      <div className="px-6 pb-32">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : (
            <AnimatePresence>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sets.map((set, index) => (
                  <motion.button
                    key={set.id}
                    type="button"
                    disabled={set.locked}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={set.locked ? {} : { scale: 1.02 }}
                    whileTap={set.locked ? {} : { scale: 0.98 }}
                    onClick={() => handleSetSelect(set)}
                    aria-label={set.locked ? `${set.name} locked` : `Open ${set.name}`}
                    className={`relative bg-white rounded-2xl p-6 shadow-lg text-left transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-200 ${
                      set.locked 
                        ? 'opacity-60 cursor-not-allowed' 
                        : 'hover:shadow-xl cursor-pointer'
                    }`}
                  >
                    {/* Lock Overlay */}
                    {set.locked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/20 rounded-2xl">
                        <LockClosedIcon className="w-12 h-12 text-gray-600" />
                      </div>
                    )}

                    {/* Set Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {set.id}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{set.name}</h3>
                          <p className="text-sm text-gray-500">{set.timeEstimate}</p>
                        </div>
                      </div>
                      
                      {/* Status Icon */}
                      <div className="flex items-center">
                        {set.completed ? (
                          <CheckCircleIcon className="w-8 h-8 text-green-500" />
                        ) : (
                          <PlayIcon className="w-8 h-8 text-blue-500" />
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {set.description}
                    </p>

                    {set.autoRunConfig?.enabled && (
                      <div
                        className={`flex items-center gap-2 text-xs font-semibold mb-3 ${
                          set.autoRunConfig.subscriberOnly ? 'text-purple-600' : 'text-blue-600'
                        }`}
                      >
                        <span>🤖</span>
                        <span>
                          {set.autoRunConfig.subscriberOnly
                            ? 'Auto Run Preview · Subscribers'
                            : 'Auto Run Preview Available'}
                        </span>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{set.totalQuestions}</div>
                          <div className="text-xs text-gray-500">Questions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{set.progress}%</div>
                          <div className="text-xs text-gray-500">Complete</div>
                        </div>
                      </div>
                      
                      {/* Difficulty Badge */}
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getDifficultyColor(set.difficulty)}`}>
                        <span>{getDifficultyIcon(set.difficulty)}</span>
                        <span className="capitalize">{set.difficulty}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${set.progress}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      />
                    </div>

                    {/* Action Status */}
                    <div
                      className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        set.locked
                          ? 'bg-gray-200 text-gray-400'
                          : set.completed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      }`}
                    >
                      {set.locked ? (
                        <>
                          <LockClosedIcon className="w-5 h-5" />
                          <span>Locked</span>
                        </>
                      ) : set.completed ? (
                        <>
                          <CheckCircleIcon className="w-5 h-5" />
                          <span>Review</span>
                        </>
                      ) : (
                        <>
                          <PlayIcon className="w-5 h-5" />
                          <span>Start Practice</span>
                        </>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-8 left-6 right-6 z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-center"
        >
          <div className="flex flex-col items-center gap-3">
            <p className="text-white/80 text-sm">
              Complete sets in order to unlock advanced levels
            </p>
            <div className="flex justify-center gap-2">
              {sets.map((set, index) => (
                <div
                  key={set.id}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    set.completed
                      ? 'bg-green-400'
                      : set.locked
                      ? 'bg-gray-400'
                      : 'bg-blue-400'
                  }`}
                />
              ))}
            </div>
            {onContinueToTheme && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onContinueToTheme}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 text-white font-semibold shadow-lg"
              >
                Next: Theme Picker
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChapterSets;