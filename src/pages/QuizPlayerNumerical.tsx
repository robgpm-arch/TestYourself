import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

interface NumericalQuestion {
  id: string;
  text: string;
  formula?: string; // LaTeX formula
  image?: string;
  correctAnswer: number;
  unit?: string;
  tolerance?: number; // Acceptable margin of error
}

interface NumericalAnswer {
  questionId: string;
  value: string;
  unit: string;
  isMarkedForReview: boolean;
  timeSpent: number;
}

interface QuizState {
  currentQuestion: number;
  answers: NumericalAnswer[];
  timeRemaining: number;
  isCompleted: boolean;
}

const QuizPlayerNumerical: React.FC = () => {
  const navigate = useNavigate();

  // Sample numerical quiz data
  const quizData = {
    title: 'JEE – Physics',
    totalQuestions: 25,
    timeLimit: 45 * 60, // 45 minutes in seconds
    questions: [
      {
        id: 'q1',
        text: 'A car accelerates from rest at 3.5 m/s² for 8 seconds. What is the final velocity?',
        formula: 'v = u + at',
        correctAnswer: 28,
        unit: 'm/s',
        tolerance: 0.1,
      },
      {
        id: 'q2',
        text: 'Calculate the kinetic energy of a 2 kg object moving at 10 m/s.',
        formula: 'KE = ½mv²',
        correctAnswer: 100,
        unit: 'J',
        tolerance: 1,
      },
      {
        id: 'q3',
        text: 'Find the resistance of a circuit if voltage is 12V and current is 3A.',
        formula: 'V = IR',
        correctAnswer: 4,
        unit: 'Ω',
        tolerance: 0.01,
      },
      {
        id: 'q4',
        text: 'A pendulum has a length of 1 meter. Calculate its period. (Take g = 9.8 m/s²)',
        formula: 'T = 2π√(L/g)',
        correctAnswer: 2.01,
        unit: 's',
        tolerance: 0.05,
      },
      {
        id: 'q5',
        text: 'Calculate the force required to accelerate a 5 kg mass at 2 m/s².',
        formula: 'F = ma',
        correctAnswer: 10,
        unit: 'N',
        tolerance: 0.1,
      },
    ],
  };

  const availableUnits = [
    'm',
    'cm',
    'mm',
    'km',
    'kg',
    'g',
    'mg',
    's',
    'ms',
    'min',
    'hr',
    'm/s',
    'm/s²',
    'km/h',
    'N',
    'J',
    'W',
    'Pa',
    'A',
    'V',
    'Ω',
    'F',
    '°C',
    '°F',
    'K',
    'mol',
    'rad',
    'Hz',
  ];

  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    answers: [],
    timeRemaining: quizData.timeLimit,
    isCompleted: false,
  });

  const [inputMode, setInputMode] = useState<'text' | 'keypad'>('text');
  const [showKeypad, setShowKeypad] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [isValidInput, setIsValidInput] = useState(true);

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

  // Load existing answer when question changes
  useEffect(() => {
    if (currentAnswer) {
      setInputValue(currentAnswer.value);
      setSelectedUnit(currentAnswer.unit);
    } else {
      setInputValue('');
      setSelectedUnit(currentQuestion?.unit || '');
    }
  }, [quizState.currentQuestion, currentAnswer, currentQuestion?.unit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const validateInput = (value: string) => {
    if (value === '') return true;
    const numValue = parseFloat(value);
    return !isNaN(numValue) && isFinite(numValue);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const isValid = validateInput(value);
    setIsValidInput(isValid);

    // Save answer
    if (isValid) {
      saveAnswer(value, selectedUnit);
    }
  };

  const saveAnswer = (value: string, unit: string) => {
    setQuizState(prev => {
      const newAnswers = prev.answers.filter(a => a.questionId !== currentQuestion.id);
      if (value.trim() !== '') {
        newAnswers.push({
          questionId: currentQuestion.id,
          value: value,
          unit: unit,
          isMarkedForReview: currentAnswer?.isMarkedForReview || false,
          timeSpent: 0,
        });
      }
      return {
        ...prev,
        answers: newAnswers,
      };
    });
  };

  const handleKeypadInput = (key: string) => {
    let newValue = inputValue;

    switch (key) {
      case 'C':
        newValue = '';
        break;
      case '←':
        newValue = inputValue.slice(0, -1);
        break;
      case '.':
        if (!inputValue.includes('.')) {
          newValue = inputValue + '.';
        }
        break;
      case '+':
      case '−':
      case '×':
      case '÷':
        // For now, just treat as regular input (could be enhanced for calculations)
        newValue = inputValue + key;
        break;
      default:
        if (/[0-9]/.test(key)) {
          newValue = inputValue + key;
        }
        break;
    }

    handleInputChange(newValue);
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
          value: inputValue,
          unit: selectedUnit,
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
    console.log('Quiz completed!', quizState.answers);
  };

  // Calculate progress
  const answeredQuestions = quizState.answers.filter(a => a.value.trim() !== '').length;
  const progressPercentage = (answeredQuestions / quizData.totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-indigo-300 to-white relative overflow-hidden">
      {/* Background math symbols pattern */}
      <div
        className="absolute inset-0 opacity-20 text-4xl"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23374151' fill-opacity='0.3'%3E%3Ctext x='10' y='20' font-size='14'%3E➕%3C/text%3E%3Ctext x='35' y='35' font-size='14'%3E➖%3C/text%3E%3Ctext x='15' y='50' font-size='14'%3E✖️%3C/text%3E%3Ctext x='40' y='15' font-size='14'%3E➗%3C/text%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm border-b border-indigo-200 p-4"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">{quizData.title}</h1>

            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-600">
                Q {quizState.currentQuestion + 1}/{quizData.totalQuestions}
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle cx="20" cy="20" r="16" stroke="#fee2e2" strokeWidth="3" fill="none" />
                    <motion.circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke="#ef4444"
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
                    <span className="text-xs text-red-600">⏱️</span>
                  </div>
                </div>
                <div className="text-sm font-mono text-red-600">
                  {formatTime(quizState.timeRemaining)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 p-4 pb-32">
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
                <Card variant="elevated" className="mb-8">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-blue-900 mb-4 leading-relaxed">
                      {currentQuestion?.text}
                    </h2>

                    {/* Formula Display */}
                    {currentQuestion?.formula && (
                      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-4 rounded-r-lg">
                        <p className="text-sm text-gray-600 mb-1">Formula:</p>
                        <p className="font-mono text-lg text-indigo-800">
                          {currentQuestion.formula}
                        </p>
                      </div>
                    )}

                    {/* Question Image */}
                    {currentQuestion?.image && (
                      <div className="mb-4">
                        <img
                          src={currentQuestion.image}
                          alt="Question diagram"
                          className="max-w-full h-auto rounded-lg shadow-md"
                        />
                      </div>
                    )}

                    <p className="text-sm text-gray-600 italic">
                      Enter your answer (integer or decimal)
                    </p>
                  </div>
                </Card>

                {/* Answer Input Section */}
                <Card variant="default" className="mb-6">
                  <div className="p-6">
                    {/* Input Mode Toggle */}
                    <div className="flex justify-center mb-6">
                      <div className="bg-gray-100 rounded-lg p-1 flex">
                        <button
                          onClick={() => setInputMode('text')}
                          className={`px-4 py-2 rounded-md transition-all duration-200 ${
                            inputMode === 'text'
                              ? 'bg-indigo-500 text-white shadow-md'
                              : 'text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Text Field
                        </button>
                        <button
                          onClick={() => {
                            setInputMode('keypad');
                            setShowKeypad(true);
                          }}
                          className={`px-4 py-2 rounded-md transition-all duration-200 ${
                            inputMode === 'keypad'
                              ? 'bg-indigo-500 text-white shadow-md'
                              : 'text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Keypad
                        </button>
                      </div>
                    </div>

                    {/* Text Field Mode */}
                    {inputMode === 'text' && (
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={inputValue}
                              onChange={e => handleInputChange(e.target.value)}
                              placeholder="Type your answer here"
                              className={`w-full px-4 py-3 border-2 rounded-lg text-lg font-mono text-center transition-all duration-200 ${
                                !isValidInput
                                  ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-200'
                                  : inputValue && isValidInput
                                    ? 'border-green-500 bg-green-50 focus:border-green-600 focus:ring-green-200'
                                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                              } focus:outline-none focus:ring-4`}
                            />
                          </div>

                          {/* Unit Dropdown */}
                          <div className="w-32">
                            <select
                              value={selectedUnit}
                              onChange={e => {
                                setSelectedUnit(e.target.value);
                                saveAnswer(inputValue, e.target.value);
                              }}
                              className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:outline-none"
                            >
                              <option value="">Unit</option>
                              {availableUnits.map(unit => (
                                <option key={unit} value={unit}>
                                  {unit}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Keypad Mode Preview */}
                    {inputMode === 'keypad' && (
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div
                              className={`w-full px-4 py-3 border-2 rounded-lg text-lg font-mono text-center transition-all duration-200 bg-gray-50 ${
                                !isValidInput
                                  ? 'border-red-500'
                                  : inputValue && isValidInput
                                    ? 'border-green-500'
                                    : 'border-gray-300'
                              }`}
                            >
                              {inputValue || 'Tap keypad to enter answer'}
                            </div>
                          </div>

                          <div className="w-32">
                            <select
                              value={selectedUnit}
                              onChange={e => {
                                setSelectedUnit(e.target.value);
                                saveAnswer(inputValue, e.target.value);
                              }}
                              className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:outline-none"
                            >
                              <option value="">Unit</option>
                              {availableUnits.map(unit => (
                                <option key={unit} value={unit}>
                                  {unit}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="text-center">
                          <button
                            onClick={() => setShowKeypad(true)}
                            className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200"
                          >
                            Open Keypad
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Custom Keypad Overlay */}
        <AnimatePresence>
          {showKeypad && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-end"
              onClick={() => setShowKeypad(false)}
            >
              <motion.div
                initial={{ y: 400 }}
                animate={{ y: 0 }}
                exit={{ y: 400 }}
                className="w-full bg-white rounded-t-3xl p-6 max-h-96 overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                {/* Keypad Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Enter Answer</h3>
                  <button
                    onClick={() => setShowKeypad(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Preview Field */}
                <div
                  className={`w-full px-4 py-3 border-2 rounded-lg text-xl font-mono text-center mb-4 ${
                    !isValidInput
                      ? 'border-red-500 bg-red-50'
                      : inputValue && isValidInput
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  {inputValue || '0'}
                </div>

                {/* Keypad Grid */}
                <div className="grid grid-cols-4 gap-3">
                  {/* Row 1 */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleKeypadInput('C')}
                    className="bg-red-500 text-white p-4 rounded-xl font-semibold hover:bg-red-600 transition-colors"
                  >
                    C
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleKeypadInput('÷')}
                    className="bg-orange-500 text-white p-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                  >
                    ÷
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleKeypadInput('×')}
                    className="bg-orange-500 text-white p-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                  >
                    ×
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleKeypadInput('←')}
                    className="bg-gray-500 text-white p-4 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                  >
                    ←
                  </motion.button>

                  {/* Numbers and operators */}
                  {[7, 8, 9].map(num => (
                    <motion.button
                      key={num}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleKeypadInput(num.toString())}
                      className="bg-gray-200 text-gray-800 p-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                    >
                      {num}
                    </motion.button>
                  ))}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleKeypadInput('−')}
                    className="bg-orange-500 text-white p-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                  >
                    −
                  </motion.button>

                  {[4, 5, 6].map(num => (
                    <motion.button
                      key={num}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleKeypadInput(num.toString())}
                      className="bg-gray-200 text-gray-800 p-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                    >
                      {num}
                    </motion.button>
                  ))}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleKeypadInput('+')}
                    className="bg-orange-500 text-white p-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                  >
                    +
                  </motion.button>

                  {[1, 2, 3].map(num => (
                    <motion.button
                      key={num}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleKeypadInput(num.toString())}
                      className="bg-gray-200 text-gray-800 p-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                    >
                      {num}
                    </motion.button>
                  ))}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowKeypad(false)}
                    className="bg-green-500 text-white p-4 rounded-xl font-semibold hover:bg-green-600 transition-colors row-span-2 flex items-center justify-center"
                  >
                    OK
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleKeypadInput('0')}
                    className="bg-gray-200 text-gray-800 p-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors col-span-2"
                  >
                    0
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleKeypadInput('.')}
                    className="bg-gray-200 text-gray-800 p-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    .
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-indigo-200 p-4"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              disabled={quizState.currentQuestion === 0}
              variant="outline"
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </Button>

            <Button
              onClick={handleMarkForReview}
              variant="secondary"
              className={`${
                currentAnswer?.isMarkedForReview
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              } rounded-full px-6`}
            >
              {currentAnswer?.isMarkedForReview ? '★ Marked' : '☆ Mark for Review'}
            </Button>

            <Button
              onClick={handleNext}
              variant="primary"
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
            >
              {quizState.currentQuestion === quizData.questions.length - 1
                ? 'Finish Quiz'
                : 'Next →'}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 max-w-6xl mx-auto">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>
                {answeredQuestions}/{quizData.totalQuestions} answered
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full"
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

export default QuizPlayerNumerical;
