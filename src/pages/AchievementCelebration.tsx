import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';

interface AchievementCelebrationProps {
  badgeName?: string;
  description?: string;
  learnerName?: string;
  rewardCoins?: number;
  isStreak?: boolean;
  onViewAchievements?: () => void;
  onContinue?: () => void;
}

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  hue: number;
  size: number;
}

interface CoinPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  scale: number;
}

const AchievementCelebration: React.FC<AchievementCelebrationProps> = ({
  badgeName = 'Math Master – 10 Quizzes Completed',
  description = 'Well done, Champion! Keep it up!',
  learnerName = 'Champion',
  rewardCoins = 120,
  isStreak = true,
  onViewAchievements,
  onContinue
}) => {
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowBadge(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const confettiPieces = useMemo<ConfettiPiece[]>(() =>
    Array.from({ length: 35 }).map((_, index) => ({
      id: index,
      left: Math.random() * 100,
      delay: Math.random() * 1.8,
      duration: 3 + Math.random() * 2,
      hue: Math.floor(Math.random() * 360),
      size: 6 + Math.random() * 10
    })),
    []
  );

  const coinPieces = useMemo<CoinPiece[]>(() =>
    Array.from({ length: 20 }).map((_, index) => ({
      id: index,
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 2.5 + Math.random() * 1.5,
      scale: 0.7 + Math.random() * 0.6
    })),
    []
  );

  const fireworks = useMemo(() => [
    { id: 1, top: '25%', left: '20%', delay: 0 },
    { id: 2, top: '18%', left: '70%', delay: 0.8 },
    { id: 3, top: '50%', left: '85%', delay: 1.2 },
  ], []);

  return (
    <Layout variant="fullscreen" showHeader={false} showFooter={false} className="relative overflow-hidden">
      <div className="celebration-bg absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

      {/* Fireworks */}
      {fireworks.map((firework) => (
        <span
          key={firework.id}
          className="firework"
          style={{
            top: firework.top,
            left: firework.left,
            animationDelay: `${firework.delay}s`
          }}
        />
      ))}

      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confettiPieces.map(piece => (
          <span
            key={`confetti-${piece.id}`}
            className="confetti-piece"
            style={{
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              width: piece.size,
              height: piece.size,
              background: `hsl(${piece.hue}deg 80% 60%)`
            }}
          />
        ))}
      </div>

      {/* Coins */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {coinPieces.map(piece => (
          <span
            key={`coin-${piece.id}`}
            className="coin-piece"
            style={{
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              transform: `scale(${piece.scale})`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-10 text-center text-white">
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="uppercase tracking-[0.35em] text-xs md:text-sm text-indigo-200 mb-6"
        >
          Achievement Unlocked
        </motion.p>

        <motion.div
          initial={{ scale: 0, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.9, type: 'spring', bounce: 0.45 }}
          className="relative mb-8"
        >
          <motion.div
            animate={{ rotate: showBadge ? [0, 15, -10, 10, 0] : 0 }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="badge-glow"
          />
          <motion.div
            className="flex items-center justify-center rounded-full badge-ring"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="badge-core"
            >
              <motion.span
                aria-hidden
                className="text-6xl md:text-7xl drop-shadow-[0_0_25px_rgba(255,215,0,0.65)]"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                🏅
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1 }}
          className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-100 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]"
        >
          {badgeName}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-lg md:text-xl text-indigo-100 mt-4 max-w-xl"
        >
          {description || `Well done, ${learnerName}! Keep it up!`}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="mt-6 flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-3 text-lg font-semibold text-amber-200">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <span className="text-2xl">🪙</span>
              +{rewardCoins} bonus coins
            </span>
            {isStreak && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-orange-200">
                <span className="text-2xl">🔥</span>
                Streak boost active
              </span>
            )}
          </div>
          <p className="text-sm text-indigo-200/80 max-w-md">
            Coins will be added to your wallet instantly. Keep exploring challenges to stack more rewards!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.6 }}
          className="mt-12 flex flex-col sm:flex-row gap-4 w-full max-w-lg"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onViewAchievements}
            className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 text-slate-950 font-semibold shadow-[0_20px_45px_-15px_rgba(45,212,191,0.9)] border border-teal-200/30"
          >
            View All Achievements
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onContinue}
            className="flex-1 px-6 py-3 rounded-full border border-white/70 text-white font-semibold bg-white/10 backdrop-blur-sm hover:bg-white/15 transition"
          >
            Continue
          </motion.button>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AchievementCelebration;
