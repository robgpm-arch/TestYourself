import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, UserPlus } from 'lucide-react';
import Layout from '../components/Layout';
import Input from '../components/Input';
import ResponsiveGrid from '../components/ResponsiveGrid';

interface Friend {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  status: 'online' | 'offline';
  mutualFriends?: string[];
  color: string;
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: index * 0.08,
      ease: [0.34, 1.56, 0.64, 1]
    }
  })
};

const FriendsSocial: React.FC = () => {
  const friends = useMemo<Friend[]>(() => [
    {
      id: 'f1',
      name: 'Anika Sharma',
      tagline: 'Preparing for JEE 2025',
      avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=160&h=160&q=80',
      status: 'online',
      mutualFriends: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=facearea&w=128&h=128&q=80',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=128&h=128&q=80'
      ],
      color: 'from-teal-400 via-cyan-400 to-blue-400'
    },
    {
      id: 'f2',
      name: 'Rahul Mehta',
      tagline: 'Focused on NEET Physics',
      avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=facearea&w=160&h=160&q=80',
      status: 'offline',
      mutualFriends: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=facearea&w=128&h=128&q=80'
      ],
      color: 'from-indigo-400 via-purple-400 to-fuchsia-400'
    },
    {
      id: 'f3',
      name: 'Sara Ali',
      tagline: 'UPSC aspirant • Ethics',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=160&h=160&q=80',
      status: 'online',
      color: 'from-rose-400 via-orange-400 to-amber-300'
    },
    {
      id: 'f4',
      name: 'Dev Patel',
      tagline: 'CAT Quant Squad',
      avatar: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=facearea&w=160&h=160&q=80',
      status: 'online',
      mutualFriends: [
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=128&h=128&q=80',
        'https://images.unsplash.com/photo-1546422401-82c8da113fe6?auto=format&fit=facearea&w=128&h=128&q=80',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=128&h=128&q=80'
      ],
      color: 'from-emerald-400 via-teal-300 to-lime-300'
    },
    {
      id: 'f5',
      name: 'Nisha Verma',
      tagline: 'SSC CGL • Reasoning',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=160&h=160&q=80',
      status: 'offline',
      color: 'from-sky-400 via-cyan-300 to-violet-300'
    },
    {
      id: 'f6',
      name: 'Rohan Das',
      tagline: 'ICSE Class 10 topper',
      avatar: 'https://images.unsplash.com/photo-1546422401-82c8da113fe6?auto=format&fit=facearea&w=160&h=160&q=80',
      status: 'online',
      mutualFriends: [
        'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=facearea&w=128&h=128&q=80'
      ],
      color: 'from-amber-400 via-orange-300 to-pink-300'
    }
  ], []);

  return (
    <Layout className="relative overflow-hidden" showFooter={false}>
      <div className="friends-bg absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/30 to-white/80" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.header
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center sm:text-left"
        >
          <p className="uppercase tracking-[0.35em] text-xs text-teal-500 mb-3">Community</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Friends & Study Buddies
          </h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Discover learners prepping for the same exams, sync streaks, and grow together.
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 items-stretch mb-10"
        >
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search by name or ID…"
              icon={<Search className="w-5 h-5" />}
              className="bg-white/90 border-transparent shadow-sm focus:border-teal-400 focus:ring-teal-400"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-4 py-3 rounded-xl bg-white/90 border border-teal-100 shadow-sm flex items-center gap-2 text-teal-600 font-semibold hover:bg-white"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </motion.button>
        </motion.div>

        <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }} gap={6} className="mb-12">
          {friends.map((friend, index) => (
            <motion.div
              key={friend.id}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={cardVariants}
              className={`friend-card relative rounded-3xl overflow-hidden shadow-[0_25px_55px_-35px_rgba(13,148,136,0.6)] bg-gradient-to-br ${friend.color}`}
            >
              <div className="absolute inset-0 bg-white/12 mix-blend-overlay" />
              <div className="relative p-6 flex flex-col h-full text-white/95">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="h-16 w-16 rounded-full object-cover border-4 border-white/40 shadow-lg"
                    />
                    <span className={`status-dot ${friend.status}`} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold tracking-tight drop-shadow-sm">{friend.name}</h2>
                    <p className="text-sm text-white/80">{friend.tagline}</p>
                  </div>
                </div>

                {friend.mutualFriends && friend.mutualFriends.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs uppercase tracking-widest text-white/70 mb-3">Mutual friends</p>
                    <div className="flex items-center">
                      {friend.mutualFriends.map((avatar, i) => (
                        <img
                          key={avatar}
                          src={avatar}
                          alt="Mutual friend"
                          className="h-9 w-9 rounded-full object-cover border-2 border-white/70 shadow-md -ml-2 first:ml-0"
                          style={{ zIndex: friend.mutualFriends!.length - i }}
                        />
                      ))}
                      <span className="ml-3 text-xs text-white/80">
                        {friend.mutualFriends.length} shared connections
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-6 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.3em] text-white/70">
                    {friend.status === 'online' ? 'Online now' : 'Offline'}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/85 text-teal-600 font-semibold shadow-[0_12px_20px_-12px_rgba(45,212,191,0.9)] hover:bg-white"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Friend
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </ResponsiveGrid>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 text-slate-900 font-semibold shadow-[0_20px_40px_-20px_rgba(13,148,136,0.9)]"
          >
            My Friends List
            <span aria-hidden>→</span>
          </motion.button>
          <p className="text-sm text-slate-600 mt-3">
            Check pending requests, active study groups, and streak partners.
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default FriendsSocial;
