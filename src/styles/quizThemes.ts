export type OptionLetter = 'A' | 'B' | 'C' | 'D';

interface OptionPaletteEntry {
  inner: string;
  innerSelected: string;
  letter: string;
  letterSelected: string;
}

interface ProgressStyles {
  track: string;
  fillClass?: string;
  fillColor?: string;
  text: string;
}

interface TimerStyles {
  track: string;
  stroke: string;
  text: string;
  icon: string;
}

interface NavStyles {
  answered: string;
  marked: string;
  unanswered: string;
  currentRing: string;
}

interface ButtonStyles {
  previous: string;
  next: string;
  mark: string;
  markActive: string;
  exit: string;
}

export interface QuizThemeStyles {
  root: string;
  overlay?: string;
  topBar: string;
  topBarTitle: string;
  topBarMeta: string;
  footer: string;
  questionCard: string;
  questionText: string;
  optionCard: string;
  optionCardHover?: string;
  optionCardSelected: string;
  optionInnerBase: string;
  optionInnerSelected: string;
  optionText: string;
  optionLetterBase: string;
  optionLetterSelectedBase: string;
  optionSelectedIcon: string;
  optionPalette: Record<OptionLetter, OptionPaletteEntry>;
  progress: ProgressStyles;
  timer: TimerStyles;
  nav: NavStyles;
  buttons: ButtonStyles;
  mobileNav: string;
  mobileNavText: string;
  modalCard: string;
  modalPrimaryButton: string;
  modalSecondaryButton: string;
}

export interface QuizThemeDefinition {
  id: string;
  name: string;
  description: string;
  preview: QuizThemePreview;
  features: string[];
  quizStyles: QuizThemeStyles;
}

export interface QuizThemePreview {
  question: string;
  options: string[];
  backgroundColor: string;
  questionColor: string;
  optionStyle: string;
  accentColor: string;
  pattern?: string;
  progressColor?: string;
  optionHover?: string;
}

export const DEFAULT_THEME_ID = 'classic';

const baseOptionText = 'text-sm sm:text-base font-medium';

