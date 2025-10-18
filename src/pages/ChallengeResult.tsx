import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';

interface PodiumPlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  streak?: number;
}

const crownVariants = {
  initial: { y: -10, rotate: -10, opacity: 0 },
  animate: {
    y: 0,
    rotate: [0, -4, 4, 0],
    opacity: 1,
    transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
  }
};

const ChallengeResult: React.FC = () => {
  const players = useMemo<PodiumPlayer[]>(() => [
    {
      id: 'p1',
      name: 'Kavya',
      avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=facearea&w=220&h=220&q=80',
      score: 1890,
      streak: 6
    },
    {
      id: 'p2',
      name: 'Rehan',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=220&h=220&q=80',
      score: 1780,
      streak: 3
    },
    {
      id: 'p3',
      name: 'Amrita',
      avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=facearea&w=220&h=220&q=80',
      score: 1715
    },
    {
      id: 'p4',
      name: 'Zeeshan',
      avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=220&h=220&q=80',
      score: 1650
    }
  ], []);

  const [displayScores, setDisplayScores] = useState<Record<string, number>>({});
  const topThree = players.slice(0, 3);
  const hasMorePlayers = players.length > 3;

  useEffect(() => {
    const intervals = topThree.map((player) => {
      const increment = Math.max(1, Math.floor(player.score / 80));
      return setInterval(() => {
        setDisplayScores(prev => {
          const current = prev[player.id] ?? 0;
          if (current >= player.score) {
            clearInterval(intervals[topThree.indexOf(player)]);
            return prev;
          }
          return { ...prev, [player.id]: Math.min(player.score, current + increment) };
        });
      }, 30);
    });

    return () => intervals.forEach(interval => clearInterval(interval));
  }, [topThree]);

  const podiumOrder: PodiumPlayer[] = [topThree[1], topThree[0], topThree[2]].filter(Boolean) as PodiumPlayer[];
  const podiumHeights = [180, 220, 160];
  const medals = ['🥈', '🥇', '🥉'];

  return (
    <Layout variant="fullscreen" showFooter={false} showHeader={false} className="relative overflow-hidden">
      <div className="challenge-bg absolute inset-0" />
      <div className="absolute inset-0 challenge-overlay" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="challenge-header">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-purple-200/80">Challenge Result</p>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-pink-200 to-cyan-200 drop-shadow-[0_0_50px_rgba(168,85,247,0.6)]">
              Victory Podium
            </h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-100/70">Lightning Science Showdown</p>
            <p className="text-xs text-purple-200/60">Round 7 • +150 coins reward</p>
          </div>
        </header>

        <main className="challenge-main">
          <div className="podium-wrapper">
            <div className="fireworks-layer" aria-hidden>
              {[...Array(6)].map((_, index) => (
                <span key={index} className={`podium-firework firework-${index + 1}`} />
              ))}
            </div>
            <motion.div
              className="podium-base"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />

            <div className="podium-columns">
              {podiumOrder.map((player, index) => (
                <motion.div
                  key={player.id}
                  className={`podium-column column-${index + 1}`}
                  initial={{ y: 120, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18, delay: index * 0.2 + 0.5 }}
                  style={{ height: podiumHeights[index] }}
                >
                  <div className="podium-avatar-wrap">
                    <motion.img
                      src={player.avatar}
                      alt={player.name}
                      className="podium-avatar"
                      initial={{ y: -30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.25 + 0.9, type: 'spring', stiffness: 200, damping: 12 }}
                    />
                    {index === 1 && (
                      <motion.span
                        className="podium-crown"
                        initial="initial"
                        animate="animate"
                        variants={crownVariants}
                        aria-hidden
                      >
                        👑
                      </motion.span>
                    )}
                    <span className="podium-medal" aria-hidden>{medals[index]}</span>
                  </div>
                  <div className="podium-info">
                    <p className="podium-name">{player.name}</p>
                    <AnimatePresence>
                      <motion.p
                        key={displayScores[player.id] ?? 0}
                        className="podium-score"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {(displayScores[player.id] ?? 0).toLocaleString()} pts
                      </motion.p>
                    </AnimatePresence>
                    {player.streak && player.streak > 0 && index === 1 && (
                      <div className="podium-streak">🔥 Streak Achieved! {player.streak} in a row</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {hasMorePlayers && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="view-leaderboard"
            >
              View Full Leaderboard
            </motion.button>
          )}
        </main>

        <footer className="challenge-footer">
          <div className="challenge-actions">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rematch-button"
            >
              Rematch
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="share-button"
            >
              Share Results
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="back-button"
            >
              Back to Lobby
            </motion.button>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default ChallengeResult;
