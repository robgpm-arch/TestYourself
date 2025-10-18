import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import SplashScreen from "./pages/SplashScreen";
import OnboardingTutorial from "./pages/OnboardingTutorial";
import Login from "./screens/Login";
import Register from "./pages/auth/Register";
import MediumPicker from "./pages/MediumPicker";
import BoardExamSelector from "./pages/BoardExamSelector";
import ClassCourseSelector from "./pages/ClassCourseSelector";
import SubjectSelector from "./pages/SubjectSelector";
import ChapterSelection, { ChapterSelectionItem } from "./pages/ChapterSelection";
import ComingSoon, { ComingSoonState } from "./pages/ComingSoon";
import LoginSignup from "./pages/LoginSignup";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AdminPanel from "./pages/AdminPanel";
import AdminDashboard from "./pages/AdminDashboard";
import AdminFileManager from "./pages/AdminFileManager";
import AdminLogin from "./pages/AdminLogin";
import { RequireAdmin, Guarded } from "./routes/guards.tsx";
import { getUserState, routeAfterLoginOrRegister } from "./routes/guards.ts";

// put near the top of App.tsx
async function routeAfterUserAuth(navigate: ReturnType<typeof useNavigate>) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return; // caller decides what to do if not signed in

  const snap = await getDoc(doc(db, 'users', user.uid));
  const onboarded = snap.exists() && snap.data()?.onboarded === true;

  navigate(onboarded ? '/profile' : '/onboarding', { replace: true });
}
import QuizThemesList from "./pages/admin/QuizThemesList";
import QuizThemeEditor from "./pages/admin/QuizThemeEditor";
import ScreenThemesList from "./pages/admin/ScreenThemesList";
import ScreenThemeEditor from "./pages/admin/ScreenThemeEditor";
import SyllabusBrowser from "./pages/SyllabusBrowser";
import QuizInstructions from "./pages/QuizInstructions";
import QuizAutoRun from "./pages/QuizAutoRun";
import ThemePicker from "./pages/ThemePicker";
import MotivationalHub from "./pages/MotivationalHub";
import DailyChallenges from "./pages/DailyChallenges";
import FriendsSocial from "./pages/FriendsSocial";
import QuizPlayer, { QuizCompletionResult } from "./pages/QuizPlayer";
import ChatMessaging from "./pages/ChatMessaging";
import MultiplayerLobby from "./pages/MultiplayerLobby";
import MultiplayerBattle from "./pages/MultiplayerBattle";
import ChallengeResult from "./pages/ChallengeResult";
import InviteFriends from "./pages/InviteFriends";
import QuizPlayerNumerical from "./pages/QuizPlayerNumerical";
import QuizPlayerComprehension from "./pages/QuizPlayerComprehension";
import ExamMode from "./pages/ExamMode";
import ResultsCelebration from "./pages/ResultsCelebration";
import DetailedAnalytics, { AnalyticsData } from "./pages/DetailedAnalytics";
import Leaderboards from "./pages/Leaderboards";
import ChapterSets, { ChapterInfo, QuizSet, MCQQuestion } from "./pages/ChapterSets";
import AchievementCelebration from "./pages/AchievementCelebration";
import ChangeCourse from "./pages/ChangeCourse";
import SeoHead from "./components/SeoHead";
import { watchDeviceClaim } from "./lib/sessionBinding";

const DEFAULT_THEME = 'classic';


interface AdminRedirectorProps {
  target: string | null;
  clear: () => void;
}

const AdminRedirector: React.FC<AdminRedirectorProps> = ({ target, clear }) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (target) {
      if (isAdmin) {
        navigate(target, { replace: true });
      }
      clear();
    }
  }, [target, isAdmin, navigate, clear]);

  return null;
};

