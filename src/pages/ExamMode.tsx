import React, { useState, useEffect, useCallback } from 'react';
import { X, Clock, CheckCircle } from 'lucide-react';
import Button from '../components/Button';

interface Question {
  id: number;
  text: string;
  type: 'multiple-choice' | 'passage' | 'diagram';
  options: string[];
  correctAnswer: number;
  passage?: string;
  diagram?: string;
  equations?: string[];
  required: boolean;
}

interface ExamModeProps {
  quizTitle?: string;
  totalTime?: number; // in seconds
  questions?: Question[];
  onExamComplete?: (results: any) => void;
  onForceExit?: () => void;
}

const ExamMode: React.FC<ExamModeProps> = ({
  quizTitle = 'Mathematics Final Examination',
  totalTime = 3600, // 1 hour default
  questions = [],
  onExamComplete,
  onForceExit,
}) => {
  // Exam state management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState(totalTime);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Mock questions for demo
  const mockQuestions: Question[] =
    questions.length > 0
      ? questions
      : [
          {
            id: 1,
            text: 'What is the derivative of f(x) = 3x² + 2x - 1?',
            type: 'multiple-choice',
            options: ['6x + 2', '6x² + 2x', '3x + 2', '6x + 1'],
            correctAnswer: 0,
            required: true,
          },
          {
            id: 2,
            text: 'Read the following passage and answer the question below:',
            type: 'passage',
            passage:
              'The Industrial Revolution began in Britain in the late 18th century and marked a major turning point in history. It transformed the way goods were produced, from hand production methods to machines, new chemical manufacturing and iron production processes, improved efficiency of water power, the increasing use of steam power, and the development of machine tools.',
            options: [
              'Late 17th century',
              'Late 18th century',
              'Early 19th century',
              'Mid 18th century',
            ],
            correctAnswer: 1,
            required: true,
          },
          {
            id: 3,
            text: 'Solve the equation: 2x + 5 = 13',
            type: 'multiple-choice',
            equations: ['2x + 5 = 13', '2x = 13 - 5', '2x = 8', 'x = 4'],
            options: ['x = 4', 'x = 9', 'x = 6', 'x = 3'],
            correctAnswer: 0,
            required: true,
          },
        ];

  const totalQuestions = mockQuestions.length;
  const currentQuestion = mockQuestions[currentQuestionIndex];

  // Timer logic with pulsing animation
  useEffect(() => {
    if (examSubmitted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examSubmitted, timeRemaining]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress
  const answeredQuestions = Object.keys(answers).length;
  const requiredQuestions = mockQuestions.filter(q => q.required).length;
  const canSubmit = answeredQuestions >= requiredQuestions || timeRemaining <= 0;

  // Time warning states
  const isTimeWarning = timeRemaining <= 300; // 5 minutes
  const isTimeCritical = timeRemaining <= 60; // 1 minute

  // Handle answer selection
  const handleAnswerSelect = (optionIndex: number) => {
    if (examSubmitted) return;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  // Handle auto submit when time runs out
  const handleAutoSubmit = useCallback(() => {
    if (!examSubmitted) {
      setExamSubmitted(true);
      onExamComplete?.(answers);
    }
  }, [answers, examSubmitted, onExamComplete]);

  // Handle manual submit
  const handleSubmit = () => {
    setShowSubmitConfirm(true);
  };

  const confirmSubmit = () => {
    setExamSubmitted(true);
    setShowSubmitConfirm(false);
    onExamComplete?.(answers);
  };

  // Navigation handlers
  const goToQuestion = (index: number) => {
    if (examSubmitted) return;
    setCurrentQuestionIndex(index);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Prevent browser back/refresh during exam
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!examSubmitted) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handlePopstate = (e: PopStateEvent) => {
      if (!examSubmitted) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopstate);
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopstate);
    };
  }, [examSubmitted]);

  // Option colors
  const optionColors = [
    'bg-blue-50 border-blue-200 hover:bg-blue-100', // A - Light Blue
    'bg-green-50 border-green-200 hover:bg-green-100', // B - Light Green
    'bg-orange-50 border-orange-200 hover:bg-orange-100', // C - Light Orange
    'bg-purple-50 border-purple-200 hover:bg-purple-100', // D - Light Purple
  ];

  const selectedOptionColors = [
    'bg-blue-100 border-blue-400 ring-2 ring-blue-300', // A - Selected Blue
    'bg-green-100 border-green-400 ring-2 ring-green-300', // B - Selected Green
    'bg-orange-100 border-orange-400 ring-2 ring-orange-300', // C - Selected Orange
    'bg-purple-100 border-purple-400 ring-2 ring-purple-300', // D - Selected Purple
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#F7F9FB' }}>
      {/* Top Bar - Fixed */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Quiz Title */}
          <div className="text-sm text-gray-500 font-medium">{quizTitle}</div>

          {/* Timer */}
          <div className="flex items-center space-x-2">
            <Clock
              className={`w-5 h-5 ${
                isTimeCritical
                  ? 'text-red-600 animate-pulse'
                  : isTimeWarning
                    ? 'text-orange-500'
                    : 'text-gray-600'
              }`}
            />
            <span
              className={`font-bold text-lg ${
                isTimeCritical
                  ? 'text-red-600 animate-pulse'
                  : isTimeWarning
                    ? 'text-orange-600'
                    : 'text-gray-900'
              }`}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Progress Indicator */}
          <div className="text-sm font-medium text-gray-700">
            Q {currentQuestionIndex + 1}/{totalQuestions}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Question Navigator */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {mockQuestions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  disabled={examSubmitted}
                  className={`
                    w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      currentQuestionIndex === index
                        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                        : answers[mockQuestions[index].id] !== undefined
                          ? 'bg-green-500 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }
                    ${examSubmitted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            {/* Question Number */}
            <div className="text-sm text-gray-500 mb-4">
              Question {currentQuestionIndex + 1} of {totalQuestions}
              {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
            </div>

            {/* Question Text */}
            <h2 className="text-xl font-bold text-gray-900 mb-6">{currentQuestion.text}</h2>

            {/* Passage (if applicable) */}
            {currentQuestion.passage && (
              <div className="bg-gray-50 p-6 rounded-lg mb-6 border-l-4 border-blue-500">
                <div className="text-sm text-gray-600 mb-2 font-medium">Reading Passage:</div>
                <div className="text-gray-800 leading-relaxed">{currentQuestion.passage}</div>
              </div>
            )}

            {/* Equations (if applicable) */}
            {currentQuestion.equations && (
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <div className="text-sm text-gray-600 mb-3 font-medium">Solution Steps:</div>
                <div className="space-y-2">
                  {currentQuestion.equations.map((equation, index) => (
                    <div key={index} className="font-mono text-lg text-gray-800">
                      {equation}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                const isSelected = answers[currentQuestion.id] === index;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={examSubmitted}
                    className={`
                      w-full p-4 rounded-lg border-2 text-left transition-all duration-200
                      ${isSelected ? selectedOptionColors[index] : optionColors[index]}
                      ${
                        examSubmitted
                          ? 'cursor-not-allowed opacity-75'
                          : 'cursor-pointer hover:shadow-md'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${isSelected ? 'bg-white text-gray-800' : 'bg-gray-200 text-gray-600'}
                      `}
                      >
                        {optionLetter}
                      </div>
                      <span className="text-gray-800 font-medium flex-1">{option}</span>
                      {isSelected && <CheckCircle className="w-5 h-5 text-green-600" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0 || examSubmitted}
              variant="outline"
              className="px-6 py-3"
            >
              Previous
            </Button>

            <div className="text-sm text-gray-600">
              {answeredQuestions}/{totalQuestions} answered
            </div>

            <Button
              onClick={nextQuestion}
              disabled={currentQuestionIndex === totalQuestions - 1 || examSubmitted}
              className="px-6 py-3"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 z-50">
        <div className="max-w-6xl mx-auto flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit && timeRemaining > 0}
            className={`
              px-8 py-3 text-lg font-semibold
              ${
                canSubmit || timeRemaining <= 0
                  ? 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {timeRemaining <= 0 ? 'Time Up - Submit' : 'Submit Quiz'}
          </Button>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Submit Exam</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your exam? You have answered {answeredQuestions} out
              of {totalQuestions} questions.
              {timeRemaining > 0 && (
                <span className="block mt-2 text-orange-600">
                  You still have {formatTime(timeRemaining)} remaining.
                </span>
              )}
            </p>
            <div className="flex space-x-3 justify-end">
              <Button
                onClick={() => setShowSubmitConfirm(false)}
                variant="outline"
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmSubmit}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Restrictions Notice (No visible pause/quit buttons) */}
      <div className="sr-only">
        Exam mode active: Navigation locked, no pause available, no quit option
      </div>
    </div>
  );
};

export default ExamMode;
