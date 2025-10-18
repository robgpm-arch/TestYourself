import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BoardExamOption {
  id: string;
  name: string;
  tagline: string;
  category: 'board' | 'exam';
  icon: string;
  color: string;
  searchTerms: string[];
}

const boardExamOptions: BoardExamOption[] = [
  {
    id: 'cbse',
    name: 'CBSE',
    tagline: 'Classes 1-12 • Central Board',
    category: 'board',
    icon: '📚',
    color: 'from-blue-500 to-blue-600',
    searchTerms: ['cbse', 'central', 'board', 'class']
  },
  {
    id: 'icse',
    name: 'ICSE',
    tagline: 'Classes 1-10 • Council Exams',
    category: 'board',
    icon: '🎓',
    color: 'from-purple-500 to-purple-600',
    searchTerms: ['icse', 'council']
  },
  {
    id: 'isc',
    name: 'ISC',
    tagline: 'Classes 11-12 • Science & Commerce',
    category: 'board',
    icon: '🔬',
    color: 'from-indigo-500 to-indigo-600',
    searchTerms: ['isc', 'science', 'commerce']
  },
  {
    id: 'iit-foundation',
    name: 'IIT Foundation',
    tagline: 'Classes 6-10 • Engineering Prep',
    category: 'board',
    icon: '⚙️',
    color: 'from-orange-500 to-red-500',
    searchTerms: ['iit', 'foundation']
  },
  {
    id: 'ts-board',
    name: 'TS Board',
    tagline: 'Telangana State Board',
    category: 'board',
    icon: '🏛️',
    color: 'from-teal-500 to-cyan-500',
    searchTerms: ['telangana', 'ts']
  },
  {
    id: 'ap-board',
    name: 'AP Board',
    tagline: 'Andhra Pradesh State Board',
    category: 'board',
    icon: '🌅',
    color: 'from-yellow-500 to-orange-500',
    searchTerms: ['andhra', 'ap']
  },
  {
    id: 'tn-board',
    name: 'TN Board',
    tagline: 'Tamil Nadu State Board',
    category: 'board',
    icon: '🏺',
    color: 'from-red-500 to-pink-500',
    searchTerms: ['tamil', 'tn']
  },
  {
    id: 'mh-board',
    name: 'Maharashtra Board',
    tagline: 'Maharashtra State Board',
    category: 'board',
    icon: '🎭',
    color: 'from-green-500 to-emerald-500',
    searchTerms: ['maharashtra', 'mh']
  },
  {
    id: 'jee',
    name: 'JEE',
    tagline: 'Engineering • IIT / NIT',
    category: 'exam',
    icon: '⚛️',
    color: 'from-blue-600 to-indigo-600',
    searchTerms: ['jee', 'engineering']
  },
  {
    id: 'neet',
    name: 'NEET',
    tagline: 'Medical • MBBS / BDS',
    category: 'exam',
    icon: '🩺',
    color: 'from-green-600 to-teal-600',
    searchTerms: ['neet', 'medical']
  },
  {
    id: 'upsc',
    name: 'UPSC',
    tagline: 'Civil Services • IAS/IPS',
    category: 'exam',
    icon: '🏛️',
    color: 'from-purple-600 to-pink-600',
    searchTerms: ['upsc', 'civil']
  },
  {
    id: 'ssc',
    name: 'SSC',
    tagline: 'Staff Selection Commission',
    category: 'exam',
    icon: '📋',
    color: 'from-orange-600 to-red-600',
    searchTerms: ['ssc', 'staff']
  },
  {
    id: 'banking',
    name: 'Banking',
    tagline: 'SBI • IBPS • RBI Grade B',
    category: 'exam',
    icon: '🏦',
    color: 'from-emerald-600 to-green-600',
    searchTerms: ['banking', 'ibps']
  },
  {
    id: 'rrb',
    name: 'RRB',
    tagline: 'Railway Recruitment Board',
    category: 'exam',
    icon: '🚂',
    color: 'from-gray-600 to-slate-600',
    searchTerms: ['rrb', 'railway']
  },
  {
    id: 'dsc-tet',
    name: 'DSC/TET',
    tagline: 'Teaching Eligibility Test',
    category: 'exam',
    icon: '👨‍🏫',
    color: 'from-cyan-600 to-blue-600',
    searchTerms: ['dsc', 'tet']
  },
  {
    id: 'gate',
    name: 'GATE',
    tagline: 'Graduate Aptitude Test',
    category: 'exam',
    icon: '🎯',
    color: 'from-violet-600 to-purple-600',
    searchTerms: ['gate', 'aptitude']
  }
];

