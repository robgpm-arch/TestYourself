import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import Layout from '../components/Layout';

// Types for syllabus data
interface Topic {
  id: string;
  name: string;
  completed: boolean;
}

interface Chapter {
  id: string;
  name: string;
  subject: string;
  subjectIcon: string;
  progress: number;
  status: 'completed' | 'pending';
  topics: Topic[];
  isBookmarked: boolean;
}

interface SyllabusData {
  [board: string]: {
    [classLevel: string]: Chapter[];
  };
}

const SyllabusBrowser: React.FC = () => {
  // Sample data - in real app this would come from API or state management
  const syllabusData: SyllabusData = {
    CBSE: {
      'Class 10': [
        {
          id: 'ch1',
          name: 'Acids, Bases & Salts',
          subject: 'Science',
          subjectIcon: '🔬',
          progress: 75,
          status: 'pending',
          isBookmarked: true,
          topics: [
            { id: 't1', name: 'Properties of Acids', completed: true },
            { id: 't2', name: 'Properties of Bases', completed: true },
            { id: 't3', name: 'Salt Formation', completed: true },
            { id: 't4', name: 'pH Scale', completed: false },
          ],
        },
        {
          id: 'ch2',
          name: 'Quadratic Equations',
          subject: 'Mathematics',
          subjectIcon: '➗',
          progress: 100,
          status: 'completed',
          isBookmarked: false,
          topics: [
            { id: 't5', name: 'Standard Form', completed: true },
            { id: 't6', name: 'Factorization', completed: true },
            { id: 't7', name: 'Quadratic Formula', completed: true },
          ],
        },
        {
          id: 'ch3',
          name: 'Democratic Politics',
          subject: 'Social Science',
          subjectIcon: '🏛️',
          progress: 40,
          status: 'pending',
          isBookmarked: true,
          topics: [
            { id: 't8', name: 'Power Sharing', completed: true },
            { id: 't9', name: 'Federalism', completed: true },
            { id: 't10', name: 'Democracy & Diversity', completed: false },
            { id: 't11', name: 'Gender & Religion', completed: false },
          ],
        },
        {
          id: 'ch4',
          name: 'Real Numbers',
          subject: 'Mathematics',
          subjectIcon: '➗',
          progress: 60,
          status: 'pending',
          isBookmarked: false,
          topics: [
            { id: 't12', name: "Euclid's Division", completed: true },
            { id: 't13', name: 'Prime Factorization', completed: true },
            { id: 't14', name: 'Rational Numbers', completed: false },
          ],
        },
        {
          id: 'ch5',
          name: 'Life Processes',
          subject: 'Science',
          subjectIcon: '🔬',
          progress: 20,
          status: 'pending',
          isBookmarked: false,
          topics: [
            { id: 't15', name: 'Nutrition', completed: true },
            { id: 't16', name: 'Respiration', completed: false },
            { id: 't17', name: 'Transportation', completed: false },
            { id: 't18', name: 'Excretion', completed: false },
          ],
        },
      ],
    },
  };

  const [selectedBoard, setSelectedBoard] = useState('CBSE');
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const chapters = syllabusData[selectedBoard]?.[selectedClass] || [];
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter(ch => ch.status === 'completed').length;
  const overallProgress =
    totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  const toggleBookmark = (chapterId: string) => {
    // In real app, this would update the state/backend
    console.log(`Toggle bookmark for chapter: ${chapterId}`);
  };

  const startQuiz = (chapterId: string) => {
    // In real app, this would navigate to quiz page
    console.log(`Start quiz for chapter: ${chapterId}`);
  };

  const toggleChapterExpansion = (chapterId: string) => {
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-200 to-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl">📘</div>
        <div className="absolute top-20 right-20 text-4xl">📏</div>
        <div className="absolute bottom-20 left-20 text-5xl">📘</div>
        <div className="absolute bottom-10 right-10 text-3xl">📏</div>
        <div className="absolute top-1/2 left-1/3 text-4xl">📘</div>
        <div className="absolute top-1/3 right-1/3 text-5xl">📏</div>
      </div>

      <div className="relative z-10 p-4 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Your Syllabus</h1>
          <p className="text-gray-600">Complete your learning journey step by step</p>

          {/* Progress Summary */}
          <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-lg p-4 mx-auto max-w-md">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span>{overallProgress}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {completedChapters} of {totalChapters} chapters completed
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 justify-center mb-8"
        >
          <select
            value={selectedBoard}
            onChange={e => setSelectedBoard(e.target.value)}
            className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="CBSE">CBSE Board</option>
            <option value="NCERT">NCERT</option>
            <option value="State Board">State Board</option>
          </select>

          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="Class 10">Class 10</option>
            <option value="Class 11">Class 11</option>
            <option value="Class 12">Class 12</option>
          </select>

          <select
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
            className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="English">English</option>
            <option value="Hindi">हिंदी</option>
            <option value="Telugu">తెలుగు</option>
          </select>
        </motion.div>

        {/* Roadmap Container */}
        <div className="max-w-4xl mx-auto">
          {/* Timeline Path */}
          <div className="relative">
            {/* Glowing path line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600 rounded-full shadow-lg shadow-teal-500/50" />

            {/* Progress glow effect */}
            <motion.div
              className="absolute left-8 top-0 w-1 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full shadow-lg shadow-yellow-500/60"
              initial={{ height: 0 }}
              animate={{ height: `${(completedChapters / totalChapters) * 100}%` }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />

            {/* Chapter Cards */}
            <div className="space-y-6">
              {chapters.map((chapter, index) => (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-start"
                >
                  {/* Timeline node */}
                  <div className="relative z-10 flex-shrink-0 mr-6">
                    <motion.div
                      className={`w-8 h-8 rounded-full border-4 flex items-center justify-center ${
                        chapter.status === 'completed'
                          ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/50'
                          : 'bg-white border-teal-400 shadow-lg shadow-teal-500/30'
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {chapter.status === 'completed' ? (
                        <span className="text-white text-sm">✓</span>
                      ) : (
                        <span className="text-2xl">{chapter.subjectIcon}</span>
                      )}
                    </motion.div>
                  </div>

                  {/* Chapter Card */}
                  <div className="flex-1">
                    <Card
                      variant="elevated"
                      className={`relative overflow-hidden transition-all duration-300 ${
                        expandedChapter === chapter.id ? 'mb-4' : ''
                      }`}
                      hover={true}
                      onClick={() => toggleChapterExpansion(chapter.id)}
                    >
                      {/* Main Chapter Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{chapter.subjectIcon}</span>
                            <div>
                              <h3 className="font-semibold text-gray-800 text-lg">
                                {chapter.name}
                              </h3>
                              <p className="text-sm text-gray-600">{chapter.subject}</p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{chapter.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                className={`h-2 rounded-full ${
                                  chapter.status === 'completed'
                                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                                    : 'bg-gradient-to-r from-teal-500 to-teal-600'
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${chapter.progress}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                              />
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                chapter.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {chapter.status === 'completed' ? 'Completed' : 'Pending'}
                            </span>

                            {/* Bookmark */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={e => {
                                e.stopPropagation();
                                toggleBookmark(chapter.id);
                              }}
                              className={`p-1 rounded ${
                                chapter.isBookmarked
                                  ? 'text-yellow-500'
                                  : 'text-gray-400 hover:text-yellow-500'
                              }`}
                            >
                              ⭐
                            </motion.button>
                          </div>
                        </div>

                        {/* Expand Indicator */}
                        <motion.div
                          animate={{ rotate: expandedChapter === chapter.id ? 180 : 0 }}
                          className="ml-4 text-gray-400"
                        >
                          ▼
                        </motion.div>
                      </div>

                      {/* Expanded Topics */}
                      <motion.div
                        initial={false}
                        animate={{
                          height: expandedChapter === chapter.id ? 'auto' : 0,
                          opacity: expandedChapter === chapter.id ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        {expandedChapter === chapter.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-3">
                              Topics in this chapter:
                            </h4>
                            <div className="space-y-2 mb-4">
                              {chapter.topics.map(topic => (
                                <div key={topic.id} className="flex items-center gap-3">
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                      topic.completed
                                        ? 'bg-green-500 border-green-400'
                                        : 'border-gray-300'
                                    }`}
                                  >
                                    {topic.completed && (
                                      <span className="text-white text-xs">✓</span>
                                    )}
                                  </div>
                                  <span
                                    className={`text-sm ${
                                      topic.completed
                                        ? 'text-gray-600 line-through'
                                        : 'text-gray-800'
                                    }`}
                                  >
                                    {topic.name}
                                  </span>
                                  <div className="flex-1 h-px bg-gray-200" />
                                  <div
                                    className={`w-16 h-1 rounded-full ${
                                      topic.completed ? 'bg-green-400' : 'bg-gray-200'
                                    }`}
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Start Quiz Button */}
                            <Button
                              onClick={e => {
                                e?.stopPropagation();
                                startQuiz(chapter.id);
                              }}
                              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
                              fullWidth
                            >
                              Start Quiz for This Chapter 🚀
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Motivational Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
            <h3 className="font-semibold text-gray-800 mb-2">Keep Going! 🎯</h3>
            <p className="text-sm text-gray-600">
              You're doing great! Complete one chapter at a time to master your subjects.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SyllabusBrowser;
