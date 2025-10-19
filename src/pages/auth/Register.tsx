import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import '@/lib/auth/bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  EmailAuthProvider,
  linkWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { navigateAfterAuth } from '@/utils/onboardingRouter';
import { db, auth } from '@/lib/firebase';
import { confirmMoveSession } from '@/components/ConfirmMoveSession';
import { saveUserProfile } from '@/lib/saveProfile';
import { withBackoff, refreshIfExpired } from '@/lib/auth/retry';
import {
  CASTE_OPTIONS,
  GENDER_OPTIONS,
  STATE_OPTIONS,
  STATE_ZONE_OPTIONS,
  CENTRAL_ZONE_OPTIONS,
  districtsForState,
} from '@/constants/options';
import '../../styles/forms.css';

/**
 * Robust Register component.
 *
 * Assumptions:
 * - Your OTP send/verify flow calls setOtpVerified(true) and results in auth.currentUser being set.
 * - If your project uses different import aliases, adjust '@/...' paths accordingly.
 *
 * This component is intentionally verbose with console logs and inline errors to
 * help debug why register button previously did nothing.
 */

const Register: React.FC = () => {
  const navigate = useNavigate();
  const confirmationResultRef = useRef<any>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  const ensureRecaptcha = useCallback(() => {
    if (recaptchaRef.current) return recaptchaRef.current;
    // Ensure container exists in DOM
    try {
      if (typeof document !== 'undefined') {
        let el = document.getElementById('recaptcha-container');
        if (!el) {
          el = document.createElement('div');
          el.id = 'recaptcha-container';
          el.style.display = 'none';
          document.body.appendChild(el);
        }
      }
    } catch {}

    recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });
    return recaptchaRef.current;
  }, []);

  const clearRecaptcha = useCallback(() => {
    try {
      recaptchaRef.current?.clear();
    } catch {}
    recaptchaRef.current = null;
  }, []);

  // Robust token refresh: try immediate refresh, then reload+retry with small backoff
  const refreshUserToken = useCallback(async () => {
    const u = auth.currentUser;
    if (!u) return;
    try {
      await u.getIdToken(true);
      return;
    } catch (e: any) {
      if (e?.code === 'auth/user-token-expired' || e?.code === 'auth/id-token-expired') {
        try {
          await u.reload();
          await new Promise(r => setTimeout(r, 250));
          await u.getIdToken(true);
          return;
        } catch (e2) {
          // swallow to keep UX flowing; subsequent calls will retry
        }
      }
    }
  }, []);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [caste, setCaste] = useState('');
  const [gender, setGender] = useState('');
  const [phc, setPhc] = useState(false);
  const [exService, setExService] = useState(false);
  const [dob, setDob] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [stateZone, setStateZone] = useState('');
  const [centralZone, setCentralZone] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isResendActive, setIsResendActive] = useState(false);

  // UI state
  const [busy, setBusy] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Computed values
  const age = useMemo(() => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return Math.max(0, age);
  }, [dob]);

  const districts = useMemo(() => districtsForState(state), [state]);

  const strongPwd = (pwd: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd);
  const canVerify = phone.length === 10 && otp.length === 6;
  const canRegister =
    !!firstName.trim() && (!password || (password === confirmPassword && strongPwd(password)));

  // Reset district when state changes
  useEffect(() => {
    setDistrict('');
  }, [state]);

  // Suppress global auth redirects while on this screen
  useEffect(() => {
    try {
      localStorage.setItem('auth_intent', 'register');
    } catch {}
    return () => {
      try {
        if (localStorage.getItem('auth_intent') === 'register') {
          localStorage.removeItem('auth_intent');
        }
      } catch {}
    };
  }, []);

  // Check if user is already authenticated and redirect accordingly
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        // Check if user has completed onboarding
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data()?.onboarded === true) {
            navigate('/home');
          } else {
            navigate('/onboarding');
          }
        } catch (err) {
          console.error('Error checking user onboarding status:', err);
        }
      }
    });
    return unsubscribe;
  }, [navigate]);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
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
    return () => interval && clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async () => {
    if (phone.length !== 10) return;

    setError(null);
    setSendingOtp(true);

    try {
      const appVerifier = ensureRecaptcha();
      const sendPromise = signInWithPhoneNumber(auth, `+91${phone}`, appVerifier);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timed out sending OTP. Please try again.')), 20000)
      );
      const confirmationResult = await Promise.race([sendPromise, timeoutPromise]);
      confirmationResultRef.current = confirmationResult;
      setSuccess('OTP sent successfully!');
      setResendTimer(28);
      setIsResendActive(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP');
      clearRecaptcha();
      confirmationResultRef.current = null;
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!isResendActive) return;
    setError(null);
    setSuccess(null);
    setSendingOtp(true);
    try {
      clearRecaptcha();
      confirmationResultRef.current = null;
      const appVerifier = ensureRecaptcha();
      const sendPromise = signInWithPhoneNumber(auth, `+91${phone}`, appVerifier);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timed out sending OTP. Please try again.')), 20000)
      );
      const confirmationResult = await Promise.race([sendPromise, timeoutPromise]);
      confirmationResultRef.current = confirmationResult;
      setSuccess('OTP re-sent successfully!');
      setOtpVerified(false);
      setOtp('');
      setResendTimer(28);
      setIsResendActive(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to resend OTP');
      clearRecaptcha();
      confirmationResultRef.current = null;
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResultRef.current || otp.length !== 6) return;

    setError(null);
    setVerifyingOtp(true);

    try {
      await confirmationResultRef.current.confirm(otp);
      // Ensure fresh token for subsequent Firestore writes
      await refreshUserToken();
      setOtpVerified(true);
      setSuccess('Phone verified successfully!');
    } catch (err: any) {
      setError(err?.message || 'Failed to verify OTP');
      // Allow resend
      try {
        recaptchaRef.current?.clear();
      } catch {}
      recaptchaRef.current = null;
      confirmationResultRef.current = null;
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Combined verify + register handler (best-effort bind + central routing)
  const handleVerifyAndRegister = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!confirmationResultRef.current) throw new Error('OTP not sent');
      if (otp.length !== 6) throw new Error('Enter 6-digit OTP');

      const cred = await confirmationResultRef.current.confirm(otp);
      const user = cred?.user;
      if (!user) throw new Error('No user after OTP confirmation');

      await refreshUserToken();

      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          phoneNumber: user.phoneNumber ?? `+91${phone}`,
          onboarded: false,
          onboarding: {
            completed: false,
            mediumId: null,
            boardId: null,
            examId: null,
            courseId: null,
            subjectId: null,
          },
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      try {
        await withBackoff(() => bindActiveDevice(), { onBeforeRetry: refreshIfExpired });
      } catch (e: any) {
        if (e?.code === 'functions/failed-precondition' || String(e?.message || '').includes('ACTIVE_ON_ANOTHER_DEVICE')) {
          const ok = await confirmMoveSession();
          if (ok) { try { await withBackoff(() => bindActiveDevice(true), { onBeforeRetry: refreshIfExpired }); } catch {} }
        }
      }

      try {
        localStorage.removeItem('auth_intent');
      } catch {}
      await navigateAfterAuth(navigate);
    } catch (err) {
      console.error('Verify & Register failed:', err);
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (e?: any) => {
    try { e?.preventDefault?.(); e?.stopPropagation?.(); } catch {}
    try {
      setError(null);
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      if (!otpVerified) throw new Error('Please verify your phone first.');

      await setDoc(
        doc(db, 'users', user.uid),
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          fullName: `${firstName} ${lastName}`.trim(),
          fullNameLc: `${firstName} ${lastName}`.trim().toLowerCase(),
          gender: gender || null,
          caste: caste || null,
          phc: !!phc,
          exService: !!exService,
          dob: dob || null,
          age: age || null,
          state: state || null,
          district: district || null,
          stateZone: stateZone || null,
          centralZone: centralZone || null,
          phone: `+91${phone}`,
          onboarded: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      if (password && password === confirmPassword && strongPwd(password)) {
        const digits = `+91${phone}`.replace(/\D/g, '');
        const synthEmail = `ph-${digits}@testyourself.app`;
        try {
          await refreshUserToken();
          const cred = EmailAuthProvider.credential(synthEmail, password);
          await linkWithCredential(user, cred);
          await refreshUserToken();
          await setDoc(
            doc(db, 'users', user.uid),
            { credentials: { hasPassword: true }, updatedAt: serverTimestamp() },
            { merge: true }
          );
        } catch (e: any) {
          if (
            e?.code !== 'auth/credential-already-in-use' &&
            e?.code !== 'auth/provider-already-linked'
          ) {
            console.warn('Link email/password failed:', e);
          }
        }
      }

      // Ensure a fresh token before bind; phone OTP/linking can rotate tokens
      await refreshUserToken();
      // Bind device, but donâ€™t block registration if it hiccups
      try {
        await withBackoff(() => bindActiveDevice(), { onBeforeRetry: refreshIfExpired });
      } catch {
        // best-effort only
      }
      // Persist profile snapshot (redundant-safe merge) and proceed
      try {
        await saveUserProfile({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dob: dob || null,
          age: age ?? null,
          onboarded: true,
        });
      } catch {}

      // release the lock and proceed
      try {
        localStorage.removeItem('auth_intent');
      } catch {}
      // explicit redirect to tutorials (requested)
      try { setTimeout(() => navigate('/onboardingtutorials', { replace: true }), 50); } catch {}
      // fallback navigation based on user doc (kept for safety)
      await navigateAfterAuth(navigate);
    } catch (e: any) {
      setError(e?.message || 'Failed to register');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      {/* Hero Section */}
      <div className="min-h-[220px] flex items-center justify-center px-4">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-2">Register</h1>
          <p className="text-purple-100 text-lg">Create your account to start learning</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8">
            {/* Success/Error Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="form-section-title mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={e => setFirstName(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white/90 px-4 py-3"
                          placeholder="Enter your first name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Surname
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={e => setLastName(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white/90 px-4 py-3"
                          placeholder="Enter your surname"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white/90 px-4 py-3"
                      >
                        <option value="">Select gender</option>
                        {GENDER_OPTIONS.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Social & Eligibility */}
                <div>
                  <h3 className="form-section-title mb-4">Social & Eligibility</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Caste Category
                      </label>
                      <select
                        value={caste}
                        onChange={e => setCaste(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white/90 px-4 py-3"
                      >
                        <option value="">Select caste category</option>
                        {CASTE_OPTIONS.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={phc}
                          onChange={e => setPhc(e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Persons with Disabilities (PHC)
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exService}
                          onChange={e => setExService(e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Ex-Service Personnel</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location & DOB */}
              <div className="space-y-6">
                {/* Location */}
                <div>
                  <h3 className="form-section-title mb-4">Location</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <select
                        value={state}
                        onChange={e => setState(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white/90 px-4 py-3"
                      >
                        <option value="">Select state</option>
                        {STATE_OPTIONS.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        District
                      </label>
                      <select
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        disabled={!districts.length}
                        className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white/90 px-4 py-3 disabled:opacity-50"
                      >
                        <option value="">Select district</option>
                        {districts.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State Zone
                        </label>
                        <select
                          value={stateZone}
                          onChange={e => setStateZone(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white/90 px-4 py-3"
                        >
                          <option value="">Select zone</option>
                          {STATE_ZONE_OPTIONS.map(option => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Central Zone
                        </label>
                        <select
                          value={centralZone}
                          onChange={e => setCentralZone(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white/90 px-4 py-3"
                        >
                          <option value="">Select zone</option>
                          {CENTRAL_ZONE_OPTIONS.map(option => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <h3 className="form-section-title mb-4">Date of Birth</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={e => setDob(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white/90 px-4 py-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                      <input
                        type="number"
                        value={age || ''}
                        readOnly
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 cursor-not-allowed"
                        placeholder="Auto-calculated"
                      />
                      <p className="helper mt-1">
                        Age is automatically calculated from date of birth
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone Verification */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="form-section-title mb-4">Phone Verification</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-xl">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => {
                        setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10));
                        setOtpVerified(false);
                        setOtp('');
                      }}
                      className="flex-1 rounded-r-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white/90 px-4 py-3"
                      placeholder="1234567890"
                      maxLength={10}
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || phone.length !== 10}
                    className="w-full h-11 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium transition-colors"
                  >
                    {sendingOtp ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    OTP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white/90 px-4 py-3"
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>
              </div>
              {/* Optional password to enable future login without OTP */}
              {/* Resend OTP controls */}
              <div className="mt-3">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-600">
                    Didnâ€™t receive? Resend OTP in{' '}
                    <span className="font-semibold text-indigo-600">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!isResendActive || sendingOtp}
                    className="text-sm underline text-indigo-600 hover:text-indigo-700 disabled:text-gray-400"
                  >
                    {sendingOtp ? 'Resendingâ€¦' : 'Resend OTP'}
                  </button>
                )}
              </div>

              {/* Optional password to enable future login without OTP */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Set Password (optional)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white/90 px-4 py-3"
                    placeholder="Min 8 chars, Aa1@"
                  />
                  {password && !strongPwd(password) && (
                    <p className="text-xs text-red-500 mt-1">
                      Use at least 8 characters with uppercase, lowercase, number and symbol.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white/90 px-4 py-3"
                    placeholder="Re-enter password"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp || !canVerify}
                  className="h-11 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium transition-colors"
                >
                  {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={!otpVerified || !canRegister}
                  className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium transition-colors"
                >
                  Register
                </button>
              </div>
              {otpVerified && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-700 text-sm font-medium">
                    âœ“ Phone verified successfully!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container" className="hidden" />
    </div>
  );
};

export default Register;





