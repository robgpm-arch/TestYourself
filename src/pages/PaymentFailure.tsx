import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PaymentFailure: React.FC = () => {
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Mock error details
  const errorDetails = {
    code: "PAYMENT_DECLINED",
    message: "Your card was declined by the issuing bank.",
    transactionId: "TXN_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    timestamp: new Date().toLocaleString()
  };

  const handleRetry = () => {
    setIsRetrying(true);
    // Simulate retry process
    setTimeout(() => {
      setIsRetrying(false);
      // Here you would typically navigate back to payment gateway
      console.log("Redirecting to payment gateway...");
    }, 2000);
  };

  const handleChangePaymentMethod = () => {
    // Navigate to payment gateway with different method selection
    console.log("Changing payment method...");
  };

  const backgroundFloatingElements = Array.from({ length: 15 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute text-red-200/10 text-2xl md:text-3xl"
      initial={{ 
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200), 
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
        rotate: Math.random() * 360 
      }}
      animate={{
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
        rotate: 360
      }}
      transition={{
        duration: Math.random() * 10 + 15,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "linear"
      }}
    >
      {i % 3 === 0 ? '💳' : i % 3 === 1 ? '⚠️' : '❌'}
    </motion.div>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-gray-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {backgroundFloatingElements}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          
          {/* Main Failure Card */}
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-[0_0_40px_rgba(239,68,68,0.3)] border border-red-200"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              boxShadow: [
                "0 0 40px rgba(239,68,68,0.3)",
                "0 0 60px rgba(239,68,68,0.5)",
                "0 0 40px rgba(239,68,68,0.3)"
              ]
            }}
            transition={{ 
              duration: 0.6,
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          >
            {/* Animated Cross Mark */}
            <div className="text-center mb-6">
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500 mb-4 relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: 1, 
                  rotate: 0,
                  x: [0, -10, 10, -5, 5, 0]
                }}
                transition={{
                  scale: { duration: 0.5, delay: 0.2 },
                  rotate: { duration: 0.5, delay: 0.2 },
                  x: { 
                    duration: 0.6, 
                    delay: 0.8, 
                    times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                    ease: "easeInOut"
                  }
                }}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30"></div>
                
                {/* Cross Mark with Drawing Animation */}
                <motion.svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  className="text-white relative z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.path
                    d="M10 10 L30 30 M30 10 L10 30"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  />
                </motion.svg>
              </motion.div>

              <motion.h1
                className="text-2xl font-bold text-gray-800 mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                Payment Failed
              </motion.h1>

              <motion.p
                className="text-gray-600 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                Your transaction could not be completed.
              </motion.p>
            </div>

            {/* Error Details Section */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <button
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className="w-full text-left p-3 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-red-700 font-medium">View Error Details</span>
                  <motion.svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    className="text-red-500"
                    animate={{ rotate: showErrorDetails ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path
                      fill="currentColor"
                      d="M8 10.5L4 6.5h8L8 10.5z"
                    />
                  </motion.svg>
                </div>
              </button>

              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: showErrorDetails ? 'auto' : 0,
                  opacity: showErrorDetails ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-3 px-3 pb-1 text-sm text-red-600 space-y-1">
                  <div><span className="font-medium">Error Code:</span> {errorDetails.code}</div>
                  <div><span className="font-medium">Message:</span> {errorDetails.message}</div>
                  <div><span className="font-medium">Transaction ID:</span> {errorDetails.transactionId}</div>
                  <div><span className="font-medium">Time:</span> {errorDetails.timestamp}</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              {/* Try Again Button */}
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              >
                {isRetrying ? (
                  <div className="flex items-center justify-center space-x-2">
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Retrying...</span>
                  </div>
                ) : (
                  "Try Again"
                )}
              </button>

              {/* Change Payment Method Button */}
              <button
                onClick={handleChangePaymentMethod}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transform hover:scale-[1.02] transition-all duration-200"
              >
                Change Payment Method
              </button>
            </motion.div>

            {/* Support Information */}
            <motion.div
              className="mt-6 pt-4 border-t border-gray-200 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
            >
              <p className="text-sm text-gray-500 mb-2">
                Need help? Contact our support team
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <button className="text-teal-600 hover:text-teal-700 transition-colors">
                  💬 Chat Support
                </button>
                <button className="text-teal-600 hover:text-teal-700 transition-colors">
                  📧 Email Us
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Security Badge */}
          <motion.div
            className="text-center mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
          >
            <div className="inline-flex items-center space-x-2 text-white/80 text-sm">
              <span>🔒</span>
              <span>Your payment details are secure and encrypted</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;