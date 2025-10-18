import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClassOption {
  id: string;
  number: number;
  name: string;
  subjects: string[];
  color: string;
  icon: string;
}

interface CourseOption {
  id: string;
  name: string;
  type: string;
  duration: string;
  icon: string;
  color: string;
  examType: string;
}

const classOptions: ClassOption[] = [
  {
    id: 'class-6',
    number: 6,
    name: 'Class 6',
    subjects: ['Math', 'Science', 'English'],
    color: 'from-pink-400 to-rose-500',
    icon: '📚'
  },
  {
    id: 'class-7',
    number: 7,
    name: 'Class 7',
    subjects: ['Math', 'Science', 'English'],
    color: 'from-purple-400 to-violet-500',
    icon: '📖'
  },
  {
    id: 'class-8',
    number: 8,
    name: 'Class 8',
    subjects: ['Math', 'Science', 'English'],
    color: 'from-blue-400 to-cyan-500',
    icon: '📝'
  },
  {
    id: 'class-9',
    number: 9,
    name: 'Class 9',
    subjects: ['Math', 'Physics', 'Chemistry', 'Biology'],
    color: 'from-green-400 to-emerald-500',
    icon: '🔬'
  },
  {
    id: 'class-10',
    number: 10,
    name: 'Class 10',
    subjects: ['Math', 'Physics', 'Chemistry', 'Biology'],
    color: 'from-yellow-400 to-orange-500',
    icon: '🎯'
  },
  {
    id: 'class-11',
    number: 11,
    name: 'Class 11',
    subjects: ['PCM/PCB', 'Commerce', 'Arts'],
    color: 'from-red-400 to-pink-500',
    icon: '🎓'
  },
  {
    id: 'class-12',
    number: 12,
    name: 'Class 12',
    subjects: ['PCM/PCB', 'Commerce', 'Arts'],
    color: 'from-indigo-400 to-purple-500',
    icon: '🏆'
  }
];

