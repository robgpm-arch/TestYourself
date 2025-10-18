import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';

interface LobbyPlayer {
  id: string;
  name: string;
  avatar: string;
  ready: boolean;
  isHost?: boolean;
  streak?: number;
}

interface LobbyChatMessage {
  id: string;
  sender: 'me' | 'other';
  name: string;
  content: string;
  timestamp: string;
}

const totalSlots = 8;
const circleRadius = 190;

const MultiplayerLobby: React.FC = () => {
  const initialPlayers = useMemo<LobbyPlayer[]>(() => [
    {
      id: 'host',
      name: 'Kavya (Host)',
      avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=facearea&w=200&h=200&q=80',
      ready: true,
      isHost: true,
      streak: 12
    },
    {
      id: 'p2',
      name: 'Rehan',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=200&h=200&q=80',
      ready: false,
      streak: 4
    },
    {
      id: 'p3',
      name: 'Amrita',
      avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=facearea&w=200&h=200&q=80',
      ready: true
    },
    {
      id: 'p4',
      name: 'Zeeshan',
      avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=200&h=200&q=80',
      ready: false
    }
  ], []);

  const [players, setPlayers] = useState<LobbyPlayer[]>(initialPlayers);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<LobbyChatMessage[]>([
    {
      id: 'm1',
      sender: 'other',
      name: 'Kavya',
      content: 'Welcome to the lobby! We’ll start as soon as everyone is ready.',
      timestamp: '19:02'
    },
    {
      id: 'm2',
      sender: 'other',
      name: 'Amrita',
      content: 'I just reviewed the acid-base notes. Feeling confident!',
      timestamp: '19:03'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const currentUserId = 'p2';

  const readyCount = players.filter(player => player.ready).length;
  const allReady = players.length > 1 && readyCount === players.length;

  useEffect(() => {
    if (!allReady) {
      setCountdown(null);
      return;
    }

    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [allReady]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleToggleReady = () => {
    setPlayers(prev =>
      prev.map(player =>
        player.id === currentUserId
          ? { ...player, ready: !player.ready }
          : player
      )
    );
  };

  const filledSlots = players.length;
  const placeholders = Math.max(totalSlots - filledSlots, 0);

  const combinedSlots = [
    ...players.map(player => ({ type: 'player' as const, data: player })),
    ...Array.from({ length: placeholders }).map((_, index) => ({
      type: 'placeholder' as const,
      data: { id: `placeholder-${index}` }
    }))
  ];

  const formatTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSendChat = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    setChatMessages(prev => [
      ...prev,
      {
        id: `chat-${Date.now()}`,
        sender: 'me',
        name: 'You',
        content: trimmed,
        timestamp: formatTime()
      }
    ]);
    setChatInput('');
  };

  return (
    <Layout variant="fullscreen" showHeader={false} showFooter={false} className="relative overflow-hidden">
      <div className="lobby-bg absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/50 via-transparent to-slate-950/85" />

      <div className="relative z-10 h-full flex flex-col">
        <header className="lobby-header">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200">Competitive Quiz Mode</p>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-300 drop-shadow-[0_0_30px_rgba(34,211,238,0.55)]">
              Multiplayer Lobby
            </h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-cyan-100/80">Players Ready</p>
            <p className="text-xl font-semibold text-amber-200">{readyCount}/{players.length}</p>
          </div>
        </header>

        <div className="flex-1 w-full px-4 py-6">
          <div className="lobby-body">
            <div className="lobby-arena">
              <div className="relative lobby-circle">
                <div className="lobby-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Quiz Topic</p>
                    <h2 className="text-2xl font-semibold text-white">Lightning Science Showdown ⚡</h2>
                    <p className="text-xs text-cyan-100/70 mt-1">Winner grabs +150 coins</p>
                  </div>
                </div>

                {combinedSlots.map((slot, index) => {
                  const angle = (index / totalSlots) * 360;
                  const positionStyle = {
                    transform: `rotate(${angle}deg) translate(${circleRadius}px) rotate(-${angle}deg)`
                  };

                  if (slot.type === 'placeholder') {
                    return (
                      <div key={slot.data.id} className="lobby-slot" style={positionStyle}>
                        <div className="waiting-slot">
                          <span>Waiting for players…</span>
                        </div>
                      </div>
                    );
                  }

                  const player = slot.data;
                  return (
                    <motion.div
                      key={player.id}
                      className="lobby-slot"
                      style={positionStyle}
                      initial={{ scale: 0.5, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: index * 0.08 }}
                    >
                      <div className={`player-card ${player.ready ? 'ready' : 'waiting'}`}>
                        <div className="player-avatar">
                          <img src={player.avatar} alt={player.name} />
                          {player.isHost && <span className="host-crown" aria-hidden>👑</span>}
                          {player.streak && player.streak > 0 && (
                            <span className="streak-badge" aria-label={`On a ${player.streak}-day streak`}>
                              🔥 {player.streak}
                            </span>
                          )}
                        </div>
                        <p className="player-name">{player.name}</p>
                        <p className={`player-status ${player.ready ? 'status-ready' : 'status-waiting'}`}>
                          {player.ready ? 'Ready ✅' : 'Waiting ⏳'}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <aside className="lobby-chat-panel" aria-label="Lobby chat">
              <div className="lobby-chat-header">
                <div>
                  <h3>Lobby Chat</h3>
                  <p>{players.length} players in room</p>
                </div>
              </div>
              <div className="lobby-chat-messages">
                {chatMessages.map(message => (
                  <div
                    key={message.id}
                    className={`lobby-chat-message ${message.sender === 'me' ? 'from-me' : 'from-other'}`}
                  >
                    <div className="lobby-chat-meta">
                      <span className="name">{message.name}</span>
                      <span className="time">{message.timestamp}</span>
                    </div>
                    <p>{message.content}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form className="lobby-chat-input" onSubmit={handleSendChat}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder="Say hi to the squad…"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send
                </motion.button>
              </form>
            </aside>
          </div>
        </div>

        <footer className="lobby-footer">
          <div className="host-controls">
            <button className="invite-button">Invite Players</button>
            <button className="start-button" disabled={!allReady}>
              Start Game
            </button>
          </div>
          <div className="player-controls">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleReady}
              className={`ready-toggle ${players.find(p => p.id === currentUserId)?.ready ? 'is-ready' : ''}`}
            >
              {players.find(p => p.id === currentUserId)?.ready ? 'Unready' : 'Ready Up'}
            </motion.button>
            <p className="text-xs text-cyan-100/80 mt-2">All set? Toggle ready when you’re pumped!</p>
          </div>
        </footer>

        <AnimatePresence>
          {countdown !== null && countdown > 0 && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="countdown-overlay"
            >
              {countdown}
            </motion.div>
          )}
          {countdown === 0 && (
            <motion.div
              key="go"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="countdown-overlay go"
            >
              Go!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default MultiplayerLobby;
