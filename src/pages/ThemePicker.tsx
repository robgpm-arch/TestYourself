import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';

interface ThemePickerProps {
  onApply?: (themeId: string) => void;
  onBack?: () => void;
  initialTheme?: string;
}

interface QuizTheme {
  id: string;
  name: string;
  description: string;
  preview: {
    question: string;
    options: string[];
    backgroundColor: string;
    questionColor: string;
    optionStyle: string;
    accentColor: string;
    pattern?: string;
    progressColor?: string;
    optionHover?: string;
  };
  features: string[];
}

const ThemePicker: React.FC<ThemePickerProps> = ({ onApply, onBack, initialTheme = 'classic' }) => {
  const [selectedTheme, setSelectedTheme] = useState<string>(initialTheme);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  // Theme definitions with live preview data
  const themes: QuizTheme[] = [
    {
      id: 'neo-prism',
      name: 'Neo Prism',
      description: 'Gradient glass with futurist typography',
      preview: {
        question: 'Which architecture style introduced the flying buttress?',
        options: ['A) Romanesque', 'B) Gothic', 'C) Renaissance', 'D) Baroque'],
        backgroundColor: 'bg-gradient-to-br from-slate-950 via-purple-950 to-rose-900',
        questionColor: 'text-violet-100',
        optionStyle:
          'bg-white/10 border border-purple-400/40 text-violet-100 backdrop-blur-lg shadow-lg shadow-purple-900/40',
        accentColor: 'text-fuchsia-200',
        pattern: 'prism',
        progressColor: '#f0abfc',
        optionHover: '#5b21b6',
      },
      features: ['Prismatic glow', 'Glass layering', 'Editorial headings'],
    },
    {
      id: 'cyber-slate',
      name: 'Cyber Slate',
      description: 'Graphite matte with luminous circuitry',
      preview: {
        question: 'Which protocol secures encrypted web traffic?',
        options: ['A) HTTP', 'B) TCP', 'C) TLS', 'D) FTP'],
        backgroundColor: 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950',
        questionColor: 'text-emerald-100',
        optionStyle:
          'bg-slate-800/80 border border-emerald-500/50 text-emerald-100 shadow-inner shadow-black/50',
        accentColor: 'text-emerald-300',
        pattern: 'circuit',
        progressColor: '#34d399',
        optionHover: '#064e3b',
      },
      features: ['Circuit etching', 'Holographic indicators', 'Night-mode comfort'],
    },
    {
      id: 'velvet-muse',
      name: 'Velvet Muse',
      description: 'Moody florals with cinematic lighting',
      preview: {
        question: 'Caravaggio pioneered which dramatic lighting technique?',
        options: ['A) Fresco', 'B) Tenebrism', 'C) Sfumato', 'D) Impasto'],
        backgroundColor: 'bg-gradient-to-br from-rose-950 via-fuchsia-950 to-slate-950',
        questionColor: 'text-rose-100',
        optionStyle:
          'bg-rose-900/60 border border-fuchsia-500/40 text-rose-100 shadow-lg shadow-rose-900/40',
        accentColor: 'text-fuchsia-200',
        pattern: 'flora',
        progressColor: '#fb7185',
        optionHover: '#7f1d1d',
      },
      features: ['Botanical silhouettes', 'Velvet grain', 'Gallery mood'],
    },
    {
      id: 'cobalt-frost',
      name: 'Cobalt Frost',
      description: 'Polar blues with aurora accents',
      preview: {
        question: 'Which ocean basin contains the deepest known trench?',
        options: ['A) Atlantic', 'B) Arctic', 'C) Indian', 'D) Pacific'],
        backgroundColor: 'bg-gradient-to-br from-sky-950 via-blue-900 to-slate-950',
        questionColor: 'text-sky-100',
        optionStyle:
          'bg-white/10 border border-sky-400/40 text-sky-100 backdrop-blur-lg shadow-lg shadow-sky-900/40',
        accentColor: 'text-sky-300',
        pattern: 'aurora',
        progressColor: '#38bdf8',
        optionHover: '#1e293b',
      },
      features: ['Dancing aurora', 'Icy reflections', 'High-latitude calm'],
    },
    {
      id: 'starlit-story',
      name: 'Starlit Story',
      description: 'Cozy night sky adventure (kids)',
      preview: {
        question: 'Which planet is known for its rings?',
        options: ['🪐 Saturn', '🌍 Earth', '🔥 Venus', '🌑 Mercury'],
        backgroundColor: 'bg-gradient-to-br from-indigo-900 via-sky-900 to-purple-900',
        questionColor: 'text-amber-100',
        optionStyle:
          'bg-indigo-800/70 border border-yellow-300/60 text-yellow-100 shadow-lg shadow-indigo-900/40 rounded-xl',
        accentColor: 'text-amber-200',
        pattern: 'sparkle',
        progressColor: '#fde68a',
        optionHover: '#312e81',
      },
      features: ['Storybook stars', 'Friendly icons', 'Bedtime palette'],
    },
    {
      id: 'bubble-pop',
      name: 'Bubble Pop',
      description: 'Playful gel bubbles (kids)',
      preview: {
        question: 'Which animal loves to splash in water?',
        options: ['🐧 Penguin', '🦊 Fox', '🦅 Eagle', '🐫 Camel'],
        backgroundColor: 'bg-gradient-to-br from-sky-200 via-cyan-200 to-emerald-200',
        questionColor: 'text-sky-900',
        optionStyle:
          'bg-white/80 border border-sky-300 text-sky-700 shadow-lg shadow-cyan-200/40 rounded-full',
        accentColor: 'text-teal-600',
        pattern: 'bubbles',
        progressColor: '#2dd4bf',
        optionHover: '#bae6fd',
      },
      features: ['Squishy bubbles', 'Rounded typography', 'Optimistic pastels'],
    },
    {
      id: 'solstice-glow',
      name: 'Solstice Glow',
      description: 'Muted sunburst with art-deco lines',
      preview: {
        question: 'Which civilization engineered the Temple of the Sun?',
        options: ['A) Maya', 'B) Inca', 'C) Aztec', 'D) Olmec'],
        backgroundColor: 'bg-gradient-to-br from-amber-900 via-rose-900 to-stone-900',
        questionColor: 'text-amber-100',
        optionStyle:
          'bg-amber-900/60 border border-yellow-400/40 text-amber-100 shadow-lg shadow-amber-900/40',
        accentColor: 'text-yellow-200',
        pattern: 'sunburst',
        progressColor: '#fcd34d',
        optionHover: '#7c2d12',
      },
      features: ['Radiant arcs', 'Deco geometry', 'Warm minimal luxe'],
    },
    {
      id: 'urban-ink',
      name: 'Urban Ink',
      description: 'Monochrome grids with editorial calm',
      preview: {
        question: 'Which designer popularized the International Typographic Style?',
        options: [
          'A) Paul Rand',
          'B) Josef Müller-Brockmann',
          'C) Massimo Vignelli',
          'D) Saul Bass',
        ],
        backgroundColor: 'bg-gradient-to-br from-neutral-950 via-zinc-900 to-neutral-800',
        questionColor: 'text-zinc-100',
        optionStyle:
          'bg-neutral-800/80 border border-zinc-600/40 text-zinc-100 shadow-inner shadow-black/50',
        accentColor: 'text-orange-200',
        pattern: 'mono-grid',
        progressColor: '#fb923c',
        optionHover: '#3f3f46',
      },
      features: ['Swiss grid', 'Ink overlays', 'High-contrast focus'],
    },
    {
      id: 'galaxy-arcade',
      name: 'Galaxy Arcade',
      description: 'Retro neon cosmos (kids)',
      preview: {
        question: 'Which galaxy is home to our Solar System?',
        options: ['🌌 Milky Way', '🌀 Whirlpool', '🎮 Andromeda', '✨ Sombrero'],
        backgroundColor: 'bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950',
        questionColor: 'text-purple-100',
        optionStyle:
          'bg-purple-900/70 border border-pink-500/50 text-pink-200 shadow-lg shadow-purple-900/50 rounded-xl',
        accentColor: 'text-pink-300',
        pattern: 'pixel-stars',
        progressColor: '#f472b6',
        optionHover: '#581c87',
      },
      features: ['Pixel constellations', 'Arcade glow', 'Fun galaxy icons'],
    },
    {
      id: 'candy-circuit',
      name: 'Candy Circuit',
      description: 'Sugary tech playground (kids)',
      preview: {
        question: 'Which treat is known as a “rainbow chip”?',
        options: ['🍭 Lollipop', '🍫 Chocolate', '🍪 Cookie', '🧁 Cupcake'],
        backgroundColor: 'bg-gradient-to-br from-rose-200 via-pink-200 to-sky-200',
        questionColor: 'text-rose-900',
        optionStyle:
          'bg-white/85 border border-rose-300 text-rose-600 shadow-lg shadow-rose-200/40 rounded-2xl',
        accentColor: 'text-rose-500',
        pattern: 'candy',
        progressColor: '#fb7185',
        optionHover: '#fecdd3',
      },
      features: ['Candy wires', 'Soft pastels', 'Energetic badges'],
    },
  ];

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
  };

  const handlePreviewFullScreen = () => {
    // In real app, this would show full-screen preview
    console.log('Preview theme:', selectedTheme);
  };

  const handleApplyTheme = () => {
    if (onApply) {
      onApply(selectedTheme);
    }
  };

  const renderThemePattern = (pattern: string | undefined, isHovered: boolean) => {
    if (!pattern) return null;

    switch (pattern) {
      case 'prism':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(120deg, rgba(196,181,253,0.25), rgba(236,72,153,0.12), rgba(96,165,250,0.18))',
                filter: 'blur(70px)',
              }}
              animate={
                isHovered ? { opacity: [0.3, 0.6, 0.3], rotate: [0, 4, -4, 0] } : { opacity: 0.45 }
              }
              transition={{ duration: 7, repeat: isHovered ? Infinity : 0, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'conic-gradient(from 130deg at 50% 50%, rgba(236,72,153,0.18), rgba(96,165,250,0.12), rgba(192,132,252,0.2))',
                mixBlendMode: 'screen',
              }}
              animate={isHovered ? { scale: [1, 1.06, 1], rotate: [0, -6, 6, 0] } : {}}
              transition={{ duration: 9, repeat: isHovered ? Infinity : 0, ease: 'easeInOut' }}
            />
          </div>
        );
      case 'circuit':
        return (
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(52,211,153,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.22) 1px, transparent 1px)',
                backgroundSize: '34px 34px',
              }}
            />
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute border border-emerald-300/40 rounded"
                style={{
                  width: 36 + i * 14,
                  height: 36 + i * 14,
                  left: `${12 + i * 14}%`,
                  top: `${18 + ((i * 19) % 54)}%`,
                }}
                animate={isHovered ? { opacity: [0.15, 0.4, 0.15] } : {}}
                transition={{
                  duration: 4.5 + i,
                  repeat: isHovered ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        );
      case 'aurora':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-sky-400/25 via-cyan-400/12 to-transparent blur-3xl"
              animate={isHovered ? { opacity: [0.25, 0.6, 0.25], y: [0, -14, 0] } : {}}
              transition={{ duration: 6, repeat: isHovered ? Infinity : 0, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-x-5 bottom-0 h-1/2 bg-gradient-to-t from-blue-500/25 via-indigo-500/12 to-transparent blur-3xl"
              animate={isHovered ? { opacity: [0.25, 0.5, 0.25], y: [0, 16, 0] } : {}}
              transition={{ duration: 5, repeat: isHovered ? Infinity : 0, ease: 'easeInOut' }}
            />
          </div>
        );
      case 'flora':
        return (
          <div className="absolute inset-0 opacity-25 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-rose-200"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  fontSize: `${18 + Math.random() * 16}px`,
                }}
                animate={isHovered ? { rotate: [0, 12, -12, 0], scale: [1, 1.1, 1] } : {}}
                transition={{
                  duration: 5,
                  repeat: isHovered ? Infinity : 0,
                  ease: 'easeInOut',
                  delay: Math.random() * 2,
                }}
              >
                ✿
              </motion.div>
            ))}
          </div>
        );
      case 'sunburst':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 20%, rgba(253,224,71,0.3), transparent 40%), radial-gradient(circle at 80% 30%, rgba(249,115,22,0.25), transparent 45%), radial-gradient(circle at 50% 80%, rgba(244,63,94,0.25), transparent 40%)',
              }}
              animate={isHovered ? { opacity: [0.3, 0.6, 0.3] } : { opacity: 0.35 }}
              transition={{ duration: 6, repeat: isHovered ? Infinity : 0, ease: 'easeInOut' }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'repeating-conic-gradient(from 0deg, rgba(253,224,71,0.15) 0deg 6deg, transparent 6deg 12deg)',
                opacity: 0.2,
              }}
            />
          </div>
        );
      case 'mono-grid':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, rgba(244,114,182,0.12) 1px, transparent 1px), linear-gradient(rgba(244,114,182,0.12) 1px, transparent 1px)',
                backgroundSize: '26px 26px',
                opacity: 0.25,
              }}
            />
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.04), transparent 60%)',
              }}
              animate={isHovered ? { opacity: [0.2, 0.4, 0.2] } : { opacity: 0.25 }}
              transition={{ duration: 5, repeat: isHovered ? Infinity : 0, ease: 'easeInOut' }}
            />
          </div>
        );
      case 'pixel-stars':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={isHovered ? { opacity: [0.2, 0.8, 0.2] } : { opacity: 0.4 }}
                transition={{
                  duration: 2.5 + Math.random(),
                  repeat: isHovered ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              >
                <span className="text-pink-300" style={{ fontSize: `${8 + Math.random() * 6}px` }}>
                  ✸
                </span>
              </motion.div>
            ))}
          </div>
        );
      case 'candy':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, rgba(248,187,208,0.25), rgba(147,197,253,0.2))',
                backgroundSize: '200% 200%',
              }}
              animate={isHovered ? { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] } : {}}
              transition={{ duration: 8, repeat: isHovered ? Infinity : 0, ease: 'easeInOut' }}
            />
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={isHovered ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: isHovered ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              >
                <span className="text-rose-400" style={{ fontSize: `${14 + Math.random() * 6}px` }}>
                  🍬
                </span>
              </motion.div>
            ))}
          </div>
        );
      case 'sparkle':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(14)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-amber-200"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  fontSize: `${10 + Math.random() * 8}px`,
                }}
                animate={isHovered ? { opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] } : {}}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: isHovered ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              >
                ✦
              </motion.div>
            ))}
          </div>
        );
      case 'bubbles':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/50"
                style={{
                  width: 60 + Math.random() * 60,
                  height: 60 + Math.random() * 60,
                  left: `${Math.random() * 80}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                animate={isHovered ? { y: [0, -14, 0], opacity: [0.35, 0.6, 0.35] } : {}}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: isHovered ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const selectedThemeData = themes.find(t => t.id === selectedTheme);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-300 to-teal-400 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl">🎨</div>
        <div className="absolute top-20 right-20 text-4xl">✨</div>
        <div className="absolute bottom-20 left-20 text-5xl">🎨</div>
        <div className="absolute bottom-10 right-10 text-3xl">✨</div>
        <div className="absolute top-1/2 left-1/4 text-4xl">🎨</div>
        <div className="absolute top-1/3 right-1/4 text-5xl">✨</div>
        <div className="absolute top-2/3 left-2/3 text-3xl">🎨</div>
        <div className="absolute top-1/4 right-2/3 text-4xl">✨</div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-8 px-4"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Choose a Quiz Theme</h1>
          <p className="text-purple-100 text-lg">Make your quiz more fun and personal</p>
        </motion.div>

        {/* Theme Grid */}
        <div className="flex-1 px-4 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {themes.map((theme, index) => (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="h-full"
                >
                  <Card
                    variant="elevated"
                    className={`h-full cursor-pointer transition-all duration-300 ${
                      selectedTheme === theme.id
                        ? 'ring-4 ring-yellow-400 ring-opacity-75 shadow-2xl shadow-yellow-400/25'
                        : 'hover:shadow-xl'
                    }`}
                    hover={true}
                    onClick={() => handleThemeSelect(theme.id)}
                    onMouseEnter={() => setHoveredTheme(theme.id)}
                    onMouseLeave={() => setHoveredTheme(null)}
                  >
                    <div className="p-4 h-full flex flex-col">
                      {/* Theme Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{theme.name}</h3>
                          <p className="text-sm text-gray-600">{theme.description}</p>
                        </div>
                        {selectedTheme === theme.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                          >
                            <span className="text-white text-sm">✅</span>
                          </motion.div>
                        )}
                      </div>

                      {/* Live Preview Mockup */}
                      <div className="flex-1 relative">
                        <motion.div
                          className={`${theme.preview.backgroundColor} rounded-lg p-4 h-full relative overflow-hidden`}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          {renderThemePattern(theme.preview.pattern, hoveredTheme === theme.id)}

                          <div className="relative z-10">
                            {/* Mock Question */}
                            <div
                              className={`${theme.preview.questionColor} font-medium text-sm mb-4`}
                            >
                              Q1. {theme.preview.question}
                            </div>

                            {/* Mock Options */}
                            <div className="space-y-2">
                              {theme.preview.options.map((option, optionIndex) => (
                                <motion.div
                                  key={optionIndex}
                                  className={`${theme.preview.optionStyle} p-2 rounded text-xs cursor-pointer transition-all duration-200`}
                                  whileHover={{
                                    scale: 1.02,
                                    backgroundColor: theme.preview.optionHover,
                                  }}
                                  transition={{ duration: 0.12 }}
                                >
                                  {option}
                                </motion.div>
                              ))}
                            </div>

                            {/* Mock Progress */}
                            <div className="mt-4 flex items-center justify-between text-xs">
                              <span className={theme.preview.accentColor}>Question 1 of 10</span>
                              <div className="w-16 h-1 bg-gray-300/60 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full"
                                  style={{ background: theme.preview.progressColor ?? '#38bdf8' }}
                                  initial={{ width: 0 }}
                                  animate={{ width: '10%' }}
                                  transition={{ delay: 0.5, duration: 0.8 }}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Theme Features */}
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex flex-wrap gap-1">
                          {theme.features.map((feature, featureIndex) => (
                            <span
                              key={featureIndex}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm border-t border-purple-200 p-6"
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="outline"
                  size="large"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 min-w-[150px]"
                >
                  ← Back
                </Button>
              )}

              {/* Preview Button */}
              <Button
                onClick={handlePreviewFullScreen}
                variant="outline"
                size="large"
                className="border-purple-300 text-purple-700 hover:bg-purple-50 min-w-[180px]"
              >
                👁️ Preview in Full Screen
              </Button>

              {/* Apply Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleApplyTheme}
                  variant="primary"
                  size="large"
                  className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white shadow-lg min-w-[160px] relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-teal-400 to-purple-500 opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10 flex items-center justify-center">
                    ✨ Apply Theme
                  </span>
                </Button>
              </motion.div>
            </div>

            {/* Selected Theme Info */}
            <AnimatePresence mode="wait">
              {selectedThemeData && (
                <motion.div
                  key={selectedTheme}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center mt-4"
                >
                  <p className="text-sm text-purple-700">
                    Selected: <span className="font-semibold">{selectedThemeData.name}</span> -{' '}
                    {selectedThemeData.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ThemePicker;
