import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import {
  Share2,
  RefreshCw,
  Eye,
  Coins,
  Flame,
  BarChart3,
  Trophy,
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react';
import Button from '../components/Button';
import { useMotivationPersonality } from '../hooks/useMotivationPersonality';
import type { PerformanceTier } from '../constants/personalities';

interface ResultsCelebrationProps {
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  playerName?: string;
  streakDays?: number;
  coinsEarned?: number;
  timeSpent?: number;
  onReviewAnswers?: () => void;
  onShareAchievement?: () => void;
  onPlayAgain?: () => void;
  onBackToHome?: () => void;
  onViewAnalytics?: () => void;
  onViewLeaderboard?: () => void;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  size: number;
  delay: number;
}

const ResultsCelebration: React.FC<ResultsCelebrationProps> = ({
  score = 85,
  totalQuestions = 20,
  correctAnswers = 17,
  playerName = 'Champion',
  streakDays = 5,
  coinsEarned = 125,
  timeSpent = 300,
  onReviewAnswers,
  onShareAchievement,
  onPlayAgain,
  onBackToHome,
  onViewAnalytics,
  onViewLeaderboard,
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const circleControls = useAnimation();
  const tierCardControls = useAnimation();

  useEffect(() => {
    tierCardControls.start({
      y: [0, -4, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    });
  }, [tierCardControls]);

  // Calculate performance level and messaging
  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'great';
    if (score >= 70) return 'good';
    if (score >= 60) return 'okay';
    return 'needs_improvement';
  };

  const getPerformanceMessage = (level: string, name: string) => {
    const messages = {
      excellent: {
        primary: 'Outstanding! 🏆',
        secondary: `Absolutely brilliant, ${name}! You're a quiz master!`,
        voice: `Amazing work, ${name}! You absolutely nailed it!`,
      },
      great: {
        primary: 'Fantastic! 🎉',
        secondary: `Great job, ${name}! You're really getting the hang of this!`,
        voice: `Well done, ${name}! Keep up the excellent work!`,
      },
      good: {
        primary: 'Well Done! 👏',
        secondary: `Nice work, ${name}! You're making solid progress!`,
        voice: `Good job, ${name}! You're on the right track!`,
      },
      okay: {
        primary: 'Good Try! 👍',
        secondary: `Keep practicing, ${name}! You're improving!`,
        voice: `Nice effort, ${name}! Practice makes perfect!`,
      },
      needs_improvement: {
        primary: 'Keep Learning! 📚',
        secondary: `Don't give up, ${name}! Every expert was once a beginner!`,
        voice: `Keep going, ${name}! You'll get there with practice!`,
      },
    };
    return messages[level as keyof typeof messages];
  };

  const performanceLevel = getPerformanceLevel(score);
  const performanceMessage = getPerformanceMessage(performanceLevel, playerName);

  const determinePerformanceTier = (value: number): PerformanceTier => {
    if (value < 40) return 'low';
    if (value <= 70) return 'average';
    return 'high';
  };

  const { selectedPersonality } = useMotivationPersonality();
  const performanceTier = determinePerformanceTier(score);
  const personalityAsset = selectedPersonality.tiers[performanceTier];

  const celebrationHeadline = personalityAsset?.headline ?? performanceMessage.primary;
  const celebrationSubcopy = personalityAsset?.subcopy ?? performanceMessage.secondary;
  const voiceTranscript = personalityAsset?.subcopy ?? performanceMessage.voice;
  const celebrationGif = personalityAsset?.gif;
  const celebrationAudio = personalityAsset?.audio;
  const tierLabels: Record<PerformanceTier, string> = {
    low: 'Needs encouragement',
    average: 'Steady progress',
    high: 'Star performer',
  };

  const determinePerformanceColor = (tier: PerformanceTier) => {
    switch (tier) {
      case 'low':
        return 'from-amber-500 to-orange-500';
      case 'average':
        return 'from-sky-500 to-indigo-500';
      case 'high':
        return 'from-emerald-500 to-teal-500';
      default:
        return 'from-sky-500 to-indigo-500';
    }
  };

  const statusColor = determinePerformanceColor(performanceTier);

  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!celebrationAudio) {
      audioRef.current?.pause();
      audioRef.current = null;
      setIsVoicePlaying(false);
      setAudioError(null);
      return;
    }

    const audio = new Audio(celebrationAudio);
    audioRef.current = audio;
    audio.volume = 0.9;
    audio.onended = () => setIsVoicePlaying(false);
    audio.onerror = () => {
      setAudioError('Unable to play this audio clip. Try a different personality later.');
      setIsVoicePlaying(false);
    };

    return () => {
      audio.pause();
      audioRef.current = null;
      setIsVoicePlaying(false);
    };
  }, [celebrationAudio]);

  const playVoice = async (restart = false) => {
    if (!audioRef.current) {
      setAudioError('Voice clip unavailable for this personality.');
      return;
    }

    try {
      if (restart) {
        audioRef.current.currentTime = 0;
      }
      await audioRef.current.play();
      setIsVoicePlaying(true);
      setAudioError(null);
    } catch (error) {
      setAudioError('Autoplay blocked. Tap play again to listen.');
      setIsVoicePlaying(false);
    }
  };

  const pauseVoice = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsVoicePlaying(false);
  };

  // Generate confetti pieces
  const generateConfetti = () => {
    const pieces: ConfettiPiece[] = [];
    const colors = [
      '#FFD700',
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FECA57',
      '#FF9FF3',
      '#54A0FF',
    ];

    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        size: Math.random() * 8 + 4,
        delay: Math.random() * 3000,
      });
    }
    return pieces;
  };

  // Animate score counter
  useEffect(() => {
    setShowCelebration(true);
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayScore(prev => {
          if (prev >= score) {
            clearInterval(interval);
            return score;
          }
          return prev + 1;
        });
      }, 30);
    }, 500);

    return () => clearTimeout(timer);
  }, [score]);

  // Generate confetti when celebration starts
  useEffect(() => {
    if (showCelebration) {
      setConfetti(generateConfetti());

      // Start circle pulsing animation
      circleControls.start({
        scale: [1, 1.05, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      });
    }
  }, [showCelebration, circleControls]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Animated Background Gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-teal-400 via-purple-500 to-purple-600"
        style={{
          background: 'linear-gradient(135deg, #4ECDC4 0%, #9b59b6 50%, #8e44ad 100%)',
        }}
      />

      {/* Animated Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confetti.map(piece => (
          <motion.div
            key={piece.id}
            initial={{
              x: `${piece.x}%`,
              y: -20,
              rotate: piece.rotation,
              opacity: 0,
            }}
            animate={{
              y: '110vh',
              rotate: piece.rotation + 720,
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 4,
              delay: piece.delay / 1000,
              ease: 'easeOut',
            }}
            className="absolute"
            style={{
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: '2px',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Score Circle */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: 'spring', bounce: 0.4 }}
          className="mb-8"
        >
          <motion.div animate={circleControls} className="relative">
            <div className="w-48 h-48 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex flex-col items-center justify-center shadow-2xl">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="text-6xl font-bold text-white mb-2"
              >
                {displayScore}%
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.5 }}
                className="text-white/90 font-medium text-sm"
              >
                {correctAnswers}/{totalQuestions} Correct
              </motion.div>
            </div>

            {/* Glow Effect */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 rounded-full bg-white/20 blur-xl -z-10"
            />
          </motion.div>
        </motion.div>

        {/* Performance Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1 rounded-full border border-white/30 bg-white/10 text-xs uppercase tracking-[0.35em] text-white/80 mb-3">
            {tierLabels[performanceTier]}
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">{celebrationHeadline}</h1>
          <p className="text-xl text-white/90 max-w-md mx-auto">{celebrationSubcopy}</p>
        </motion.div>

        {/* Motivational personality block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.6, type: 'spring', stiffness: 150 }}
          className="mb-8 w-full max-w-3xl"
        >
          <div className="relative grid gap-6 md:grid-cols-[220px,1fr] bg-white/15 border border-white/25 rounded-3xl p-6 backdrop-blur-md shadow-2xl">
            <motion.div animate={tierCardControls} className="relative">
              <div
                className={`absolute -top-4 -left-3 px-3 py-1 rounded-full bg-gradient-to-r ${statusColor} text-xs font-semibold text-white shadow-lg`}
              >
                {tierLabels[performanceTier]}
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/30 bg-black/40 aspect-[4/5] flex items-center justify-center">
                {celebrationGif ? (
                  <img
                    src={celebrationGif}
                    alt={`${selectedPersonality.name} celebrating`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-4xl text-white/70">
                    🎉
                  </div>
                )}
              </div>
            </motion.div>

            <div className="flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-3 py-1 text-xs uppercase tracking-[0.35em] bg-white/10 rounded-full text-white/80">
                    Motivator
                  </div>
                  <div className="text-white/70 text-xs">{selectedPersonality.title}</div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">{selectedPersonality.name}</h2>
                <p className="text-white/80 text-sm leading-relaxed mb-4">{celebrationSubcopy}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPersonality.traits.map(trait => (
                    <span
                      key={trait}
                      className="text-xs uppercase tracking-wide bg-white/10 text-white/80 px-3 py-1 rounded-full border border-white/15"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    if (isVoicePlaying) {
                      pauseVoice();
                    } else {
                      playVoice();
                    }
                  }}
                  variant="outline"
                  className="flex-1 border-white/50 text-white hover:bg-white/10"
                  icon={
                    isVoicePlaying ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )
                  }
                >
                  {isVoicePlaying ? 'Pause voice message' : 'Play voice message'}
                </Button>
                <Button
                  onClick={() => playVoice(true)}
                  variant="ghost"
                  className="flex-1 text-white/80 hover:text-white hover:bg-white/10"
                  icon={<RotateCcw className="w-4 h-4" />}
                >
                  Replay from start
                </Button>
              </div>

              {audioError && (
                <div className="text-xs text-amber-300 bg-amber-500/20 border border-amber-400/30 rounded-lg px-3 py-2">
                  {audioError}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats & Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          {/* Streak Badge */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30 flex items-center space-x-2">
            <Flame className="w-5 h-5 text-orange-300" />
            <span className="text-white font-semibold">{streakDays}-day streak!</span>
          </div>

          {/* Coins Earned */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30 flex items-center space-x-2">
            <Coins className="w-5 h-5 text-yellow-300" />
            <span className="text-white font-semibold">+{coinsEarned} coins</span>
          </div>

          {/* Time Badge */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30 flex items-center space-x-2">
            <span className="text-white font-semibold">⏱️ {formatTime(timeSpent)}</span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.3 }}
          className="flex flex-col gap-4 w-full max-w-2xl"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={onReviewAnswers}
              className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              icon={<Eye className="w-5 h-5" />}
            >
              Review Answers
            </Button>

            <Button
              onClick={onShareAchievement}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              icon={<Share2 className="w-5 h-5" />}
            >
              Share
            </Button>
          </div>

          {(onViewAnalytics || onViewLeaderboard) && (
            <div className="flex flex-col sm:flex-row gap-4">
              {onViewAnalytics && (
                <Button
                  onClick={onViewAnalytics}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  icon={<BarChart3 className="w-5 h-5" />}
                >
                  Quiz Analytics
                </Button>
              )}

              {onViewLeaderboard && (
                <Button
                  onClick={onViewLeaderboard}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  icon={<Trophy className="w-5 h-5" />}
                >
                  Leaderboard
                </Button>
              )}
            </div>
          )}
        </motion.div>

        {/* Secondary Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.6 }}
          className="flex flex-col sm:flex-row gap-3 mt-4 w-full max-w-md"
        >
          {/* Play Again */}
          <Button
            onClick={onPlayAgain}
            variant="outline"
            className="flex-1 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 py-3 font-semibold transition-all duration-200 transform hover:scale-105"
            icon={<RefreshCw className="w-5 h-5" />}
          >
            Play Again
          </Button>

          {/* Back to Home */}
          <Button
            onClick={onBackToHome}
            variant="ghost"
            className="flex-1 text-white/80 hover:text-white hover:bg-white/10 py-3 font-semibold transition-all duration-200"
          >
            Back to Home
          </Button>
        </motion.div>

        {/* Voice-over transcript */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 3 }}
          className="mt-8 text-center max-w-2xl"
        >
          <p className="text-white/70 text-sm italic">🔊 "{voiceTranscript}"</p>
          <p className="text-white/60 text-xs mt-2">
            Personalised by {selectedPersonality.name}. Update your favourite motivator in profile
            anytime.
          </p>
        </motion.div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsCelebration;
