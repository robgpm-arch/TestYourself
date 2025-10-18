import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';

interface Mission {
  id: string;
  title: string;
  description: string;
  reward: string;
  rewardType: 'coins' | 'badge';
  icon: string;
  progress: number;
  target: number;
  isCompleted: boolean;
}

const missionVariants = {
  default: {
    rotateY: 0,
    background: 'rgba(255,255,255,0.94)',
    boxShadow: '0 30px 60px -25px rgba(249, 115, 22, 0.35)',
    borderColor: 'rgba(253, 186, 116, 0.35)',
  },
  completed: {
    rotateY: [0, 180, 360],
    background: 'linear-gradient(135deg, rgba(253,230,138,0.95), rgba(251,191,36,0.96))',
    boxShadow: '0 40px 80px -30px rgba(217,119,6,0.55)',
    borderColor: 'rgba(250, 204, 21, 0.8)',
    transition: {
      rotateY: { duration: 0.8, ease: 'easeInOut' },
      background: { duration: 0.4 },
      boxShadow: { duration: 0.4 },
      borderColor: { duration: 0.4 },
    },
  },
};

const DailyChallenges: React.FC = () => {
  const missionsData = useMemo<Mission[]>(
    () => [
      {
        id: 'mission-1',
        title: 'Complete 2 Science quizzes today',
        description: 'Keep your curiosity burning bright with focused practice.',
        reward: '+20 coins',
        rewardType: 'coins',
        icon: '🧪',
        progress: 1,
        target: 2,
        isCompleted: false,
      },
      {
        id: 'mission-2',
        title: 'Maintain 5-day streak',
        description: 'Consistency unlocked your flame bonus — don’t let it go!',
        reward: 'Special Badge 🏅',
        rewardType: 'badge',
        icon: '🔥',
        progress: 5,
        target: 5,
        isCompleted: true,
      },
      {
        id: 'mission-3',
        title: 'Score 80%+ in any quiz',
        description: 'Aim for precision and collect extra coins for mastery.',
        reward: '+50 coins',
        rewardType: 'coins',
        icon: '🎯',
        progress: 0,
        target: 1,
        isCompleted: false,
      },
    ],
    []
  );

  const [missions, setMissions] = useState<Mission[]>(missionsData);

  const handleStartMission = (missionId: string) => {
    setMissions(prev =>
      prev.map(mission => {
        if (mission.id !== missionId || mission.isCompleted) {
          return mission;
        }

        const nextProgress = Math.min(mission.target, mission.progress + 1);
        return {
          ...mission,
          progress: nextProgress,
          isCompleted: nextProgress >= mission.target,
        };
      })
    );
  };

  const streakDays = 7;
  const nextMilestone = 10;
  const streakPercent = Math.min(100, Math.round((streakDays / nextMilestone) * 100));

  return (
    <Layout className="relative overflow-hidden" showFooter={false}>
      <div className="mission-pattern absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/40 to-white/80" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-slate-900"
        >
          <p className="uppercase tracking-[0.3em] text-xs text-orange-500 mb-3">Mission Control</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-amber-700">Daily Challenges</h1>
          <p className="mt-4 text-base md:text-lg text-slate-600">
            Complete missions to earn bonus coins & badges. Keep the streak alive and the rewards
            flowing!
          </p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="sticky top-4 z-20"
        >
          <div className="bg-white/80 backdrop-blur border border-orange-200/60 rounded-3xl shadow-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <motion.span
                aria-hidden
                animate={{ scale: [1, 1.1, 1], rotate: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                className="text-3xl"
              >
                🔥
              </motion.span>
              <div>
                <p className="text-sm uppercase text-orange-500 font-semibold tracking-widest">
                  Streak Tracker
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {streakDays}-day streak active
                </p>
              </div>
            </div>
            <div className="flex-1 min-w-[180px]">
              <div className="flex items-center justify-between text-xs uppercase text-slate-500 font-semibold mb-1">
                <span>Next reward</span>
                <span>{nextMilestone}-day badge</span>
              </div>
              <div className="h-3 w-full rounded-full bg-orange-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${streakPercent}%` }}
                  transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.section>

        <div className="mt-8 space-y-5 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
          {missions.map((mission, index) => {
            const progressLabel = mission.isCompleted
              ? 'Completed today'
              : `${mission.progress}/${mission.target} done`;
            const progressPercent = Math.min(
              100,
              Math.round((mission.progress / mission.target) * 100)
            );

            return (
              <motion.div
                key={mission.id}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 * index }}
                style={{ perspective: '1200px' }}
              >
                <motion.div
                  variants={missionVariants}
                  animate={mission.isCompleted ? 'completed' : 'default'}
                  initial="default"
                  className="rounded-3xl border px-6 py-5 sm:px-7 sm:py-6 transition-colors duration-500"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
                          mission.isCompleted
                            ? 'bg-amber-100/90 text-amber-700'
                            : 'bg-orange-100 text-orange-600'
                        }`}
                      >
                        {mission.icon}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">{mission.title}</h2>
                        <p className="text-sm text-slate-600 mt-1">{mission.description}</p>
                        <div className="mt-3 flex items-center gap-3 text-sm font-medium">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-600">
                            {mission.rewardType === 'coins' ? '🪙' : '🏅'} {mission.reward}
                          </span>
                          <span className="text-slate-500">{progressLabel}</span>
                        </div>
                        <div className="mt-4 h-2.5 bg-slate-200/70 rounded-full overflow-hidden w-full">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className={`h-full rounded-full ${
                              mission.isCompleted
                                ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                                : 'bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col md:items-end gap-4 md:gap-3 md:ml-auto">
                      <div
                        className={`text-sm font-semibold ${
                          mission.isCompleted ? 'text-amber-700' : 'text-slate-500'
                        }`}
                      >
                        {mission.isCompleted ? 'Reward unlocked' : 'Reward on completion'}
                      </div>
                      <motion.button
                        type="button"
                        onClick={() => handleStartMission(mission.id)}
                        disabled={mission.isCompleted}
                        whileHover={!mission.isCompleted ? { scale: 1.05 } : {}}
                        whileTap={!mission.isCompleted ? { scale: 0.97 } : {}}
                        className={`px-6 py-2.5 rounded-full font-semibold text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-teal-200 focus:ring-offset-2 ${
                          mission.isCompleted
                            ? 'bg-emerald-400/50 cursor-default'
                            : 'bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500'
                        }`}
                      >
                        {mission.isCompleted ? 'Claimed' : 'Start'}
                      </motion.button>
                    </div>
                  </div>

                  {mission.isCompleted && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.25 }}
                      className="absolute -top-3 -right-3 h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl shadow-lg"
                    >
                      ✅
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 text-slate-900 font-semibold shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:ring-offset-2"
          >
            View All Challenges
            <span aria-hidden>→</span>
          </motion.button>
        </motion.div>
      </div>
    </Layout>
  );
};

export default DailyChallenges;
