import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import Button from '../components/Button';

const PaymentSuccess: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [checkmarkVisible, setCheckmarkVisible] = useState(false);
  const [dashboardButtonGlow, setDashboardButtonGlow] = useState(true);

  // Payment details - would normally come from props or state
  const paymentDetails = {
    plan: 'Pro',
    amount: '₹49',
    originalPrice: '₹199',
    period: '/month',
    validTill: '30 Oct 2025',
    transactionId: 'TXN123456789'
  };

  // Start animations on mount
  useEffect(() => {
    // Show checkmark after a brief delay
    const checkmarkTimer = setTimeout(() => {
      setCheckmarkVisible(true);
    }, 500);

    // Hide confetti after animation
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 4000);

    // Dashboard button glow animation
    const glowInterval = setInterval(() => {
      setDashboardButtonGlow(prev => !prev);
    }, 2000);

    return () => {
      clearTimeout(checkmarkTimer);
      clearTimeout(confettiTimer);
      clearInterval(glowInterval);
    };
  }, []);

  const handleGoToDashboard = () => {
    console.log('Navigating to dashboard...');
    // In real app, this would navigate to dashboard
  };

  const handleViewInvoice = () => {
    console.log('Opening invoice...');
    // In real app, this would open/download invoice
  };

  // Confetti component
  const Confetti: React.FC = () => (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {[...Array(80)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10%',
          }}
          initial={{ 
            opacity: 0, 
            scale: 0, 
            rotate: 0,
            y: -100
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0],
            rotate: [0, 180, 360, 540],
            y: [0, window.innerHeight + 100],
            x: [0, (Math.random() - 0.5) * 200],
          }}
          transition={{
            duration: 4,
            delay: Math.random() * 2,
            ease: "easeOut"
          }}
        >
          {['🎉', '🎊', '✨', '🌟', '💚', '🎈'][Math.floor(Math.random() * 6)]}
        </motion.div>
      ))}
    </div>
  );

  // Animated checkmark component
  const CheckmarkIcon: React.FC = () => (
    <motion.div
      initial={{ scale: 0 }}
      animate={checkmarkVisible ? { 
        scale: [0, 1.3, 1],
        rotate: [0, 10, -10, 0]
      } : {}}
      transition={{ 
        duration: 0.8, 
        type: "spring", 
        stiffness: 200,
        damping: 10
      }}
      className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 mx-auto relative overflow-hidden"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-green-400 rounded-full opacity-30"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.1, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Checkmark SVG with drawing animation */}
      <motion.svg
        className="w-10 h-10 text-white relative z-10"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        initial={{ pathLength: 0 }}
        animate={checkmarkVisible ? { pathLength: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M5 13l4 4L19 7"
        />
      </motion.svg>
    </motion.div>
  );

  return (
    <Layout>
      {/* Animated Background */}
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-green-50 relative overflow-hidden">
        {/* Confetti Animation */}
        <AnimatePresence>
          {showConfetti && <Confetti />}
        </AnimatePresence>
        
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-screen">
          {/* Success Card */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              type: "spring", 
              stiffness: 100,
              delay: 0.2
            }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 text-center relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-16 h-16 bg-green-200/30 rounded-full blur-xl" />
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-teal-200/20 rounded-full blur-lg" />
            
            {/* Animated Checkmark */}
            <CheckmarkIcon />
            
            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Payment Successful! 🎉
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Your Pro plan is now active.
              </p>
            </motion.div>

            {/* Plan Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 mb-8 border border-green-100"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-gray-800">{paymentDetails.plan} Plan</h3>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                  ACTIVE
                </span>
              </div>
              
              <div className="space-y-2 text-gray-700">
                <div className="flex items-center justify-center gap-2">
                  <span className="line-through text-gray-400">{paymentDetails.originalPrice}</span>
                  <span className="text-2xl font-bold text-green-600">{paymentDetails.amount}</span>
                  <span className="text-gray-600">{paymentDetails.period}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Valid till <span className="font-semibold">{paymentDetails.validTill}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Transaction ID: {paymentDetails.transactionId}
                </p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {/* Dashboard Button with Glow */}
              <motion.div
                animate={dashboardButtonGlow ? {
                  boxShadow: [
                    "0 4px 20px rgba(20, 184, 166, 0.3)",
                    "0 8px 30px rgba(20, 184, 166, 0.5)",
                    "0 4px 20px rgba(20, 184, 166, 0.3)"
                  ]
                } : {}}
                transition={{ duration: 2, ease: "easeInOut" }}
              >
                <Button
                  variant="default"
                  size="large"
                  onClick={handleGoToDashboard}
                  className="px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold"
                >
                  Go to Dashboard
                </Button>
              </motion.div>
              
              <Button
                variant="outline"
                size="large"
                onClick={handleViewInvoice}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800"
              >
                View Invoice
              </Button>
            </motion.div>

            {/* Additional Success Messages */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              className="mt-8 space-y-3"
            >
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                <span>Unlimited quizzes unlocked</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                <span>Detailed analytics available</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                <span>Ad-free experience activated</span>
              </div>
            </motion.div>

            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 2 }}
              className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
            >
              <p className="text-sm text-gray-700">
                🚀 <span className="font-semibold">Welcome to Pro!</span> Start your enhanced learning journey with unlimited access to all features.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Success Elements */}
        <motion.div
          className="absolute top-20 left-10 text-4xl"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🎊
        </motion.div>
        
        <motion.div
          className="absolute top-32 right-16 text-3xl"
          animate={{
            y: [0, -15, 0],
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          ✨
        </motion.div>
        
        <motion.div
          className="absolute bottom-20 left-20 text-3xl"
          animate={{
            y: [0, -8, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          🌟
        </motion.div>
        
        <motion.div
          className="absolute bottom-32 right-12 text-4xl"
          animate={{
            y: [0, -12, 0],
            rotate: [0, -8, 8, 0],
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        >
          🎉
        </motion.div>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;