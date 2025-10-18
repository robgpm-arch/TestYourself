import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import {
  EmailAuthProvider,
  linkWithCredential,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import ResponsiveGrid from '../components/ResponsiveGrid';
import { useMotivationPersonality } from '../hooks/useMotivationPersonality';

const Profile: React.FC = () => {
  const [streakAnimation, setStreakAnimation] = useState(false);
  const [coinsAnimation, setCoinAnimation] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [hasPassword, setHasPassword] = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdErr, setPwdErr] = useState<string | null>(null);
  const strongPwd = (pwd: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd);

  // User data with gamification elements
  const [user, setUser] = useState({
    name: 'Priya Sharma',
    tagline: 'Preparing for NEET 2025',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face',
    level: 7,
    levelProgress: 60, // 60% to next level
    streakDays: 12,
    totalCoins: 850,
    totalQuizzes: 45,
    accuracy: 87,
    hoursSpent: 156,
    status: 'Bronze', // Bronze, Silver, Gold
  });

  // Load real user profile details from Firestore (first/last name, state/district)
  useEffect(() => {
    (async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const snap = await getDoc(doc(db, 'users', uid));
        if (!snap.exists()) return;
        const d: any = snap.data();
        const composedName = [d?.firstName, d?.lastName].filter(Boolean).join(' ').trim();
        const tagline = [d?.state, d?.district].filter(Boolean).join(' • ');
        setUser(prev => ({
          ...prev,
          name: composedName || prev.name,
          tagline: tagline || prev.tagline,
        }));
        setHasPassword(Boolean(d?.credentials?.hasPassword));
      } catch (e) {
        // ignore – keep defaults
      }
    })();
  }, []);

  const changePassword = async () => {
    setPwdErr(null);
    setPwdMsg(null);
    try {
      if (!auth.currentUser) throw new Error('Not authenticated');
      const digits = (auth.currentUser.phoneNumber || '').replace(/\D/g, '');
      const email = `ph-${digits}@testyourself.app`;

      if (!strongPwd(pwdNew)) throw new Error('Weak password. Use 8+ chars with Aa1@');
      if (pwdNew !== pwdConfirm) throw new Error('Passwords do not match');

      if (hasPassword) {
        if (!pwdCurrent) throw new Error('Enter current password');
        const cred = EmailAuthProvider.credential(email, pwdCurrent);
        await reauthenticateWithCredential(auth.currentUser, cred);
        await updatePassword(auth.currentUser, pwdNew);
      } else {
        const cred = EmailAuthProvider.credential(email, pwdNew);
        await linkWithCredential(auth.currentUser, cred);
        await setDoc(
          doc(db, 'users', auth.currentUser.uid),
          { credentials: { hasPassword: true }, updatedAt: serverTimestamp() },
          { merge: true }
        );
        setHasPassword(true);
      }
      setPwdMsg('Password updated successfully.');
      setPwdCurrent('');
      setPwdNew('');
      setPwdConfirm('');
    } catch (e: any) {
      setPwdErr(e?.message || 'Failed to update password');
    }
  };

  // Achievement badges with sparkle animations
  const achievements = [
    {
      title: 'First Steps',
      description: 'Complete your first quiz',
      earned: true,
      icon: '🎯',
      color: 'from-green-400 to-green-600',
      sparkle: true,
    },
    {
      title: 'Streak Master',
      description: '7-day learning streak',
      earned: true,
      icon: '🔥',
      color: 'from-red-400 to-red-600',
      sparkle: true,
    },
    {
      title: 'Quiz Champion',
      description: 'Complete 25 quizzes',
      earned: true,
      icon: '🏆',
      color: 'from-yellow-400 to-yellow-600',
      sparkle: true,
    },
    {
      title: 'Speed Demon',
      description: 'Complete quiz in under 2 minutes',
      earned: true,
      icon: '⚡',
      color: 'from-blue-400 to-blue-600',
      sparkle: true,
    },
    {
      title: 'Perfect Score',
      description: 'Get 100% accuracy',
      earned: false,
      icon: '⭐',
      color: 'from-purple-400 to-purple-600',
      sparkle: false,
    },
    {
      title: 'NEET Warrior',
      description: 'Master Biology section',
      earned: false,
      icon: '🧬',
      color: 'from-teal-400 to-teal-600',
      sparkle: false,
    },
    {
      title: 'Night Owl',
      description: 'Study after midnight',
      earned: true,
      icon: '🦉',
      color: 'from-indigo-400 to-indigo-600',
      sparkle: true,
    },
    {
      title: 'Consistency King',
      description: '30-day streak',
      earned: false,
      icon: '👑',
      color: 'from-pink-400 to-pink-600',
      sparkle: false,
    },
  ];

  const { personalities, selectedPersonality, selectPersonality } = useMotivationPersonality();

  // Badge carousel rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBadgeIndex(prev => (prev + 1) % achievements.filter(a => a.earned).length);
    }, 3000);
    return () => clearInterval(interval);
  }, [achievements]);

  // Streak pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setStreakAnimation(true);
      setTimeout(() => setStreakAnimation(false), 600);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Coins bounce animation
  const triggerCoinsAnimation = () => {
    setCoinAnimation(true);
    setTimeout(() => setCoinAnimation(false), 800);
  };

  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Bronze':
        return 'from-amber-600 to-yellow-700';
      case 'Silver':
        return 'from-gray-400 to-gray-600';
      case 'Gold':
        return 'from-yellow-400 to-yellow-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'Bronze':
        return '🥉';
      case 'Silver':
        return '🥈';
      case 'Gold':
        return '🥇';
      default:
        return '🏅';
    }
  };

  const earnedBadges = achievements.filter(achievement => achievement.earned);

  // Sparkle animation component
  const SparkleEffect = ({ show }: { show: boolean }) => (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="absolute inset-0 pointer-events-none"
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 1,
                delay: i * 0.1,
                repeat: 2,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <Layout>
      {/* Animated Background */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100 relative overflow-hidden">
        {/* Background icons */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 text-6xl">👤</div>
          <div className="absolute top-40 right-20 text-5xl">🏅</div>
          <div className="absolute bottom-40 left-20 text-4xl">👤</div>
          <div className="absolute bottom-20 right-10 text-5xl">🏅</div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
            className="mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <motion.img
                      src={user.avatar}
                      alt={user.name}
                      className="w-28 h-28 rounded-full border-4 border-white shadow-xl"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700"
                    >
                      ✏️
                    </motion.button>
                  </div>

                  {/* Status Badge */}
                  <motion.div
                    className={`mt-4 px-4 py-2 rounded-full bg-gradient-to-r ${getStatusColor(user.status)} text-white font-bold text-sm shadow-lg flex items-center gap-2`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-lg">{getStatusEmoji(user.status)}</span>
                    {user.status}
                  </motion.div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left">
                  <motion.h1
                    className="text-4xl font-bold text-gray-800 mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {user.name}
                  </motion.h1>
                  <motion.p
                    className="text-lg text-gray-600 mb-6 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {user.tagline}
                  </motion.p>

                  {/* Level Progress */}
                  <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Level {user.level}</span>
                      <span className="text-sm text-gray-600">{user.levelProgress}% to next</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${user.levelProgress}%` }}
                        transition={{ duration: 1.5, delay: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Gamification Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {/* Streak Counter */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex items-center gap-4">
                <motion.div
                  className="text-4xl"
                  animate={streakAnimation ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.6 }}
                >
                  🔥
                </motion.div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {user.streakDays}-day streak
                  </div>
                  <div className="text-sm text-gray-600">Keep it going!</div>
                </div>
              </div>
            </div>

            {/* Coins Balance */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex items-center gap-4">
                <motion.div
                  className="text-4xl cursor-pointer"
                  onClick={triggerCoinsAnimation}
                  animate={coinsAnimation ? { y: [-5, -15, -5], rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                >
                  🪙
                </motion.div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{user.totalCoins} Coins</div>
                  <div className="text-sm text-gray-600">Spend wisely!</div>
                </div>
              </div>
            </div>

            {/* Level Badge */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user.level}
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">Level {user.level}</div>
                  <div className="text-sm text-gray-600">{user.levelProgress}% to next</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Change/Set Password */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-8"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {hasPassword ? 'Change Password' : 'Set Password'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hasPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={pwdCurrent}
                    onChange={e => setPwdCurrent(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={pwdNew}
                  onChange={e => setPwdNew(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3"
                  placeholder="Min 8 chars, Aa1@"
                />
                {pwdNew && !strongPwd(pwdNew) && (
                  <p className="text-xs text-red-500 mt-1">
                    Use at least 8 chars with uppercase, lowercase, number and symbol.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={pwdConfirm}
                  onChange={e => setPwdConfirm(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3"
                />
                {pwdConfirm && pwdNew !== pwdConfirm && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={changePassword}
                className="h-11 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium"
              >
                {hasPassword ? 'Change Password' : 'Set Password'}
              </button>
              {pwdMsg && <span className="text-green-600 text-sm">{pwdMsg}</span>}
              {pwdErr && <span className="text-red-600 text-sm">{pwdErr}</span>}
            </div>
          </motion.div>

          {/* Motivational personality selector */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Motivation personality</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose who greets you after each quiz. Your choice is saved across devices.
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white shadow-sm">
                      <img
                        src={selectedPersonality.previewGif}
                        alt={selectedPersonality.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-blue-500">
                        Current favourite
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {selectedPersonality.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {personalities.map(personality => {
                  const isSelected = personality.id === selectedPersonality.id;
                  return (
                    <div
                      key={personality.id}
                      className={`relative rounded-2xl border transition-all duration-200 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md ${
                        isSelected ? 'border-blue-500 shadow-lg' : 'border-white'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={personality.previewGif}
                          alt={`${personality.name} preview`}
                          className="w-full h-40 object-cover rounded-t-2xl"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                            Selected
                          </div>
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <p className="text-sm uppercase tracking-[0.25em] text-blue-500">
                            {personality.title}
                          </p>
                          <p className="text-lg font-semibold text-gray-900">{personality.name}</p>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {personality.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {personality.traits.map(trait => (
                            <span
                              key={trait}
                              className="text-[11px] uppercase tracking-wide bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                        <Button
                          onClick={() => selectPersonality(personality.id)}
                          variant={isSelected ? 'secondary' : 'outline'}
                          size="small"
                          fullWidth
                          className={
                            isSelected
                              ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'
                              : ''
                          }
                        >
                          {isSelected ? 'Currently selected' : 'Set as favourite'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Achievements Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Achievements</h3>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => setShowAllBadges(!showAllBadges)}
                >
                  View All Badges
                </Button>
              </div>

              {/* Badge Carousel */}
              <div className="flex overflow-hidden gap-4">
                <AnimatePresence mode="wait">
                  {earnedBadges
                    .slice(currentBadgeIndex, currentBadgeIndex + 4)
                    .map((badge, index) => (
                      <motion.div
                        key={badge.title}
                        initial={{ opacity: 0, scale: 0.8, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: -50 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="relative flex-shrink-0"
                      >
                        <div
                          className={`w-16 h-16 bg-gradient-to-br ${badge.color} rounded-full flex items-center justify-center shadow-lg relative overflow-hidden`}
                        >
                          <span className="text-2xl">{badge.icon}</span>
                          <SparkleEffect show={badge.sparkle} />
                        </div>
                        <div className="text-center mt-2">
                          <div className="text-xs font-medium text-gray-700">{badge.title}</div>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Learning Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {/* Total Quizzes */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{user.totalQuizzes}</div>
              <div className="text-gray-700 font-medium mb-1">Total Quizzes Played</div>
              <div className="text-sm text-gray-500">Keep learning!</div>
            </div>

            {/* Accuracy with Pie Chart Representation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray={`${user.accuracy}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-600">{user.accuracy}%</span>
                </div>
              </div>
              <div className="text-gray-700 font-medium mb-1">Accuracy %</div>
              <div className="text-sm text-gray-500">Great job!</div>
            </div>

            {/* Hours Spent */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{user.hoursSpent}</div>
              <div className="text-gray-700 font-medium mb-1">Hours Spent Learning</div>
              <div className="text-sm text-gray-500">Dedicated student!</div>
            </div>
          </motion.div>

          {/* All Badges Modal */}
          <AnimatePresence>
            {showAllBadges && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowAllBadges(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">All Achievements</h3>
                    <button
                      onClick={() => setShowAllBadges(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center"
                      >
                        <div
                          className={`relative w-20 h-20 bg-gradient-to-br ${achievement.color} rounded-full flex items-center justify-center mx-auto mb-3 ${achievement.earned ? 'shadow-lg' : 'grayscale opacity-50'}`}
                        >
                          <span className="text-3xl">{achievement.icon}</span>
                          {achievement.earned && <SparkleEffect show={achievement.sparkle} />}
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                        {achievement.earned ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Earned
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Locked
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button variant="outline" size="large" className="flex items-center gap-2">
              <span>⚙️</span>
              Settings
            </Button>
            <Button
              variant="default"
              size="large"
              className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
            >
              <span>📤</span>
              Share Profile
            </Button>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
