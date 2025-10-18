import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediumOption {
  id: string;
  name: string;
  englishName: string;
  flag: string;
  color: string;
}

const mediumOptions: MediumOption[] = [
  {
    id: 'english',
    name: 'English',
    englishName: 'English',
    flag: '🇬🇧',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'telugu',
    name: 'తెలుగు',
    englishName: 'Telugu',
    flag: '🇮🇳',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'hindi',
    name: 'हिंदी',
    englishName: 'Hindi',
    flag: '🇮🇳',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'tamil',
    name: 'தமிழ்',
    englishName: 'Tamil',
    flag: '🇮🇳',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'kannada',
    name: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    flag: '🇮🇳',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'malayalam',
    name: 'മലയാളം',
    englishName: 'Malayalam',
    flag: '🇮🇳',
    color: 'from-teal-500 to-cyan-500',
  },
];

interface MediumPickerProps {
  onMediumSelect: (medium: string) => void;
}

const MediumPicker: React.FC<MediumPickerProps> = ({ onMediumSelect }) => {
  const [selectedMedium, setSelectedMedium] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState(false);
  const autoAdvanceRef = useRef<number | null>(null);

  const handleMediumSelect = (mediumId: string) => {
    setSelectedMedium(mediumId);
    setIsConfirming(true);

    // Auto-hide confirmation after 1.5 seconds
    window.clearTimeout(autoAdvanceRef.current ?? undefined);
    autoAdvanceRef.current = window.setTimeout(() => {
      setIsConfirming(false);
    }, 1500);

    // Automatically advance without requiring the continue button
    window.setTimeout(() => {
      onMediumSelect(mediumId);
    }, 250);
  };

  const handleContinue = () => {
    if (selectedMedium) {
      onMediumSelect(selectedMedium);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-300 to-white relative overflow-hidden text-[90%] sm:text-[95%]">
      {/* Decorative background characters */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-20 text-9xl font-bold text-white transform rotate-12">
          E
        </div>
        <div className="absolute top-40 right-32 text-8xl font-bold text-white transform -rotate-6">
          క
        </div>
        <div className="absolute bottom-32 left-40 text-7xl font-bold text-white transform rotate-45">
          A
        </div>
        <div className="absolute bottom-20 right-20 text-6xl font-bold text-white transform -rotate-12">
          த
        </div>
        <div className="absolute top-1/2 left-1/4 text-5xl font-bold text-white transform rotate-90">
          ह
        </div>
        <div className="absolute top-1/3 right-1/3 text-6xl font-bold text-white transform -rotate-30">
          ಕ
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">
            Choose Your Medium
          </h1>
          <p className="text-teal-100 text-base md:text-lg font-medium">
            You can change this later in settings
          </p>
        </motion.div>

        {/* Medium Cards Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full max-w-3xl mb-8"
        >
          {mediumOptions.map((medium, index) => (
            <motion.div
              key={medium.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleMediumSelect(medium.id)}
              className={`
                relative cursor-pointer rounded-2xl p-4 bg-white/90 backdrop-blur-sm
                shadow-lg hover:shadow-2xl transition-all duration-300
                ${
                  selectedMedium === medium.id
                    ? 'ring-4 ring-teal-300 shadow-2xl bg-white'
                    : 'hover:bg-white'
                }
              `}
            >
              {/* Glowing border effect for selected */}
              {selectedMedium === medium.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-400 opacity-20 blur-sm"
                />
              )}

              <div className="relative z-10 text-center">
                {/* Flag/Icon */}
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${medium.color} mb-3 text-xl`}
                >
                  <span className="text-white font-bold">{medium.flag}</span>
                </div>

                {/* Medium Name */}
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-800">{medium.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    {medium.englishName}
                  </p>
                </div>

                {/* Selection indicator */}
                {selectedMedium === medium.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-teal-500 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.div>
                )}
              </div>

              {/* Card hover effect */}
              <motion.div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>

        {/* Confirmation Message */}
        <AnimatePresence>
          {isConfirming && selectedMedium && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="mb-6 px-5 py-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg"
            >
              <p className="text-teal-700 font-medium text-center text-sm sm:text-base">
                {mediumOptions.find(m => m.id === selectedMedium)?.englishName} selected!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          onClick={handleContinue}
          disabled
          className="px-8 py-3 rounded-full font-semibold text-sm sm:text-base text-white bg-gradient-to-r from-teal-500 to-cyan-500 shadow-md opacity-40 cursor-not-allowed"
        >
          Tap a card to continue
        </motion.button>

        {/* Progress indicator */}
        <div className="flex space-x-1.5 mt-6">
          {[1, 2, 3, 4].map((step, index) => (
            <div
              key={step}
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                index === 3 ? 'bg-teal-500' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediumPicker;
