import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';

const QuizFeedback: React.FC = () => {
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const feedbackOptions = [
    { id: 'loved', emoji: '😍', label: 'Loved it', description: 'Amazing quiz!' },
    { id: 'good', emoji: '😀', label: 'Good', description: 'Pretty good!' },
    { id: 'okay', emoji: '😐', label: 'Okay', description: 'It was okay' },
    { id: 'confusing', emoji: '😕', label: 'Confusing', description: 'A bit confusing' },
    { id: 'disliked', emoji: '😞', label: "Didn't like it", description: 'Not my favorite' }
  ];

  const handleEmojiSelect = (feedbackId: string) => {
    setSelectedFeedback(feedbackId);
    
    // Show confetti for positive feedback
    if (feedbackId === 'loved' || feedbackId === 'good') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleSubmit = () => {
    if (!selectedFeedback) return;
    
    // Simulate feedback submission
    console.log('Feedback submitted:', { 
      rating: selectedFeedback, 
      comment: comment.trim() 
    });
    
    setSubmitted(true);
    
    // Show success message and redirect after delay
    setTimeout(() => {
      // In real app, this would navigate to next screen
      console.log('Redirecting to next screen...');
    }, 2000);
  };

  const handleSkip = () => {
    // Simulate skip action
    console.log('Feedback skipped');
    // In real app, this would navigate to next screen
  };

  // Confetti component
  const Confetti: React.FC = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0],
            rotate: [0, 180, 360],
            y: [0, -50, 100],
            x: [0, Math.random() * 100 - 50],
          }}
          transition={{
            duration: 3,
            delay: Math.random() * 0.5,
            ease: "easeOut"
          }}
        >
          🎉
        </motion.div>
      ))}
    </div>
  );

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-6xl mb-4"
            >
              🙏
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">Your feedback helps us improve</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Animated Background */}
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50 relative overflow-hidden">
        {/* Background icons */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 text-6xl">💬</div>
          <div className="absolute top-40 right-20 text-5xl">😀</div>
          <div className="absolute bottom-40 left-20 text-4xl">💬</div>
          <div className="absolute bottom-20 right-10 text-5xl">😀</div>
          <div className="absolute top-60 left-1/3 text-4xl">💬</div>
          <div className="absolute bottom-60 right-1/3 text-4xl">😀</div>
        </div>

        {/* Confetti Effect */}
        <AnimatePresence>
          {showConfetti && <Confetti />}
        </AnimatePresence>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              How was this quiz?
            </h1>
            <p className="text-xl text-gray-600">
              Your feedback helps us improve
            </p>
          </motion.div>

          {/* Emoji Feedback Options */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {feedbackOptions.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.3 + index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ 
                    scale: 1.1, 
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEmojiSelect(option.id)}
                  className={`relative p-4 rounded-2xl transition-all duration-300 ${
                    selectedFeedback === option.id
                      ? 'bg-white shadow-2xl ring-4 ring-purple-400'
                      : 'bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl'
                  }`}
                >
                  {/* Glow effect for selected emoji */}
                  {selectedFeedback === option.id && (
                    <motion.div
                      className="absolute inset-0 bg-purple-200 rounded-2xl blur-xl opacity-60"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 0.6 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  <div className="relative z-10 text-center">
                    <motion.div 
                      className="text-6xl md:text-7xl mb-3"
                      animate={selectedFeedback === option.id ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                      } : {}}
                      transition={{ duration: 0.6 }}
                    >
                      {option.emoji}
                    </motion.div>
                    <div className="text-sm font-medium text-gray-700">
                      {option.label}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Selected feedback label */}
            <AnimatePresence>
              {selectedFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center mt-6"
                >
                  <p className="text-xl font-medium text-purple-700">
                    You chose: {feedbackOptions.find(opt => opt.id === selectedFeedback)?.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Optional Comment Box */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Tell us more (optional)
              </h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this quiz..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="text-right text-sm text-gray-500 mt-2">
                {comment.length}/500 characters
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              variant="default"
              size="large"
              onClick={handleSubmit}
              disabled={!selectedFeedback}
              className={`px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-gray-300 disabled:to-gray-400 ${
                !selectedFeedback ? 'cursor-not-allowed' : ''
              }`}
            >
              Submit Feedback
            </Button>
            
            <motion.button
              onClick={handleSkip}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-gray-400 hover:text-gray-800 transition-colors"
            >
              Skip
            </motion.button>
          </motion.div>

          {/* Encouragement Text */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-center mt-8"
          >
            <p className="text-gray-500 text-sm">
              Your honest feedback makes our quizzes better for everyone! 🌟
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default QuizFeedback;