interface BoardExamSelectorProps {
  onSelection: (selection: string) => void;
}

const BoardExamSelector: React.FC<BoardExamSelectorProps> = ({ onSelection }) => {
  const [activeTab, setActiveTab] = useState<'board' | 'exam'>('board');
  const [selectedOption, setSelectedOption] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const autoAdvanceRef = useRef<number | null>(null);

  useEffect(() => () => window.clearTimeout(autoAdvanceRef.current ?? undefined), []);

  const filteredOptions = useMemo(() => {
    const subset = boardExamOptions.filter(option => option.category === activeTab);
    if (!searchQuery.trim()) return subset;

    const keyword = searchQuery.toLowerCase();
    return subset.filter(option =>
      option.name.toLowerCase().includes(keyword) ||
      option.tagline.toLowerCase().includes(keyword) ||
      option.searchTerms.some(term => term.toLowerCase().includes(keyword))
    );
  }, [activeTab, searchQuery]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setIsConfirming(true);

    window.clearTimeout(autoAdvanceRef.current ?? undefined);
    autoAdvanceRef.current = window.setTimeout(() => {
      setIsConfirming(false);
    }, 1500);

    window.setTimeout(() => onSelection(optionId), 300);
  };

  const selectedOptionData = boardExamOptions.find(option => option.id === selectedOption);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-900 px-3 py-8 text-white">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl text-center mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">
          Select Your Board or Exam
        </h1>
        <p className="text-blue-100 text-xs md:text-sm font-medium">
          Tap a card to continue. You can change this later in settings.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl mb-4"
      >
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search boards or exams..."
            className="w-full px-4 py-2 pl-10 rounded-2xl bg-white/80 text-gray-800 placeholder-gray-500 text-xs shadow-lg focus:outline-none focus:ring-3 focus:ring-blue-300/40 transition-all duration-300"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </motion.div>

      <div className="flex bg-white/20 backdrop-blur-sm rounded-2xl p-1 mb-4 max-w-md w-full">
        {(['board', 'exam'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative flex-1 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 ${
              activeTab === tab ? 'text-blue-900 bg-white shadow' : 'text-blue-100 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab === 'board' ? 'Boards' : 'Exams'}
            {activeTab === tab && (
              <motion.div
                layoutId="board-exam-tab"
                className="absolute inset-0 rounded-xl bg-white/70"
                transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
              />
            )}
          </button>
        ))}
      </div>

      <motion.div
        key={`${activeTab}-${searchQuery}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[220px] overflow-y-auto pr-1">
          <AnimatePresence mode="wait">
            {filteredOptions.map((option, index) => (
              <motion.button
                key={option.id}
                type="button"
                initial={{ opacity: 0, y: 8, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.9 }}
                transition={{ duration: 0.15, delay: index * 0.025 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOptionSelect(option.id)}
                className={`relative rounded-2xl p-2.5 sm:p-3 bg-white text-center shadow transition-all duration-200 ${
                  selectedOption === option.id ? 'ring-3 ring-teal-300 shadow-lg bg-white' : 'hover:shadow-md'
                }`}
            >
              {selectedOption === option.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.15 }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-400"
                />
              )}

              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className={`inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${option.color} text-sm sm:text-base text-white shadow-inner`}>
                  <span>{option.icon}</span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-800">{option.name}</h3>
                  <p className="text-[10px] sm:text-[11px] text-gray-600 font-medium leading-tight">
                    {option.tagline}
                  </p>
                </div>
              </div>

              {selectedOption === option.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white rounded-full flex items-center justify-center shadow"
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
        </div>
      </motion.div>

      {filteredOptions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-blue-100 text-sm"
        >
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-lg font-semibold">No matches found. Try a different keyword.</p>
        </motion.div>
      )}

      <AnimatePresence>
        {isConfirming && selectedOptionData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-8 px-5 py-2 bg-white/90 text-blue-800 rounded-full shadow text-sm"
          >
            {selectedOptionData.name} selected! Loading the next step…
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BoardExamSelector;
