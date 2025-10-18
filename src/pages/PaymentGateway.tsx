import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';

interface PlanDetails {
  name: string;
  originalPrice: string;
  offerPrice: string;
  period: string;
  features: string[];
}

const PaymentGateway: React.FC = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('upi');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });
  const [selectedBank, setSelectedBank] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [payButtonPulse, setPayButtonPulse] = useState(true);

  // Mock plan details - would normally come from props or state
  const planDetails: PlanDetails = {
    name: 'Pro',
    originalPrice: '₹199',
    offerPrice: '₹49',
    period: '/month',
    features: [
      'Unlimited quizzes of a course',
      'Detailed analytics & insights',
      'Ad-free experience',
      'Priority support',
    ],
  };

  // Pay button pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPayButtonPulse(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI',
      subtitle: 'Recommended',
      icon: '📱',
      logos: ['Google Pay', 'PhonePe', 'Paytm'],
      recommended: true,
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      subtitle: 'Visa, Mastercard, RuPay',
      icon: '💳',
      logos: ['Visa', 'Mastercard', 'RuPay'],
      recommended: false,
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      subtitle: 'All major banks supported',
      icon: '🏦',
      logos: ['SBI', 'HDFC', 'ICICI'],
      recommended: false,
    },
    {
      id: 'wallet',
      name: 'Digital Wallets',
      subtitle: 'Quick & secure',
      icon: '👛',
      logos: ['Amazon Pay', 'Paytm Wallet'],
      recommended: false,
    },
  ];

  const banks = [
    'State Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Punjab National Bank',
    'Bank of Baroda',
    'Canara Bank',
    'Union Bank',
  ];

  const handlePayment = () => {
    setIsProcessing(true);

    // Simulate payment processing
    console.log('Processing payment with method:', selectedPaymentMethod);
    console.log('Plan:', planDetails.name, planDetails.offerPrice);

    setTimeout(() => {
      setIsProcessing(false);
      // In real app, this would redirect to success page
      console.log('Payment successful!');
    }, 3000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <Layout>
      {/* Animated Background */}
      <div className="min-h-screen bg-gradient-to-br from-teal-100 via-white to-teal-50 relative overflow-hidden">
        {/* Background icons */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 text-6xl">₹</div>
          <div className="absolute top-40 right-20 text-5xl">💳</div>
          <div className="absolute bottom-40 left-20 text-4xl">₹</div>
          <div className="absolute bottom-20 right-10 text-5xl">💳</div>
          <div className="absolute top-60 left-1/3 text-4xl">₹</div>
          <div className="absolute bottom-60 right-1/3 text-4xl">💳</div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Complete Your Payment
            </h1>
            <p className="text-lg text-gray-600">Secure checkout for your subscription</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Plan Summary Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-teal-100 sticky top-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Plan Summary</h3>
                  <button className="text-teal-600 text-sm font-medium hover:underline">
                    Change Plan
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-gray-800">{planDetails.name}</span>
                    <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs font-bold">
                      POPULAR
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg line-through text-gray-400">
                      {planDetails.originalPrice}
                    </span>
                    <span className="text-2xl font-bold text-teal-600">
                      {planDetails.offerPrice}
                    </span>
                    <span className="text-gray-600">{planDetails.period}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">What's included:</h4>
                  <ul className="space-y-2">
                    {planDetails.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 text-teal-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-teal-600">{planDetails.offerPrice}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Including all taxes</p>
                </div>
              </div>
            </motion.div>

            {/* Payment Methods */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-6">Choose Payment Method</h3>

                <div className="space-y-4 mb-8">
                  {paymentMethods.map((method, index) => (
                    <motion.div
                      key={method.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className={`relative bg-white rounded-xl p-4 border-2 cursor-pointer transition-all duration-300 ${
                        selectedPaymentMethod === method.id
                          ? 'border-teal-500 shadow-lg transform scale-105'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      {/* Recommended Badge */}
                      {method.recommended && (
                        <div className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          Recommended
                        </div>
                      )}

                      {/* Glow Effect */}
                      {selectedPaymentMethod === method.id && (
                        <motion.div
                          className="absolute inset-0 bg-teal-100 rounded-xl opacity-20"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 0.2 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}

                      <div className="flex items-center gap-4 relative z-10">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedPaymentMethod === method.id}
                          onChange={() => setSelectedPaymentMethod(method.id)}
                          className="w-5 h-5 text-teal-600"
                        />

                        <div className="text-3xl">{method.icon}</div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-800">{method.name}</h4>
                            {method.recommended && (
                              <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                Fast
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{method.subtitle}</p>
                          <div className="flex gap-2 mt-2">
                            {method.logos.map((logo, logoIndex) => (
                              <span
                                key={logoIndex}
                                className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600"
                              >
                                {logo}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Payment Method Details */}
                <AnimatePresence mode="wait">
                  {selectedPaymentMethod === 'card' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white rounded-xl p-6 border border-gray-200 mb-6 overflow-hidden"
                    >
                      <h4 className="font-semibold text-gray-800 mb-4">Card Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card Number
                          </label>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={cardDetails.number}
                            onChange={e =>
                              setCardDetails({
                                ...cardDetails,
                                number: formatCardNumber(e.target.value),
                              })
                            }
                            maxLength={19}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onChange={e =>
                              setCardDetails({
                                ...cardDetails,
                                expiry: formatExpiry(e.target.value),
                              })
                            }
                            maxLength={5}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            placeholder="123"
                            value={cardDetails.cvv}
                            onChange={e =>
                              setCardDetails({
                                ...cardDetails,
                                cvv: e.target.value.replace(/\D/g, ''),
                              })
                            }
                            maxLength={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={cardDetails.name}
                            onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {selectedPaymentMethod === 'netbanking' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white rounded-xl p-6 border border-gray-200 mb-6 overflow-hidden"
                    >
                      <h4 className="font-semibold text-gray-800 mb-4">Select Your Bank</h4>
                      <select
                        value={selectedBank}
                        onChange={e => setSelectedBank(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Choose your bank</option>
                        {banks.map(bank => (
                          <option key={bank} value={bank}>
                            {bank}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}

                  {selectedPaymentMethod === 'upi' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white rounded-xl p-6 border border-gray-200 mb-6 overflow-hidden"
                    >
                      <div className="text-center">
                        <div className="text-6xl mb-4">📱</div>
                        <h4 className="font-semibold text-gray-800 mb-2">UPI Payment</h4>
                        <p className="text-gray-600 text-sm mb-4">
                          You'll be redirected to your UPI app to complete the payment
                        </p>
                        <div className="flex justify-center gap-4">
                          <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium">
                            Google Pay
                          </div>
                          <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium">
                            PhonePe
                          </div>
                          <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium">
                            Paytm
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pay Now Button */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="space-y-4"
                >
                  <motion.div
                    animate={
                      payButtonPulse
                        ? {
                            boxShadow: [
                              '0 4px 20px rgba(20, 184, 166, 0.3)',
                              '0 8px 30px rgba(20, 184, 166, 0.5)',
                              '0 4px 20px rgba(20, 184, 166, 0.3)',
                            ],
                          }
                        : {}
                    }
                    transition={{ duration: 3, ease: 'easeInOut' }}
                  >
                    <Button
                      variant="default"
                      size="large"
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-lg font-semibold"
                    >
                      {isProcessing ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processing...
                        </div>
                      ) : (
                        `Pay Now ${planDetails.offerPrice}`
                      )}
                    </Button>
                  </motion.div>

                  {/* Security Note */}
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <span className="text-lg">🔒</span>
                    <span>100% secure & encrypted payment</span>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex justify-center items-center gap-6 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <span>🛡️</span>
                      <span>SSL Protected</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>💳</span>
                      <span>PCI Compliant</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🔐</span>
                      <span>Bank Grade Security</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Processing Modal */}
        <AnimatePresence>
          {isProcessing && (
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
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-6xl mb-4"
                >
                  💳
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Payment</h3>
                <p className="text-gray-600 mb-4">Please don't close this window...</p>
                <div className="flex justify-center">
                  <div className="animate-pulse flex gap-1">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-teal-500 rounded-full animation-delay-200"></div>
                    <div className="w-2 h-2 bg-teal-500 rounded-full animation-delay-400"></div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default PaymentGateway;
