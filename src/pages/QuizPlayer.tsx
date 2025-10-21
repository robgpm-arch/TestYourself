import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDb, getAuth } from '@/lib/firebaseClient';
import { DatabaseService } from '../services/databaseService';
import { saveUserProfile } from '@/lib/saveProfile';
import Card from '../components/Card';
import Button from '../components/Button';
import { ChapterInfo, MCQQuestion, QuizSet } from './ChapterSets';
import { getQuizTheme } from '../styles/quizThemes';
import { AnalyticsService } from '../services/analyticsService';

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

interface QuizOption {
  id: string;
  text: string;
  letter: 'A' | 'B' | 'C' | 'D';
}

interface FormattedQuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  image?: string;
  explanation?: string;
  correctAnswer: string;
}

interface QuizAnswer {
  questionId: string;
  selectedOption: string;
  isMarkedForReview: boolean;
  timeSpent: number;
}

interface QuizState {
  currentQuestion: number;
  answers: QuizAnswer[];
  timeRemaining: number;
  isCompleted: boolean;
}

export interface QuizCompletionResult {
  title: string;
  correctCount: number;
  totalQuestions: number;
  answeredCount: number;
  timeSpent: number;
  passed: boolean;
  session: QuizPlayerProps['session'];
  answers: QuizAnswer[];
  scorePercentage: number;
}

interface QuizPlayerProps {
  session: {
    set: QuizSet;
    questions: MCQQuestion[];
    chapterInfo: ChapterInfo;
  };
  onExit: () => void;
  onComplete?: (result: QuizCompletionResult) => void;
  themeId?: string;
}

const LETTERS: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

