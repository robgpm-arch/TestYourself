import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import Card from '../components/Card';

interface FeedCardBase {
  id: string;
  title: string;
}

interface QuoteCard extends FeedCardBase {
  type: 'quote';
  quote: string;
  author: string;
  authorRole: string;
  authorImage: string;
}

interface GifCard extends FeedCardBase {
  type: 'gif';
  gifUrl: string;
  overlayText: string;
}

interface VoiceCard extends FeedCardBase {
  type: 'voice';
  persona: string;
  avatar: string;
  audio: string;
}

interface ProgressCard extends FeedCardBase {
  type: 'progress';
  streakText: string;
  badgeName: string;
  badgeIcon: string;
  description: string;
}

type FeedCard = QuoteCard | GifCard | VoiceCard | ProgressCard;

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: index * 0.1,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

const sparkleGradient =
  'linear-gradient(135deg, rgba(20,184,166,0.85), rgba(79,70,229,0.85))';

const sparklesPattern =
  'radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)';

const MotivationalHub: React.FC = () => {
  const learnerName = useMemo(() => {
    const storedName = localStorage.getItem('learner_name');
    return storedName && storedName.trim().length > 0 ? storedName.split(' ')[0] : 'Champion';
  }, []);

  const primaryFeed = useMemo<FeedCard[]>(() => [
    {
      id: 'quote-1',
      type: 'quote',
      title: 'Daily Spark',
      quote: 'Dream is not that which you see while sleeping, it is something that does not let you sleep.',
      author: 'Dr. A.P.J. Abdul Kalam',
      authorRole: '11th President of India',
      authorImage: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=200&h=200&q=80'
    },
    {
      id: 'gif-1',
      type: 'gif',
      title: 'Cheer Squad',
      gifUrl: 'https://media.tenor.com/-TMz5_8ABakAAAAM/cheering-celebration.gif',
      overlayText: `Keep pushing, ${learnerName}!`
    },
    {
      id: 'voice-1',
      type: 'voice',
      title: 'Voice Boost',
      persona: 'Virat Kohli',
      avatar: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=facearea&w=200&h=200&q=80',
      audio: 'https://samplelib.com/lib/preview/mp3/sample-6s.mp3'
    },
    {
      id: 'progress-1',
      type: 'progress',
      title: 'Progress Highlight',
      streakText: "🔥 You're on a 10-day streak!",
      badgeName: 'Consistency Legend',
      badgeIcon: '🔥',
      description: 'You unlocked the Consistency Legend badge by practicing daily. Keep it blazing!'
    }
  ], [learnerName]);

  const extraFeed = useMemo<FeedCard[]>(() => [
    {
      id: 'quote-2',
      type: 'quote',
      title: 'Mindset Reset',
      quote: 'No act of kindness, no matter how small, is ever wasted.',
      author: 'Abdul Sattar Edhi',
      authorRole: 'Humanitarian & Founder, Edhi Foundation',
      authorImage: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=facearea&w=200&h=200&q=80'
    },
    {
      id: 'gif-2',
      type: 'gif',
      title: 'Winning Moments',
      gifUrl: 'https://media.tenor.com/OrSlX1LflE4AAAAM/fireworks-celebration.gif',
      overlayText: `Momentum is yours, ${learnerName}!`
    },
    {
      id: 'voice-2',
      type: 'voice',
      title: 'Coach Corner',
      persona: 'Dr. A.P.J. Abdul Kalam',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=200&h=200&q=80',
      audio: 'https://samplelib.com/lib/preview/mp3/sample-9s.mp3'
    },
    {
      id: 'progress-2',
      type: 'progress',
      title: 'Milestone Replay',
      streakText: '🌟 Badge Rewind: Precision Pro',
      badgeName: 'Precision Pro',
      badgeIcon: '🏅',
      description: 'Your accuracy stayed above 90% across 5 quizzes. Focus level: unbeatable!'
    }
  ], [learnerName]);

  const [visibleFeed, setVisibleFeed] = useState<FeedCard[]>(primaryFeed);
  const [hasLoadedMore, setHasLoadedMore] = useState(false);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const audioMap = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    setVisibleFeed(primaryFeed);
    setHasLoadedMore(false);
    setActiveAudioId(null);
    audioMap.current = {};
  }, [primaryFeed]);

  useEffect(() => {
    return () => {
      Object.values(audioMap.current).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);

  const handlePlayAudio = (card: VoiceCard) => {
    const existing = audioMap.current[card.id] ?? new Audio(card.audio);
    audioMap.current[card.id] = existing;

    if (activeAudioId === card.id && !existing.paused) {
      existing.pause();
      existing.currentTime = 0;
      setActiveAudioId(null);
      return;
    }

    Object.entries(audioMap.current).forEach(([id, audio]) => {
      if (id !== card.id) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    existing.play().catch(() => {
      setActiveAudioId(null);
    });
    setActiveAudioId(card.id);

    existing.onended = () => {
      setActiveAudioId((prev) => (prev === card.id ? null : prev));
    };
  };

  const handleShare = async (card: GifCard, platform: 'whatsapp' | 'instagram') => {
    const shareText = `${card.overlayText} – Stay motivated with TestYourself!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Stay Motivated',
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (error) {
        console.warn('Share cancelled', error);
      }
    }

    const encodedMessage = encodeURIComponent(`${shareText} ${shareUrl}`);
    const targetUrl = platform === 'whatsapp'
      ? `https://wa.me/?text=${encodedMessage}`
      : `https://www.instagram.com/?url=${encodeURIComponent(shareUrl)}`;

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleLoadMore = () => {
    setVisibleFeed((current) => {
      if (!hasLoadedMore) {
        setHasLoadedMore(true);
        return [...current, ...extraFeed];
      }

      const rotated = [...primaryFeed, ...extraFeed].sort(() => Math.random() - 0.5);
      return rotated;
    });
  };

  return (
    <Layout className="relative overflow-hidden" showFooter={false}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `${sparkleGradient}, ${sparklesPattern}`,
          backgroundSize: 'cover, 80px 80px',
          backgroundPosition: 'center',
          filter: 'saturate(1.05)'
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_55%)]" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-8 text-center text-white"
        >
          <p className="uppercase tracking-[0.3em] text-sm text-teal-100 mb-4">Motivational Hub</p>
          <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
            Stay Motivated
          </h1>
          <p className="mt-4 text-lg text-indigo-100">
            A personalized stream of quotes, cheers, and achievements curated to keep your energy high.
          </p>
        </motion.header>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
          {visibleFeed.map((card, index) => (
            <motion.div
              key={card.id}
              custom={index}
              initial="hidden"
              whileInView="visible"
              variants={fadeInUp}
              viewport={{ once: true, amount: 0.4 }}
            >
              {card.type === 'quote' && (
                <Card variant="elevated" padding="large" className="bg-white/95 backdrop-blur rounded-3xl shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="flex-1">
                      <p className="text-sm uppercase tracking-widest text-teal-500 font-semibold mb-3">
                        {card.title}
                      </p>
                      <blockquote className="text-2xl font-semibold text-gray-900 leading-relaxed">
                        “{card.quote}”
                      </blockquote>
                    </div>
                    <div className="flex items-center gap-4">
                      <img
                        src={card.authorImage}
                        alt={card.author}
                        className="h-16 w-16 rounded-full object-cover ring-4 ring-teal-200"
                      />
                      <div>
                        <p className="text-base font-semibold text-gray-900">{card.author}</p>
                        <p className="text-sm text-gray-500">{card.authorRole}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {card.type === 'gif' && (
                <Card
                  variant="elevated"
                  padding="none"
                  className="overflow-hidden rounded-3xl shadow-xl relative bg-black"
                >
                  <div className="relative">
                    <img
                      src={card.gifUrl}
                      alt="Motivational animation"
                      className="w-full h-72 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-black/20" />
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                      <h3 className="text-2xl font-bold drop-shadow">{card.overlayText}</h3>
                      <p className="text-sm text-gray-200 mt-1">
                        Share the hype with your learning circle.
                      </p>
                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() => handleShare(card, 'whatsapp')}
                          className="px-4 py-2 rounded-full bg-emerald-500/90 hover:bg-emerald-500 transition-colors text-sm font-semibold shadow"
                        >
                          Share on WhatsApp
                        </button>
                        <button
                          onClick={() => handleShare(card, 'instagram')}
                          className="px-4 py-2 rounded-full bg-pink-500/90 hover:bg-pink-500 transition-colors text-sm font-semibold shadow"
                        >
                          Share on Instagram
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {card.type === 'voice' && (
                <Card
                  variant="elevated"
                  padding="large"
                  className={`rounded-3xl shadow-xl bg-white/95 backdrop-blur relative overflow-hidden ${
                    activeAudioId === card.id ? 'ring-4 ring-indigo-300 shadow-indigo-200' : ''
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img
                        src={card.avatar}
                        alt={`${card.persona} avatar`}
                        className={`h-20 w-20 rounded-full object-cover transition-all duration-500 ${
                          activeAudioId === card.id ? 'shadow-[0_0_35px_rgba(129,140,248,0.6)] scale-105' : ''
                        }`}
                      />
                      <span className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white text-sm font-semibold">
                        ▶
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm uppercase tracking-widest text-indigo-500 font-semibold mb-2">
                        {card.title}
                      </p>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {card.persona} recorded a message for you
                      </h3>
                      <p className="text-sm text-gray-600">Hit play to hear your personalized boost.</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePlayAudio(card)}
                      className={`px-6 py-3 rounded-full font-semibold text-white shadow-lg transition-colors ${
                        activeAudioId === card.id ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-violet-500 hover:bg-violet-400'
                      }`}
                    >
                      {activeAudioId === card.id ? 'Playing…' : '▶ Hear Message'}
                    </motion.button>
                  </div>
                  <motion.div
                    animate={{ opacity: activeAudioId === card.id ? [0.2, 0.6, 0.2] : 0 }}
                    transition={{ duration: 1.8, repeat: activeAudioId === card.id ? Infinity : 0 }}
                    className="absolute inset-0 pointer-events-none bg-gradient-to-r from-indigo-500/15 via-transparent to-purple-500/20"
                  />
                </Card>
              )}

              {card.type === 'progress' && (
                <Card
                  variant="gradient"
                  padding="large"
                  className="rounded-3xl shadow-xl bg-white/95 backdrop-blur border border-white/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-3xl">
                        {card.badgeIcon}
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-widest text-orange-100 font-semibold">
                          {card.title}
                        </p>
                        <h3 className="text-2xl font-bold text-white drop-shadow">{card.streakText}</h3>
                        <p className="text-sm text-orange-50 mt-1">{card.description}</p>
                      </div>
                    </div>
                    <div className="sm:ml-auto">
                      <div className="bg-white/20 border border-white/30 rounded-full px-4 py-2 text-xs uppercase tracking-widest text-white">
                        {card.badgeName}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLoadMore}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white/90 text-indigo-600 font-semibold shadow-lg hover:bg-white"
          >
            More Inspirations
            <span aria-hidden>{hasLoadedMore ? '✨' : '↻'}</span>
          </motion.button>
          <p className="mt-4 text-sm text-indigo-100">
            Tap for a fresh wave of quotes, cheers, and highlights tailored for you.
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default MotivationalHub;
