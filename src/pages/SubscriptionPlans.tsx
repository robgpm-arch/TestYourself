import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import Button from '../components/Button';

const SubscriptionPlans: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [proCardPulse, setProCardPulse] = useState(true);

  // Pro card gentle pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProCardPulse(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      subtitle: 'Free Forever',
      price: '₹0',
      originalPrice: null,
      offerPrice: null,
      period: '',
      features: [
        'Limited quizzes per day',
        'Basic progress tracking',
        'Community support',
        'Ads shown'
      ],
      buttonText: 'Continue Free',
      buttonVariant: 'outline' as const,
      cardStyle: 'bg-white border-2 border-teal-400',
      popular: false,
      icon: null
    },
    {
      id: 'pro',
      name: 'Pro',
      subtitle: 'Most Popular Choice',
      price: '₹199',
      originalPrice: '₹199',
      offerPrice: '₹49',
      period: '/month',
      features: [
        'Unlimited quizzes of a course',
        'Detailed analytics & insights',
        'Ad-free experience',
        'Priority support',
        'Performance tracking',
        'Custom study plans'
      ],
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'default' as const,
      cardStyle: 'bg-white border-2 border-teal-500 shadow-2xl transform scale-105 relative',
      popular: true,
      icon: null
    },
    {
      id: 'premium',
      name: 'Premium',
      subtitle: 'Ultimate Learning',
      price: '₹1999',
      originalPrice: '₹1999',
      offerPrice: '₹499',
      period: '/Course',
      features: [
        'Everything in Pro',
        'Exclusive NEET mock exams',
        'Live doubt sessions',
        'Personal mentor support',
        '1-on-1 guidance calls',
        'Exam strategy sessions'
      ],
      buttonText: 'Go Premium',
      buttonVariant: 'default' as const,
      cardStyle: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white border-2 border-yellow-400',
      popular: false,
      icon: '👑'
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    // Simulate plan selection
    console.log('Selected plan:', planId);
    
    // In real app, this would navigate to payment
    setTimeout(() => {
      if (planId === 'basic') {
        console.log('Continuing with free plan...');
      } else {
        console.log('Redirecting to payment...');
      }
    }, 1000);
  };

  const CheckIcon = () => (
    <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );

  return (
    <Layout>
      {/* Animated Background */}
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-50 relative overflow-hidden">
        {/* Background icons */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 text-6xl">💳</div>
          <div className="absolute top-40 right-20 text-5xl">👑</div>
          <div className="absolute bottom-40 left-20 text-4xl">💳</div>
          <div className="absolute bottom-20 right-10 text-5xl">👑</div>
          <div className="absolute top-60 left-1/3 text-4xl">💳</div>
          <div className="absolute bottom-60 right-1/3 text-4xl">👑</div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upgrade for unlimited quizzes, insights, and rewards
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
                className="relative"
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.2 }}
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20"
                  >
                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </div>
                  </motion.div>
                )}

                {/* Pro Card Pulse Animation */}
                <motion.div
                  animate={plan.id === 'pro' && proCardPulse ? {
                    boxShadow: [
                      "0 10px 25px rgba(0, 0, 0, 0.1)",
                      "0 20px 40px rgba(20, 184, 166, 0.3)",
                      "0 10px 25px rgba(0, 0, 0, 0.1)"
                    ]
                  } : {}}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className={`${plan.cardStyle} rounded-3xl p-8 h-full flex flex-col relative overflow-hidden`}
                >
                  {/* Crown icon for Premium */}
                  {plan.icon && (
                    <div className="absolute top-4 right-4 text-3xl">
                      {plan.icon}
                    </div>
                  )}

                  {/* Decorative elements for Premium */}
                  {plan.id === 'premium' && (
                    <>
                      <div className="absolute top-4 left-4 w-16 h-16 bg-white/20 rounded-full blur-xl" />
                      <div className="absolute bottom-4 right-4 w-12 h-12 bg-white/10 rounded-full blur-lg" />
                    </>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className={`text-2xl font-bold mb-2 ${plan.id === 'premium' ? 'text-white' : 'text-gray-800'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm ${plan.id === 'premium' ? 'text-yellow-100' : 'text-gray-600'}`}>
                      {plan.subtitle}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-8">
                    {plan.offerPrice ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`text-lg line-through ${plan.id === 'premium' ? 'text-yellow-200' : 'text-gray-400'}`}>
                            {plan.originalPrice}
                          </span>
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            OFFER
                          </span>
                        </div>
                        <div className={`text-4xl font-bold ${plan.id === 'premium' ? 'text-white' : 'text-gray-800'}`}>
                          {plan.offerPrice}
                          <span className={`text-lg font-normal ${plan.id === 'premium' ? 'text-yellow-200' : 'text-gray-600'}`}>
                            {plan.period}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className={`text-4xl font-bold ${plan.id === 'premium' ? 'text-white' : 'text-gray-800'}`}>
                        {plan.price}
                        <span className={`text-lg font-normal ${plan.id === 'premium' ? 'text-yellow-200' : 'text-gray-600'}`}>
                          {plan.period}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex-1 mb-8">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.2 + featureIndex * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className="flex-shrink-0">
                            {plan.id === 'premium' ? (
                              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                <CheckIcon />
                              </div>
                            ) : (
                              <CheckIcon />
                            )}
                          </div>
                          <span className={`${plan.id === 'premium' ? 'text-white' : 'text-gray-700'}`}>
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={plan.buttonVariant}
                      size="large"
                      onClick={() => handlePlanSelect(plan.id)}
                      className={`w-full ${
                        plan.id === 'pro' 
                          ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700' 
                          : plan.id === 'premium'
                          ? 'bg-white text-yellow-600 hover:bg-yellow-50'
                          : ''
                      }`}
                    >
                      {plan.buttonText}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Footer Info */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center space-y-4"
          >
            <p className="text-gray-500 text-sm">
              Cancel anytime. 7-day free trial available.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex justify-center items-center gap-8 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📱</span>
                <span>Instant Access</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💯</span>
                <span>Money-back Guarantee</span>
              </div>
            </div>

            {/* Special Offer Alert */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 max-w-md mx-auto"
            >
              <div className="flex items-center justify-center gap-2 text-red-700">
                <span className="animate-pulse">⏰</span>
                <span className="font-medium text-sm">
                  Limited Time Offer - Save up to 75%!
                </span>
              </div>
            </motion.div>
          </div>

          {/* Success Animation */}
          <AnimatePresence>
            {selectedPlan && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-6xl mb-4"
                  >
                    {selectedPlan === 'basic' ? '🎉' : '💳'}
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {selectedPlan === 'basic' ? 'Welcome!' : 'Processing...'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedPlan === 'basic' 
                      ? 'You can start using the free plan right away!'
                      : 'Redirecting to secure payment...'
                    }
                  </p>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default SubscriptionPlans;