import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';

interface BattlePlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isLeader?: boolean;
  isMe?: boolean;
}

const optionColors = ['blue', 'green', 'orange', 'purple'] as const;

type OptionColor = (typeof optionColors)[number];

const MultiplayerBattle: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswerResult, setShowAnswerResult] = useState<'correct' | 'wrong' | null>(null);
  const [streakCount, setStreakCount] = useState(3);
  const [timer, setTimer] = useState(18);

  const players = useMemo<BattlePlayer[]>(
    () => [
      {
        id: 'p1',
        name: 'Kavya',
        avatar:
          'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=facearea&w=120&h=120&q=80',
        score: 1420,
        isLeader: true,
      },
      {
        id: 'p2',
        name: 'You',
        avatar:
          'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=120&h=120&q=80',
        score: 1375,
        isMe: true,
      },
      {
        id: 'p3',
        name: 'Rehan',
        avatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=120&h=120&q=80',
        score: 1305,
      },
      {
        id: 'p4',
        name: 'Amrita',
        avatar:
          'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=facearea&w=120&h=120&q=80',
        score: 1240,
      },
    ],
    []
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const question = {
    text: 'A solution has pH = 4. By how much should the hydrogen ion concentration change to reach neutral pH?',
    options: [
      'Decrease by 10⁴ times',
      'Increase by 10⁴ times',
      'Decrease by 10 times',
      'Increase by 10 times',
    ],
  };

  const handleSelectOption = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    const isCorrect = option === question.options[0];
    setShowAnswerResult(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setStreakCount(prev => prev + 1);
    } else {
      setStreakCount(0);
    }
  };

  const timerPercentage = (timer / 20) * 100;

  return (
    <Layout
      variant="fullscreen"
      showHeader={false}
      showFooter={false}
      className="relative overflow-hidden"
    >
      <div className="battle-bg absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 via-transparent to-black/90" />

      <div className="relative z-10 h-full flex flex-col">
        <header className="battle-leaderboard" role="region" aria-label="Live leaderboard">
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              className={`battle-leader ${player.isLeader ? 'leader-active' : ''} ${player.isMe ? 'leader-me' : ''}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <div className="relative mr-3">
                <img src={player.avatar} alt={player.name} className="leader-avatar" />
                {player.isLeader && (
                  <span className="leader-crown" aria-hidden>
                    👑
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="leader-name">{player.name}</p>
                <div className="leader-progress">
                  <motion.div
                    className="leader-progress-bar"
                    initial={{ width: '0%' }}
                    animate={{
                      width: `${Math.min(100, (player.score / players[0].score) * 100)}%`,
                    }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  />
                </div>
              </div>
              <motion.span
                className="leader-score"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                {player.score}
              </motion.span>
            </motion.div>
          ))}
        </header>

        <main className="battle-main">
          <motion.section
            className={`question-card ${showAnswerResult ? `answer-${showAnswerResult}` : ''}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="question-heading">Round 7 • Acid-Base Chemistry</p>
            <h2 className="question-text">{question.text}</h2>

            <div className="question-options">
              {question.options.map((option, idx) => {
                const color = optionColors[idx % optionColors.length];
                const isSelected = selectedOption === option;
                return (
                  <motion.button
                    key={option}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    className={`option-pill option-${color} ${isSelected ? 'selected' : ''}`}
                    whileHover={!selectedOption ? { scale: 1.03 } : undefined}
                    whileTap={!selectedOption ? { scale: 0.97 } : undefined}
                    disabled={!!selectedOption}
                  >
                    <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                    <span>{option}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.section>
        </main>

        <footer className="battle-footer">
          <div className="streak-meter" aria-label={`Current streak ${streakCount}`}>
            <div className={`streak-flame ${streakCount > 0 ? 'active' : ''}`}>🔥</div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">Streak</p>
              <p className="text-lg font-bold text-white">{streakCount} correct in a row</p>
            </div>
          </div>

          <div className="powerups" aria-label="Power-ups">
            <div className="powerup active">
              <span>🧠</span>
              <p>50-50</p>
            </div>
            <div className="powerup">
              <span>🕒</span>
              <p>Time Freeze</p>
            </div>
            <div className="powerup disabled">
              <span>👥</span>
              <p>Team Boost</p>
            </div>
          </div>

          <div className="battle-timer" aria-label={`Time left ${timer} seconds`}>
            <svg viewBox="0 0 120 120" className="timer-ring">
              <circle className="timer-track" cx="60" cy="60" r="52" />
              <motion.circle
                className="timer-progress"
                cx="60"
                cy="60"
                r="52"
                strokeDasharray="326"
                strokeDashoffset={326 - (326 * timerPercentage) / 100}
              />
            </svg>
            <div className="timer-label">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Timer</p>
              <p className="text-2xl font-semibold text-white">{timer}s</p>
            </div>
          </div>
        </footer>

        <AnimatePresence>
          {showAnswerResult === 'correct' && (
            <motion.div
              key="correct"
              className="answer-banner correct"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              ✅ Correct! +150 pts
            </motion.div>
          )}
          {showAnswerResult === 'wrong' && (
            <motion.div
              key="wrong"
              className="answer-banner wrong"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              ❌ Not quite. Shake it off!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default MultiplayerBattle;
