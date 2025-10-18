import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import {
  sendOtp,
  confirmOtp,
  resetOtpFlow,
  isOtpPending,
  mapAuthError,
} from '../services/phoneAuth';
import Input from '../components/Input';
import Button from '../components/Button';

interface LoginSignupProps {
  initialTab?: 'login' | 'register';
  onSuccess: () => void;
  onSkip?: () => void;
}

const LoginSignup: React.FC<LoginSignupProps> = ({ initialTab = 'login', onSuccess, onSkip }) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [step, setStep] = useState<'mobile' | 'otp' | 'success'>('mobile');
  const [usePasswordLogin, setUsePasswordLogin] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [passwordLogin, setPasswordLogin] = useState('');
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(28);
  const [isResendActive, setIsResendActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => setTab(initialTab), [initialTab]);

  // after successful auth (email/password, phone OTP, etc.)
  async function handleAuthDone() {
    await getAuth().currentUser?.getIdToken(true); // refresh claims
    onSuccess();
  }

  const buildEmailFromPhone = (code: string, number: string) => {
    const digits = `${code}${number}`.replace(/\D/g, '');
    return `ph-${digits}@testyourself.app`;
  };

  const handlePasswordSignIn = async () => {
    if (mobileNumber.length < 10 || passwordLogin.length < 1) return;
    setError(null);
    setInfoMsg(null);
    setIsLoading(true);
    try {
      const email = buildEmailFromPhone(countryCode, mobileNumber);
      await signInWithEmailAndPassword(getAuth(), email, passwordLogin);
      await handleAuthDone();
    } catch (e: any) {
      setError(e?.message || 'Login failed. Check number or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (mobileNumber.length < 10) {
      setError('Enter your mobile number first.');
      return;
    }
    setError(null);
    setInfoMsg(null);
    try {
      const email = buildEmailFromPhone(countryCode, mobileNumber);
      await sendPasswordResetEmail(getAuth(), email);
      setInfoMsg('If an account exists, a reset link has been sent to the email on file.');
    } catch (e: any) {
      // For synthetic email, reset email may not be deliverable; instruct OTP path
      setError('Could not send reset email. Use OTP login, then change your password in Profile.');
    }
  };

  // Timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            setIsResendActive(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  const handleSendOtp = async () => {
    if (mobileNumber.length < 10) return;

    setError(null);
    setIsLoading(true);

    try {
      const e164Number = `${countryCode}${mobileNumber}`;
      await sendOtp(e164Number);
      setStep('otp');
      setResendTimer(28);
      setIsResendActive(false);
    } catch (error: any) {
      setError(mapAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) return;

    setError(null);
    setIsLoading(true);

    try {
      await confirmOtp(otpValue);
      setStep('success');
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        handleAuthDone();
      }, 3000);
    } catch (error: any) {
      setError(mapAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!isResendActive) return;

    setError(null);
    setIsLoading(true);

    try {
      resetOtpFlow();
      const e164Number = `${countryCode}${mobileNumber}`;
      await sendOtp(e164Number);
      setResendTimer(28);
      setIsResendActive(false);
      setOtp(['', '', '', '', '', '']);
    } catch (error: any) {
      setError(mapAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  const getBackgroundGradient = () => {
    switch (step) {
      case 'mobile':
        return 'bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-700';
      case 'otp':
        return 'bg-gradient-to-br from-teal-400 via-teal-200 to-white';
      case 'success':
        return 'bg-gradient-to-br from-emerald-400 via-teal-300 to-white';
      default:
        return 'bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-700';
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${getBackgroundGradient()}`}>
      {/* Dynamic Background Icons */}
      {step === 'mobile' && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 text-6xl">📱</div>
          <div className="absolute top-40 right-32 text-5xl">🔒</div>
          <div className="absolute bottom-60 left-32 text-7xl">📱</div>
          <div className="absolute top-80 left-1/2 text-4xl">🔒</div>
          <div className="absolute bottom-40 right-20 text-6xl">📱</div>
          <div className="absolute top-32 left-1/3 text-5xl">🔒</div>
          <div className="absolute bottom-20 left-1/4 text-4xl">📱</div>
          <div className="absolute top-60 right-1/4 text-6xl">🔒</div>
        </div>
      )}

      {step === 'otp' && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 text-6xl">🔒</div>
          <div className="absolute top-40 right-32 text-5xl">✉️</div>
          <div className="absolute bottom-60 left-32 text-7xl">🔒</div>
          <div className="absolute top-80 left-1/2 text-4xl">✉️</div>
          <div className="absolute bottom-40 right-20 text-6xl">🔒</div>
          <div className="absolute top-32 left-1/3 text-5xl">✉️</div>
          <div className="absolute bottom-20 left-1/4 text-4xl">🔒</div>
          <div className="absolute top-60 right-1/4 text-6xl">✉️</div>
        </div>
      )}

      {step === 'success' && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Confetti Animation */}
          <div
            className="absolute top-0 left-1/6 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"
            style={{ animationDelay: '0s' }}
          ></div>
          <div
            className="absolute top-0 left-1/4 w-2 h-2 bg-pink-400 rounded-full animate-pulse"
            style={{ animationDelay: '0.2s' }}
          ></div>
          <div
            className="absolute top-0 left-1/3 w-3 h-3 bg-blue-400 rounded-full animate-pulse"
            style={{ animationDelay: '0.4s' }}
          ></div>
          <div
            className="absolute top-0 left-1/2 w-2 h-2 bg-green-400 rounded-full animate-pulse"
            style={{ animationDelay: '0.6s' }}
          ></div>
          <div
            className="absolute top-0 left-2/3 w-3 h-3 bg-purple-400 rounded-full animate-pulse"
            style={{ animationDelay: '0.8s' }}
          ></div>
          <div
            className="absolute top-0 left-3/4 w-2 h-2 bg-red-400 rounded-full animate-pulse"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute top-0 left-5/6 w-3 h-3 bg-orange-400 rounded-full animate-pulse"
            style={{ animationDelay: '1.2s' }}
          ></div>

          <div
            className="absolute top-20 left-1/5 text-2xl animate-bounce"
            style={{ animationDelay: '0.5s' }}
          >
            🎉
          </div>
          <div
            className="absolute top-32 left-2/5 text-2xl animate-bounce"
            style={{ animationDelay: '1.0s' }}
          >
            ✨
          </div>
          <div
            className="absolute top-40 left-3/5 text-2xl animate-bounce"
            style={{ animationDelay: '0.8s' }}
          >
            🎊
          </div>
          <div
            className="absolute top-28 left-4/5 text-2xl animate-bounce"
            style={{ animationDelay: '1.3s' }}
          >
            🌟
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-8">
        {/* Glassmorphism Login Card */}
        <div className="w-full max-w-md mx-auto">
          <div
            className={`backdrop-blur-lg rounded-3xl p-8 shadow-2xl border ${
              step === 'otp' || step === 'success'
                ? 'bg-white bg-opacity-95 border-white border-opacity-50'
                : 'bg-white bg-opacity-20 border-white border-opacity-30'
            }`}
          >
            <div className="flex justify-center mb-4">
              <button
                className={`px-4 py-2 mx-1 rounded-lg font-medium transition-colors ${
                  tab === 'login'
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setTab('login')}
              >
                Login
              </button>
              <button
                className={`px-4 py-2 mx-1 rounded-lg font-medium transition-colors ${
                  tab === 'register'
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setTab('register')}
              >
                Register
              </button>
            </div>

            {/* Form Header */}
            <div className="text-center mb-8">
              {step !== 'success' ? (
                <>
                  <motion.h1
                    className={`text-3xl font-bold mb-2 ${
                      step === 'mobile' ? 'text-white' : 'text-gray-900'
                    }`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {step === 'mobile'
                      ? tab === 'login'
                        ? 'Login'
                        : 'Register'
                      : 'Verify Your Mobile'}
                  </motion.h1>
                  <motion.p
                    className={`opacity-90 ${
                      step === 'mobile' ? 'text-blue-100' : 'text-gray-600'
                    }`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    {step === 'mobile'
                      ? 'Login with your mobile number'
                      : `We've sent an OTP to ${countryCode} ${mobileNumber.slice(0, -4).replace(/./g, 'X')}${mobileNumber.slice(-4)}`}
                  </motion.p>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-6"
                >
                  {/* Success Checkmark */}
                  <div className="w-32 h-32 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-2xl">
                    <motion.svg
                      className="w-20 h-20"
                      viewBox="0 0 52 52"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <circle cx="26" cy="26" r="25" fill="none" stroke="#10B981" strokeWidth="2" />
                      <motion.path
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 27l7 7 16-16"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                      />
                    </motion.svg>
                  </div>

                  <motion.h1
                    className="text-4xl font-bold text-gray-900"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    Mobile Verified Successfully!
                  </motion.h1>

                  <motion.p
                    className="text-gray-600 text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                  >
                    Your account is now secured and ready to use
                  </motion.p>

                  <motion.div
                    className="text-6xl"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.1 }}
                  >
                    ✅ 🎉
                  </motion.div>

                  <motion.div
                    className="bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl p-4 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.3 }}
                  >
                    <p className="text-gray-700 text-lg font-semibold">
                      Redirecting to Profile Setup in{' '}
                      <span className="font-bold text-emerald-600 text-xl">3</span>s...
                    </p>
                  </motion.div>

                  <motion.p
                    className="text-gray-600 text-sm italic"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.5 }}
                  >
                    🎊 Welcome to your secure learning journey! 🎊
                  </motion.p>
                </motion.div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {step === 'success' ? // Success state is handled in the header above
              null : step === 'mobile' && !usePasswordLogin ? (
                <motion.div
                  key="mobile-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Step 1: Mobile Entry */}
                  <div className="space-y-4">
                    {/* Country Code and Mobile Number */}
                    <div className="flex space-x-3">
                      {/* Country Code Dropdown */}
                      <div className="relative">
                        <select
                          value={countryCode}
                          onChange={e => setCountryCode(e.target.value)}
                          className="appearance-none bg-white bg-opacity-90 border border-white border-opacity-30 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent min-w-[100px]"
                        >
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+86">🇨🇳 +86</option>
                          <option value="+81">🇯🇵 +81</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">▼</span>
                        </div>
                      </div>

                      {/* Mobile Number Input */}
                      <div className="flex-1 relative">
                        <motion.input
                          type="tel"
                          value={mobileNumber}
                          onChange={e => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="Enter Mobile Number"
                          className="w-full px-4 py-3 bg-white bg-opacity-90 border border-white border-opacity-30 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent placeholder-gray-500 text-gray-800"
                          maxLength={10}
                          whileFocus={{
                            boxShadow: '0 0 20px rgba(20, 184, 166, 0.3)',
                            scale: 1.02,
                          }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}

                    {/* Send OTP Button */}
                    <motion.button
                      onClick={handleSendOtp}
                      disabled={mobileNumber.length < 10 || isLoading}
                      className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300"
                      whileHover={
                        mobileNumber.length >= 10 && !isLoading
                          ? {
                              scale: 1.02,
                              boxShadow: '0 10px 30px rgba(20, 184, 166, 0.4)',
                            }
                          : {}
                      }
                      whileTap={mobileNumber.length >= 10 && !isLoading ? { scale: 0.98 } : {}}
                    >
                      <span className="flex items-center justify-center">
                        {isLoading ? '⏳ Sending...' : '📱 Send OTP'}
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              ) : usePasswordLogin ? (
                <motion.div
                  key="password-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <div className="relative">
                        <select
                          value={countryCode}
                          onChange={e => setCountryCode(e.target.value)}
                          className="appearance-none bg-white bg-opacity-90 border border-white border-opacity-30 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent min-w-[100px]"
                        >
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                        </select>
                      </div>
                      <div className="flex-1 relative">
                        <motion.input
                          type="tel"
                          value={mobileNumber}
                          onChange={e => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="Enter Mobile Number"
                          className="w-full px-4 py-3 bg-white bg-opacity-90 border border-white border-opacity-30 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent placeholder-gray-500 text-gray-800"
                          maxLength={10}
                        />
                      </div>
                    </div>
                    <div>
                      <motion.input
                        type="password"
                        value={passwordLogin}
                        onChange={e => setPasswordLogin(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-3 bg-white bg-opacity-90 border border-white border-opacity-30 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent placeholder-gray-500 text-gray-800"
                      />
                    </div>
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}
                    <motion.button
                      onClick={handlePasswordSignIn}
                      disabled={mobileNumber.length < 10 || isLoading}
                      className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300"
                    >
                      <span className="flex items-center justify-center">
                        {isLoading ? 'Signing in...' : 'Sign In'}
                      </span>
                    </motion.button>
                    <div className="flex items-center justify-between mt-2">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm underline text-teal-600 hover:text-teal-700"
                      >
                        Forgot password?
                      </button>
                      <button
                        type="button"
                        onClick={() => setUsePasswordLogin(false)}
                        className="text-gray-500 hover:text-gray-700 text-sm underline"
                      >
                        Use OTP instead
                      </button>
                    </div>
                    {infoMsg && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-2">
                        <p className="text-blue-700 text-sm">{infoMsg}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Step 2: OTP Verification */}
                  <div className="space-y-6">
                    {/* Mobile Number Display */}
                    <div className="text-center">
                      <p className="text-gray-600 text-sm mb-4">
                        OTP sent to {countryCode} {mobileNumber.slice(0, -4).replace(/./g, 'X')}****
                      </p>
                      <button
                        onClick={() => setStep('mobile')}
                        className="text-gray-500 hover:text-gray-700 text-sm underline"
                      >
                        Change number
                      </button>
                    </div>

                    {/* 6-digit OTP Input */}
                    <div className="flex justify-center space-x-3">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <motion.input
                          key={index}
                          ref={el => (otpRefs.current[index] = el)}
                          type="text"
                          value={otp[index]}
                          onChange={e => handleOtpChange(index, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(index, e)}
                          className="w-14 h-16 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-800 transition-all duration-200"
                          maxLength={1}
                          inputMode="numeric"
                          whileFocus={{
                            scale: 1.05,
                            boxShadow: '0 0 15px rgba(20, 184, 166, 0.4)',
                          }}
                          animate={
                            otp[index]
                              ? {
                                  scale: [1, 1.15, 1],
                                  transition: { duration: 0.3, ease: 'easeOut' },
                                }
                              : {}
                          }
                        />
                      ))}
                    </div>

                    {/* Error Display */}
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}

                    {/* Resend Timer */}
                    <div className="text-center space-y-2">
                      {resendTimer > 0 ? (
                        <p className="text-gray-600 text-sm">
                          Didn't receive? Resend OTP in{' '}
                          <span className="font-bold text-teal-600">{resendTimer}s</span>
                        </p>
                      ) : (
                        <button
                          onClick={handleResendOtp}
                          disabled={isLoading}
                          className="text-teal-600 hover:text-teal-700 disabled:text-gray-400 font-semibold text-sm underline disabled:no-underline"
                        >
                          {isLoading ? 'Resending...' : 'Resend OTP'}
                        </button>
                      )}
                    </div>

                    {/* Verify Button */}
                    <motion.button
                      onClick={handleVerifyOtp}
                      disabled={!isOtpComplete || isLoading}
                      className={`w-full font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 ${
                        isOtpComplete && !isLoading
                          ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white cursor-pointer'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      whileHover={
                        isOtpComplete && !isLoading
                          ? {
                              scale: 1.02,
                              boxShadow: '0 10px 30px rgba(20, 184, 166, 0.4)',
                            }
                          : {}
                      }
                      whileTap={isOtpComplete && !isLoading ? { scale: 0.98 } : {}}
                    >
                      {isLoading ? '⏳ Verifying...' : 'Verify & Continue'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer Links */}
            {step !== 'success' && (
              <div className="text-center space-y-3 mt-8">
                <p className={`text-xs ${step === 'mobile' ? 'text-blue-100' : 'text-gray-500'}`}>
                  By continuing, you agree to{' '}
                  <button
                    className={`underline ${
                      step === 'mobile'
                        ? 'text-teal-200 hover:text-teal-100'
                        : 'text-teal-600 hover:text-teal-700'
                    }`}
                  >
                    Terms & Privacy Policy
                  </button>
                </p>

                <p className={`text-sm ${step === 'mobile' ? 'text-blue-100' : 'text-gray-500'}`}>
                  <button
                    className={`transition-colors duration-200 underline ${
                      step === 'mobile'
                        ? 'text-teal-200 hover:text-teal-100'
                        : 'text-teal-600 hover:text-teal-700'
                    }`}
                  >
                    Need help?
                  </button>
                </p>

                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setUsePasswordLogin(v => !v)}
                    className="text-sm underline text-teal-600 hover:text-teal-700"
                  >
                    {usePasswordLogin ? 'Use OTP login' : 'Use password instead'}
                  </button>
                </div>
                {onSkip && (
                  <p
                    className={`text-sm mt-4 ${
                      step === 'mobile' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    <button
                      onClick={onSkip}
                      className={`transition-colors duration-200 underline ${
                        step === 'mobile'
                          ? 'text-white/70 hover:text-white'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Skip for now
                    </button>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Illustration Elements */}
        <div className="absolute bottom-10 left-10 w-6 h-6 bg-yellow-300 rounded-full opacity-70 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-16 w-4 h-4 bg-pink-300 rounded-full opacity-70 animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-40 right-10 w-5 h-5 bg-cyan-300 rounded-full opacity-70 animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>
    </div>
  );
};

export default LoginSignup;
