import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';

interface Message {
  id: string;
  sender: 'me' | 'friend';
  username: string;
  timestamp: string;
  content: string;
  type: 'text' | 'emoji' | 'gif' | 'link';
  threadParentId?: string;
  stickerUrl?: string;
  quizPreview?: {
    title: string;
    description: string;
    subject: string;
  };
}

const messageVariants = {
  initial: (align: string) => ({
    opacity: 0,
    x: align === 'flex-row-reverse' ? 40 : -40
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const ChatMessaging: React.FC = () => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messages = useMemo<Message[]>(() => [
    {
      id: 'm1',
      sender: 'friend',
      username: 'Anika',
      timestamp: '9:12 PM',
      content: 'Hey! Ready to revise the Chemical Reactions chapter? 😄',
      type: 'text'
    },
    {
      id: 'm2',
      sender: 'me',
      username: 'You',
      timestamp: '9:13 PM',
      content: 'Absolutely! I just solved the practice quiz.',
      type: 'text'
    },
    {
      id: 'm3',
      sender: 'friend',
      username: 'Anika',
      timestamp: '9:15 PM',
      content: 'Try this Science Quiz',
      type: 'link',
      quizPreview: {
        title: 'Science Lightning Round',
        description: '10 quick-fire questions • Avg score 78%',
        subject: 'Chemistry'
      }
    },
    {
      id: 'm3-reply',
      sender: 'me',
      username: 'You',
      timestamp: '9:16 PM',
      content: 'Oh that looks fun, let me bookmark it!',
      type: 'text',
      threadParentId: 'm3'
    },
    {
      id: 'm4',
      sender: 'friend',
      username: 'Anika',
      timestamp: '9:16 PM',
      content: '🎉',
      type: 'emoji'
    },
    {
      id: 'm5',
      sender: 'me',
      username: 'You',
      timestamp: '9:18 PM',
      content: '',
      type: 'gif',
      stickerUrl: 'https://media.tenor.com/8mTJ06P88xQAAAAC/excited-minions.gif'
    }
  ], []);

  return (
    <Layout variant="fullscreen" showFooter={false} className="relative overflow-hidden">
      <div className="chat-bg absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 via-transparent to-slate-900/85" />

      <div className="relative z-10 flex flex-col h-full">
        <header className="chat-header">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=96&h=96&q=80"
                alt="Anika avatar"
                className="h-12 w-12 rounded-full object-cover border-2 border-blue-400/70"
              />
              <span className="status-dot online" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Anika Sharma</h1>
              <p className="text-sm text-blue-100/80">Online ✅ • Revising Chemistry today</p>
            </div>
          </div>
          <button className="chat-options" aria-label="Conversation options">
            ⋮
          </button>
        </header>

        <div className="flex-1 overflow-hidden">
          <div className="chat-scroll" role="log" aria-live="polite">
            <div className="space-y-6">
              {messages.map((message) => {
                const align = message.sender === 'me' ? 'flex-row-reverse' : 'flex-row';
                const bubbleTone = message.sender === 'me'
                  ? 'bg-gradient-to-br from-blue-500/80 via-indigo-500/80 to-purple-500/80'
                  : 'bg-slate-800/70 backdrop-blur';

                return (
                  <motion.div
                    key={message.id}
                    className={`flex ${align}`}
                    custom={align}
                    initial="initial"
                    animate="animate"
                    variants={messageVariants}
                  >
                    <div className={`max-w-xl w-full ${message.threadParentId ? 'pl-10 relative thread-line' : ''}`}>
                      <div className={`${align === 'flex-row-reverse' ? 'text-right' : 'text-left'} mb-1`}> 
                        <span className="text-xs font-semibold text-white/70 mr-2">{message.username}</span>
                        <span className="text-[11px] text-white/50">{message.timestamp}</span>
                      </div>
                      <div className={`chat-bubble ${bubbleTone}`}>
                        {message.type === 'text' && (
                          <p className="text-sm leading-relaxed text-white/95">{message.content}</p>
                        )}
                        {message.type === 'emoji' && (
                          <div className="text-4xl">{message.content}</div>
                        )}
                        {message.type === 'gif' && message.stickerUrl && (
                          <motion.img
                            src={message.stickerUrl}
                            alt="shared sticker"
                            className="max-h-48 rounded-xl"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          />
                        )}
                        {message.type === 'link' && message.quizPreview && (
                          <motion.div
                            className="quiz-preview"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs uppercase tracking-[0.3em] text-teal-200">Quiz Link</span>
                              <span className="text-[10px] text-white/50">Tap to open</span>
                            </div>
                            <h3 className="text-sm font-semibold text-white">{message.quizPreview.title}</h3>
                            <p className="text-xs text-white/70 mt-1">{message.quizPreview.description}</p>
                            <div className="mt-3 text-xs font-medium text-teal-200/90">Subject • {message.quizPreview.subject}</div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <footer className="chat-input-wrapper">
          <div className="flex items-center gap-3">
            <button
              className="chat-icon"
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              aria-label="Toggle emoji picker"
            >
              😊
            </button>
            <button className="chat-icon" type="button" aria-label="GIF picker">
              🎞
            </button>
            <button className="chat-icon" type="button" aria-label="Attach file">
              📎
            </button>
          </div>
          <div className="flex-1">
            <input
              type="text"
              className="chat-text-input"
              placeholder="Message Anika…"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="chat-send"
            type="button"
          >
            ➤
          </motion.button>
        </footer>

        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25 }}
              className="emoji-picker"
            >
              <div className="grid grid-cols-8 gap-3 text-2xl">
                {['😀', '😂', '🔥', '🤓', '💪', '🧠', '🎯', '🏆', '📚', '⚡', '🚀', '🥳', '🙌', '😴', '🤩', '🧪'].map((emoji) => (
                  <button key={emoji} className="emoji-button">
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default ChatMessaging;
