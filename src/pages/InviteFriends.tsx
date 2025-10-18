import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';

interface ShareOption {
  id: string;
  label: string;
  color: string;
  emoji: string;
  action: () => void;
}

const InviteFriends: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [confettiBurst, setConfettiBurst] = useState(false);
  const inviteCode = 'QZ1234';
  const inviteLink = 'https://quiz.testyourself.app/invite/QZ1234';

  const triggerConfetti = () => {
    setConfettiBurst(true);
    setTimeout(() => setConfettiBurst(false), 1800);
  };

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      triggerConfetti();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.warn('Clipboard copy failed', error);
      alert('Copy failed. Please try manually.');
    }
  };

  const shareOptions = useMemo<ShareOption[]>(
    () => [
      {
        id: 'whatsapp',
        label: 'WhatsApp',
        color: 'share-whatsapp',
        emoji: '🟢',
        action: () =>
          window.open(
            `https://wa.me/?text=${encodeURIComponent(`Join me on TestYourself quizzes! ${inviteLink}`)}`,
            '_blank'
          ),
      },
      {
        id: 'telegram',
        label: 'Telegram',
        color: 'share-telegram',
        emoji: '🔵',
        action: () =>
          window.open(
            `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent('Join me on TestYourself quizzes!')}`,
            '_blank'
          ),
      },
      {
        id: 'instagram',
        label: 'Instagram',
        color: 'share-instagram',
        emoji: '💜',
        action: () => triggerConfetti(),
      },
      {
        id: 'facebook',
        label: 'Facebook',
        color: 'share-facebook',
        emoji: '📘',
        action: () =>
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`,
            '_blank'
          ),
      },
      {
        id: 'gmail',
        label: 'Gmail',
        color: 'share-gmail',
        emoji: '✉️',
        action: () =>
          window.open(
            `mailto:?subject=Let’s play quizzes together!&body=Join me on TestYourself quizzes: ${inviteLink}`
          ),
      },
      {
        id: 'copy',
        label: 'Copy Link',
        color: 'share-copy',
        emoji: '🔗',
        action: () => copyToClipboard(inviteLink),
      },
    ],
    [inviteLink]
  );

  return (
    <Layout showFooter={false} className="relative overflow-hidden">
      <div className="invite-bg absolute inset-0" />
      <div className="absolute inset-0 invite-overlay" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col min-h-screen">
        <header className="invite-header">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">
              Invite &amp; earn rewards
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_35px_rgba(59,130,246,0.45)]">
              Invite Friends to Play!
            </h1>
            <p className="mt-3 text-base md:text-lg text-white/80 max-w-2xl">
              Challenge your friends and compare scores. Share the fun and rack up bonus coins
              together.
            </p>
          </div>
        </header>

        <main className="invite-main">
          <div className="share-grid">
            {shareOptions.map((option, index) => (
              <motion.button
                key={option.id}
                className={`share-card ${option.color}`}
                onClick={() => {
                  option.action();
                  triggerConfetti();
                }}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 260, damping: 15, delay: index * 0.02 }}
              >
                <span className="share-emoji" aria-hidden>
                  {option.emoji}
                </span>
                <span className="share-label">{option.label}</span>
              </motion.button>
            ))}
          </div>

          <motion.section
            className="invite-referral"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-white/70">Referral Code</p>
              <h2 className="text-3xl font-bold text-white drop-shadow-[0_0_25px_rgba(56,189,248,0.45)]">
                {inviteCode}
              </h2>
              <p className="text-sm text-white/80 mt-2">
                Earn 50 coins when your friend joins with your code!
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => copyToClipboard(inviteCode)}
              className="copy-code"
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </motion.button>
          </motion.section>
        </main>

        <footer className="invite-footer">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              triggerConfetti();
              window.open(
                `https://wa.me/?text=${encodeURIComponent(`Join me on TestYourself quizzes! ${inviteLink}`)}`,
                '_blank'
              );
            }}
            className="invite-share-button"
          >
            Share Now
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.location.assign('/')}
            className="invite-back-button"
          >
            Back to Dashboard
          </motion.button>
        </footer>
      </div>

      <AnimatePresence>
        {confettiBurst && (
          <motion.div
            className="invite-confetti-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {[...Array(80)].map((_, index) => (
              <span key={index} className={`invite-confetti confetti-${index % 7}`} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default InviteFriends;
