import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface LeaderboardsProps {
  onBack?: () => void;
  onContinue?: () => void;
}

interface LeaderboardPlayer {
  id: number;
  rank: number;
  name: string;
  avatar: string;
  score: number;
  badge?: string;
  isCurrentUser?: boolean;
  streak?: number;
}

interface TabType {
  id: 'national' | 'state' | 'friends';
  label: string;
  icon: string;
}

// Mock data for different leaderboard types
const mockLeaderboards = {
  national: [
    {
      id: 1,
      rank: 1,
      name: 'Alex Chen',
      avatar: '/assets/avatar-1.jpg',
      score: 9850,
      badge: '🏆',
      streak: 15,
    },
    {
      id: 2,
      rank: 2,
      name: 'Sarah Johnson',
      avatar: '/assets/avatar-2.jpg',
      score: 9720,
      badge: '🥈',
    },
    {
      id: 3,
      rank: 3,
      name: 'Mike Rodriguez',
      avatar: '/assets/avatar-3.jpg',
      score: 9650,
      badge: '🥉',
    },
    {
      id: 4,
      rank: 4,
      name: 'Emma Wilson',
      avatar: '/assets/avatar-4.jpg',
      score: 9480,
      badge: '🔥',
      streak: 12,
    },
    { id: 5, rank: 5, name: 'David Kim', avatar: '/assets/avatar-5.jpg', score: 9350 },
    {
      id: 6,
      rank: 12,
      name: 'You',
      avatar: '/assets/logo.png',
      score: 8750,
      isCurrentUser: true,
      streak: 8,
    },
    { id: 7, rank: 6, name: 'Lisa Zhang', avatar: '/assets/avatar-6.jpg', score: 9200 },
    {
      id: 8,
      rank: 7,
      name: 'James Miller',
      avatar: '/assets/avatar-7.jpg',
      score: 9100,
      badge: '🔥',
      streak: 10,
    },
  ],
  state: [
    {
      id: 1,
      rank: 1,
      name: 'Sarah Johnson',
      avatar: '/assets/avatar-2.jpg',
      score: 9720,
      badge: '🏆',
    },
    {
      id: 2,
      rank: 2,
      name: 'You',
      avatar: '/assets/logo.png',
      score: 8750,
      isCurrentUser: true,
      streak: 8,
    },
    {
      id: 3,
      rank: 3,
      name: 'Emma Wilson',
      avatar: '/assets/avatar-4.jpg',
      score: 8680,
      badge: '🔥',
      streak: 12,
    },
    { id: 4, rank: 4, name: 'Lisa Zhang', avatar: '/assets/avatar-6.jpg', score: 8550 },
    {
      id: 5,
      rank: 5,
      name: 'James Miller',
      avatar: '/assets/avatar-7.jpg',
      score: 8420,
      badge: '🔥',
      streak: 10,
    },
  ],
  friends: [
    {
      id: 1,
      rank: 1,
      name: 'You',
      avatar: '/assets/logo.png',
      score: 8750,
      isCurrentUser: true,
      streak: 8,
    },
    {
      id: 2,
      rank: 2,
      name: 'John Doe',
      avatar: '/assets/avatar-8.jpg',
      score: 7850,
      badge: '🔥',
      streak: 6,
    },
    { id: 3, rank: 3, name: 'Jane Smith', avatar: '/assets/avatar-9.jpg', score: 7650 },
    { id: 4, rank: 4, name: 'Tom Brown', avatar: '/assets/avatar-10.jpg', score: 7320 },
  ],
};

const tabs: TabType[] = [
  { id: 'national', label: 'National', icon: '🌍' },
  { id: 'state', label: 'State/District', icon: '📍' },
  { id: 'friends', label: 'Friends', icon: '👥' },
];