const subjectChapterDefaults: Record<string, ChapterInfo> = {
  mathematics: { subject: 'Mathematics', chapter: 'Algebra Fundamentals', chapterNumber: 1 },
  science: { subject: 'Science', chapter: 'Scientific Foundations', chapterNumber: 1 },
  history: { subject: 'History', chapter: 'World History Overview', chapterNumber: 1 },
  geography: { subject: 'Geography', chapter: 'Earth Systems Basics', chapterNumber: 1 },
  english: { subject: 'English', chapter: 'Language Essentials', chapterNumber: 1 },
  'general-knowledge': { subject: 'General Knowledge', chapter: 'Trivia Kickoff', chapterNumber: 1 },
  reasoning: { subject: 'Reasoning', chapter: 'Logic Building Blocks', chapterNumber: 1 },
  'current-affairs': { subject: 'Current Affairs', chapter: 'Recent Events Overview', chapterNumber: 1 },
};

const COMING_SOON_SUBJECTS: Record<string, ComingSoonState> = {
  reasoning: {
    eta: 'Late October',
    features: ['Logic Drills', 'Pattern Quizzes', 'Timed Rounds'],
  },
  'current-affairs': {
    eta: 'Weekly drops',
    features: ['Daily Capsules', 'Instant Quizzes', 'Mock Press Tests'],
  },
  'general-knowledge': {
    eta: 'Early November',
    features: ['Topic Capsules', 'Lightning Quizzes', 'Leader Challenges'],
  },
};