export const QUIZ_THEMES: QuizThemeDefinition[] = [
  {
    id: 'classic',
    name: 'Classic Focus',
    description: 'Teal gradient with clear contrast and calming accents',
    preview: {
      question: 'What is the value of 3x when x = 7?',
      options: ['A) 10', 'B) 14', 'C) 18', 'D) 21'],
      backgroundColor: 'bg-gradient-to-br from-teal-500 via-sky-400 to-white',
      questionColor: 'text-slate-900',
      optionStyle: 'bg-white border border-teal-200 text-slate-800 shadow-sm',
      accentColor: 'text-teal-700',
      pattern: 'aurora',
      progressColor: '#0ea5e9',
      optionHover: '#0f766e'
    },
    features: ['High legibility', 'Adaptive contrast', 'Guided focus'],
    quizStyles: {
      root: 'bg-gradient-to-br from-teal-100 via-white to-slate-100',
      overlay:
        'pointer-events-none absolute inset-0 bg-[radial-gradient(circle,_rgba(13,148,136,0.12)_1px,_transparent_1px)] bg-[length:36px_36px]',
      topBar: 'bg-white/90 backdrop-blur border-b border-teal-200 text-slate-900',
      topBarTitle: 'text-slate-900',
      topBarMeta: 'text-slate-600',
      footer: 'bg-white/90 backdrop-blur border-t border-teal-200',
      questionCard: 'bg-white/95 border border-teal-100 shadow-xl text-slate-800',
      questionText: 'text-slate-900',
      optionCard: 'cursor-pointer transition-all duration-200 hover:shadow-lg',
      optionCardHover: 'hover:ring-2 hover:ring-teal-200/80',
      optionCardSelected: 'ring-4 ring-offset-2 ring-white/70 shadow-[0_18px_44px_rgba(13,148,136,0.35)]',
      optionInnerBase:
        'flex items-center justify-between gap-3 p-4 rounded-xl transition-all duration-200 text-white shadow-sm',
      optionInnerSelected: 'ring-1 ring-white/40 shadow-xl',
      optionText: `${baseOptionText} text-white`,
      optionLetterBase:
        'w-9 h-9 flex items-center justify-center rounded-full font-semibold shrink-0 transition-colors duration-200',
      optionLetterSelectedBase: 'ring-2 ring-white/70 ring-offset-2',
      optionSelectedIcon: 'text-white',
      optionPalette: {
        A: {
          inner:
            'bg-teal-500/95 border border-teal-400/60 shadow-[0_6px_18px_rgba(13,148,136,0.25)]',
          innerSelected: 'bg-gradient-to-r from-teal-500 to-sky-500 border border-transparent',
          letter: 'bg-teal-500 text-white',
          letterSelected: 'bg-white text-teal-600'
        },
        B: {
          inner:
            'bg-emerald-500/95 border border-emerald-400/60 shadow-[0_6px_18px_rgba(16,185,129,0.25)]',
          innerSelected: 'bg-gradient-to-r from-emerald-500 to-teal-500 border border-transparent',
          letter: 'bg-emerald-500 text-white',
          letterSelected: 'bg-white text-emerald-600'
        },
        C: {
          inner:
            'bg-sky-500/95 border border-sky-400/60 shadow-[0_6px_18px_rgba(56,189,248,0.25)]',
          innerSelected: 'bg-gradient-to-r from-sky-500 to-cyan-500 border border-transparent',
          letter: 'bg-sky-500 text-white',
          letterSelected: 'bg-white text-sky-600'
        },
        D: {
          inner:
            'bg-indigo-500/95 border border-indigo-400/60 shadow-[0_6px_18px_rgba(99,102,241,0.25)]',
          innerSelected: 'bg-gradient-to-r from-indigo-500 to-purple-500 border border-transparent',
          letter: 'bg-indigo-500 text-white',
          letterSelected: 'bg-white text-indigo-600'
        }
      },
      progress: {
        track: 'bg-teal-200/60',
        fillClass: 'bg-gradient-to-r from-teal-500 to-sky-500',
        text: 'text-slate-700'
      },
      timer: {
        track: '#ccfbf1',
        stroke: '#0f766e',
        text: 'text-teal-700',
        icon: 'text-teal-700'
      },
      nav: {
        answered: 'bg-teal-500 text-white',
        marked: 'bg-amber-400 text-white',
        unanswered: 'bg-slate-400 text-white',
        currentRing: 'ring-teal-300 ring-offset-2'
      },
      buttons: {
        previous: 'border border-teal-400 text-teal-700 hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed',
        next: 'bg-gradient-to-r from-teal-500 to-sky-500 text-white hover:from-teal-600 hover:to-sky-600',
        mark: 'bg-teal-100 text-teal-700 hover:bg-teal-200',
        markActive: 'bg-amber-500 text-white hover:bg-amber-600',
        exit: 'border border-teal-400 text-teal-700 hover:bg-teal-50'
      },
      mobileNav: 'bg-white/95',
      mobileNavText: 'text-slate-800',
      modalCard: 'bg-white text-slate-800',
      modalPrimaryButton: 'bg-gradient-to-r from-teal-500 to-sky-500 text-white hover:from-teal-600 hover:to-sky-600',
      modalSecondaryButton: 'bg-teal-100 text-teal-700 hover:bg-teal-200'
    }
  },
  {
    id: 'neo-prism',
    name: 'Neo Prism',
    description: 'Gradient glass with futurist typography',
    preview: {
      question: 'Which architecture style introduced the flying buttress?',
      options: ['A) Romanesque', 'B) Gothic', 'C) Renaissance', 'D) Baroque'],
      backgroundColor: 'bg-gradient-to-br from-slate-950 via-purple-950 to-rose-900',
      questionColor: 'text-violet-100',
      optionStyle: 'bg-white/10 border border-purple-400/40 text-violet-100 backdrop-blur-lg shadow-lg shadow-purple-900/40',
      accentColor: 'text-fuchsia-200',
      pattern: 'prism',
      progressColor: '#f0abfc',
      optionHover: '#5b21b6'
    },
    features: ['Prismatic glow', 'Glass layering', 'Editorial headings'],
    quizStyles: {
      root: 'bg-gradient-to-br from-slate-950 via-purple-950 to-rose-900',
      overlay:
        'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(236,72,153,0.22),transparent_58%)]',
      topBar: 'bg-slate-950/80 backdrop-blur-lg border-b border-purple-700/40 text-violet-100',
      topBarTitle: 'text-violet-100',
      topBarMeta: 'text-violet-300',
      footer: 'bg-slate-950/75 backdrop-blur border-t border-purple-700/40',
      questionCard: 'bg-white/10 border border-purple-500/40 shadow-2xl shadow-fuchsia-900/30 text-violet-100',
      questionText: 'text-violet-100',
      optionCard:
        'cursor-pointer transition-all duration-200 border border-purple-500/40 bg-white/10 text-violet-100 backdrop-blur shadow-lg shadow-purple-900/30',
      optionCardHover: 'hover:bg-white/12 hover:shadow-2xl hover:shadow-fuchsia-900/40',
      optionCardSelected:
        'ring-4 ring-offset-2 ring-fuchsia-300/70 ring-offset-purple-900/60 shadow-[0_22px_48px_rgba(236,72,153,0.45)]',
      optionInnerBase:
        'flex items-center justify-between gap-3 p-4 rounded-2xl transition-all duration-200 text-violet-100',
      optionInnerSelected: 'ring-1 ring-fuchsia-200/40 shadow-xl',
      optionText: `${baseOptionText} text-violet-100`,
      optionLetterBase:
        'w-9 h-9 flex items-center justify-center rounded-full font-semibold shrink-0 transition-colors duration-200',
      optionLetterSelectedBase: 'ring-2 ring-fuchsia-200/60 ring-offset-2 ring-offset-purple-900/60',
      optionSelectedIcon: 'text-fuchsia-100',
      optionPalette: {
        A: {
          inner:
            'bg-purple-900/50 border border-purple-400/40 backdrop-blur-md shadow-[0_10px_26px_rgba(88,28,135,0.35)]',
          innerSelected:
            'bg-gradient-to-r from-purple-700/80 to-fuchsia-600/80 border border-fuchsia-400/70 text-violet-100',
          letter: 'bg-fuchsia-500 text-white',
          letterSelected: 'bg-white/80 text-fuchsia-700'
        },
        B: {
          inner:
            'bg-indigo-900/50 border border-indigo-400/40 backdrop-blur-md shadow-[0_10px_26px_rgba(67,56,202,0.35)]',
          innerSelected:
            'bg-gradient-to-r from-indigo-700/80 to-purple-600/80 border border-indigo-400/70 text-violet-100',
          letter: 'bg-indigo-500 text-white',
          letterSelected: 'bg-white/80 text-indigo-700'
        },
        C: {
          inner:
            'bg-rose-900/50 border border-rose-400/40 backdrop-blur-md shadow-[0_10px_26px_rgba(190,24,93,0.35)]',
          innerSelected:
            'bg-gradient-to-r from-rose-700/80 to-fuchsia-600/80 border border-rose-400/70 text-violet-100',
          letter: 'bg-rose-500 text-white',
          letterSelected: 'bg-white/80 text-rose-700'
        },
        D: {
          inner:
            'bg-sky-900/50 border border-sky-400/40 backdrop-blur-md shadow-[0_10px_26px_rgba(14,116,144,0.35)]',
          innerSelected:
            'bg-gradient-to-r from-sky-700/80 to-indigo-600/80 border border-sky-400/70 text-violet-100',
          letter: 'bg-sky-500 text-white',
          letterSelected: 'bg-white/80 text-sky-700'
        }
      },
      progress: {
        track: 'bg-violet-900/35',
        fillClass: 'bg-gradient-to-r from-fuchsia-400 via-purple-500 to-indigo-500',
        text: 'text-fuchsia-200'
      },
      timer: {
        track: '#312e81',
        stroke: '#f472b6',
        text: 'text-pink-200',
        icon: 'text-pink-200'
      },
      nav: {
        answered: 'bg-emerald-400 text-slate-900',
        marked: 'bg-fuchsia-400 text-slate-900',
        unanswered: 'bg-white/20 text-white',
        currentRing: 'ring-fuchsia-300 ring-offset-2 ring-offset-purple-900/60'
      },
      buttons: {
        previous: 'border border-fuchsia-400/60 text-fuchsia-200 hover:bg-fuchsia-900/40 disabled:opacity-50 disabled:cursor-not-allowed',
        next: 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white hover:from-fuchsia-600 hover:to-purple-700',
        mark: 'bg-fuchsia-900/40 text-fuchsia-200 hover:bg-fuchsia-900/50',
        markActive: 'bg-fuchsia-600 text-white hover:bg-fuchsia-700',
        exit: 'border border-fuchsia-400/60 text-fuchsia-100 hover:bg-fuchsia-900/40'
      },
      mobileNav: 'bg-slate-950/90',
      mobileNavText: 'text-violet-100',
      modalCard: 'bg-slate-900/90 text-violet-100',
      modalPrimaryButton: 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white hover:from-fuchsia-600 hover:to-purple-700',
      modalSecondaryButton: 'bg-fuchsia-900/40 text-fuchsia-200 hover:bg-fuchsia-900/50'
    }
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
      optionStyle: 'bg-slate-800/80 border border-emerald-500/50 text-emerald-100 shadow-inner shadow-black/50',
      accentColor: 'text-emerald-300',
      pattern: 'circuit',
      progressColor: '#34d399',
      optionHover: '#064e3b'
    },
    features: ['Circuit etching', 'Holographic indicators', 'Night-mode comfort'],
    quizStyles: {
      root: 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950',
      overlay:
        'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.25),transparent_60%)]',
      topBar: 'bg-slate-950/85 backdrop-blur-lg border-b border-emerald-500/30 text-emerald-100',
      topBarTitle: 'text-emerald-100',
      topBarMeta: 'text-emerald-300',
      footer: 'bg-slate-950/80 backdrop-blur border-t border-emerald-500/30',
      questionCard: 'bg-slate-900/80 border border-emerald-500/30 shadow-xl shadow-emerald-900/40 text-emerald-100',
      questionText: 'text-emerald-100',
      optionCard:
        'cursor-pointer transition-all duration-200 border border-emerald-500/40 bg-slate-900/70 text-emerald-100 backdrop-blur',
      optionCardHover: 'hover:ring-2 hover:ring-emerald-400/50 hover:bg-slate-900/80',
      optionCardSelected:
        'ring-4 ring-offset-2 ring-emerald-500/70 ring-offset-slate-900/60 shadow-[0_22px_48px_rgba(16,185,129,0.45)]',
      optionInnerBase:
        'flex items-center justify-between gap-3 p-4 rounded-2xl transition-all duration-200 text-emerald-100',
      optionInnerSelected: 'ring-1 ring-emerald-300/40 shadow-xl',
      optionText: `${baseOptionText} text-emerald-100`,
      optionLetterBase:
        'w-9 h-9 flex items-center justify-center rounded-full font-semibold shrink-0 transition-colors duration-200',
      optionLetterSelectedBase: 'ring-2 ring-emerald-300/70 ring-offset-2 ring-offset-slate-900/70',
      optionSelectedIcon: 'text-emerald-200',
      optionPalette: {
        A: {
          inner:
            'bg-gradient-to-r from-emerald-500/40 to-cyan-500/30 border border-emerald-500/40 shadow-[0_12px_28px_rgba(16,185,129,0.30)]',
          innerSelected:
            'bg-gradient-to-r from-emerald-500 to-cyan-500 border border-transparent text-slate-900',
          letter: 'bg-emerald-500 text-slate-900',
          letterSelected: 'bg-emerald-300 text-slate-900'
        },
        B: {
          inner:
            'bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 border border-cyan-500/40 shadow-[0_12px_28px_rgba(6,182,212,0.30)]',
          innerSelected:
            'bg-gradient-to-r from-cyan-500 to-emerald-500 border border-transparent text-slate-900',
          letter: 'bg-cyan-500 text-slate-900',
          letterSelected: 'bg-cyan-300 text-slate-900'
        },
        C: {
          inner:
            'bg-emerald-600/30 border border-emerald-500/40 shadow-[0_12px_28px_rgba(5,150,105,0.30)]',
          innerSelected: 'bg-emerald-600/80 border border-transparent text-emerald-50',
          letter: 'bg-emerald-600 text-emerald-50',
          letterSelected: 'bg-emerald-400 text-slate-900'
        },
        D: {
          inner:
            'bg-slate-800/40 border border-slate-700/50 shadow-[0_12px_28px_rgba(15,23,42,0.35)]',
          innerSelected: 'bg-slate-800/80 border border-transparent text-emerald-100',
          letter: 'bg-slate-700 text-emerald-200',
          letterSelected: 'bg-slate-500 text-emerald-100'
        }
      },
      progress: {
        track: 'bg-emerald-900/35',
        fillClass: 'bg-gradient-to-r from-emerald-400 to-cyan-400',
        text: 'text-emerald-200'
      },
      timer: {
        track: '#064e3b',
        stroke: '#34d399',
        text: 'text-emerald-200',
        icon: 'text-emerald-200'
      },
      nav: {
        answered: 'bg-emerald-400 text-slate-900',
        marked: 'bg-cyan-400 text-slate-900',
        unanswered: 'bg-slate-700 text-emerald-100',
        currentRing: 'ring-emerald-300 ring-offset-2 ring-offset-slate-900/60'
      },
      buttons: {
        previous: 'border border-emerald-400/60 text-emerald-200 hover:bg-emerald-900/40 disabled:opacity-50 disabled:cursor-not-allowed',
        next: 'bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-900 hover:from-emerald-300 hover:to-cyan-400',
        mark: 'bg-slate-800/70 text-emerald-200 hover:bg-slate-800/80',
        markActive: 'bg-emerald-500 text-slate-900 hover:bg-emerald-400',
        exit: 'border border-emerald-400/60 text-emerald-200 hover:bg-emerald-900/40'
      },
      mobileNav: 'bg-slate-950/90',
      mobileNavText: 'text-emerald-100',
      modalCard: 'bg-slate-900/90 text-emerald-100',
      modalPrimaryButton: 'bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-900 hover:from-emerald-300 hover:to-cyan-400',
      modalSecondaryButton: 'bg-slate-800/80 text-emerald-200 hover:bg-slate-800/90'
    }
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
      optionStyle: 'bg-rose-900/60 border border-fuchsia-500/40 text-rose-100 shadow-lg shadow-rose-900/40',
      accentColor: 'text-fuchsia-200',
      pattern: 'flora',
      progressColor: '#fb7185',
      optionHover: '#7f1d1d'
    },
    features: ['Botanical silhouettes', 'Velvet grain', 'Gallery mood'],
    quizStyles: {
      root: 'bg-gradient-to-br from-rose-950 via-fuchsia-950 to-slate-950',
      overlay:
        'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(244,114,182,0.26),transparent_58%)]',
      topBar: 'bg-rose-950/80 backdrop-blur-lg border-b border-fuchsia-500/30 text-rose-100',
      topBarTitle: 'text-rose-100',
      topBarMeta: 'text-rose-300',
      footer: 'bg-rose-950/75 backdrop-blur border-t border-fuchsia-500/30',
      questionCard: 'bg-rose-900/70 border border-fuchsia-500/30 shadow-xl shadow-rose-900/40 text-rose-100',
      questionText: 'text-rose-100',
      optionCard:
        'cursor-pointer transition-all duration-200 border border-fuchsia-500/40 bg-rose-900/60 text-rose-100',
      optionCardHover: 'hover:ring-2 hover:ring-rose-400/50 hover:bg-rose-900/70',
      optionCardSelected:
        'ring-4 ring-offset-2 ring-rose-300/70 ring-offset-rose-950/60 shadow-[0_22px_48px_rgba(244,114,182,0.45)]',
      optionInnerBase:
        'flex items-center justify-between gap-3 p-4 rounded-2xl transition-all duration-200 text-rose-100',
      optionInnerSelected: 'ring-1 ring-rose-300/40 shadow-xl',
      optionText: `${baseOptionText} text-rose-100`,
      optionLetterBase:
        'w-9 h-9 flex items-center justify-center rounded-full font-semibold shrink-0 transition-colors duration-200',
      optionLetterSelectedBase: 'ring-2 ring-rose-200/60 ring-offset-2 ring-offset-rose-950/70',
      optionSelectedIcon: 'text-rose-100',
      optionPalette: {
        A: {
          inner:
            'bg-rose-900/60 border border-rose-500/40 shadow-[0_12px_30px_rgba(225,30,72,0.30)]',
          innerSelected: 'bg-rose-700/80 border border-transparent text-rose-100',
          letter: 'bg-rose-500 text-white',
          letterSelected: 'bg-rose-200 text-rose-800'
        },
        B: {
          inner:
            'bg-fuchsia-900/60 border border-fuchsia-500/40 shadow-[0_12px_30px_rgba(217,70,239,0.30)]',
          innerSelected: 'bg-fuchsia-700/80 border border-transparent text-rose-100',
          letter: 'bg-fuchsia-500 text-white',
          letterSelected: 'bg-fuchsia-200 text-fuchsia-800'
        },
        C: {
          inner:
            'bg-purple-900/60 border border-purple-500/40 shadow-[0_12px_30px_rgba(168,85,247,0.30)]',
          innerSelected: 'bg-purple-700/80 border border-transparent text-rose-100',
          letter: 'bg-purple-500 text-white',
          letterSelected: 'bg-purple-200 text-purple-800'
        },
        D: {
          inner:
            'bg-amber-900/60 border border-amber-600/40 shadow-[0_12px_30px_rgba(251,191,36,0.25)]',
          innerSelected: 'bg-amber-700/80 border border-transparent text-rose-100',
          letter: 'bg-amber-500 text-slate-900',
          letterSelected: 'bg-amber-200 text-amber-900'
        }
      },
      progress: {
        track: 'bg-rose-900/35',
        fillClass: 'bg-gradient-to-r from-rose-400 via-fuchsia-400 to-purple-500',
        text: 'text-rose-200'
      },
      timer: {
        track: '#7f1d1d',
        stroke: '#fb7185',
        text: 'text-rose-200',
        icon: 'text-rose-200'
      },
      nav: {
        answered: 'bg-rose-400 text-white',
        marked: 'bg-fuchsia-400 text-white',
        unanswered: 'bg-rose-800 text-rose-200',
        currentRing: 'ring-rose-300 ring-offset-2 ring-offset-rose-950/60'
      },
      buttons: {
        previous: 'border border-rose-400/60 text-rose-100 hover:bg-rose-900/40 disabled:opacity-50 disabled:cursor-not-allowed',
        next: 'bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white hover:from-rose-600 hover:to-fuchsia-700',
        mark: 'bg-rose-900/40 text-rose-100 hover:bg-rose-900/50',
        markActive: 'bg-rose-600 text-white hover:bg-rose-700',
        exit: 'border border-rose-400/60 text-rose-100 hover:bg-rose-900/40'
      },
      mobileNav: 'bg-rose-950/90',
      mobileNavText: 'text-rose-100',
      modalCard: 'bg-rose-950/90 text-rose-100',
      modalPrimaryButton: 'bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white hover:from-rose-600 hover:to-fuchsia-700',
      modalSecondaryButton: 'bg-rose-900/50 text-rose-100 hover:bg-rose-900/60'
    }
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
      optionStyle: 'bg-white/10 border border-sky-400/40 text-sky-100 backdrop-blur-lg shadow-lg shadow-sky-900/40',
      accentColor: 'text-sky-300',
      pattern: 'aurora',
      progressColor: '#38bdf8',
      optionHover: '#1e293b'
    },
    features: ['Dancing aurora', 'Icy reflections', 'High-latitude calm'],
    quizStyles: {
      root: 'bg-gradient-to-br from-slate-950 via-blue-950 to-sky-900',
      overlay:
        'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.28),transparent_60%)]',
      topBar: 'bg-slate-950/80 backdrop-blur-lg border-b border-sky-500/30 text-sky-100',
      topBarTitle: 'text-sky-100',
      topBarMeta: 'text-sky-300',
      footer: 'bg-slate-950/75 backdrop-blur border-t border-sky-500/30',
      questionCard: 'bg-white/10 border border-sky-400/40 shadow-xl shadow-sky-900/40 text-sky-100',
      questionText: 'text-sky-100',
      optionCard:
        'cursor-pointer transition-all duration-200 border border-sky-400/50 bg-white/10 text-sky-100 backdrop-blur',
      optionCardHover: 'hover:ring-2 hover:ring-sky-400/50 hover:bg-white/12',
      optionCardSelected:
        'ring-4 ring-offset-2 ring-sky-300/70 ring-offset-slate-900/60 shadow-[0_22px_48px_rgba(56,189,248,0.40)]',
      optionInnerBase:
        'flex items-center justify-between gap-3 p-4 rounded-2xl transition-all duration-200 text-sky-100',
      optionInnerSelected: 'ring-1 ring-sky-300/40 shadow-xl',
      optionText: `${baseOptionText} text-sky-100`,
      optionLetterBase:
        'w-9 h-9 flex items-center justify-center rounded-full font-semibold shrink-0 transition-colors duration-200',
      optionLetterSelectedBase: 'ring-2 ring-sky-200/70 ring-offset-2 ring-offset-slate-900/70',
      optionSelectedIcon: 'text-sky-100',
      optionPalette: {
        A: {
          inner:
            'bg-sky-900/40 border border-sky-500/40 shadow-[0_12px_30px_rgba(59,130,246,0.30)]',
          innerSelected:
            'bg-gradient-to-r from-sky-500 to-cyan-500 border border-transparent text-white',
          letter: 'bg-sky-500 text-white',
          letterSelected: 'bg-white text-sky-700'
        },
        B: {
          inner:
            'bg-cyan-900/40 border border-cyan-500/40 shadow-[0_12px_30px_rgba(34,211,238,0.28)]',
          innerSelected:
            'bg-gradient-to-r from-cyan-500 to-emerald-500 border border-transparent text-white',
          letter: 'bg-cyan-500 text-white',
          letterSelected: 'bg-white text-cyan-700'
        },
        C: {
          inner:
            'bg-indigo-900/40 border border-indigo-500/40 shadow-[0_12px_30px_rgba(99,102,241,0.28)]',
          innerSelected:
            'bg-gradient-to-r from-indigo-500 to-blue-500 border border-transparent text-white',
          letter: 'bg-indigo-500 text-white',
          letterSelected: 'bg-white text-indigo-700'
        },
        D: {
          inner:
            'bg-blue-900/40 border border-blue-500/40 shadow-[0_12px_30px_rgba(37,99,235,0.28)]',
          innerSelected:
            'bg-gradient-to-r from-blue-500 to-sky-500 border border-transparent text-white',
          letter: 'bg-blue-500 text-white',
          letterSelected: 'bg-white text-blue-700'
        }
      },
      progress: {
        track: 'bg-sky-900/35',
        fillClass: 'bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500',
        text: 'text-sky-200'
      },
      timer: {
        track: '#1e3a8a',
        stroke: '#38bdf8',
        text: 'text-sky-200',
        icon: 'text-sky-200'
      },
      nav: {
        answered: 'bg-sky-400 text-white',
        marked: 'bg-cyan-400 text-white',
        unanswered: 'bg-blue-900 text-sky-100',
        currentRing: 'ring-sky-300 ring-offset-2 ring-offset-slate-900/60'
      },
      buttons: {
        previous: 'border border-sky-400/60 text-sky-100 hover:bg-sky-900/40 disabled:opacity-50 disabled:cursor-not-allowed',
        next: 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:from-sky-600 hover:to-cyan-600',
        mark: 'bg-sky-900/40 text-sky-100 hover:bg-sky-900/50',
        markActive: 'bg-sky-500 text-white hover:bg-sky-600',
        exit: 'border border-sky-400/60 text-sky-100 hover:bg-sky-900/40'
      },
      mobileNav: 'bg-slate-950/90',
      mobileNavText: 'text-sky-100',
      modalCard: 'bg-slate-900/90 text-sky-100',
      modalPrimaryButton: 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:from-sky-600 hover:to-cyan-600',
      modalSecondaryButton: 'bg-sky-900/40 text-sky-100 hover:bg-sky-900/50'
    }
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
      optionStyle: 'bg-indigo-800/70 border border-yellow-300/60 text-yellow-100 shadow-lg shadow-indigo-900/40 rounded-xl',
      accentColor: 'text-amber-200',
      pattern: 'sparkle',
      progressColor: '#fde68a',
      optionHover: '#312e81'
    },
    features: ['Storybook stars', 'Friendly icons', 'Bedtime palette'],
    quizStyles: {
      root: 'bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950',
      overlay:
        'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(253,224,71,0.22),transparent_62%)]',
      topBar: 'bg-indigo-950/80 backdrop-blur-lg border-b border-amber-300/40 text-amber-100',
      topBarTitle: 'text-amber-100',
      topBarMeta: 'text-amber-200',
      footer: 'bg-indigo-950/75 backdrop-blur border-t border-amber-300/40',
      questionCard: 'bg-indigo-900/70 border border-amber-300/40 shadow-xl shadow-indigo-900/40 text-amber-100',
      questionText: 'text-amber-100',
      optionCard:
        'cursor-pointer transition-all duration-200 border border-amber-300/50 bg-indigo-900/60 text-amber-100 rounded-3xl',
      optionCardHover: 'hover:ring-2 hover:ring-amber-200/70 hover:bg-indigo-900/70',
      optionCardSelected:
        'ring-4 ring-offset-2 ring-amber-200/70 ring-offset-indigo-950/60 shadow-[0_22px_48px_rgba(253,224,71,0.35)]',
      optionInnerBase:
        'flex items-center justify-between gap-3 p-4 rounded-3xl transition-all duration-200 text-amber-100',
      optionInnerSelected: 'ring-1 ring-amber-200/40 shadow-xl',
      optionText: `${baseOptionText} text-amber-100`,
      optionLetterBase:
        'w-9 h-9 flex items-center justify-center rounded-full font-semibold shrink-0 transition-colors duration-200',
      optionLetterSelectedBase: 'ring-2 ring-amber-200/70 ring-offset-2 ring-offset-indigo-950/70',
      optionSelectedIcon: 'text-amber-100',
      optionPalette: {
        A: {
          inner:
            'bg-indigo-900/60 border border-indigo-700/50 shadow-[0_12px_30px_rgba(79,70,229,0.28)]',
          innerSelected: 'bg-gradient-to-r from-indigo-700 to-purple-600 border border-transparent text-amber-100',
          letter: 'bg-amber-300 text-indigo-900',
          letterSelected: 'bg-amber-200 text-indigo-900'
        },
        B: {
          inner:
            'bg-purple-900/60 border border-purple-700/50 shadow-[0_12px_30px_rgba(147,51,234,0.28)]',
          innerSelected: 'bg-gradient-to-r from-purple-700 to-indigo-600 border border-transparent text-amber-100',
          letter: 'bg-amber-300 text-indigo-900',
          letterSelected: 'bg-amber-200 text-indigo-900'
        },
        C: {
          inner:
            'bg-blue-900/60 border border-blue-700/50 shadow-[0_12px_30px_rgba(37,99,235,0.28)]',
          innerSelected: 'bg-gradient-to-r from-blue-700 to-indigo-600 border border-transparent text-amber-100',
          letter: 'bg-amber-300 text-indigo-900',
          letterSelected: 'bg-amber-200 text-indigo-900'
        },
        D: {
          inner:
            'bg-indigo-900/60 border border-indigo-700/50 shadow-[0_12px_30px_rgba(79,70,229,0.28)]',
          innerSelected: 'bg-gradient-to-r from-indigo-700 to-purple-600 border border-transparent text-amber-100',
          letter: 'bg-amber-300 text-indigo-900',
          letterSelected: 'bg-amber-200 text-indigo-900'
        }
      },
      progress: {
        track: 'bg-indigo-900/35',
        fillClass: 'bg-gradient-to-r from-amber-300 to-rose-300',
        text: 'text-amber-200'
      },
      timer: {
        track: '#312e81',
        stroke: '#fde68a',
        text: 'text-amber-200',
        icon: 'text-amber-200'
      },
      nav: {
        answered: 'bg-amber-300 text-indigo-900',
        marked: 'bg-purple-400 text-indigo-900',
        unanswered: 'bg-indigo-800 text-amber-100',
        currentRing: 'ring-amber-200 ring-offset-2 ring-offset-indigo-950/60'
      },
      buttons: {
        previous: 'border border-amber-300/60 text-amber-100 hover:bg-indigo-900/40 disabled:opacity-50 disabled:cursor-not-allowed',
        next: 'bg-gradient-to-r from-amber-300 to-rose-300 text-indigo-900 hover:from-amber-200 hover:to-rose-200',
        mark: 'bg-indigo-900/40 text-amber-100 hover:bg-indigo-900/50',
        markActive: 'bg-amber-300 text-indigo-900 hover:bg-amber-200',
        exit: 'border border-amber-300/60 text-amber-100 hover:bg-indigo-900/40'
      },
      mobileNav: 'bg-indigo-950/90',
      mobileNavText: 'text-amber-100',
      modalCard: 'bg-indigo-950/90 text-amber-100',
      modalPrimaryButton: 'bg-gradient-to-r from-amber-300 to-rose-300 text-indigo-900 hover:from-amber-200 hover:to-rose-200',
      modalSecondaryButton: 'bg-indigo-900/40 text-amber-100 hover:bg-indigo-900/50'
    }
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
      optionStyle: 'bg-white/80 border border-sky-300 text-sky-700 shadow-lg shadow-cyan-200/40 rounded-full',
      accentColor: 'text-teal-600',
      pattern: 'bubbles',
      progressColor: '#2dd4bf',
      optionHover: '#bae6fd'
    },
    features: ['Squishy bubbles', 'Rounded typography', 'Optimistic pastels'],
    quizStyles: {
      root: 'bg-gradient-to-br from-sky-200 via-cyan-200 to-emerald-200',
      overlay:
        'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(14,165,233,0.22),transparent_60%)]',
      topBar: 'bg-white/85 backdrop-blur border-b border-cyan-200 text-sky-800',
      topBarTitle: 'text-sky-900',
      topBarMeta: 'text-sky-700',
      footer: 'bg-white/85 backdrop-blur border-t border-cyan-200',
      questionCard: 'bg-white/90 border border-cyan-200 shadow-xl shadow-cyan-200/40 text-sky-900',
      questionText: 'text-sky-900',
      optionCard:
        'cursor-pointer transition-all duration-200 border border-cyan-200 bg-white/90 text-sky-800 rounded-full',
      optionCardHover: 'hover:ring-2 hover:ring-cyan-200/70 hover:bg-sky-100/70',
      optionCardSelected:
        'ring-4 ring-offset-2 ring-cyan-200/70 ring-offset-white shadow-[0_22px_48px_rgba(56,189,248,0.30)]',
      optionInnerBase:
        'flex items-center justify-between gap-3 p-4 rounded-full transition-all duration-200 text-sky-800',
      optionInnerSelected: 'ring-1 ring-sky-200/60 shadow-xl',
      optionText: `${baseOptionText} text-sky-800`,
      optionLetterBase:
        'w-9 h-9 flex items-center justify-center rounded-full font-semibold shrink-0 transition-colors duration-200',
      optionLetterSelectedBase: 'ring-2 ring-cyan-200/70 ring-offset-2 ring-offset-white',
      optionSelectedIcon: 'text-sky-700',
      optionPalette: {
        A: {
          inner:
            'bg-white/95 border border-sky-200 shadow-[0_10px_26px_rgba(125,211,252,0.40)]',
          innerSelected:
            'bg-gradient-to-r from-sky-300 to-cyan-300 border border-transparent text-white',
          letter: 'bg-cyan-400 text-white',
          letterSelected: 'bg-white text-cyan-600'
        },
        B: {
          inner:
            'bg-white/95 border border-teal-200 shadow-[0_10px_26px_rgba(94,234,212,0.35)]',
          innerSelected:
            'bg-gradient-to-r from-teal-300 to-emerald-300 border border-transparent text-white',
          letter: 'bg-emerald-400 text-white',
          letterSelected: 'bg-white text-emerald-600'
        },
        C: {
          inner:
            'bg-white/95 border border-amber-200 shadow-[0_10px_26px_rgba(253,230,138,0.35)]',
          innerSelected:
            'bg-gradient-to-r from-amber-300 to-orange-300 border border-transparent text-white',
          letter: 'bg-amber-400 text-white',
          letterSelected: 'bg-white text-amber-600'
        },
        D: {
          inner:
            'bg-white/95 border border-pink-200 shadow-[0_10px_26px_rgba(248,187,208,0.35)]',
          innerSelected:
            'bg-gradient-to-r from-pink-300 to-rose-300 border border-transparent text-white',
          letter: 'bg-pink-400 text-white',
          letterSelected: 'bg-white text-pink-600'
        }
      },
      progress: {
        track: 'bg-cyan-100',
        fillClass: 'bg-gradient-to-r from-sky-400 to-cyan-400',
        text: 'text-sky-700'
      },
      timer: {
        track: '#bae6fd',
        stroke: '#0891b2',
        text: 'text-sky-700',
        icon: 'text-sky-700'
      },
      nav: {
        answered: 'bg-cyan-400 text-white',
        marked: 'bg-amber-400 text-white',
        unanswered: 'bg-sky-200 text-sky-700',
        currentRing: 'ring-cyan-200 ring-offset-2 ring-offset-white'
      },
      buttons: {
        previous: 'border border-cyan-300 text-sky-700 hover:bg-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed',
        next: 'bg-gradient-to-r from-sky-400 to-cyan-400 text-white hover:from-sky-500 hover:to-cyan-500',
        mark: 'bg-cyan-100 text-sky-700 hover:bg-cyan-200',
        markActive: 'bg-amber-400 text-white hover:bg-amber-500',
        exit: 'border border-cyan-300 text-sky-700 hover:bg-cyan-100'
      },
      mobileNav: 'bg-white/90',
      mobileNavText: 'text-sky-800',
      modalCard: 'bg-white text-sky-900',
      modalPrimaryButton: 'bg-gradient-to-r from-sky-400 to-cyan-400 text-white hover:from-sky-500 hover:to-cyan-500',
      modalSecondaryButton: 'bg-cyan-100 text-sky-700 hover:bg-cyan-200'
    }
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
      optionStyle: 'bg-amber-900/60 border border-yellow-400/40 text-amber-100 shadow-lg shadow-amber-900/40',
      accentColor: 'text-yellow-200',
      pattern: 'sunburst',
      progressColor: '#fcd34d',
      optionHover: '#7c2d12'
    },
    features: ['Radiant arcs', 'Deco geometry', 'Warm minimal luxe'],
    quizStyles: {
      root: 'bg-gradient-to-br from-amber-900 via-rose-900 to-stone-900',
      overlay:
        'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(253,224,71,0.22),transparent_60%)]',
      topBar: 'bg-amber-950/80 backdrop-blur-lg border-b border-yellow-400/30 text-amber-100',
      topBarTitle: 'text-amber-100',
      topBarMeta: 'text-amber-200',
      footer: 'bg-amber-950/75 backdrop-blur border-t border-yellow-400/30',
      questionCard: 'bg-amber-900/70 border border-yellow-400/30 shadow-xl shadow-amber-900/40 text-amber-100',
      questionText: 'text-amber-100',
      optionCard:
        'cursor-pointer transition-all duration-200 border border-yellow-400/40 bg-amber-900/60 text-amber-100',
      optionCardHover: 'hover:ring-2 hover:ring-amber-300/60 hover:bg-amber-900/70',
      optionCardSelected:
        'ring-4 ring-offset-2 ring-amber-200/70 ring-offset-amber-950/60 shadow-[0_22px_48px_rgba(251,191,36,0.35)]',
      optionInnerBase:
        'flex items-center justify-between gap-3 p-4 rounded-2xl transition-all duration-200 text-amber-100',
      optionInnerSelected: 'ring-1 ring-amber-300/40 shadow-xl',
      optionText: `${baseOptionText} text-amber-100`,
      optionLetterBase:
        'w-9 h-9 flex items-center justify-center rounded-full font-semibold shrink-0 transition-colors duration-200',
      optionLetterSelectedBase: 'ring-2 ring-amber-200/70 ring-offset-2 ring-offset-amber-950/60',
      optionSelectedIcon: 'text-amber-100',
      optionPalette: {
        A: {
          inner:
            'bg-amber-900/60 border border-amber-700/50 shadow-[0_12px_30px_rgba(252,211,77,0.28)]',
          innerSelected: 'bg-gradient-to-r from-amber-500 to-yellow-400 border border-transparent text-amber-900',
          letter: 'bg-yellow-400 text-amber-900',
          letterSelected: 'bg-amber-200 text-amber-900'
        },
        B: {
          inner:
            'bg-rose-900/60 border border-rose-700/50 shadow-[0_12px_30px_rgba(244,63,94,0.28)]',
          innerSelected: 'bg-gradient-to-r from-rose-500 to-amber-400 border border-transparent text-amber-100',
          letter: 'bg-rose-400 text-amber-900',
          letterSelected: 'bg-amber-100 text-amber-900'
        },
        C: {
          inner:
            'bg-stone-900/60 border border-stone-700/50 shadow-[0_12px_30px_rgba(120,113,108,0.28)]',
          innerSelected: 'bg-gradient-to-r from-stone-700 to-amber-500 border border-transparent text-amber-100',
          letter: 'bg-stone-500 text-amber-100',
          letterSelected: 'bg-amber-100 text-amber-900'
        },
        D: {
          inner:
            'bg-amber-900/60 border border-amber-700/50 shadow-[0_12px_30px_rgба(252,211,77,0.28)]',
          innerSelected: 'bg-gradient-to-r from-amber-500 to-yellow-400 border border-transparent text-amber-900',
          letter: 'bg-yellow-400 text-amber-900',
          letterSelected: 'bg-amber-200 text-amber-900'
        }
      },
      progress: {
        track: 'bg-amber-900/35',
        fillClass: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-rose-400',
        text: 'text-amber-200'
      },
      timer: {
        track: '#78350f',
        stroke: '#fbbf24',
        text: 'text-amber-200',
        icon: 'text-amber-200'
      },
      nav: {
        answered: 'bg-amber-400 text-amber-900',
        marked: 'bg-rose-400 text-amber-900',
        unanswered: 'bg-stone-600 text-amber-100',
        currentRing: 'ring-amber-200 ring-offset-2 ring-offset-amber-950/60'
      },
      buttons: {
        previous: 'border border-amber-400/60 text-amber-100 hover:bg-amber-900/40 disabled:opacity-50 disabled:cursor-not-allowed',
        next: 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 hover:from-amber-300 hover:to-yellow-300',
        mark: 'bg-amber-900/40 text-amber-100 hover:bg-amber-900/50',
        markActive: 'bg-amber-500 text-amber-900 hover:bg-amber-400',
        exit: 'border border-amber-400/60 text-amber-100 hover:bg-amber-900/40'
      },
      mobileNav: 'bg-amber-950/85',
      mobileNavText: 'text-amber-100',
      modalCard: 'bg-amber-950/85 text-amber-100',
      modalPrimaryButton: 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 hover:from-amber-300 hover:to-yellow-300',
      modalSecondaryButton: 'bg-amber-900/40 text-amber-100 hover:bg-amber-900/50'
    }
  },
  {
    id: 'urban-ink',
    name: 'Urban Ink',
    description: 'Monochrome grids with editorial calm',
    preview: {
      question: 'Which designer popularized the International Typographic Style?',
      options: ['A) Paul Rand', 'B) Josef Müller-Brockmann', 'C) Massimo Vignelli', 'D) Saul Bass'],
      backgroundColor: 'bg-gradient-to-br from-neutral-950 via-zinc-900 to-neutral-800',
      questionColor: 'text-zinc-100',
      optionStyle: 'bg-neutral-800/80 border border-zinc-600/40 text-zinc-100 shadow-inner shadow-black/50',
      accentColor: 'text-orange-200',
      pattern: 'mono-grid',
      progressColor: '#fb923c',
      optionHover: '#3f3f46'
    },
    features: ['Swiss grid', 'Ink overlays', 'High-contrast focus'],
    quizStyles: {
      root: 'bg-gradient-to-br from-neutral-950 via-zinc-900 to-neutral-800',
      overlay:
        'pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(244,114,182,0.14)_1px,transparent_1px),linear-gradient(rgba(244,114,182,0.14)_1px,transparent_1px)] bg-[length:26px_26px]',
      topBar: 'bg-neutral-950/85 backdrop-blur-lg border-b border-zinc-700/40 text-zinc-100',
      topBarTitle: 'text-zinc-100',
      topBarMeta: 'text-zinc-400',
      footer: 'bg-neutral-950/80 backdrop-blur border-t border-zinc-700/40',
      questionCard: 'bg-neutral-900/80 border border-zinc-700/40 shadow-xl shadow-black/30 text-zinc-100',
      questionText: 'text-zinc-100',
      optionCard:
        'cursor-pointer transition-all duration-200 border border-zinc-600/40 bg-neutral-900/70 text-zinc-100',
      optionCardHover: 'hover:ring-2 hover:ring-orange-300/40 hover:bg-neutral-900/75',
      optionCardSelected:
        'ring-4 ring-offset-2 ring-orange-200/70 ring-offset-neutral-900/70 shadow-[0_22px_48px_rgba(249,115,22,0.35)]',
      optionInnerBase:
        'flex items-center justify-between gap-3 p-4 rounded-2xl transition-all duration-200 text-zinc-100',
      optionInnerSelected: 'ring-1 ring-orange-200/40 shadow-xl',
      optionText: `${baseOptionText} text-zinc-100`,
      optionLetterBase:
        'w-9 h-9 flex items-center justify-center rounded-full font-semibold shrink-0 transition-colors duration-200',
      optionLetterSelectedBase: 'ring-2 ring-orange-200/60 ring-offset-2 ring-offset-neutral-900/70',
      optionSelectedIcon: 'text-neutral-900',
      optionPalette: {
        A: {
          inner:
            'bg-neutral-900/70 border border-neutral-700/60 shadow-[0_12px_30px_rgba(249,115,22,0.24)]',
          innerSelected: 'bg-gradient-to-r from-orange-500 to-amber-400 border border-transparent text-neutral-900',
          letter: 'bg-orange-300 text-neutral-900',
          letterSelected: 'bg-orange-200 text-neutral-900'
        },
        B: {
          inner:
            'bg-neutral-900/70 border border-neutral-700/60 shadow-[0_12px_30px_rgba(20,184,166,0.24)]',
          innerSelected: 'bg-gradient-to-r from-teal-500 to-emerald-400 border border-transparent text-neutral-900',
          letter: 'bg-teal-300 text-neutral-900',
          letterSelected: 'bg-teal-200 text-neutral-900'
        },
        C: {
          inner:
            'bg-neutral-900/70 border border-neutral-700/60 shadow-[0_12px_30px_rgба(96,165,250,0.24)]',
          innerSelected: 'bg-gradient-to-r from-sky-500 to-blue-500 border border-transparent text-neutral-900',
          letter: 'bg-sky-300 text-neutral-900',
          letterSelected: 'bg-sky-200 text-neutral-900'
        },
        D: {
          inner:
            'bg-neutral-900/70 border border-neutral-700/60 shadow-[0_12px_30px_rgba(244,114,182,0.24)]',
          innerSelected: 'bg-gradient-to-r from-fuchsia-500 to-rose-500 border border-transparent text-neutral-900',
          letter: 'bg-fuchsia-300 text-neutral-900',
          letterSelected: 'bg-fuchsia-200 text-neutral-900'
        }
      },
      progress: {
        track: 'bg-neutral-800/40',
        fillClass: 'bg-gradient-to-r from-orange-400 to-fuchsia-400',
        text: 'text-orange-200'
      },
      timer: {
        track: '#3f3f46',
        stroke: '#fb923c',
        text: 'text-orange-200',
        icon: 'text-orange-200'
      },
      nav: {
        answered: 'bg-orange-400 text-neutral-900',
        marked: 'bg-fuchsia-400 text-neutral-900',
        unanswered: 'bg-neutral-600 text-zinc-100',
        currentRing: 'ring-orange-300 ring-offset-2 ring-offset-neutral-900/60'
      },
      buttons: {
        previous: 'border border-zinc-600/50 text-zinc-100 hover:bg-neutral-900/70 disabled:opacity-50 disabled:cursor-not-allowed',
        next: 'bg-gradient-to-r from-orange-500 to-amber-400 text-neutral-900 hover:from-orange-400 hover:to-amber-300',
        mark: 'bg-neutral-800/70 text-zinc-100 hover:bg-neutral-800',
        markActive: 'bg-orange-400 text-neutral-900 hover:bg-orange-300',
        exit: 'border border-zinc-600/50 text-zinc-100 hover:bg-neutral-900/70'
      },
      mobileNav: 'bg-neutral-950/85',
      mobileNavText: 'text-zinc-100',
      modalCard: 'bg-neutral-950/85 text-zinc-100',
      modalPrimaryButton: 'bg-gradient-to-r from-orange-500 to-amber-400 text-neutral-900 hover:from-orange-400 hover:to-amber-300',
      modalSecondaryButton: 'bg-neutral-800/70 text-zinc-100 hover:bg-neutral-800'
    }
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
      optionStyle: 'bg-purple-900/70 border border-pink-500/50 text-pink-200 shadow-lg shadow-purple-900/50 rounded-xl',
      accentColor: 'text-pink-300',
      pattern: 'pixel-stars',
      progressColor: '#f472b6',
      optionHover: '#581c87'
    },
    features: ['Pixel constellations', 'Arcade glow', 'Fun galaxy icons'],
    quizStyles: {
      root: 'bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950',
      overlay:
        'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(244,114,182,0.22),transparent_58%)]',
      topBar: 'bg-slate-950/80 backdrop-blur-lg border-b border-pink-500/40 text-pink-200',
      topBarTitle: 'text-pink-200',
      topBarMeta: 'text-pink-300',
      footer: 'bg-slate-950/75 backdrop-blur border-t border-pink-500/40',
      questionCard: 'bg-purple-900/70 border border-pink-500/40 shadow-xl shadow-purple-900/40 text-pink-200',
      questionText: 'text-pink-200',
      optionCard:
        'cursor-pointer transition-all duration-200 border border-pink-500/50 bg-purple-900/60 text-pink-200 rounded-2xl',
      optionCardHover: 'hover:ring-2 hover:ring-pink-400/70 hover:bg-purple-900/70',
      optionCardSelected:
        'ring-4 ring-offset-2 ring-pink-300/70 ring-offset-slate-950/60 shadow-[0_22px_48px_rgба(244,114,182,0.40)]',
      optionInnerBase:
        'flex items-center justify-between gap-3 p-4 rounded-2xl transition-all duration-200 text-pink-200',
      optionInnerSelected: 'ring-1 ring-pink-300/40 shadow-xl',
      optionText: `${baseOptionText} text-pink-200`,
      optionLetterBase:
        'w-9 h-9 flex items-center justify-center rounded-full font-semibold shrink-0 transition-colors duration-200',
      optionLetterSelectedBase: 'ring-2 ring-pink-200/70 ring-offset-2 ring-offset-purple-950/60',
      optionSelectedIcon: 'text-pink-200',
      optionPalette: {
        A: {
          inner:
            'bg-purple-900/60 border border-purple-600/50 shadow-[0_12px_30px_rgba(139,92,246,0.35)]',
          innerSelected: 'bg-gradient-to-r from-purple-600 to-pink-500 border border-transparent text-pink-100',
          letter: 'bg-pink-500 text-purple-950',
          letterSelected: 'bg-pink-300 text-purple-950'
        },
        B: {
          inner:
            'bg-indigo-900/60 border border-indigo-600/50 shadow-[0_12px_30px_rgba(99,102,241,0.35)]',
          innerSelected: 'bg-gradient-to-r from-indigo-600 to-blue-500 border border-transparent text-pink-100',
          letter: 'bg-sky-400 text-purple-950',
          letterSelected: 'bg-sky-200 text-purple-950'
        },
        C: {
          inner:
            'bg-blue-900/60 border border-blue-600/50 shadow-[0_12px_30px_rgба(37,99,235,0.35)]',
          innerSelected: 'bg-gradient-to-r from-blue-600 to-cyan-500 border border-transparent text-pink-100',
          letter: 'bg-cyan-400 text-purple-950',
          letterSelected: 'bg-cyan-200 text-purple-950'
        },
        D: {
          inner:
            'bg-purple-900/60 border border-purple-600/50 shadow-[0_12px_30px_rgба(168,85,247,0.35)]',
          innerSelected: 'bg-gradient-to-r from-purple-600 to-indigo-500 border border-transparent text-pink-100',
          letter: 'bg-violet-400 text-purple-950',
          letterSelected: 'bg-violet-200 text-purple-950'
        }
      },
      progress: {
        track: 'bg-purple-900/35',
        fillClass: 'bg-gradient-to-r from-pink-400 via-purple-400 to-blue-500',
        text: 'text-pink-200'
      },
      timer: {
        track: '#581c87',
        stroke: '#f472b6',
        text: 'text-pink-200',
        icon: 'text-pink-200'
      },
      nav: {
        answered: 'bg-pink-400 text-purple-950',
        marked: 'bg-sky-400 text-purple-950',
        unanswered: 'bg-purple-800 text-pink-200',
        currentRing: 'ring-pink-300 ring-offset-2 ring-offset-purple-950/60'
      },
      buttons: {
        previous: 'border border-pink-400/60 text-pink-200 hover:bg-purple-900/40 disabled:opacity-50 disabled:cursor-not-allowed',
        next: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700',
        mark: 'bg-purple-900/50 text-pink-200 hover:bg-purple-900/60',
        markActive: 'bg-pink-500 text-white hover:bg-pink-600',
        exit: 'border border-pink-400/60 text-pink-200 hover:bg-purple-900/40'
      },
      mobileNav: 'bg-slate-950/90',
      mobileNavText: 'text-pink-200',
      modalCard: 'bg-slate-950/90 text-pink-200',
      modalPrimaryButton: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700',
      modalSecondaryButton: 'bg-purple-900/50 text-pink-200 hover:bg-purple-900/60'
    }
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
      optionStyle: 'bg-white/85 border border-rose-300 text-rose-600 shadow-lg shadow-rose-200/40 rounded-2xl',
      accentColor: 'text-rose-500',
      pattern: 'candy',
      progressColor: '#fb7185',
      optionHover: '#fecdd3'
    },
    features: ['Candy wires', 'Soft pastels', 'Energetic badges'],
    quizStyles: {
      root: 'bg-gradient-to-br from-rose-200 via-pink-200 to-sky-200',
      overlay:
        'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(244,114,182,0.20),transparent_60%)]',
      topBar: 'bg-white/80 backdrop-blur border-b border-rose-200 text-rose-700',
      topBarTitle: 'text-rose-900',
      topBarMeta: 'text-rose-600',
      footer: 'bg-white/80 backdrop-blur border-t border-rose-200',
      questionCard: 'bg-white/90 border border-rose-200 shadow-xl shadow-rose-200/40 text-rose-700',
      questionText: 'text-rose-900',
      optionCard:
        'cursor-pointer transition-all duration-200 border border-rose-200 bg-white/90 text-rose-700 rounded-2xl',
      optionCardHover: 'hover:ring-2 hover:ring-rose-200/70 hover:bg-rose-100/60',
      optionCardSelected:
        'ring-4 ring-offset-2 ring-rose-200/70 ring-offset-white shadow-[0_22px_48px_rgба(244,114,182,0.35)]',
      optionInnerBase:
        'flex items-center justify-between gap-3 p-4 rounded-2xl transition-all duration-200 text-rose-700',
      optionInnerSelected: 'ring-1 ring-rose-200/60 shadow-xl',
      optionText: `${baseOptionText} text-rose-700`,
      optionLetterBase:
        'w-9 h-9 flex items-center justify-center rounded-full font-semibold shrink-0 transition-colors duration-200',
      optionLetterSelectedBase: 'ring-2 ring-rose-200/70 ring-offset-2 ring-offset-white',
      optionSelectedIcon: 'text-rose-500',
      optionPalette: {
        A: {
          inner:
            'bg-white/95 border border-rose-200 shadow-[0_10px_26px_rgба(248,187,208,0.32)]',
          innerSelected: 'bg-gradient-to-r from-rose-300 to-pink-300 border border-transparent text-white',
          letter: 'bg-rose-400 text-white',
          letterSelected: 'bg-white text-rose-600'
        },
        B: {
          inner:
            'bg-white/95 border border-sky-200 shadow-[0_10px_26px_rgба(125,211,252,0.30)]',
          innerSelected: 'bg-gradient-to-r from-sky-300 to-teal-300 border border-transparent text-white',
          letter: 'bg-sky-400 text-white',
          letterSelected: 'bg-white text-sky-600'
        },
        C: {
          inner:
            'bg-white/95 border border-amber-200 shadow-[0_10px_26px_rgба(253,230,138,0.30)]',
          innerSelected: 'bg-gradient-to-r from-amber-300 to-orange-300 border border-transparent text-white',
          letter: 'bg-amber-400 text-white',
          letterSelected: 'bg-white text-amber-600'
        },
        D: {
          inner:
            'bg-white/95 border border-lime-200 shadow-[0_10px_26px_rgба(190,242,100,0.30)]',
          innerSelected: 'bg-gradient-to-r from-lime-300 to-teal-300 border border-transparent text-white',
          letter: 'bg-lime-400 text-white',
          letterSelected: 'bg-white text-lime-600'
        }
      },
      progress: {
        track: 'bg-rose-100',
        fillClass: 'bg-gradient-to-r from-rose-400 to-sky-400',
        text: 'text-rose-600'
      },
      timer: {
        track: '#fecdd3',
        stroke: '#fb7185',
        text: 'text-rose-600',
        icon: 'text-rose-600'
      },
      nav: {
        answered: 'bg-rose-400 text-white',
        marked: 'bg-sky-400 text-white',
        unanswered: 'bg-rose-200 text-rose-700',
        currentRing: 'ring-rose-200 ring-offset-2 ring-offset-white'
      },
      buttons: {
        previous: 'border border-rose-200 text-rose-700 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed',
        next: 'bg-gradient-to-r from-rose-400 to-sky-400 text-white hover:from-rose-500 hover:to-sky-500',
        mark: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
        markActive: 'bg-rose-400 text-white hover:bg-rose-500',
        exit: 'border border-rose-200 text-rose-700 hover:bg-rose-100'
      },
      mobileNav: 'bg-white/85',
      mobileNavText: 'text-rose-700',
      modalCard: 'bg-white text-rose-700',
      modalPrimaryButton: 'bg-gradient-to-r from-rose-400 to-sky-400 text-white hover:from-rose-500 hover:to-sky-500',
      modalSecondaryButton: 'bg-rose-100 text-rose-700 hover:bg-rose-200'
    }
  }
];

const THEME_LOOKUP: Record<string, QuizThemeDefinition> = QUIZ_THEMES.reduce(
  (acc, theme) => {
    acc[theme.id] = theme;
    return acc;
  },
  {} as Record<string, QuizThemeDefinition>
);

export const getQuizTheme = (themeId?: string): QuizThemeDefinition => {
  if (themeId && THEME_LOOKUP[themeId]) {
    return THEME_LOOKUP[themeId];
  }
  return THEME_LOOKUP[DEFAULT_THEME_ID];
};

export const QUIZ_THEME_IDS = Object.keys(THEME_LOOKUP);