const Leaderboards: React.FC<LeaderboardsProps> = ({ onBack, onContinue }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'national' | 'state' | 'friends'>('national');
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(-1);
  };

  useEffect(() => {
    setPlayers(mockLeaderboards[activeTab]);
  }, [activeTab]);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-600';
    return 'text-gray-600';
  };

  const getRankBgColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600';
    return 'bg-gradient-to-r from-blue-400 to-blue-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 text-6xl">👑</div>
        <div className="absolute top-40 right-20 text-5xl">🏆</div>
        <div className="absolute bottom-40 left-20 text-4xl">🥇</div>
        <div className="absolute bottom-20 right-10 text-5xl">⭐</div>
        <div className="absolute top-60 left-1/2 text-3xl">🔥</div>
      </div>

      {/* Header */}
      <div className="relative z-10 pt-12 pb-6 px-6">
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </motion.button>
        </div>

        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Leaderboards
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-blue-100 text-lg"
          >
            See where you stand!
          </motion.p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-1 flex">
            {tabs.map(tab => (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="relative z-10 px-6 pb-32">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`mb-4 ${player.isCurrentUser ? 'relative' : ''}`}
                >
                  {/* Current user glow effect */}
                  {player.isCurrentUser && (
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-2xl blur-sm opacity-60 animate-pulse"></div>
                  )}

                  <div
                    className={`relative bg-white rounded-2xl p-4 shadow-lg ${
                      player.isCurrentUser
                        ? 'ring-2 ring-teal-400 bg-gradient-to-r from-teal-50 to-blue-50'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {/* Rank and Avatar */}
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getRankBgColor(player.rank)}`}
                          >
                            {player.rank <= 3 && (
                              <motion.div
                                animate={{
                                  scale: player.rank === 1 ? [1, 1.2, 1] : 1,
                                  rotate: player.rank === 1 ? [0, 5, -5, 0] : 0,
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: player.rank === 1 ? Infinity : 0,
                                  repeatType: 'reverse',
                                }}
                                className="text-2xl"
                              >
                                {player.rank === 1 ? '👑' : player.rank}
                              </motion.div>
                            )}
                            {player.rank > 3 && <span>{player.rank}</span>}
                          </motion.div>
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="w-14 h-14 rounded-full overflow-hidden border-3 border-white shadow-lg"
                        >
                          <img
                            src={player.avatar}
                            alt={player.name}
                            className="w-full h-full object-cover"
                            onError={e => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBzdHlsZT0idHJhbnNmb3JtOiB0cmFuc2xhdGUoOHB4LCA4cHgpOyI+CjxwYXRoIGQ9Ik0yMCAyMVYxOUE0IDQgMCAwIDAgMTYgMTVIOEE0IDQgMCAwIDAgNCAxOVYyMSIgc3Ryb2tlPSIjOUI5QkEwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiIHN0cm9rZT0iIzlCOUJBMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPgo=';
                            }}
                          />
                        </motion.div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3
                              className={`font-semibold ${
                                player.isCurrentUser ? 'text-teal-700' : 'text-gray-900'
                              }`}
                            >
                              {player.name}
                            </h3>
                            {player.isCurrentUser && (
                              <span className="px-2 py-1 bg-teal-500 text-white text-xs rounded-full font-medium">
                                You
                              </span>
                            )}
                          </div>
                          {player.streak && (
                            <div className="flex items-center gap-1 text-orange-500 text-sm">
                              <span>🔥</span>
                              <span>{player.streak} day streak</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Score and Badge */}
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className="text-xl font-bold text-gray-900"
                          >
                            {player.score.toLocaleString()}
                          </motion.div>
                          {player.badge && (
                            <motion.div
                              animate={{
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: 'reverse',
                                delay: Math.random() * 2,
                              }}
                              className="text-2xl"
                            >
                              {player.badge}
                            </motion.div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">points</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Button */}
      <div className="fixed bottom-8 left-6 right-6 z-20">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold py-4 rounded-2xl shadow-lg backdrop-blur-sm flex items-center justify-center gap-2"
        >
          <span>👤</span>
          <span>{onContinue ? 'Continue to Profile' : 'View Rewards'}</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Leaderboards;