const formatSubjectName = (subjectId: string) => {
  if (!subjectId) {
    return subjectChapterDefaults.mathematics.subject;
  }

  return subjectId
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const getInitialChapterInfo = (subjectId: string): ChapterInfo => {
  if (!subjectId) {
    return subjectChapterDefaults.mathematics;
  }

  return (
    subjectChapterDefaults[subjectId] ?? {
      subject: formatSubjectName(subjectId),
      chapter: 'Chapter 1',
      chapterNumber: 1,
    }
  );
};

const formatSelectionLabel = (value: string) => {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map(part => (part.length <= 3 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ');
};

const SUBJECT_CHAPTERS: Record<string, ChapterSelectionItem[]> = {
  mathematics: [
    {
      id: 'algebra-basics',
      title: 'Algebra Fundamentals',
      description: 'Linear equations, expressions and problem solving essentials.',
      duration: '20 min',
      difficulty: 'easy',
      number: 1
    },
    {
      id: 'geometry-angles',
      title: 'Geometry & Angles',
      description: 'Triangles, similarity and angle chasing challenges.',
      duration: '25 min',
      difficulty: 'medium',
      number: 2
    },
    {
      id: 'calculus-starters',
      title: 'Calculus Kickoff',
      description: 'Limits, derivatives and interpreting graphs quickly.',
      duration: '30 min',
      difficulty: 'hard',
      number: 3
    }
  ],
  science: [
    {
      id: 'physics-motion',
      title: 'Motion & Forces',
      description: 'Kinematics recap with real-world application questions.',
      duration: '18 min',
      difficulty: 'easy',
      number: 1
    },
    {
      id: 'chemistry-reactions',
      title: 'Chemical Reactions',
      description: 'Balancing equations, rate of reaction and practical tips.',
      duration: '24 min',
      difficulty: 'medium',
      number: 2
    },
    {
      id: 'biology-cell',
      title: 'Cell Systems',
      description: 'Cell organelles, genetics and diagrams practice.',
      duration: '26 min',
      difficulty: 'medium',
      number: 3
    }
  ],
  history: [
    {
      id: 'ancient-civs',
      title: 'Ancient Civilizations',
      description: 'Mesopotamia, Indus Valley and Egyptian highlights.',
      duration: '15 min',
      difficulty: 'easy',
      number: 1
    },
    {
      id: 'medieval-india',
      title: 'Medieval India',
      description: 'Important dynasties and cultural transformations.',
      duration: '22 min',
      difficulty: 'medium',
      number: 2
    },
    {
      id: 'world-war',
      title: 'World Wars',
      description: 'Key events, timelines and consequences of WWI & WWII.',
      duration: '28 min',
      difficulty: 'hard',
      number: 3
    }
  ],
  geography: [
    {
      id: 'physical-geography',
      title: 'Physical Geography',
      description: 'Landforms, plate tectonics and earth processes.',
      duration: '20 min',
      difficulty: 'medium',
      number: 1
    },
    {
      id: 'climate-zones',
      title: 'Climate Zones',
      description: 'Weather patterns, monsoons and climate graphs.',
      duration: '18 min',
      difficulty: 'easy',
      number: 2
    },
    {
      id: 'maps-and-gis',
      title: 'Maps & GIS',
      description: 'Topographic maps, GIS basics and coordinate practice.',
      duration: '25 min',
      difficulty: 'medium',
      number: 3
    }
  ],
  english: [
    {
      id: 'grammar-essentials',
      title: 'Grammar Essentials',
      description: 'Tenses, subject-verb agreement and sentence correction.',
      duration: '17 min',
      difficulty: 'easy',
      number: 1
    },
    {
      id: 'reading-comprehension',
      title: 'Reading Comprehension',
      description: 'Passage analysis, inference and vocabulary in context.',
      duration: '23 min',
      difficulty: 'medium',
      number: 2
    },
    {
      id: 'writing-skills',
      title: 'Writing Skills',
      description: 'Essay structure, creative prompts and summarising tips.',
      duration: '28 min',
      difficulty: 'medium',
      number: 3
    }
  ]
};

const fallbackChapters: ChapterSelectionItem[] = [
  {
    id: 'chapter-1',
    title: 'Chapter 1',
    description: 'Warm-up concepts to ease into the subject.',
    duration: '15 min',
    difficulty: 'easy',
    number: 1
  },
  {
    id: 'chapter-2',
    title: 'Chapter 2',
    description: 'Practice questions with increasing challenge.',
    duration: '20 min',
    difficulty: 'medium',
    number: 2
  },
  {
    id: 'chapter-3',
    title: 'Chapter 3',
    description: 'Advanced drills for mastery and speed.',
    duration: '25 min',
    difficulty: 'hard',
    number: 3
  }
];

type FlowStage =
  | 'none'
  | 'splash'
  | 'login'
  | 'register'
  | 'onboarding'
  | 'mediumPicker'
  | 'boardExamSelector'
  | 'classCourseSelector'
  | 'subjectSelector'
  | 'chapterSelection'
  | 'chapterSets'
  | 'comingSoon'
  | 'quizInstructions'
  | 'autoRun'
  | 'themePickerFlow'
  | 'quizPlayer'
  | 'results';

function App() {
  const location = useLocation();

  const determineInitialFlowStage = (): FlowStage => {
    if (process.env.NODE_ENV !== 'production' && localStorage.getItem('demo_authenticated') === 'true') {
      return 'none';
    }

    if (process.env.NODE_ENV !== 'production' && localStorage.getItem('test_show_login') === 'true') {
      return 'login';
    }

    return 'splash';
  };

  // Check for demo authentication from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(
    process.env.NODE_ENV !== 'production' && localStorage.getItem('demo_authenticated') === 'true'
  );
  const [flowStage, setFlowStage] = useState<FlowStage>(determineInitialFlowStage);
  const [hasShownSplash, setHasShownSplash] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const didRouteRef = useRef(false);
  const navigate = useNavigate();

  // keep this; used by AdminRedirector
  const [postAuthRedirect, setPostAuthRedirect] = useState<string | null>(
    () => (localStorage.getItem('admin_authenticated') === 'true' ? '/admin/dashboard' : null)
  );


  // Control whether to show splash or app shell
  const showShell = flowStage !== 'splash';

  useEffect(() => {
    if (flowStage === 'splash') {
      setHasShownSplash(true);
    }
  }, [flowStage]);

  // Mount device claim watcher once
  useEffect(() => {
    const unsubscribe = watchDeviceClaim();
    return unsubscribe;
  }, []);


  useEffect(() => {
    if (!hasShownSplash || !userInteracted) return;

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return; // don't auto-redirect when signed out
      if (flowStage === 'splash') return; // don't redirect while splash is visible

      // --- AUTH INTENT LOCK: do not auto-redirect while on /register or /login or in flow mode ---
      const path = location?.pathname || '';
      const intent = localStorage.getItem('auth_intent'); // 'register' | 'login' | null
      const inFlowMode = flowStage === 'register' || flowStage === 'login';
      if (inFlowMode ||
          (path === '/register' && intent === 'register') ||
          (path === '/login' && intent === 'login')) {
        // stay on the page until the screen completes the flow
        return;
      }

      // If user came from the Admin button and they ARE admin -> push to admin
      if (postAuthRedirect) {
        try {
          const tokenResult = await user.getIdTokenResult(true);
          const isAdmin = !!tokenResult.claims?.admin;
          if (isAdmin) {
            setIsAuthenticated(true);
            setFlowStage('none');
            navigate(postAuthRedirect, { replace: true });
            return;
          }
        } catch (e) {
          // fallback -> onboard
          navigate('/onboarding', { replace: true });
        }
      }

      // Normal user flow (and admins who did NOT use the admin button)
      await routeAfterUserAuth(navigate);
      setIsAuthenticated(true);
      setFlowStage('none');
    });

    return unsubscribe;
  }, [hasShownSplash, userInteracted, navigate, postAuthRedirect, flowStage, location]);
  const [selectedMedium, setSelectedMedium] = useState('');
  const [selectedBoardExam, setSelectedBoardExam] = useState('');
  const [selectedClassCourse, setSelectedClassCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapterInfo, setSelectedChapterInfo] = useState<ChapterInfo | null>(null);
  const [comingSoonSubject, setComingSoonSubject] = useState<ComingSoonState | null>(null);
  const [activeQuizSession, setActiveQuizSession] = useState<{
    set: QuizSet;
    questions: MCQQuestion[];
    chapterInfo: ChapterInfo;
  } | null>(null);
  const [isSubscriber, setIsSubscriber] = useState<boolean>(
    process.env.NODE_ENV !== 'production' && localStorage.getItem('demo_subscriber') === 'true'
  );
  const [selectedTheme, setSelectedTheme] = useState(
    localStorage.getItem('quiz_theme') ?? DEFAULT_THEME
  );
  const [quizResult, setQuizResult] = useState<QuizCompletionResult | null>(null);
  const [quizRunId, setQuizRunId] = useState(0);
  const { isAdmin } = useAuth();
  const [resultsSubView, setResultsSubView] = useState<'results' | 'analytics' | 'leaderboard'>('results');

  const analyticsData = useMemo<AnalyticsData | undefined>(() => {
    if (!quizResult) {
      return undefined;
    }

    const sessionData = quizResult.session ?? activeQuizSession ?? undefined;
    const questions = sessionData?.questions ?? activeQuizSession?.questions ?? [];
    const totalQuestions = quizResult.totalQuestions || questions.length;

    const questionEntries = questions.map((question, index) => {
      const id = question.id != null ? question.id.toString() : `question-${index + 1}`;
      const correctIndex = Number(question.correctAnswer);

      return {
        id,
        index: index + 1,
        text: question.question,
        options: question.options ?? [],
        correctIndex: Number.isFinite(correctIndex) ? correctIndex : 0,
        explanation: question.explanation,
        difficulty: question.difficulty ?? 'Overall'
      };
    });

    const answerMap = new Map(quizResult.answers.map(answer => [answer.questionId, answer]));

    const answered = quizResult.answers.filter(answer => answer.selectedOption);
    const correctAnswers = quizResult.correctCount;
    const wrongAnswers = Math.max(answered.length - correctAnswers, 0);
    const skippedQuestions = Math.max(totalQuestions - answered.length, 0);
    const totalTimeSpent = quizResult.timeSpent ?? 0;
    const averageTimePerQuestion = totalQuestions > 0 ? totalTimeSpent / totalQuestions : 0;

    const formatOption = (entryOptions: string[], index: number | undefined, fallback: string) => {
      if (index === undefined || Number.isNaN(index) || index < 0) {
        return fallback;
      }

      const letter = String.fromCharCode(65 + index);
      const optionText = entryOptions[index];
      if (!optionText) {
        return `${letter}. ${fallback}`;
      }

      return `${letter}. ${optionText}`;
    };

    const difficultyStats = new Map<string, { correct: number; total: number }>();
    const wrongQuestions: AnalyticsData['wrongQuestions'] = [];

    questionEntries.forEach(entry => {
      const answer = answerMap.get(entry.id);
      const selectedIndex = answer && answer.selectedOption !== '' ? Number(answer.selectedOption) : undefined;
      const hasSelection = selectedIndex !== undefined && !Number.isNaN(selectedIndex) && selectedIndex >= 0;
      const isCorrect = hasSelection && selectedIndex === entry.correctIndex;

      const difficultyKey = entry.difficulty ?? 'Overall';
      const stats = difficultyStats.get(difficultyKey) ?? { correct: 0, total: 0 };
      stats.total += 1;
      if (isCorrect) {
        stats.correct += 1;
      }
      difficultyStats.set(difficultyKey, stats);

      if (hasSelection && !isCorrect) {
        wrongQuestions.push({
          questionNumber: entry.index,
          question: entry.text,
          yourAnswer: formatOption(entry.options, selectedIndex, 'No answer selected'),
          correctAnswer: formatOption(entry.options, entry.correctIndex, 'Answer unavailable'),
          subject: sessionData?.chapterInfo?.subject ?? 'Quiz',
          explanation: entry.explanation ?? 'Explanation not available.'
        });
      }
    });

    wrongQuestions.sort((a, b) => a.questionNumber - b.questionNumber);

    const palette = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];
    const subjectLabel = sessionData?.chapterInfo?.subject ?? 'Overall Performance';

    const subjectBreakdown: AnalyticsData['subjectBreakdown'] = [
      {
        subject: subjectLabel,
        score: Math.round(quizResult.scorePercentage),
        color: palette[0]
      }
    ];

    let colorIndex = 1;
    difficultyStats.forEach((stats, key) => {
      if (key === 'Overall') return;
      const score = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      subjectBreakdown.push({
        subject: key.charAt(0).toUpperCase() + key.slice(1),
        score,
        color: palette[colorIndex % palette.length]
      });
      colorIndex += 1;
    });

    const fallbackTime = totalQuestions > 0 ? totalTimeSpent / totalQuestions : 0;
    const timeAnalysis: AnalyticsData['timeAnalysis'] = questionEntries.map(entry => {
      const answer = answerMap.get(entry.id);
      const rawTime = answer && answer.timeSpent > 0 ? answer.timeSpent : fallbackTime;
      return {
        questionNumber: entry.index,
        timeSpent: Math.max(0, Math.round(rawTime))
      };
    });

    const getPerformanceComparison = (score: number) => {
      if (score >= 90) return 'Outstanding Performance';
      if (score >= 75) return 'Great Job';
      if (score >= 60) return 'Keep Improving';
      return 'Needs Attention';
    };

    return {
      overallScore: Math.round(quizResult.scorePercentage),
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      skippedQuestions,
      totalTimeSpent,
      averageTimePerQuestion,
      performanceComparison: getPerformanceComparison(quizResult.scorePercentage),
      subjectBreakdown,
      timeAnalysis,
      wrongQuestions
    };
  }, [quizResult, activeQuizSession]);

  const handleLogin = () => {
    if (process.env.NODE_ENV !== 'production') {
      localStorage.removeItem('test_show_login');
      localStorage.setItem('demo_authenticated', 'true');
    }
    setIsAuthenticated(process.env.NODE_ENV !== 'production');
    setFlowStage('none');
  };

  const handleAdminAuthenticated = () => {
    setUserInteracted(true);
    if (process.env.NODE_ENV !== 'production') {
      localStorage.setItem('demo_authenticated', 'true');
      localStorage.setItem('admin_authenticated', 'true');
    }
    setIsAuthenticated(process.env.NODE_ENV !== 'production');
    setFlowStage('none');
    setPostAuthRedirect('/admin/dashboard');
  };

  const handleLogout = () => {
    if (process.env.NODE_ENV !== 'production') {
      localStorage.removeItem('demo_authenticated');
      localStorage.removeItem('admin_authenticated');
    }
    setIsAuthenticated(false);
    setFlowStage('login');
  };


  const handleGetStarted = () => {
    setUserInteracted(true);
    navigate('/welcome', { replace: true });
  };

  // ==== Splash button handlers ====

  // Admin button -> navigate to admin login
  const handleAdminFromSplash = () => {
    setUserInteracted(true);
    navigate('/admin/login');
  };

  // Register -> show register screen
  const handleRegisterFromSplash = () => {
    setUserInteracted(true);
    localStorage.setItem('auth_intent', 'register');
    setFlowStage('register');
  };

  // Login -> if signed-in -> profile, else login screen
  const handleLoginFromSplash = async () => {
    setUserInteracted(true);
    const auth = getAuth();
    if (auth.currentUser) {
      await routeAfterUserAuth(navigate);
      return;
    }
    localStorage.setItem('auth_intent', 'login');
    navigate('/login');
  };

  const handleSignIn = () => {
    setUserInteracted(true);
    if (process.env.NODE_ENV !== 'production') {
      localStorage.setItem('test_show_login', 'true');
    }
    setFlowStage('login');
  };

  const handleOnboardingComplete = () => {
    if (process.env.NODE_ENV !== 'production') {
      localStorage.setItem('onboarding_completed', 'true');
    }
    setFlowStage('mediumPicker');
  };

  const handleMediumSelect = (medium: string) => {
    setSelectedMedium(medium);
    localStorage.setItem('medium_selected', 'true');
    setFlowStage('boardExamSelector');
  };

  const handleBoardExamSelect = (selection: string) => {
    setSelectedBoardExam(selection);
    localStorage.setItem('board_exam_selected', 'true');
    setFlowStage('classCourseSelector');
  };

  const handleClassCourseSelect = (selection: string) => {
    setSelectedClassCourse(selection);
    localStorage.setItem('class_course_selected', 'true');
    setFlowStage('subjectSelector');
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedChapterInfo(null);
    localStorage.setItem('subject_selected', 'true');
    setFlowStage('chapterSelection');
  };

  const handleSubjectComingSoon = (subjectId: string) => {
    const defaults = COMING_SOON_SUBJECTS[subjectId] ?? {};
    const subjectLabel = defaults.subjectName ?? formatSubjectName(subjectId);
    const fallbackCourseLabel =
      (selectedClassCourse ? formatSelectionLabel(selectedClassCourse) : '') ||
      (selectedBoardExam ? formatSelectionLabel(selectedBoardExam) : 'Upcoming course track');
    const courseLabel = defaults.courseOrBoard ?? fallbackCourseLabel;

    setComingSoonSubject({
      ...defaults,
      subjectName: subjectLabel,
      courseOrBoard: courseLabel,
      eta: defaults.eta ?? 'Coming soon',
      features: defaults.features,
      feedbackPath: '/settings?tab=feedback',
    });
    setFlowStage('comingSoon');
  };

  return (
    <>
      <SeoHead />

      {flowStage === 'splash' && (
        <SplashScreen
          onAdmin={handleAdminFromSplash}
          onRegister={handleRegisterFromSplash}
          onLogin={handleLoginFromSplash}
          onUserInteracted={() => setUserInteracted(true)}
        />
      )}

      {/* APP SHELL ONLY (routes) */}
      {showShell && (
        <>
          {flowStage === 'login' && (
            <LoginSignup
              initialTab="login"
              onSuccess={() => routeAfterUserAuth(navigate)}
              onSkip={() => {
                localStorage.removeItem('test_show_login');
                setFlowStage('splash');
              }}
            />
          )}

          {flowStage === 'register' && (
            <Register onSuccess={() => setFlowStage('onboarding')} />
          )}

          {flowStage === 'onboarding' && (
            <OnboardingTutorial onComplete={handleOnboardingComplete} />
          )}

          {flowStage === 'mediumPicker' && (
            <MediumPicker onMediumSelect={handleMediumSelect} />
          )}

          {flowStage === 'boardExamSelector' && (
            <BoardExamSelector onSelection={handleBoardExamSelect} />
          )}

          {flowStage === 'classCourseSelector' && (
            <ClassCourseSelector
              selectedBoardExam={selectedBoardExam}
              onSelection={handleClassCourseSelect}
            />
          )}

          {flowStage === 'subjectSelector' && (
            <SubjectSelector
              onSubjectSelect={handleSubjectSelect}
              comingSoonSubjects={Object.keys(COMING_SOON_SUBJECTS)}
              onSubjectComingSoon={handleSubjectComingSoon}
            />
          )}

          {flowStage === 'comingSoon' && comingSoonSubject && (
            <ComingSoon
              initialState={comingSoonSubject}
              onBack={() => {
                setComingSoonSubject(null);
                setSelectedSubject('');
                setFlowStage('subjectSelector');
              }}
              onBackToCourses={() => {
                setComingSoonSubject(null);
                setSelectedSubject('');
                setFlowStage('classCourseSelector');
              }}
              onSuggestTopics={() => {
                window.location.href = '/settings?tab=feedback';
              }}
              onNotify={() => new Promise<void>((resolve) => setTimeout(resolve, 500))}
            />
          )}

          {flowStage === 'chapterSelection' && selectedSubject && (
            <ChapterSelection
              subjectId={selectedSubject}
              subjectName={formatSubjectName(selectedSubject)}
              chapters={SUBJECT_CHAPTERS[selectedSubject] ?? fallbackChapters}
              onSelect={(chapter) => {
                const chapterInfo: ChapterInfo = {
                  subject: formatSubjectName(selectedSubject),
                  chapter: chapter.title,
                  chapterNumber: chapter.number
                };
                setSelectedChapterInfo(chapterInfo);
                setFlowStage('chapterSets');
              }}
              onBack={() => {
                setSelectedSubject('');
                setSelectedChapterInfo(null);
                setFlowStage('subjectSelector');
              }}
            />
          )}

          {flowStage === 'chapterSets' && (
            <ChapterSets
              initialChapterInfo={selectedChapterInfo ?? getInitialChapterInfo(selectedSubject)}
              onBack={() => {
                setFlowStage('chapterSelection');
              }}
              onSetStart={({ set, questions, chapterInfo }) => {
                setQuizResult(null);
                setActiveQuizSession({ set, questions, chapterInfo });
                setFlowStage('quizInstructions');
              }}
              onContinueToTheme={() => setFlowStage('themePickerFlow')}
            />
          )}

          {flowStage === 'quizInstructions' && activeQuizSession && (
            <QuizInstructions
              session={activeQuizSession}
              isSubscriber={isSubscriber}
              onBack={() => setFlowStage('chapterSets')}
              onStartQuiz={() => {
                setResultsSubView('results');
                setFlowStage('themePickerFlow');
              }}
              onAutoRun={() => {
                setResultsSubView('results');
                setFlowStage('autoRun');
              }}
              onUnlockSubscriber={() => {
                if (process.env.NODE_ENV !== 'production') {
                  localStorage.setItem('demo_subscriber', 'true');
                }
                setIsSubscriber(process.env.NODE_ENV !== 'production');
              }}
            />
          )}

          {flowStage === 'autoRun' && activeQuizSession && (
            <QuizAutoRun
              session={activeQuizSession}
              onExit={() => setFlowStage('quizInstructions')}
              onContinueToQuiz={() => setFlowStage('themePickerFlow')}
              onReplay={() => {
                // no-op placeholder for analytics hook later
              }}
            />
          )}

          {flowStage === 'themePickerFlow' && (
            <ThemePicker
              initialTheme={selectedTheme}
              onBack={() => {
                if (activeQuizSession) {
                  setFlowStage('chapterSets');
                } else {
                  setFlowStage('chapterSets');
                }
              }}
              onApply={(themeId) => {
                setSelectedTheme(themeId);
                localStorage.setItem('quiz_theme', themeId);
                if (activeQuizSession) {
                  setQuizResult(null);
                  setResultsSubView('results');
                  setQuizRunId(prev => prev + 1);
                  setFlowStage('quizPlayer');
                } else {
                  setFlowStage('chapterSets');
                }
              }}
            />
          )}

          {flowStage === 'quizPlayer' && activeQuizSession && (
            <QuizPlayer
              key={quizRunId}
              session={activeQuizSession}
              themeId={selectedTheme}
              onExit={() => {
                setQuizResult(null);
                setResultsSubView('results');
                setActiveQuizSession(null);
                setFlowStage('chapterSets');
              }}
              onComplete={(result) => {
                setQuizResult(result);
                setResultsSubView('results');
                setFlowStage('results');
              }}
            />
          )}

          {flowStage === 'results' && quizResult && resultsSubView === 'results' && (
            <ResultsCelebration
              score={quizResult.scorePercentage}
              totalQuestions={quizResult.totalQuestions}
              correctAnswers={quizResult.correctCount}
              timeSpent={quizResult.timeSpent}
              onReviewAnswers={() => {
                setQuizRunId(prev => prev + 1);
                setResultsSubView('results');
                setFlowStage('quizPlayer');
              }}
              onPlayAgain={() => {
                setQuizRunId(prev => prev + 1);
                setResultsSubView('results');
                setFlowStage('quizPlayer');
              }}
              onBackToHome={() => {
                setQuizResult(null);
                setActiveQuizSession(null);
                setResultsSubView('results');
                setFlowStage('chapterSets');
              }}
              onViewAnalytics={() => setResultsSubView('analytics')}
              onViewLeaderboard={() => setResultsSubView('leaderboard')}
            />
          )}

          {flowStage === 'results' && quizResult && resultsSubView === 'analytics' && (
            <DetailedAnalytics
              analyticsData={analyticsData}
              onBack={() => setResultsSubView('results')}
              onContinue={() => setResultsSubView('leaderboard')}
            />
          )}

          {flowStage === 'results' && quizResult && resultsSubView === 'leaderboard' && (
            <Leaderboards
              onBack={() => setResultsSubView('results')}
              onContinue={() => {
                setFlowStage('none');
                navigate('/profile');
              }}
            />
          )}

          {flowStage === 'none' && (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/onboarding" element={<OnboardingTutorial />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/change-course" element={<ChangeCourse />} />
              <Route path="/home" element={<Guarded><Home /></Guarded>} />
              <Route path="/syllabus" element={<Guarded><SyllabusBrowser /></Guarded>} />
              <Route path="/chapters" element={<Guarded><div>Chapters - Coming Soon</div></Guarded>} />
              <Route path="/sets" element={<Guarded><ChapterSets /></Guarded>} />
              <Route path="/theme" element={<Guarded><ThemePicker /></Guarded>} />
              <Route path="/quiz" element={<Guarded><div>Quiz - Coming Soon</div></Guarded>} />
              <Route path="/results" element={<ResultsCelebration />} />
              <Route path="/leaderboard" element={<Leaderboards />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route element={<RequireAdmin />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>
              <Route path="*" element={<Home />} />
            </Routes>
          )}
        </>
      )}

      {/* Hidden anchor for Firebase reCAPTCHA */}
      <div id="send-otp-anchor" style={{ display: 'none' }} />

      <AdminRedirector
        target={postAuthRedirect}
        clear={() => {
          setPostAuthRedirect(null);
          if (process.env.NODE_ENV !== 'production') {
            localStorage.removeItem('admin_authenticated');
          }
        }}
      />
    </>
  );
}

export default App;
