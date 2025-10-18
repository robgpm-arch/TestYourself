import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import {
  Download,
  Share2,
  Eye,
  Clock,
  TrendingUp,
  Target,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Minus,
  X,
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

export interface AnalyticsData {
  overallScore: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  totalTimeSpent: number;
  averageTimePerQuestion: number;
  performanceComparison: string;
  subjectBreakdown: SubjectPerformance[];
  timeAnalysis: QuestionTime[];
  wrongQuestions: WrongQuestion[];
}

interface SubjectPerformance {
  subject: string;
  score: number;
  color: string;
}

interface QuestionTime {
  questionNumber: number;
  timeSpent: number;
}

interface WrongQuestion {
  questionNumber: number;
  question: string;
  yourAnswer: string;
  correctAnswer: string;
  subject: string;
  explanation: string;
}

interface DetailedAnalyticsProps {
  analyticsData?: AnalyticsData;
  onDownloadReport?: () => void;
  onShareReport?: () => void;
  onViewWrongAnswers?: () => void;
  onBack?: () => void;
  onContinue?: () => void;
}

const DetailedAnalytics: React.FC<DetailedAnalyticsProps> = ({
  analyticsData,
  onDownloadReport,
  onShareReport,
  onViewWrongAnswers,
  onBack,
  onContinue,
}) => {
  const navigate = useNavigate();
  // Mock data for demonstration
  const data: AnalyticsData = analyticsData || {
    overallScore: 82,
    totalQuestions: 25,
    correctAnswers: 20,
    wrongAnswers: 4,
    skippedQuestions: 1,
    totalTimeSpent: 1248, // seconds
    averageTimePerQuestion: 49.92,
    performanceComparison: 'Above Average',
    subjectBreakdown: [
      { subject: 'Algebra', score: 85, color: '#3B82F6' },
      { subject: 'Physics', score: 78, color: '#10B981' },
      { subject: 'General Knowledge', score: 90, color: '#F59E0B' },
      { subject: 'History', score: 65, color: '#EF4444' },
      { subject: 'Geography', score: 88, color: '#8B5CF6' },
    ],
    timeAnalysis: [
      { questionNumber: 1, timeSpent: 45 },
      { questionNumber: 2, timeSpent: 32 },
      { questionNumber: 3, timeSpent: 67 },
      { questionNumber: 4, timeSpent: 41 },
      { questionNumber: 5, timeSpent: 55 },
      { questionNumber: 6, timeSpent: 38 },
      { questionNumber: 7, timeSpent: 72 },
      { questionNumber: 8, timeSpent: 29 },
      { questionNumber: 9, timeSpent: 58 },
      { questionNumber: 10, timeSpent: 44 },
    ],
    wrongQuestions: [
      {
        questionNumber: 3,
        question: 'What is the capital of Australia?',
        yourAnswer: 'Sydney',
        correctAnswer: 'Canberra',
        subject: 'Geography',
        explanation: 'While Sydney is the largest city, Canberra is the capital city of Australia.',
      },
      {
        questionNumber: 7,
        question: "Who wrote '1984'?",
        yourAnswer: 'Aldous Huxley',
        correctAnswer: 'George Orwell',
        subject: 'Literature',
        explanation: "George Orwell wrote '1984', while Aldous Huxley wrote 'Brave New World'.",
      },
      {
        questionNumber: 12,
        question: 'What is the derivative of x²?',
        yourAnswer: 'x',
        correctAnswer: '2x',
        subject: 'Mathematics',
        explanation: 'Using the power rule: d/dx(x²) = 2x¹ = 2x',
      },
      {
        questionNumber: 18,
        question: 'What year did World War II end?',
        yourAnswer: '1944',
        correctAnswer: '1945',
        subject: 'History',
        explanation: 'World War II ended in 1945 with the surrender of Japan in September.',
      },
    ],
  };

  const [animatedScore, setAnimatedScore] = useState(0);
  const [showWrongAnswers, setShowWrongAnswers] = useState(false);
  const hasWrongAnswers = data.wrongQuestions.length > 0;
  const progressControls = useAnimation();

  useEffect(() => {
    if (!hasWrongAnswers) {
      setShowWrongAnswers(false);
    }
  }, [hasWrongAnswers]);

  // Animate score counter
  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setAnimatedScore(prev => {
          if (prev >= data.overallScore) {
            clearInterval(interval);
            return data.overallScore;
          }
          return prev + 1;
        });
      }, 20);
    }, 500);

    return () => clearTimeout(timer);
  }, [data.overallScore]);

  // Animate progress rings
  useEffect(() => {
    progressControls.start({
      pathLength: data.overallScore / 100,
      transition: { duration: 2, delay: 0.5 },
    });
  }, [data.overallScore, progressControls]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get performance color
  const getPerformanceColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-6xl">📊</div>
          <div className="absolute top-20 right-20 text-4xl">📈</div>
          <div className="absolute bottom-20 left-20 text-5xl">🎯</div>
          <div className="absolute bottom-10 right-10 text-4xl">⏱️</div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {onBack && (
            <div className="mb-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="bg-white/80 hover:bg-white text-teal-700 border-transparent shadow"
              >
                ← Back to results
              </Button>
            </div>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Performance Report</h1>
            <p className="text-gray-600">Detailed insights into your quiz performance</p>
          </motion.div>

          {/* Score Summary Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <Card className="p-8 text-center bg-gradient-to-r from-teal-500 to-blue-600 text-white">
              <div className="flex flex-col items-center">
                {/* Circular Progress */}
                <div className="relative w-32 h-32 mb-4">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-white/20"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-white"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      animate={progressControls}
                      initial={{ pathLength: 0 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{animatedScore}%</span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-2">{data.performanceComparison}</h2>
                <p className="text-white/90">
                  {data.correctAnswers} out of {data.totalQuestions} questions correct
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {/* Correct Answers */}
            <Card className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{data.correctAnswers}</div>
              <div className="text-gray-600">Correct</div>
            </Card>

            {/* Wrong Answers */}
            <Card className="p-6 text-center">
              <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{data.wrongAnswers}</div>
              <div className="text-gray-600">Wrong</div>
            </Card>

            {/* Skipped */}
            <Card className="p-6 text-center">
              <Minus className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-600">{data.skippedQuestions}</div>
              <div className="text-gray-600">Skipped</div>
            </Card>

            {/* Time */}
            <Card className="p-6 text-center">
              <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(data.totalTimeSpent)}
              </div>
              <div className="text-gray-600">Total Time</div>
            </Card>
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Accuracy Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-teal-600" />
                  Accuracy Breakdown
                </h3>

                {/* Pie Chart Visualization */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-48 h-48">
                    <svg className="w-48 h-48 transform -rotate-90">
                      {/* Correct - Green */}
                      <motion.circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="#10B981"
                        strokeWidth="16"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 80}`}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: data.correctAnswers / data.totalQuestions }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                      />
                      {/* Wrong - Red */}
                      <motion.circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="#EF4444"
                        strokeWidth="16"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 80}`}
                        strokeDashoffset={`${-2 * Math.PI * 80 * (data.correctAnswers / data.totalQuestions)}`}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: data.wrongAnswers / data.totalQuestions }}
                        transition={{ duration: 1.5, delay: 1 }}
                      />
                      {/* Skipped - Gray */}
                      <motion.circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="#9CA3AF"
                        strokeWidth="16"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 80}`}
                        strokeDashoffset={`${-2 * Math.PI * 80 * ((data.correctAnswers + data.wrongAnswers) / data.totalQuestions)}`}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: data.skippedQuestions / data.totalQuestions }}
                        transition={{ duration: 1.5, delay: 1.5 }}
                      />
                    </svg>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                      <span>Correct</span>
                    </div>
                    <span className="font-semibold">{data.correctAnswers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                      <span>Wrong</span>
                    </div>
                    <span className="font-semibold">{data.wrongAnswers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
                      <span>Skipped</span>
                    </div>
                    <span className="font-semibold">{data.skippedQuestions}</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Subject Performance */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-teal-600" />
                  Subject Analysis
                </h3>

                <div className="space-y-4">
                  {data.subjectBreakdown.map((subject, index) => (
                    <motion.div
                      key={subject.subject}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{subject.subject}</span>
                        <span className={`font-bold ${getPerformanceColor(subject.score)}`}>
                          {subject.score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                          className="h-3 rounded-full"
                          style={{ backgroundColor: subject.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${subject.score}%` }}
                          transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Time Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-8"
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-teal-600" />
                Time Analysis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Average Time */}
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {Math.round(data.averageTimePerQuestion)}s
                  </div>
                  <div className="text-gray-600">Average per Question</div>
                </div>

                {/* Total Time */}
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <div className="text-2xl font-bold text-teal-600 mb-1">
                    {formatTime(data.totalTimeSpent)}
                  </div>
                  <div className="text-gray-600">Total Time Spent</div>
                </div>
              </div>

              {/* Time per Question Chart */}
              <div className="mt-6">
                <div className="flex items-end space-x-2 h-32">
                  {data.timeAnalysis.slice(0, 10).map((question, index) => {
                    const maxTime = Math.max(...data.timeAnalysis.map(q => q.timeSpent));
                    const height = (question.timeSpent / maxTime) * 100;

                    return (
                      <motion.div
                        key={question.questionNumber}
                        className="flex-1 bg-teal-500 rounded-t"
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.8, delay: 1 + index * 0.1 }}
                        title={`Question ${question.questionNumber}: ${question.timeSpent}s`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  {data.timeAnalysis.slice(0, 10).map(question => (
                    <span key={question.questionNumber}>Q{question.questionNumber}</span>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {onContinue && (
              <Button
                onClick={onContinue}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-semibold"
              >
                Continue to Leaderboard
              </Button>
            )}
            <Button
              onClick={() => {
                if (onDownloadReport) {
                  onDownloadReport();
                  return;
                }
                navigate('/results-celebration', { state: { action: 'download-report' } });
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 font-semibold"
              icon={<Download className="w-5 h-5" />}
            >
              Download Report (PDF)
            </Button>

            <Button
              onClick={() => {
                if (onShareReport) {
                  onShareReport();
                  return;
                }
                const shareData = {
                  title: 'Quiz Performance Report',
                  text: 'Check out my quiz performance on TestYourself!',
                  url: window.location.href,
                };
                if (navigator.share) {
                  navigator.share(shareData).catch(() => {
                    void navigator.clipboard?.writeText(shareData.url);
                  });
                } else {
                  void navigator.clipboard?.writeText(shareData.url);
                }
              }}
              variant="outline"
              className="border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-3 font-semibold"
              icon={<Share2 className="w-5 h-5" />}
            >
              Share Report
            </Button>

            <Button
              onClick={() => {
                if (!hasWrongAnswers) return;
                setShowWrongAnswers(true);
                onViewWrongAnswers?.();
              }}
              disabled={!hasWrongAnswers}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 font-semibold disabled:bg-red-300 disabled:hover:bg-red-300"
              icon={<AlertCircle className="w-5 h-5" />}
            >
              {hasWrongAnswers ? 'Review Wrong Answers' : 'No Wrong Answers'}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center"
          >
            <Button variant="ghost" onClick={() => navigate('/')}>
              Home
            </Button>
            <Button variant="ghost" onClick={() => navigate('/chapter-sets')}>
              Quizzes
            </Button>
            <Button variant="ghost" onClick={() => navigate('/leaderboards')}>
              Leaderboard
            </Button>
          </motion.div>
        </div>

        {/* Wrong Answers Modal */}
        {showWrongAnswers && hasWrongAnswers && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <AlertCircle className="w-6 h-6 mr-2 text-red-600" />
                    Review Wrong Answers
                  </h2>
                  <button
                    onClick={() => setShowWrongAnswers(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {data.wrongQuestions.map((question, index) => (
                    <motion.div
                      key={question.questionNumber}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-red-200 rounded-lg p-6 bg-red-50"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Question {question.questionNumber}
                        </h3>
                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                          {question.subject}
                        </span>
                      </div>

                      <p className="text-gray-800 mb-4 font-medium">{question.question}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-red-100 border border-red-300 rounded p-3">
                          <div className="text-sm font-semibold text-red-700 mb-1">
                            Your Answer:
                          </div>
                          <div className="text-red-800">{question.yourAnswer}</div>
                        </div>

                        <div className="bg-green-100 border border-green-300 rounded p-3">
                          <div className="text-sm font-semibold text-green-700 mb-1">
                            Correct Answer:
                          </div>
                          <div className="text-green-800">{question.correctAnswer}</div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <div className="text-sm font-semibold text-blue-700 mb-1">Explanation:</div>
                        <div className="text-blue-800">{question.explanation}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button
                    onClick={() => setShowWrongAnswers(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DetailedAnalytics;