const courseOptions: { [key: string]: CourseOption[] } = {
  jee: [
    {
      id: 'jee-foundation',
      name: 'JEE Foundation',
      type: 'Foundation Course',
      duration: '2 Years • Classes 11-12',
      icon: '🏗️',
      color: 'from-blue-500 to-indigo-600',
      examType: 'jee'
    },
    {
      id: 'jee-crash',
      name: 'JEE Crash Course',
      type: 'Intensive Prep',
      duration: '6 Months • 2025 Target',
      icon: '⚡',
      color: 'from-orange-500 to-red-600',
      examType: 'jee'
    },
    {
      id: 'jee-full',
      name: 'JEE Full Syllabus',
      type: 'Complete Coverage',
      duration: '1 Year • Main + Advanced',
      icon: '📋',
      color: 'from-green-500 to-teal-600',
      examType: 'jee'
    },
    {
      id: 'jee-test',
      name: 'JEE Test Series',
      type: 'Practice & Mock Tests',
      duration: '6 Months • 100+ Tests',
      icon: '🎯',
      color: 'from-purple-500 to-indigo-600',
      examType: 'jee'
    }
  ],
  neet: [
    {
      id: 'neet-foundation',
      name: 'NEET Foundation',
      type: 'Foundation Course',
      duration: '2 Years • Classes 11-12',
      icon: '🏥',
      color: 'from-green-500 to-emerald-600',
      examType: 'neet'
    },
    {
      id: 'neet-crash',
      name: 'NEET Crash Course',
      type: 'Intensive Prep',
      duration: '4 Months • 2025 Target',
      icon: '💊',
      color: 'from-red-500 to-pink-600',
      examType: 'neet'
    },
    {
      id: 'neet-full',
      name: 'NEET Full Syllabus',
      type: 'Complete Coverage',
      duration: '1 Year • Physics, Chemistry, Biology',
      icon: '🔬',
      color: 'from-blue-500 to-cyan-600',
      examType: 'neet'
    },
    {
      id: 'neet-test',
      name: 'NEET Test Series',
      type: 'Practice & Mock Tests',
      duration: '6 Months • Weekly Tests',
      icon: '📊',
      color: 'from-purple-500 to-violet-600',
      examType: 'neet'
    }
  ],
  upsc: [
    {
      id: 'upsc-prelims',
      name: 'UPSC Prelims',
      type: 'Preliminary Exam',
      duration: '8 Months • General Studies',
      icon: '📚',
      color: 'from-indigo-500 to-purple-600',
      examType: 'upsc'
    },
    {
      id: 'upsc-mains',
      name: 'UPSC Mains',
      type: 'Main Examination',
      duration: '1 Year • Essay + Optional',
      icon: '✍️',
      color: 'from-blue-500 to-indigo-600',
      examType: 'upsc'
    },
    {
      id: 'upsc-complete',
      name: 'UPSC Complete',
      type: 'Prelims + Mains + Interview',
      duration: '18 Months • Full Preparation',
      icon: '🏛️',
      color: 'from-green-500 to-blue-600',
      examType: 'upsc'
    }
  ],
  ssc: [
    {
      id: 'ssc-cgl',
      name: 'SSC CGL',
      type: 'Combined Graduate Level',
      duration: '6 Months • Tier 1 + Tier 2',
      icon: '📋',
      color: 'from-orange-500 to-red-600',
      examType: 'ssc'
    },
    {
      id: 'ssc-chsl',
      name: 'SSC CHSL',
      type: 'Combined Higher Secondary',
      duration: '4 Months • Tier 1 + Tier 2',
      icon: '📝',
      color: 'from-blue-500 to-cyan-600',
      examType: 'ssc'
    }
  ],
  banking: [
    {
      id: 'banking-po',
      name: 'Banking PO',
      type: 'Probationary Officer',
      duration: '8 Months • SBI + IBPS',
      icon: '🏦',
      color: 'from-green-500 to-teal-600',
      examType: 'banking'
    },
    {
      id: 'banking-clerk',
      name: 'Banking Clerk',
      type: 'Clerical Cadre',
      duration: '6 Months • All Banks',
      icon: '💼',
      color: 'from-blue-500 to-indigo-600',
      examType: 'banking'
    }
  ],
  'dsc-tet': [
    {
      id: 'dsc-secondary-grade-teachers',
      name: 'Secondary Grade Teachers',
      type: 'Core Teaching Track',
      duration: 'Complete Pedagogy & Content',
      icon: '🏫',
      color: 'from-blue-500 to-indigo-600',
      examType: 'dsc-tet'
    },
    {
      id: 'dsc-school-assistant-telugu',
      name: 'School Assistant (TELUGU)',
      type: 'Language Specialisation',
      duration: 'Telugu Language Pedagogy & Content',
      icon: '🗣️',
      color: 'from-cyan-500 to-blue-600',
      examType: 'dsc-tet'
    },
    {
      id: 'dsc-school-assistant-hindi',
      name: 'School Assistant (HINDI)',
      type: 'Language Specialisation',
      duration: 'Hindi Language Pedagogy & Content',
      icon: '📝',
      color: 'from-amber-500 to-orange-600',
      examType: 'dsc-tet'
    },
    {
      id: 'dsc-school-assistant-english',
      name: 'School Assistant (ENGLISH)',
      type: 'Language Specialisation',
      duration: 'English Language Pedagogy & Content',
      icon: '📘',
      color: 'from-indigo-500 to-purple-600',
      examType: 'dsc-tet'
    },
    {
      id: 'dsc-school-assistant-mathematics',
      name: 'School Assistant (MATHEMATICS)',
      type: 'STEM Specialisation',
      duration: 'Advanced Mathematics Pedagogy',
      icon: '➗',
      color: 'from-green-500 to-emerald-600',
      examType: 'dsc-tet'
    },
    {
      id: 'dsc-school-assistant-physical-science',
      name: 'School Assistant (PHYSICAL SCIENCE)',
      type: 'STEM Specialisation',
      duration: 'Physics & Chemistry Pedagogy',
      icon: '🔬',
      color: 'from-rose-500 to-red-600',
      examType: 'dsc-tet'
    },
    {
      id: 'dsc-school-assistant-biological-science',
      name: 'School Assistant (BIOLOGICAL SCIENCE)',
      type: 'STEM Specialisation',
      duration: 'Life Sciences Pedagogy',
      icon: '🌿',
      color: 'from-emerald-500 to-teal-600',
      examType: 'dsc-tet'
    },
    {
      id: 'dsc-school-assistant-social-studies',
      name: 'School Assistant (SOCIAL STUDIES)',
      type: 'Humanities Specialisation',
      duration: 'History, Civics & Geography',
      icon: '🌍',
      color: 'from-purple-500 to-fuchsia-600',
      examType: 'dsc-tet'
    },
    {
      id: 'dsc-school-assistant-physical-education',
      name: 'School Assistant (PHYSICAL EDUCATION)',
      type: 'Physical Training Track',
      duration: 'Sports Science & Pedagogy',
      icon: '🏃‍♂️',
      color: 'from-orange-500 to-red-600',
      examType: 'dsc-tet'
    },
    {
      id: 'dsc-language-pandit-telugu',
      name: 'LANGUAGE PANDIT (TELUGU)',
      type: 'Language Mastery',
      duration: 'Advanced Telugu Language Teaching',
      icon: '📜',
      color: 'from-sky-500 to-blue-600',
      examType: 'dsc-tet'
    },
    {
      id: 'dsc-language-pandit-hindi',
      name: 'LANGUAGE PANDIT (HINDI)',
      type: 'Language Mastery',
      duration: 'Advanced Hindi Language Teaching',
      icon: '🪔',
      color: 'from-yellow-500 to-amber-600',
      examType: 'dsc-tet'
    },
    {
      id: 'dsc-physical-education-teacher',
      name: 'Physical Education Teacher',
      type: 'Physical Training Track',
      duration: 'Sports Pedagogy & Fitness Training',
      icon: '🏅',
      color: 'from-lime-500 to-green-600',
      examType: 'dsc-tet'
    },
    {
      id: 'dsc-perspectives-in-education',
      name: 'Perspectives in Education',
      type: 'Foundational Pedagogy',
      duration: 'Educational Psychology & Methodology',
      icon: '🧠',
      color: 'from-indigo-500 to-cyan-600',
      examType: 'dsc-tet'
    },
    {
      id: 'dsc-general-knowledge-current-affairs',
      name: 'General Knowledge & Current Affairs',
      type: 'Competitive Essentials',
      duration: 'Daily Updates & Mock Drills',
      icon: '📰',
      color: 'from-gray-500 to-slate-600',
      examType: 'dsc-tet'
    }
  ],
  // Default fallback for other exams
  default: [
    {
      id: 'general-prep',
      name: 'Complete Preparation',
      type: 'Full Syllabus Coverage',
      duration: '8 Months • 2025 Target',
      icon: '📚',
      color: 'from-gray-500 to-slate-600',
      examType: 'general'
    },
    {
      id: 'test-series',
      name: 'Test Series',
      type: 'Practice & Mock Tests',
      duration: '4 Months • Regular Tests',
      icon: '🎯',
      color: 'from-purple-500 to-indigo-600',
      examType: 'general'
    }
  ]
};

