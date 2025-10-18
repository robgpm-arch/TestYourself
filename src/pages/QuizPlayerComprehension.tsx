import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

interface ComprehensionOption {
  id: string;
  text: string;
  letter: 'A' | 'B' | 'C' | 'D';
}

interface ComprehensionQuestion {
  id: string;
  text: string;
  options: ComprehensionOption[];
  correctAnswer: string;
}

interface ComprehensionPassage {
  id: string;
  title: string;
  content: string;
  questions: ComprehensionQuestion[];
}

interface ComprehensionAnswer {
  questionId: string;
  selectedOption: string;
  isMarkedForReview: boolean;
  timeSpent: number;
}

interface QuizState {
  currentQuestion: number;
  answers: ComprehensionAnswer[];
  timeRemaining: number;
  isCompleted: boolean;
  highlightedText: Array<{ start: number; end: number; id: string }>;
}

const QuizPlayerComprehension: React.FC = () => {
  const navigate = useNavigate();
  const passageRef = useRef<HTMLDivElement>(null);

  // Sample comprehension data
  const comprehensionData = {
    title: 'UPSC – Reading Comprehension',
    totalQuestions: 5,
    timeLimit: 60 * 60, // 60 minutes in seconds
    passage: {
      id: 'passage1',
      title: 'Climate Change and Global Agriculture',
      content: `Climate change poses significant challenges to global food security and agricultural productivity. Rising temperatures, changing precipitation patterns, and increased frequency of extreme weather events are already affecting crop yields worldwide. The Intergovernmental Panel on Climate Change (IPCC) has warned that without immediate and far-reaching action, food production could decline by 10-25% by 2050 due to climate change.

Agricultural systems are particularly vulnerable to climate variability because they depend heavily on weather conditions. Temperature increases can accelerate crop development, reducing the time available for grain filling and thereby decreasing yields. Heat stress during critical reproductive phases can be particularly damaging to cereal crops like wheat, rice, and maize, which form the foundation of global food systems.

Water availability is another critical factor affected by climate change. Many regions are experiencing altered precipitation patterns, with some areas facing prolonged droughts while others encounter increased flooding. These changes directly impact irrigation systems and rain-fed agriculture, forcing farmers to adapt their practices or face reduced productivity.

However, climate change impacts are not uniform across all regions. While some northern latitudes may experience longer growing seasons and potentially increased yields, tropical and subtropical regions are likely to face more severe negative impacts. This disparity could exacerbate global food inequality and increase the risk of food insecurity in already vulnerable populations.

Adaptation strategies are crucial for maintaining agricultural productivity under changing climatic conditions. These include developing climate-resilient crop varieties, improving water management systems, implementing precision agriculture technologies, and diversifying farming systems. International cooperation and knowledge sharing are essential for ensuring that these adaptation measures reach smallholder farmers who produce much of the world's food but have limited resources for adaptation.

The role of technology in agricultural adaptation cannot be overstated. Innovations in drought-resistant crops, efficient irrigation systems, and climate monitoring tools offer promising solutions for addressing climate challenges. Investment in agricultural research and development, particularly in developing countries, is critical for building resilient food systems that can withstand future climate shocks.`,
      questions: [
        {
          id: 'q1',
          text: 'According to the passage, what is the projected decline in food production by 2050 due to climate change?',
          options: [
            { id: 'a', text: '5-15%', letter: 'A' as const },
            { id: 'b', text: '10-25%', letter: 'B' as const },
            { id: 'c', text: '15-30%', letter: 'C' as const },
            { id: 'd', text: '20-35%', letter: 'D' as const },
          ],
          correctAnswer: 'b',
        },
        {
          id: 'q2',
          text: 'Which of the following crops are specifically mentioned as being vulnerable to heat stress during reproductive phases?',
          options: [
            { id: 'a', text: 'Wheat, rice, and barley', letter: 'A' as const },
            { id: 'b', text: 'Rice, maize, and soybeans', letter: 'B' as const },
            { id: 'c', text: 'Wheat, rice, and maize', letter: 'C' as const },
            { id: 'd', text: 'Maize, barley, and oats', letter: 'D' as const },
          ],
          correctAnswer: 'c',
        },
        {
          id: 'q3',
          text: 'What does the passage suggest about the regional impact of climate change on agriculture?',
          options: [
            { id: 'a', text: 'All regions will be equally affected', letter: 'A' as const },
            {
              id: 'b',
              text: 'Northern latitudes may benefit while tropical regions suffer',
              letter: 'B' as const,
            },
            { id: 'c', text: 'Only developing countries will be affected', letter: 'C' as const },
            { id: 'd', text: 'Coastal regions will be most impacted', letter: 'D' as const },
          ],
          correctAnswer: 'b',
        },
        {
          id: 'q4',
          text: 'Which of the following is NOT mentioned as an adaptation strategy in the passage?',
          options: [
            { id: 'a', text: 'Developing climate-resilient crop varieties', letter: 'A' as const },
            {
              id: 'b',
              text: 'Implementing precision agriculture technologies',
              letter: 'B' as const,
            },
            { id: 'c', text: 'Increasing use of chemical fertilizers', letter: 'C' as const },
            { id: 'd', text: 'Improving water management systems', letter: 'D' as const },
          ],
          correctAnswer: 'c',
        },
        {
          id: 'q5',
          text: 'According to the passage, why is international cooperation important for agricultural adaptation?',
          options: [
            { id: 'a', text: 'To reduce global trade barriers', letter: 'A' as const },
            {
              id: 'b',
              text: 'To ensure adaptation measures reach smallholder farmers',
              letter: 'B' as const,
            },
            { id: 'c', text: 'To standardize farming practices globally', letter: 'C' as const },
            { id: 'd', text: 'To create uniform climate policies', letter: 'D' as const },
          ],
          correctAnswer: 'b',
        },
      ],
    },
  };

  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    answers: [],
    timeRemaining: comprehensionData.timeLimit,
    isCompleted: false,
    highlightedText: [],
  });

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

  const currentQuestion = comprehensionData.passage.questions[quizState.currentQuestion];
  const currentAnswer = quizState.answers.find(a => a.questionId === currentQuestion?.id);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getOptionColor = (letter: 'A' | 'B' | 'C' | 'D') => {
    const colors = {
      A: 'bg-blue-500 hover:bg-blue-600',
      B: 'bg-green-500 hover:bg-green-600',
      C: 'bg-orange-500 hover:bg-orange-600',
      D: 'bg-purple-500 hover:bg-purple-600',
    };
    return colors[letter];
  };

  const getGlowColor = (letter: 'A' | 'B' | 'C' | 'D') => {
    const colors = {
      A: 'shadow-blue-500/50',
      B: 'shadow-green-500/50',
      C: 'shadow-orange-500/50',
      D: 'shadow-purple-500/50',
    };
    return colors[letter];
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

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() && passageRef.current) {
      const range = selection.getRangeAt(0);
      const passageElement = passageRef.current;

      // Check if selection is within the passage
      if (passageElement.contains(range.commonAncestorContainer)) {
        const passageText = passageElement.textContent || '';
        const selectedText = selection.toString();
        const startIndex = passageText.indexOf(selectedText);

        if (startIndex !== -1) {
          const highlightId = `highlight-${Date.now()}`;
          setQuizState(prev => ({
            ...prev,
            highlightedText: [
              ...prev.highlightedText,
              {
                start: startIndex,
                end: startIndex + selectedText.length,
                id: highlightId,
              },
            ],
          }));
        }

        selection.removeAllRanges();
      }
    }
  };

  const renderPassageWithHighlights = (text: string) => {
    if (quizState.highlightedText.length === 0) {
      return text;
    }

    const highlights = [...quizState.highlightedText].sort((a, b) => a.start - b.start);
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    highlights.forEach((highlight, index) => {
      // Add text before highlight
      if (highlight.start > lastIndex) {
        elements.push(text.slice(lastIndex, highlight.start));
      }

      // Add highlighted text
      elements.push(
        <span key={highlight.id} className="bg-yellow-200 px-1 rounded" title="Highlighted text">
          {text.slice(highlight.start, highlight.end)}
        </span>
      );

      lastIndex = highlight.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }

    return elements;
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
    if (quizState.currentQuestion < comprehensionData.passage.questions.length - 1) {
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
  const answeredQuestions = quizState.answers.filter(a => a.selectedOption).length;
  const progressPercentage = (answeredQuestions / comprehensionData.totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-white relative overflow-hidden">
      {/* Background book and paragraph pattern */}
      <div
        className="absolute inset-0 opacity-20 text-2xl"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23374151' fill-opacity='0.15'%3E%3Ctext x='15' y='25' font-size='16'%3E📖%3C/text%3E%3Ctext x='45' y='55' font-size='12'%3E¶%3C/text%3E%3Ctext x='25' y='70' font-size='10'%3E▬▬▬%3C/text%3E%3Ctext x='55' y='20' font-size='10'%3E▬▬%3C/text%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm border-b border-orange-200 p-4 sticky top-0 z-20"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">{comprehensionData.title}</h1>

            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-600">
                Q {quizState.currentQuestion + 1}/{comprehensionData.totalQuestions}
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="#fee2e2" strokeWidth="3" fill="none" />
                    <motion.circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="#ef4444"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      initial={{ strokeDashoffset: 0 }}
                      animate={{
                        strokeDashoffset:
                          (1 - quizState.timeRemaining / comprehensionData.timeLimit) *
                          2 *
                          Math.PI *
                          20,
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

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto pb-24">
          <div className="max-w-6xl mx-auto p-4 space-y-6">
            {/* Passage Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card variant="elevated" className="sticky top-4 z-10">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-blue-900">
                      {comprehensionData.passage.title}
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>💡</span>
                      <span>Select text to highlight</span>
                    </div>
                  </div>

                  <div
                    ref={passageRef}
                    className="prose prose-gray max-w-none leading-relaxed text-gray-700 max-h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50"
                    style={{ fontFamily: 'Georgia, serif' }}
                    onMouseUp={handleTextSelection}
                    onTouchEnd={handleTextSelection}
                  >
                    {renderPassageWithHighlights(comprehensionData.passage.content)}
                  </div>

                  {quizState.highlightedText.length > 0 && (
                    <div className="mt-3 flex items-center space-x-2">
                      <span className="text-sm text-yellow-600">
                        📝 {quizState.highlightedText.length} highlight(s) made
                      </span>
                      <button
                        onClick={() => setQuizState(prev => ({ ...prev, highlightedText: [] }))}
                        className="text-xs text-red-600 hover:text-red-800 underline"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Current Question Section */}
            <AnimatePresence mode="wait">
              <motion.div
                key={quizState.currentQuestion}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <Card variant="elevated" className="mb-6">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-blue-900 leading-relaxed flex-1">
                        Question {quizState.currentQuestion + 1}: {currentQuestion?.text}
                      </h3>
                      {currentAnswer?.isMarkedForReview && (
                        <span className="ml-2 text-orange-500 text-sm font-semibold bg-orange-100 px-2 py-1 rounded-full">
                          ★ Marked
                        </span>
                      )}
                    </div>

                    {/* Options */}
                    <div className="grid gap-3 md:grid-cols-1">
                      {currentQuestion?.options.map(option => {
                        const isSelected = currentAnswer?.selectedOption === option.id;
                        return (
                          <motion.div
                            key={option.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card
                              variant="default"
                              className={`cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? `ring-4 ring-white ring-opacity-75 shadow-2xl ${getGlowColor(option.letter)}`
                                  : 'hover:shadow-lg'
                              }`}
                              onClick={() => handleOptionSelect(option.id)}
                            >
                              <div
                                className={`${getOptionColor(option.letter)} text-white font-semibold p-4 rounded-xl transition-all duration-200`}
                              >
                                <div className="flex items-center space-x-3">
                                  <span className="text-lg font-bold bg-white/20 w-8 h-8 rounded-full flex items-center justify-center">
                                    {option.letter}
                                  </span>
                                  <span className="flex-1 text-left">{option.text}</span>
                                  {isSelected && (
                                    <motion.span
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="text-xl"
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
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-orange-200 p-4 z-20"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              disabled={quizState.currentQuestion === 0}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              {quizState.currentQuestion === comprehensionData.passage.questions.length - 1
                ? 'Finish Quiz'
                : 'Next →'}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 max-w-6xl mx-auto">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>
                {answeredQuestions}/{comprehensionData.totalQuestions} answered
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
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

export default QuizPlayerComprehension;