async function recordQuizResult(result: {
  score: number;
  totalQuestions: number;
  timeSec: number;
  courseId?: string;
  subjectId?: string;
  chapterId?: string;
  boardId?: string | null;
  examId?: string | null;
  state?: string | null;
  district?: string | null;
}) {
  const auth = await getAuth();
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const db = await getDb();
  await addDoc(collection(db, 'quiz_results'), {
    uid,
    ...result,
    createdAt: serverTimestamp(),
  });
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ session, onExit, onComplete, themeId }) => {
  const navigate = useNavigate();
  const theme = useMemo(() => getQuizTheme(themeId), [themeId]);
  const themeStyles = theme.quizStyles;
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const quizData = useMemo(() => {
    const totalQuestions = session.questions.length;
    const formattedQuestions: FormattedQuizQuestion[] = session.questions.map(
      (question, index) => ({
        id: question.id?.toString() ?? `question-${index + 1}`,
        text: question.question,
        image: undefined,
        explanation: question.explanation,
        options: (question.options ?? []).slice(0, 4).map((optionText, optionIndex) => ({
          id: optionIndex.toString(),
          text: optionText,
          letter: LETTERS[optionIndex] ?? 'A',
        })),
        correctAnswer: question.correctAnswer?.toString() ?? '0',
      })
    );

    return {
      title: `${session.chapterInfo.subject} – ${session.chapterInfo.chapter} (${session.set.name})`,
      totalQuestions,
      timeLimit: Math.max(totalQuestions * 60, 10 * 60),
      questions: formattedQuestions,
    };
  }, [session]);

  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    answers: [],
    timeRemaining: quizData.timeLimit,
    isCompleted: false,
  });

  useEffect(() => {
    setQuizState({
      currentQuestion: 0,
      answers: [],
      timeRemaining: quizData.timeLimit,
      isCompleted: false,
    });
  }, [quizData.timeLimit, quizData.title]);

  const [showSideNav, setShowSideNav] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (quizState.timeRemaining > 0 && !quizState.isCompleted) {
      const timer = setTimeout(() => {
        setQuizState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (quizState.timeRemaining === 0) {
      handleQuizComplete();
    }
  }, [quizState.timeRemaining, quizState.isCompleted]);

  const currentQuestion = quizData.questions[quizState.currentQuestion];
  const currentAnswer = quizState.answers.find(a => a.questionId === currentQuestion?.id);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionId: string) => {
    setQuizState(prev => {
      const newAnswers = prev.answers.filter(a => a.questionId !== currentQuestion.id);
      newAnswers.push({
        questionId: currentQuestion.id,
        selectedOption: optionId,
        isMarkedForReview: currentAnswer?.isMarkedForReview || false,
        timeSpent: 0,
      });

      return {
        ...prev,
        answers: newAnswers,
      };
    });
  };

  const handleMarkForReview = () => {
    setQuizState(prev => {
      const newAnswers = [...prev.answers];
      const existingIndex = newAnswers.findIndex(a => a.questionId === currentQuestion.id);

      if (existingIndex >= 0) {
        newAnswers[existingIndex].isMarkedForReview = !newAnswers[existingIndex].isMarkedForReview;
      } else {
        newAnswers.push({
          questionId: currentQuestion.id,
          selectedOption: '',
          isMarkedForReview: true,
          timeSpent: 0,
        });
      }

      return {
        ...prev,
        answers: newAnswers,
      };
    });
  };

  const handlePrevious = () => {
    if (quizState.currentQuestion > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1,
      }));
    }
  };

  const handleNext = () => {
    if (quizState.currentQuestion < quizData.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
      }));
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = () => {
    setQuizState(prev => ({ ...prev, isCompleted: true }));
  };

  useEffect(() => {
    if (!quizState.isCompleted) return;

    const answeredCount = quizState.answers.filter(a => a.selectedOption).length;
    const correctCount = quizState.answers.reduce((acc, answer) => {
      const question = quizData.questions.find(q => q.id === answer.questionId);
      if (!question) return acc;
      return question.correctAnswer === answer.selectedOption ? acc + 1 : acc;
    }, 0);

    const timeSpent = Math.max(quizData.timeLimit - quizState.timeRemaining, 0);
    const passed =
      quizData.totalQuestions > 0 ? correctCount / quizData.totalQuestions >= 0.6 : true;
    const scorePercentage =
      quizData.totalQuestions > 0 ? Math.round((correctCount / quizData.totalQuestions) * 100) : 0;

    const completionResult: QuizCompletionResult = {
      title: quizData.title,
      correctCount,
      totalQuestions: quizData.totalQuestions,
      answeredCount,
      timeSpent,
      passed,
      session,
      answers: quizState.answers,
      scorePercentage,
    };

    AnalyticsService.trackQuizComplete(
      session.set?.id?.toString() ?? 'unknown_quiz',
      quizData.title,
      session.chapterInfo.subject,
      correctCount,
      quizData.totalQuestions,
      timeSpent,
      passed
    );

    // Record quiz result for leaderboards
    recordQuizResult({
      score: scorePercentage,
      totalQuestions: quizData.totalQuestions,
      timeSec: timeSpent,
      courseId: session.chapterInfo.subject.toLowerCase(),
      subjectId: session.chapterInfo.chapter.toLowerCase(),
      chapterId: session.set.name.toLowerCase(),
    }).catch(err => console.error('Failed to record quiz result:', err));

    // Update aggregated user stats and per-course progress (best-effort)
    try {
      (async () => {
        try {
          const auth = await getAuth();
          const uid = auth.currentUser?.uid;
          if (!uid) return;

          DatabaseService.updateUserStats(uid, {
            score: scorePercentage,
            totalQuestions: quizData.totalQuestions,
            correctAnswers: correctCount,
            timeSpent,
            subject: session.chapterInfo.subject,
          }).catch((err: any) => console.error('Failed to update user stats:', err));

          // persist a lightweight progress snapshot on the user document
          saveUserProfile({
            lastQuiz: {
              title: quizData.title,
              score: scorePercentage,
              correct: correctCount,
              total: quizData.totalQuestions,
              timeSpent,
              course: session.chapterInfo.subject,
              subject: session.chapterInfo.chapter,
              chapter: session.set.name,
              completedAt: new Date().toISOString(),
            },
            // ensure selected course is stored for profile display
            selectedCourse: session.chapterInfo.subject,
            selectedSubject: session.chapterInfo.chapter,
          }).catch((err: any) => console.error('Failed to save profile progress:', err));
        } catch (err) {
          console.error('Error persisting quiz completion data', err);
        }
      })();
    } catch (e) {
      console.error('Error launching persistence task', e);
    }

    const completionHandler = onCompleteRef.current;

    if (completionHandler) {
      completionHandler(completionResult);
    } else {
      navigate('/results-celebration', {
        state: {
          title: completionResult.title,
          score: correctCount,
          scorePercentage,
          totalQuestions: completionResult.totalQuestions,
          answered: answeredCount,
          correctAnswers: correctCount,
          session,
          answers: quizState.answers,
          timeSpent,
          passed,
        },
      });
    }
  }, [
    navigate,
    quizData,
    quizState.answers,
    quizState.isCompleted,
    quizState.timeRemaining,
    session,
  ]);

  const jumpToQuestion = (questionIndex: number) => {
    setQuizState(prev => ({
      ...prev,
      currentQuestion: questionIndex,
    }));
    setShowSideNav(false);
  };

  const getQuestionStatus = (questionIndex: number) => {
    const question = quizData.questions[questionIndex];
    const answer = quizState.answers.find(a => a.questionId === question.id);

    if (answer?.isMarkedForReview) return 'marked';
    if (answer?.selectedOption) return 'answered';
    return 'unanswered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return themeStyles.nav.answered;
      case 'marked':
        return themeStyles.nav.marked;
      default:
        return themeStyles.nav.unanswered;
    }
  };

  // Calculate progress
  const answeredQuestions = quizState.answers.filter(a => a.selectedOption).length;
  const progressPercentage = quizData.totalQuestions
    ? (answeredQuestions / quizData.totalQuestions) * 100
    : 0;

  return (
    <div className={cx('min-h-screen relative overflow-hidden', themeStyles.root)}>
      {themeStyles.overlay && <div className={themeStyles.overlay} />}

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cx('p-4', themeStyles.topBar)}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Quiz Title */}
            <div className="flex items-center space-x-4">
              <div>
                <h1 className={cx('text-xl font-bold', themeStyles.topBarTitle)}>
                  {quizData.title}
                </h1>
                <p className={cx('text-sm', themeStyles.topBarMeta)}>
                  {quizData.totalQuestions} questions · {Math.floor(quizData.timeLimit / 60)} min
                </p>
              </div>
              <button
                onClick={() => setShowSideNav(!showSideNav)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10"
              >
                ☰
              </button>
            </div>

            <Button
              onClick={onExit}
              variant="outline"
              className={cx('hidden md:inline-flex', themeStyles.buttons.exit)}
            >
              Exit
            </Button>

            {/* Progress and Timer */}
            <div className="flex items-center space-x-6">
              {/* Progress */}
              <div className={cx('text-sm', themeStyles.topBarMeta)}>
                Q {quizState.currentQuestion + 1}/{quizData.totalQuestions}
              </div>

              {/* Timer */}
              <div className="flex items-center space-x-2">
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke={themeStyles.timer.track}
                      strokeWidth="3"
                      fill="none"
                    />
                    <motion.circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke={themeStyles.timer.stroke}
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 16}`}
                      initial={{ strokeDashoffset: 0 }}
                      animate={{
                        strokeDashoffset:
                          (1 - quizState.timeRemaining / quizData.timeLimit) * 2 * Math.PI * 16,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cx('text-xs', themeStyles.timer.icon)}>⏱️</span>
                  </div>
                </div>
                <div className={cx('text-sm font-mono', themeStyles.timer.text)}>
                  {formatTime(quizState.timeRemaining)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Side Navigator - Desktop */}
          <div className="hidden lg:block w-20 p-4">
            <div className="sticky top-4">
              <div className="grid grid-cols-2 gap-2">
                {quizData.questions.map((_, index) => {
                  const status = getQuestionStatus(index);
                  return (
                    <motion.button
                      key={index}
                      onClick={() => jumpToQuestion(index)}
                      className={cx(
                        'w-8 h-8 rounded-full text-xs font-semibold transition-all duration-200',
                        getStatusColor(status),
                        index === quizState.currentQuestion && themeStyles.nav.currentRing
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {index + 1}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Question Area */}
          <div className="flex-1 p-4 pb-24">
            <div className="max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={quizState.currentQuestion}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Question Card */}
                  <Card variant="elevated" className={cx('mb-6', themeStyles.questionCard)}>
                    <div className="p-6">
                      <h2
                        className={cx(
                          'text-xl font-bold mb-4 leading-relaxed',
                          themeStyles.questionText
                        )}
                      >
                        {currentQuestion?.text}
                      </h2>

                      {/* Question Image (if available) */}
                      {currentQuestion?.image && (
                        <div className="mb-6">
                          <img
                            src={currentQuestion.image}
                            alt="Question diagram"
                            className="max-w-full h-auto rounded-lg shadow-md"
                          />
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Options */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {currentQuestion?.options.map(option => {
                      const isSelected = currentAnswer?.selectedOption === option.id;
                      const palette = themeStyles.optionPalette[option.letter];
                      return (
                        <motion.div
                          key={option.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card
                            variant="default"
                            hover={false}
                            className={cx(
                              'cursor-pointer transition-all duration-200 bg-transparent border-transparent shadow-none',
                              themeStyles.optionCard,
                              !isSelected && themeStyles.optionCardHover,
                              isSelected && themeStyles.optionCardSelected
                            )}
                            onClick={() => handleOptionSelect(option.id)}
                          >
                            <div
                              className={cx(
                                themeStyles.optionInnerBase,
                                palette.inner,
                                isSelected && themeStyles.optionInnerSelected,
                                isSelected && palette.innerSelected
                              )}
                            >
                              <div className="flex items-center justify-between gap-3 w-full">
                                <span
                                  className={cx(
                                    themeStyles.optionLetterBase,
                                    palette.letter,
                                    isSelected && themeStyles.optionLetterSelectedBase,
                                    isSelected && palette.letterSelected
                                  )}
                                >
                                  {option.letter}
                                </span>
                                <span className={cx('flex-1 text-left', themeStyles.optionText)}>
                                  {option.text}
                                </span>
                                {isSelected && (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={cx('text-xl', themeStyles.optionSelectedIcon)}
                                  >
                                    ✅
                                  </motion.span>
                                )}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Side Navigator */}
        <AnimatePresence>
          {showSideNav && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowSideNav(false)}
            >
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className={cx('w-80 h-full p-6 overflow-y-auto', themeStyles.mobileNav)}
                onClick={e => e.stopPropagation()}
              >
                <h3 className={cx('text-lg font-semibold mb-4', themeStyles.mobileNavText)}>
                  Questions
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {quizData.questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <button
                        key={index}
                        onClick={() => jumpToQuestion(index)}
                        className={cx(
                          'w-12 h-12 rounded-full text-sm font-semibold transition-all duration-200',
                          getStatusColor(status),
                          index === quizState.currentQuestion && themeStyles.nav.currentRing
                        )}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className={cx('mt-6 space-y-2 text-sm', themeStyles.mobileNavText)}>
                  <div className="flex items-center space-x-2">
                    <div className={cx('w-4 h-4 rounded-full', themeStyles.nav.answered)}></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={cx('w-4 h-4 rounded-full', themeStyles.nav.marked)}></div>
                    <span>Marked for Review</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={cx('w-4 h-4 rounded-full', themeStyles.nav.unanswered)}></div>
                    <span>Not Answered</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cx('fixed bottom-0 left-0 right-0 p-4', themeStyles.footer)}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Previous Button */}
            <Button
              onClick={handlePrevious}
              disabled={quizState.currentQuestion === 0}
              variant="outline"
              className={cx(
                themeStyles.buttons.previous,
                quizState.currentQuestion === 0 && 'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              ← Previous
            </Button>

            {/* Mark for Review */}
            <Button
              onClick={handleMarkForReview}
              variant="secondary"
              className={cx(
                'rounded-full px-6',
                currentAnswer?.isMarkedForReview
                  ? themeStyles.buttons.markActive
                  : themeStyles.buttons.mark
              )}
            >
              {currentAnswer?.isMarkedForReview ? '★ Marked' : '☆ Mark for Review'}
            </Button>

            {/* Next Button */}
            <Button onClick={handleNext} variant="primary" className={themeStyles.buttons.next}>
              {quizState.currentQuestion === quizData.questions.length - 1
                ? 'Finish Quiz'
                : 'Next →'}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 max-w-6xl mx-auto">
            <div className={cx('flex justify-between text-xs mb-1', themeStyles.progress.text)}>
              <span>Progress</span>
              <span>
                {answeredQuestions}/{quizData.totalQuestions} answered
              </span>
            </div>
            <div className={cx('w-full rounded-full h-2', themeStyles.progress.track)}>
              <motion.div
                className={cx('h-2 rounded-full', themeStyles.progress.fillClass)}
                style={
                  themeStyles.progress.fillColor
                    ? { background: themeStyles.progress.fillColor }
                    : undefined
                }
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizPlayer;