// Board categories that show class selection
const boardCategories = ['cbse', 'icse', 'isc', 'iit-foundation', 'ts-board', 'ap-board', 'tn-board', 'mh-board'];

interface ClassCourseSelectorProps {
  selectedBoardExam: string;
  onSelection: (selection: string) => void;
}

const ClassCourseSelector: React.FC<ClassCourseSelectorProps> = ({ selectedBoardExam, onSelection }) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState(false);
  const autoAdvanceRef = useRef<number | null>(null);
  
  const isBoard = boardCategories.includes(selectedBoardExam);
  const currentCourses = courseOptions[selectedBoardExam] || courseOptions.default;

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setIsConfirming(true);

    window.clearTimeout(autoAdvanceRef.current ?? undefined);
    autoAdvanceRef.current = window.setTimeout(() => {
      setIsConfirming(false);
    }, 1500);

    window.setTimeout(() => {
      onSelection(optionId);
    }, 300);
  };

  const getSelectedOptionName = () => {
    if (isBoard) {
      const classOption = classOptions.find(c => c.id === selectedOption);
      return classOption?.name;
    } else {
      const courseOption = currentCourses.find(c => c.id === selectedOption);
      return courseOption?.name;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-300 to-white relative overflow-hidden">
      {/* Decorative background icons */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-20 text-8xl transform rotate-12">🎓</div>
        <div className="absolute top-40 right-32 text-6xl transform -rotate-6">⚛️</div>
        <div className="absolute bottom-32 left-40 text-7xl transform rotate-45">✏️</div>
        <div className="absolute bottom-20 right-20 text-5xl transform -rotate-12">📐</div>
        <div className="absolute top-1/2 left-1/4 text-4xl transform rotate-90">🧮</div>
        <div className="absolute top-1/3 right-1/3 text-6xl transform -rotate-30">📊</div>
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-12 sm:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Select Your {isBoard ? 'Class' : 'Course'}
          </h1>
          <p className="text-teal-100 text-lg md:text-xl font-medium">
            This will help us personalize your quizzes
          </p>
        </motion.div>

        {/* Dynamic Content Based on Selection */}
        <AnimatePresence mode="wait">
          {isBoard ? (
            // Case A: Board Students - Class Grid
            <motion.div
              key="classes"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 w-full max-w-5xl mb-12 justify-items-center"
            >
              {classOptions.map((classOption, index) => (
                <motion.button
                  key={classOption.id}
                  type="button"
                  initial={{ opacity: 0, y: 20, rotateY: 180 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  whileTap={{ 
                    scale: 0.95,
                    rotateY: selectedOption === classOption.id ? 360 : 180,
                    transition: { duration: 0.6 }
                  }}
                  onClick={() => handleOptionSelect(classOption.id)}
                  aria-pressed={selectedOption === classOption.id}
                  aria-label={`Select ${classOption.name}`}
                  className={`
                    relative cursor-pointer rounded-2xl p-4 sm:p-5 lg:p-6 aspect-[4/5]
                    bg-gradient-to-br ${classOption.color} text-white w-full max-w-[150px] sm:max-w-[180px] lg:max-w-[220px]
                    shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70
                    ${selectedOption === classOption.id 
                      ? 'ring-2 ring-white ring-opacity-50 shadow-2xl scale-105' 
                      : ''
                    }
                  `}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="text-center h-full flex flex-col justify-center">
                    {/* Class Icon */}
                    <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3">
                      {classOption.icon}
                    </div>

                    {/* Class Number */}
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
                      {classOption.number}
                    </div>

                    {/* Class Name */}
                    <div className="text-sm sm:text-base font-semibold mb-2">
                      {classOption.name}
                    </div>

                    {/* Subjects */}
                    <div className="text-xs sm:text-sm opacity-90 leading-relaxed max-w-[150px] mx-auto">
                      {classOption.subjects.join(' • ')}
                    </div>

                    {/* Selection indicator */}
                      {selectedOption === classOption.id && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute -top-2 -right-2 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg"
                      >
                        <svg className="w-6 h-6 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            // Case B: Competitive Exams - Course Cards
            <motion.div
              key="courses"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-4xl space-y-4 mb-12"
            >
              {currentCourses.map((course, index) => (
                <motion.button
                  key={course.id}
                  type="button"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOptionSelect(course.id)}
                  className={`
                    relative cursor-pointer rounded-2xl p-6 bg-white/95 backdrop-blur-sm
                    shadow-lg hover:shadow-2xl transition-all duration-300
                    ${selectedOption === course.id 
                      ? 'ring-4 ring-teal-300 shadow-2xl bg-white scale-102' 
                      : 'hover:bg-white'
                    }
                  `}
                >
                  <div className="flex items-center space-x-6">
                    {/* Course Icon */}
                    <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center text-2xl text-white shadow-lg`}>
                      {course.icon}
                    </div>

                    {/* Course Details */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">
                        {course.name}
                      </h3>
                      <p className="text-lg text-gray-600 font-medium mb-2">
                        {course.type}
                      </p>
                      <p className="text-sm text-gray-500 font-medium">
                        {course.duration}
                      </p>
                    </div>

                    {/* Selection indicator */}
                    {selectedOption === course.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0 w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center"
                      >
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                    )}
                  </div>

                  {/* Glowing border effect for selected */}
                  {selectedOption === course.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-400 opacity-10 blur-sm"
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Message */}
        <AnimatePresence>
          {isConfirming && selectedOption && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="mb-6 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg"
            >
              <p className="text-teal-700 font-semibold text-center">
                {getSelectedOptionName()} selected! Loading the next step…
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex space-x-2 mt-4">
          {[1, 2, 3, 4, 5, 6].map((step, index) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                index === 5 ? 'bg-teal-500' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassCourseSelector;